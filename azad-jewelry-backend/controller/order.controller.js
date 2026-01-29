const { secret } = require("../config/secret");
const ApiError = require("../errors/api-error");
const Order = require("../model/Order");
const Admin = require("../model/Admin");
const Products = require("../model/Products");
const GlobalSetting = require("../model/GlobalSetting");
const mongoose = require("mongoose");

let stripeClient = null;
const getStripeClient = () => {
  if (stripeClient) return stripeClient;
  if (!secret.stripe_key) return null;
  stripeClient = require("stripe")(secret.stripe_key);
  return stripeClient;
};

const parseNonNegativeNumber = (value, fallback = 0) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return num;
};

const normalizeCartItems = (cart) => {
  const src = Array.isArray(cart) ? cart : [];
  const normalizedCart = src
    .filter((i) => i && typeof i === "object")
    .map((i) => {
      const productId = i.productId ?? i._id ?? i.id ?? i.product?._id;
      return { ...i, productId };
    });

  const normalizedItems = new Map();

  for (const rawItem of normalizedCart) {
    if (!rawItem || typeof rawItem !== "object") continue;
    const productId =
      rawItem.productId ?? rawItem._id ?? rawItem.id ?? rawItem.product?._id;
    const qtyRaw =
      rawItem.orderQuantity ?? rawItem.qty ?? rawItem.quantity ?? rawItem.count;
    const qty = Number.parseInt(String(qtyRaw), 10);
    if (!productId || !Number.isFinite(qty) || qty <= 0) {
      throw new ApiError(400, "Invalid cart items.");
    }
    const key = String(productId);
    if (!mongoose.Types.ObjectId.isValid(key)) {
      throw new ApiError(400, "Invalid cart items.");
    }
    normalizedItems.set(key, (normalizedItems.get(key) || 0) + qty);
  }

  if (normalizedItems.size === 0) {
    throw new ApiError(400, "Cart is empty.");
  }

  return { normalizedCart, normalizedItems };
};

const getCheckoutSettings = async () => {
  const settings = await GlobalSetting.findOne()
    .select(
      "currency paymentCodEnabled paymentCardEnabled paymentPaypalEnabled paymentBankTransferEnabled deliveryCharge deliveryChargeStandard deliveryChargeExpress freeShippingMinSubtotal shippingCostTiers bundleDiscountEnabled bundleDiscountPercent bundleDiscountMinItems giftWrapEnabled giftWrapFeeStandard giftWrapFeePremium"
    )
    .lean();

  const currencyRaw = String(settings?.currency || "USD").trim().toLowerCase();
  const currency = currencyRaw || "usd";

  return {
    currency,
    paymentCodEnabled: settings?.paymentCodEnabled !== false,
    paymentCardEnabled: Boolean(settings?.paymentCardEnabled),
    paymentPaypalEnabled: Boolean(settings?.paymentPaypalEnabled),
    paymentBankTransferEnabled: Boolean(settings?.paymentBankTransferEnabled),
    deliveryCharge: settings?.deliveryCharge,
    deliveryChargeStandard: settings?.deliveryChargeStandard,
    deliveryChargeExpress: settings?.deliveryChargeExpress,
    freeShippingMinSubtotal: settings?.freeShippingMinSubtotal,
    shippingCostTiers: Array.isArray(settings?.shippingCostTiers) ? settings.shippingCostTiers : [],
    bundleDiscountEnabled: Boolean(settings?.bundleDiscountEnabled),
    bundleDiscountPercent: settings?.bundleDiscountPercent,
    bundleDiscountMinItems: settings?.bundleDiscountMinItems,
    giftWrapEnabled: Boolean(settings?.giftWrapEnabled),
    giftWrapFeeStandard: settings?.giftWrapFeeStandard,
    giftWrapFeePremium: settings?.giftWrapFeePremium,
  };
};

const calculateTotalsFromCart = async ({
  normalizedItems,
  discount,
  shippingCost,
  shippingOption,
  city,
  giftWrap,
  settings,
}) => {
  const discountValue = parseNonNegativeNumber(discount, 0);

  const entries = Array.from(normalizedItems.entries()).map(([productId, qty]) => ({
    productId,
    qty,
  }));
  const ids = entries.map((e) => e.productId);

  const products = await Products.find({
    _id: { $in: ids },
    status: { $ne: "discontinued" },
  })
    .select("_id price")
    .lean();

  if (!Array.isArray(products) || products.length !== ids.length) {
    throw new ApiError(409, "One or more products are unavailable.");
  }

  const priceById = new Map(
    products.map((p) => [String(p._id), Number(p.price)])
  );

  let subTotal = 0;
  for (const { productId, qty } of entries) {
    const unitPrice = priceById.get(String(productId));
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new ApiError(409, "One or more products are unavailable.");
    }
    subTotal += unitPrice * qty;
  }

  const subTotalRounded = Number(subTotal.toFixed(2));

  const normalizeShippingOption = (value) => {
    const v = String(value || "").trim().toUpperCase();
    if (v === "EXPRESS" || v === "TODAY") return "EXPRESS";
    if (v === "STANDARD" || v === "SEVEN_DAYS") return "STANDARD";
    return "";
  };

  const normalizeGiftWrap = (value) => {
    if (!value) return { enabled: false, type: "", message: "" };
    if (typeof value === "boolean") return { enabled: value, type: "", message: "" };
    if (typeof value !== "object") return { enabled: false, type: "", message: "" };
    const enabled =
      value.enabled === true ||
      value.enabled === 1 ||
      value.enabled === "1" ||
      String(value.enabled || "").toLowerCase() === "true";
    const type = String(value.type || "").trim().toUpperCase();
    const message = typeof value.message === "string" ? value.message : "";
    return { enabled, type, message };
  };

  const checkoutSettings = settings || (await getCheckoutSettings());
  const shippingSelected = normalizeShippingOption(shippingOption);
  const shippingStandard = parseNonNegativeNumber(
    checkoutSettings?.deliveryChargeStandard ?? checkoutSettings?.deliveryCharge,
    0
  );
  const shippingExpress = parseNonNegativeNumber(
    checkoutSettings?.deliveryChargeExpress,
    shippingStandard
  );

  let shipping = parseNonNegativeNumber(shippingCost, 0);
  const cityNormalized = String(city || "").trim().toLowerCase();
  const tiers = Array.isArray(checkoutSettings?.shippingCostTiers)
    ? checkoutSettings.shippingCostTiers
    : [];

  const findTierCost = ({ option }) => {
    if (!option) return null;
    for (const tier of tiers) {
      if (!tier || typeof tier !== "object") continue;
      const tierCity = String(tier.city || "").trim().toLowerCase();
      const tierOption = String(tier.option || "").trim().toUpperCase();
      const minSubtotal = parseNonNegativeNumber(tier.minSubtotal, 0);
      const maxSubtotalRaw = Number(tier.maxSubtotal);
      const hasMax = Number.isFinite(maxSubtotalRaw) && maxSubtotalRaw > 0;
      const maxSubtotal = hasMax ? maxSubtotalRaw : 0;
      const cost = parseNonNegativeNumber(tier.cost, NaN);
      if (!Number.isFinite(cost)) continue;

      const cityOk = !tierCity || tierCity === cityNormalized;
      const optionOk = !tierOption || tierOption === option;
      const minOk = subTotalRounded >= minSubtotal;
      const maxOk = !hasMax || subTotalRounded <= maxSubtotal;
      if (cityOk && optionOk && minOk && maxOk) return cost;
    }
    return null;
  };

  if (shippingSelected === "EXPRESS") shipping = shippingExpress;
  if (shippingSelected === "STANDARD") {
    shipping = shippingStandard;
    const freeMin = parseNonNegativeNumber(checkoutSettings?.freeShippingMinSubtotal, 0);
    if (freeMin > 0 && subTotalRounded >= freeMin) shipping = 0;
  }
  if (shippingSelected === "EXPRESS") {
    const tierCost = findTierCost({ option: "EXPRESS" });
    if (tierCost !== null) shipping = tierCost;
  }
  if (shippingSelected === "STANDARD") {
    const freeMin = parseNonNegativeNumber(checkoutSettings?.freeShippingMinSubtotal, 0);
    if (!(freeMin > 0 && subTotalRounded >= freeMin)) {
      const tierCost = findTierCost({ option: "STANDARD" });
      if (tierCost !== null) shipping = tierCost;
    } else {
      shipping = 0;
    }
  }

  const giftWrapNormalized = normalizeGiftWrap(giftWrap);
  let giftWrapFee = 0;
  if (checkoutSettings?.giftWrapEnabled && giftWrapNormalized.enabled) {
    const feeStandard = parseNonNegativeNumber(checkoutSettings?.giftWrapFeeStandard, 0);
    const feePremium = parseNonNegativeNumber(checkoutSettings?.giftWrapFeePremium, 0);
    giftWrapFee = giftWrapNormalized.type === "PREMIUM" ? feePremium : feeStandard;
  }

  let bundleDiscount = 0;
  if (checkoutSettings?.bundleDiscountEnabled) {
    const percent = parseNonNegativeNumber(checkoutSettings?.bundleDiscountPercent, 0);
    const rawMinItems = Number.parseInt(String(checkoutSettings?.bundleDiscountMinItems ?? 2), 10);
    const minItems = Number.isFinite(rawMinItems) && rawMinItems > 1 ? rawMinItems : 2;
    const totalQty = entries.reduce((acc, e) => acc + (Number(e.qty) || 0), 0);
    if (percent > 0 && totalQty >= minItems) {
      bundleDiscount = Number(((subTotalRounded * percent) / 100).toFixed(2));
      if (bundleDiscount > subTotalRounded) bundleDiscount = subTotalRounded;
    }
  }

  const totalRaw = subTotalRounded + shipping + giftWrapFee - discountValue - bundleDiscount;
  const totalRounded = Number(totalRaw.toFixed(2));
  if (!Number.isFinite(totalRounded) || totalRounded <= 0) {
    throw new ApiError(400, "Invalid order total.");
  }

  const amountCents = Math.round(totalRounded * 100);
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new ApiError(400, "Invalid order total.");
  }

  return {
    subTotal: subTotalRounded,
    shippingCost: shipping,
    discount: discountValue,
    bundleDiscount,
    giftWrapFee,
    giftWrap: giftWrapNormalized,
    totalAmount: totalRounded,
    amountCents,
  };
};

exports.paymentIntent = async (req, res, next) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return next(
        new ApiError(
          500,
          "Stripe is not configured. Set STRIPE_KEY (or STRIPE_SECRET_KEY)."
        )
      );
    }

    const settings = await getCheckoutSettings();
    if (!settings.paymentCardEnabled) {
      return next(new ApiError(400, "Card payment is not enabled."));
    }

    const { normalizedItems } = normalizeCartItems(req.body?.cart);
    const totals = await calculateTotalsFromCart({
      normalizedItems,
      discount: req.body?.discount,
      shippingCost: req.body?.shippingCost,
      shippingOption: req.body?.shippingOption,
      city: req.body?.city,
      giftWrap: req.body?.giftWrap,
      settings,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      currency: settings.currency,
      amount: totals.amountCents,
      payment_method_types: ["card"],
      metadata: {
        userId: String(req.user?._id || ""),
      },
    });
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

exports.stripeWebhook = async (req, res, next) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return next(
        new ApiError(
          500,
          "Stripe is not configured. Set STRIPE_KEY (or STRIPE_SECRET_KEY)."
        )
      );
    }

    const webhookSecret = secret.stripe_webhook_secret;
    if (!webhookSecret) {
      return next(new ApiError(500, "Stripe webhook is not configured."));
    }

    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return next(new ApiError(400, "Missing Stripe signature header."));
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      return next(new ApiError(400, "Missing raw request body."));
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      return next(new ApiError(400, "Invalid Stripe signature."));
    }

    const getPaymentIntentIdFromCharge = async (chargeId) => {
      try {
        const id = chargeId ? String(chargeId) : "";
        if (!id) return "";
        const charge = await stripe.charges.retrieve(id);
        const pi = charge?.payment_intent;
        if (!pi) return "";
        if (typeof pi === "string") return pi;
        if (typeof pi === "object" && pi.id) return String(pi.id);
        return "";
      } catch {
        return "";
      }
    };

    const updateOrderFieldsByPaymentIntent = async ({ paymentIntentId, extraSet }) => {
      const piId = paymentIntentId ? String(paymentIntentId) : "";
      if (!piId) return;
      if (!extraSet || typeof extraSet !== "object") return;

      await Order.updateOne(
        { paymentIntentId: piId },
        { $set: { ...extraSet } },
        { runValidators: true }
      );
    };

    const updateOrderStatusByPaymentIntent = async ({
      paymentIntentId,
      status,
      source,
      extraSet,
    }) => {
      const piId = paymentIntentId ? String(paymentIntentId) : "";
      const nextStatus = status ? String(status).trim().toLowerCase() : "";
      const statusSource = source ? String(source).trim() : "stripe";
      if (!piId || !nextStatus) return;

      const now = new Date();
      const setFields = extraSet && typeof extraSet === "object" ? extraSet : null;
      const update = {
        $set: { status: nextStatus, ...(setFields || {}) },
        $push: { statusHistory: { status: nextStatus, at: now, source: statusSource } },
      };

      const result = await Order.updateOne(
        { paymentIntentId: piId, status: { $ne: nextStatus } },
        update,
        { runValidators: true }
      );

      const matchedCount =
        typeof result?.matchedCount === "number"
          ? result.matchedCount
          : typeof result?.n === "number"
            ? result.n
            : 0;

      if (matchedCount === 0 && setFields) {
        await updateOrderFieldsByPaymentIntent({ paymentIntentId: piId, extraSet: setFields });
      }
    };

    if (event?.type === "payment_intent.succeeded") {
      const pi = event.data?.object;
      await updateOrderStatusByPaymentIntent({
        paymentIntentId: pi?.id,
        status: "processing",
        source: "stripe",
      });
    } else if (event?.type === "payment_intent.payment_failed") {
      const pi = event.data?.object;
      await updateOrderStatusByPaymentIntent({
        paymentIntentId: pi?.id,
        status: "cancel",
        source: "stripe",
      });
    } else if (
      event?.type === "refund.created" ||
      event?.type === "refund.updated" ||
      event?.type === "charge.refunded"
    ) {
      const obj = event.data?.object;

      if (event?.type === "charge.refunded") {
        const paymentIntentId = await getPaymentIntentIdFromCharge(obj?.id);
        await updateOrderStatusByPaymentIntent({
          paymentIntentId,
          status: "refunded",
          source: "stripe",
          extraSet: {
            refundDetails: {
              refundId: null,
              amountCents: Number.isFinite(Number(obj?.amount_refunded)) ? Number(obj.amount_refunded) : null,
              currency: obj?.currency ? String(obj.currency).toLowerCase() : null,
              reason: null,
              status: "succeeded",
              createdAt: obj?.created ? new Date(Number(obj.created) * 1000) : null,
            },
          },
        });
      } else {
        const refund = obj;
        const pi =
          typeof refund?.payment_intent === "string"
            ? refund.payment_intent
            : refund?.payment_intent?.id;
        const paymentIntentId = pi
          ? String(pi)
          : await getPaymentIntentIdFromCharge(refund?.charge);
        const refundStatus = refund?.status ? String(refund.status).toLowerCase() : "";
        const shouldMarkRefunded = refundStatus === "succeeded";
        const refundDetails = {
          refundId: refund?.id ? String(refund.id) : null,
          amountCents: Number.isFinite(Number(refund?.amount)) ? Number(refund.amount) : null,
          currency: refund?.currency ? String(refund.currency).toLowerCase() : null,
          reason: refund?.reason ? String(refund.reason) : null,
          status: refundStatus || null,
          createdAt: refund?.created ? new Date(Number(refund.created) * 1000) : null,
        };

        if (shouldMarkRefunded) {
          await updateOrderStatusByPaymentIntent({
            paymentIntentId,
            status: "refunded",
            source: "stripe",
            extraSet: { refundDetails },
          });
        } else {
          await updateOrderFieldsByPaymentIntent({
            paymentIntentId,
            extraSet: { refundDetails },
          });
        }
      }
    } else if (
      event?.type === "charge.dispute.created" ||
      event?.type === "charge.dispute.updated" ||
      event?.type === "charge.dispute.closed"
    ) {
      const dispute = event.data?.object;
      const paymentIntentId = await getPaymentIntentIdFromCharge(dispute?.charge);
      const disputeStatus = dispute?.status ? String(dispute.status) : "";
      const resolved = ["won", "lost"].includes(disputeStatus);

      await updateOrderStatusByPaymentIntent({
        paymentIntentId,
        status: "chargeback",
        source: "stripe",
        extraSet: {
          chargebackDetails: {
            disputeId: dispute?.id ? String(dispute.id) : null,
            amountCents: Number.isFinite(Number(dispute?.amount)) ? Number(dispute.amount) : null,
            currency: dispute?.currency ? String(dispute.currency).toLowerCase() : null,
            reason: dispute?.reason ? String(dispute.reason) : null,
            status: disputeStatus || null,
            createdAt: dispute?.created ? new Date(Number(dispute.created) * 1000) : null,
            evidenceDueBy: dispute?.evidence_details?.due_by
              ? new Date(Number(dispute.evidence_details.due_by) * 1000)
              : null,
            resolved,
          },
        },
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};
// addOrder
exports.addOrder = async (req, res, next) => {
  const userId = req.user?._id;
  if (!userId) {
    return next(new ApiError(401, "You are not logged in"));
  }

  let normalizedCart;
  let normalizedItems;
  let stockUpdates;
  let orderBody;
  try {
    const normalized = normalizeCartItems(req.body?.cart);
    normalizedCart = normalized.normalizedCart;
    normalizedItems = normalized.normalizedItems;

    const settings = await getCheckoutSettings();
    const paymentMethod = String(req.body?.paymentMethod || "").trim();
    if (!paymentMethod) throw new ApiError(400, "Payment method is required.");

    if (paymentMethod === "Card" && !settings.paymentCardEnabled) {
      throw new ApiError(400, "Card payment is not enabled.");
    }
    if (paymentMethod === "COD" && !settings.paymentCodEnabled) {
      throw new ApiError(400, "Cash on delivery is not enabled.");
    }
    if (paymentMethod === "PAYPAL" && !settings.paymentPaypalEnabled) {
      throw new ApiError(400, "PayPal payment is not enabled.");
    }
    if (paymentMethod === "BANK_TRANSFER" && !settings.paymentBankTransferEnabled) {
      throw new ApiError(400, "Bank transfer is not enabled.");
    }

    const totals = await calculateTotalsFromCart({
      normalizedItems,
      discount: req.body?.discount,
      shippingCost: req.body?.shippingCost,
      shippingOption: req.body?.shippingOption,
      city: req.body?.city,
      giftWrap: req.body?.giftWrap,
      settings,
    });

    if (paymentMethod === "Card") {
      const stripe = getStripeClient();
      if (!stripe) {
        throw new ApiError(
          500,
          "Stripe is not configured. Set STRIPE_KEY (or STRIPE_SECRET_KEY)."
        );
      }

      const piId = req.body?.paymentIntent?.id ?? req.body?.paymentIntentId;
      const paymentIntentId = piId ? String(piId) : "";
      if (!paymentIntentId) {
        throw new ApiError(400, "Payment intent is required.");
      }

      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      const amountReceived = Number(pi?.amount_received ?? pi?.amount);
      if (pi?.status !== "succeeded") {
        throw new ApiError(400, "Payment is not completed.");
      }
      if (!Number.isFinite(amountReceived) || amountReceived !== totals.amountCents) {
        throw new ApiError(400, "Payment amount mismatch.");
      }
    }

    stockUpdates = Array.from(normalizedItems.entries()).map(
      ([productId, orderQty]) => ({ productId, orderQty })
    );

    const paymentIntentId =
      req.body?.paymentIntent?.id ?? req.body?.paymentIntentId ?? "";

    orderBody = {
      ...req.body,
      user: userId,
      status: "pending",
      cart: normalizedCart,
      subTotal: totals.subTotal,
      shippingCost: totals.shippingCost,
      discount: totals.discount,
      bundleDiscount: totals.bundleDiscount,
      giftWrap: totals.giftWrap,
      giftWrapFee: totals.giftWrapFee,
      totalAmount: totals.totalAmount,
      paymentIntentId: paymentIntentId ? String(paymentIntentId) : undefined,
    };
  } catch (error) {
    next(error);
    return;
  }

  const shouldRetryTransaction = (error) => {
    if (!error) return false;
    if (typeof error?.hasErrorLabel === "function") {
      try {
        return error.hasErrorLabel("TransientTransactionError");
      } catch {}
    }
    const msg = String(error?.message || "");
    return (
      error?.code === 112 ||
      msg.includes("catalog changes") ||
      msg.includes("Please retry your operation") ||
      msg.includes("TransientTransactionError")
    );
  };

  const isTransactionNotSupportedError = (error) => {
    const msg = String(error?.message || "");
    return (
      error?.code === 20 ||
      error?.codeName === "IllegalOperation" ||
      msg.includes("Transaction numbers are only allowed on a replica set member or mongos")
    );
  };

  let transactionsSupported = true;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let session = null;
    let useTransaction = false;
    if (transactionsSupported) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
        useTransaction = true;
      } catch (e) {
        session = null;
        useTransaction = false;
        transactionsSupported = false;
      }
    }

    const appliedUpdates = [];
    const updatedToOutOfStock = new Set();
    try {
      for (const { productId, orderQty } of stockUpdates) {
        const updated = await Products.findOneAndUpdate(
          {
            _id: productId,
            status: { $ne: "discontinued" },
            quantity: { $gte: orderQty },
          },
          { $inc: { quantity: -orderQty, sellCount: orderQty } },
          { new: true, ...(session ? { session } : {}) }
        ).lean();

        if (!updated) {
          throw new ApiError(409, "One or more products are out of stock.");
        }

        appliedUpdates.push({ productId, orderQty });

        if (Number(updated.quantity) === 0 && updated.status !== "out-of-stock") {
          await Products.updateOne(
            { _id: productId },
            { $set: { status: "out-of-stock" } },
            { ...(session ? { session } : {}) }
          );
          updatedToOutOfStock.add(String(productId));
        }
      }

      const created = await Order.create(
        [orderBody],
        session ? { session } : undefined
      );
      const orderItems = Array.isArray(created) ? created[0] : created;
      const orderSafe = orderItems?.toObject ? orderItems.toObject() : orderItems;
      if (orderSafe && typeof orderSafe === "object") {
        delete orderSafe.cardInfo;
        delete orderSafe.paymentIntent;
      }

      if (useTransaction && session) {
        await session.commitTransaction();
      }

      res.status(200).json({
        success: true,
        message: "Order added successfully",
        order: orderSafe,
      });
      return;
    } catch (error) {
      if (useTransaction && session) {
        try {
          await session.abortTransaction();
        } catch {}
        if (isTransactionNotSupportedError(error)) {
          transactionsSupported = false;
          continue;
        }
        if (attempt === 0 && shouldRetryTransaction(error)) {
          continue;
        }
      } else if (appliedUpdates.length > 0) {
        try {
          await Promise.all(
            appliedUpdates.map(({ productId, orderQty }) =>
              Products.updateOne(
                { _id: productId },
                { $inc: { quantity: orderQty, sellCount: -orderQty } }
              )
            )
          );
          if (updatedToOutOfStock.size > 0) {
            await Products.updateMany(
              { _id: { $in: Array.from(updatedToOutOfStock) }, status: "out-of-stock" },
              { $set: { status: "in-stock" } }
            );
          }
        } catch {}
      }

      next(error);
      return;
    } finally {
      if (session) {
        try {
          session.endSession();
        } catch {}
      }
    }
  }
};
// get Orders
exports.getOrders = async (req, res, next) => {
  try {
    const { page, limit, statuses } = req.query;
    const pages = Number(page) || 1;
    const limits = Math.min(Number(limit) || 50, 200);
    const skip = (pages - 1) * limits;

    const query = {};
    if (typeof statuses === "string" && statuses.trim()) {
      const statusList = statuses
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (statusList.length > 0) {
        query.status = { $in: statusList };
      }
    }

    const totalDoc = await Order.countDocuments(query);
    const orderItems = await Order.find(query)
      .select("-cardInfo -paymentIntent")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limits)
      .populate("user", "name email")
      .lean();
    res.status(200).json({
      success: true,
      data: orderItems,
      page: pages,
      limit: limits,
      totalDoc,
    });
  }
  catch (error) {
    next(error)
  }
};
// get Orders
exports.getSingleOrder = async (req, res, next) => {
  try {
    const orderItem = await Order.findById(req.params.id)
      .select("-cardInfo -paymentIntent")
      .populate("user", "name email")
      .lean();
    res.status(200).json(orderItem);
  }
  catch (error) {
    next(error)
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const newStatus = String(req.body?.status || "")
      .trim()
      .toLowerCase();
    const allowedStatuses = [
      "pending",
      "processing",
      "delivered",
      "cancel",
      "refunded",
      "chargeback",
    ];
    if (!allowedStatuses.includes(newStatus)) {
      throw new ApiError(400, "Invalid status.");
    }

    await Order.updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: {
          status: newStatus,
        },
        $push: {
          statusHistory: { status: newStatus, at: new Date(), source: "admin" },
        },
      },
      { runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
    });
  }
  catch (error) {
    next(error)
  }
};

exports.getOrderPaymentDetailsForAzad = async (req, res, next) => {
  try {
    const adminId = req.user?._id;
    if (!adminId) return next(new ApiError(401, "You are not logged in"));

    const admin = await Admin.findById(adminId).select("name role status").lean();
    const adminName = String(admin?.name || "").trim().toLowerCase();
    const isAllowed =
      admin &&
      admin.role === "Super Admin" &&
      adminName === "azad" &&
      admin.status !== "Inactive";

    if (!isAllowed) {
      return next(new ApiError(403, "You are not authorized to access this"));
    }

    const orderItem = await Order.findById(req.params.id).lean();
    if (!orderItem) return next(new ApiError(404, "Order not found"));

    const decrypted =
      typeof Order.decryptPaymentFields === "function"
        ? Order.decryptPaymentFields(orderItem)
        : orderItem;

    res.status(200).json({
      _id: decrypted._id,
      invoice: decrypted.invoice,
      paymentMethod: decrypted.paymentMethod,
      cardInfo: decrypted.cardInfo,
      paymentIntent: decrypted.paymentIntent,
    });
  } catch (error) {
    next(error);
  }
};
