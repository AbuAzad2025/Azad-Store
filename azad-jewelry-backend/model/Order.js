const mongoose = require("mongoose");
const crypto = require("crypto");
const { secret } = require("../config/secret");

const ENCRYPTED_MARKER = "__enc";

const parseEncryptionKey = (rawKey) => {
  const raw = typeof rawKey === "string" ? rawKey.trim() : "";
  if (!raw) return null;

  try {
    const buf = Buffer.from(raw, "base64");
    if (buf.length === 32) return buf;
  } catch {}

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }

  return null;
};

const getEncryptionKey = () => parseEncryptionKey(secret?.order_encryption_key);

const isEncryptedPayload = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      value[ENCRYPTED_MARKER] === 1 &&
      typeof value.iv === "string" &&
      typeof value.tag === "string" &&
      typeof value.data === "string"
  );

const encryptJson = (value) => {
  if (!value || typeof value !== "object") return value;
  if (isEncryptedPayload(value)) return value;

  const key = getEncryptionKey();
  if (!key) {
    if (secret?.order_encryption_required) {
      throw new Error("ORDER_ENCRYPTION_KEY is required but not configured.");
    }
    return value;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    [ENCRYPTED_MARKER]: 1,
    alg: "aes-256-gcm",
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: encrypted.toString("base64"),
  };
};

const decryptJson = (value) => {
  if (!isEncryptedPayload(value)) return value;

  const key = getEncryptionKey();
  if (!key) {
    if (secret?.order_encryption_required) {
      throw new Error("ORDER_ENCRYPTION_KEY is required but not configured.");
    }
    throw new Error("ORDER_ENCRYPTION_KEY is not configured.");
  }

  if (value.alg && value.alg !== "aes-256-gcm") {
    throw new Error("Unsupported encryption algorithm.");
  }

  const iv = Buffer.from(value.iv, "base64");
  const tag = Buffer.from(value.tag, "base64");
  const data = Buffer.from(value.data, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  const plaintext = decrypted.toString("utf8");

  try {
    return JSON.parse(plaintext);
  } catch {
    return plaintext;
  }
};

const invoiceCounterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true },
  },
  { versionKey: false }
);

const InvoiceCounter =
  mongoose.models.InvoiceCounter ||
  mongoose.model("InvoiceCounter", invoiceCounterSchema);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cart: [{}],
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    bundleDiscount: {
      type: Number,
      required: false,
      default: 0,
    },
    giftWrap: {
      enabled: { type: Boolean, required: false, default: false },
      type: { type: String, required: false, trim: true },
      message: { type: String, required: false, trim: true },
    },
    giftWrapFee: {
      type: Number,
      required: false,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingOption: {
      type: String,
      required: false,
    },
    cardInfo: {
      type: Object,
      required: false,
    },
    paymentIntent: {
      type: Object,
      required: false,
    },
    paymentIntentId: {
      type: String,
      required: false,
      trim: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    orderNote: {
      type: String,
      required: false,
    },
    invoice: {
      type: Number,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "delivered", "cancel", "refunded", "chargeback"],
      lowercase: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true, lowercase: true, trim: true },
        at: { type: Date, required: true },
        source: { type: String, required: true, trim: true },
      },
    ],
    refundDetails: {
      refundId: { type: String, required: false, trim: true },
      amountCents: { type: Number, required: false },
      currency: { type: String, required: false, lowercase: true, trim: true },
      reason: { type: String, required: false, trim: true },
      status: { type: String, required: false, trim: true },
      createdAt: { type: Date, required: false },
    },
    chargebackDetails: {
      disputeId: { type: String, required: false, trim: true },
      amountCents: { type: Number, required: false },
      currency: { type: String, required: false, lowercase: true, trim: true },
      reason: { type: String, required: false, trim: true },
      status: { type: String, required: false, trim: true },
      createdAt: { type: Date, required: false },
      evidenceDueBy: { type: Date, required: false },
      resolved: { type: Boolean, required: true, default: false },
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", async function (next) {
  try {
    if (!Array.isArray(this.statusHistory) || this.statusHistory.length === 0) {
      const initialStatus = String(this.status || "pending").toLowerCase();
      this.statusHistory = [{ status: initialStatus, at: new Date(), source: "system" }];
    }

    if (this.invoice) return next();
    const session = typeof this.$session === "function" ? this.$session() : null;
    let counter = await InvoiceCounter.findOneAndUpdate(
      { _id: "order_invoice" },
      { $inc: { seq: 1 } },
      { new: true, ...(session ? { session } : {}) }
    ).lean();

    if (!counter) {
      try {
        await InvoiceCounter.create(
          [{ _id: "order_invoice", seq: 999 }],
          session ? { session } : undefined
        );
      } catch (error) {
        if (error?.code !== 11000) throw error;
      }
      counter = await InvoiceCounter.findOneAndUpdate(
        { _id: "order_invoice" },
        { $inc: { seq: 1 } },
        { new: true, ...(session ? { session } : {}) }
      ).lean();
    }
    this.invoice = counter.seq;
    next();
  } catch (error) {
    next(error);
  }
});

orderSchema.statics.decryptPaymentFields = (order) => {
  const src = order?.toObject ? order.toObject() : order;
  if (!src || typeof src !== "object") return src;

  const output = { ...src };
  if (Object.prototype.hasOwnProperty.call(output, "cardInfo")) {
    output.cardInfo = decryptJson(output.cardInfo);
  }
  if (Object.prototype.hasOwnProperty.call(output, "paymentIntent")) {
    output.paymentIntent = decryptJson(output.paymentIntent);
  }
  return output;
};

orderSchema.index({ user: 1, _id: -1 });
orderSchema.index({ status: 1, updatedAt: -1 });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ updatedAt: 1 });
orderSchema.index({ paymentIntentId: 1 });
orderSchema.index({ "cart.productType": 1 });
orderSchema.index({ "cart.productId": 1 });

orderSchema.pre("save", function (next) {
  try {
    if (this.isModified("cardInfo")) {
      this.cardInfo = encryptJson(this.cardInfo);
    }
    if (this.isModified("paymentIntent")) {
      this.paymentIntent = encryptJson(this.paymentIntent);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const encryptUpdate = (update) => {
  if (!update || typeof update !== "object") return update;

  const target = update.$set && typeof update.$set === "object" ? update.$set : update;

  if (Object.prototype.hasOwnProperty.call(target, "cardInfo")) {
    target.cardInfo = encryptJson(target.cardInfo);
  }
  if (Object.prototype.hasOwnProperty.call(target, "paymentIntent")) {
    target.paymentIntent = encryptJson(target.paymentIntent);
  }

  if (update.$set && typeof update.$set === "object") {
    update.$set = target;
    return update;
  }
  return target;
};

orderSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
  try {
    const update = encryptUpdate(this.getUpdate());

    const target = update?.$set && typeof update.$set === "object" ? update.$set : update;
    const nextStatusRaw = target?.status;
    const isExplicitlySettingHistory = Object.prototype.hasOwnProperty.call(
      target,
      "statusHistory"
    );
    if (
      typeof nextStatusRaw === "string" &&
      nextStatusRaw.trim() &&
      !isExplicitlySettingHistory &&
      (!update.$push || !Object.prototype.hasOwnProperty.call(update.$push, "statusHistory"))
    ) {
      const nextStatus = nextStatusRaw.trim().toLowerCase();
      update.$push = {
        ...(update.$push && typeof update.$push === "object" ? update.$push : {}),
        statusHistory: { status: nextStatus, at: new Date(), source: "system" },
      };
    }

    this.setUpdate(update);
    next();
  } catch (error) {
    next(error);
  }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = Order;
