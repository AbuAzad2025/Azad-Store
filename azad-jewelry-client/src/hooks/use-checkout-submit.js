import * as dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
//internal import
import useCartInfo from "./use-cart-info";
import { set_shipping } from "@/redux/features/order/orderSlice";
import { set_coupon } from "@/redux/features/coupon/couponSlice";
import { notifyError, notifySuccess } from "@/utils/toast";
import {useCreatePaymentIntentMutation,useSaveOrderMutation} from "@/redux/features/order/orderApi";
import { useGetOfferCouponsQuery } from "@/redux/features/coupon/couponApi";
import { useLanguage } from "@/context/language-context";
import { get_cart_products } from "@/redux/features/cartSlice";
import { useGetGlobalSettingsQuery } from "@/redux/features/settingApi";

const useCheckoutSubmit = () => {
  // offerCoupons
  const { data: offerCoupons, isError, isLoading } = useGetOfferCouponsQuery();
  // addOrder
  const [saveOrder, {}] = useSaveOrderMutation();
  // createPaymentIntent
  const [createPaymentIntent, {}] = useCreatePaymentIntentMutation();
  // cart_products
  const { cart_products } = useSelector((state) => state.cart);
  // user
  const { user } = useSelector((state) => state.auth);
  // shipping_info
  const { shipping_info } = useSelector((state) => state.order);
  // total amount
  const { total, setTotal } = useCartInfo();
  // couponInfo
  const [couponInfo, setCouponInfo] = useState({});
  //cartTotal
  const [cartTotal, setCartTotal] = useState("");
  // minimumAmount
  const [minimumAmount, setMinimumAmount] = useState(0);
  // shippingCost
  const [shippingCost, setShippingCost] = useState(0);
  const [giftWrapFee, setGiftWrapFee] = useState(0);
  const [bundleDiscountAmount, setBundleDiscountAmount] = useState(0);
  // discountAmount
  const [discountAmount, setDiscountAmount] = useState(0);
  // discountPercentage
  const [discountPercentage, setDiscountPercentage] = useState(0);
  // discountProductType
  const [discountProductType, setDiscountProductType] = useState("");
  // isCheckoutSubmit
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  // cardError
  const [cardError, setCardError] = useState("");
  // clientSecret
  const [clientSecret, setClientSecret] = useState("");
  // showCard
  const [showCard, setShowCard] = useState(false);
  // coupon apply message
  const [couponApplyMsg,setCouponApplyMsg] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const {register,handleSubmit,setValue,watch,formState: { errors }} = useForm();
  const { formatPrice, t } = useLanguage();
  const selectedPayment = watch("payment");
  const selectedShippingOption = watch("shippingOption");
  const cityField = watch("city");
  const giftWrapEnabledField = watch("giftWrapEnabled");
  const giftWrapTypeField = watch("giftWrapType");
  const giftWrapMessageField = watch("giftWrapMessage");
  const { data: settings } = useGetGlobalSettingsQuery();

  let couponRef = useRef("");
  const beginCheckoutTrackedRef = useRef(false);

  const trackEvent = (event, payload = {}) => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });
  };

  useEffect(() => {
    if (beginCheckoutTrackedRef.current) return;
    if (!Array.isArray(cart_products) || cart_products.length === 0) return;
    beginCheckoutTrackedRef.current = true;
    trackEvent("begin_checkout", {
      itemsCount: cart_products.length,
      total: Number(total) || 0,
    });
  }, [cart_products, total]);

  useEffect(() => {
    if (localStorage.getItem("couponInfo")) {
      const data = localStorage.getItem("couponInfo");
      const coupon = JSON.parse(data);
      setCouponInfo(coupon);
      setDiscountPercentage(coupon.discountPercentage);
      setMinimumAmount(coupon.minimumAmount);
      setDiscountProductType(coupon.productType);
    }
  }, []);

  useEffect(() => {
    if (minimumAmount - discountAmount > total || cart_products.length === 0) {
      setDiscountPercentage(0);
      localStorage.removeItem("couponInfo");
    }
  }, [minimumAmount, total, discountAmount, cart_products]);

  useEffect(() => {
    const toNumber = (value) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : NaN;
    };

    const freeMin = toNumber(settings?.freeShippingMinSubtotal);
    const baseStandard =
      Number.isFinite(toNumber(settings?.deliveryChargeStandard))
        ? toNumber(settings?.deliveryChargeStandard)
        : Number.isFinite(toNumber(settings?.deliveryCharge))
          ? toNumber(settings?.deliveryCharge)
          : 20;
    const baseExpress = Number.isFinite(toNumber(settings?.deliveryChargeExpress))
      ? toNumber(settings?.deliveryChargeExpress)
      : 60;

    const tiers = Array.isArray(settings?.shippingCostTiers) ? settings.shippingCostTiers : [];
    const cityNormalized = String(cityField || shipping_info?.city || "").trim().toLowerCase();

    const findTierCost = (option) => {
      if (!option) return null;
      for (const tier of tiers) {
        if (!tier || typeof tier !== "object") continue;
        const tierCity = String(tier.city || "").trim().toLowerCase();
        const tierOption = String(tier.option || "").trim().toUpperCase();
        const minSubtotal = Number.isFinite(toNumber(tier.minSubtotal)) ? toNumber(tier.minSubtotal) : 0;
        const maxSubtotalRaw = toNumber(tier.maxSubtotal);
        const hasMax = Number.isFinite(maxSubtotalRaw) && maxSubtotalRaw > 0;
        const cost = toNumber(tier.cost);
        if (!Number.isFinite(cost) || cost < 0) continue;

        const cityOk = !tierCity || tierCity === cityNormalized;
        const optionOk = !tierOption || tierOption === option;
        const minOk = total >= minSubtotal;
        const maxOk = !hasMax || total <= maxSubtotalRaw;
        if (cityOk && optionOk && minOk && maxOk) return cost;
      }
      return null;
    };

    const option = String(selectedShippingOption || "").trim().toUpperCase();
    if (option === "EXPRESS" || option === "TODAY") {
      const tierCost = findTierCost("EXPRESS");
      setShippingCost(tierCost !== null ? tierCost : baseExpress);
      return;
    }
    if (option === "STANDARD" || option === "SEVEN_DAYS") {
      if (Number.isFinite(freeMin) && freeMin > 0 && total >= freeMin) {
        setShippingCost(0);
        return;
      }
      const tierCost = findTierCost("STANDARD");
      setShippingCost(tierCost !== null ? tierCost : baseStandard);
      return;
    }
    setShippingCost(0);
  }, [
    selectedShippingOption,
    settings?.deliveryChargeStandard,
    settings?.deliveryChargeExpress,
    settings?.deliveryCharge,
    settings?.freeShippingMinSubtotal,
    settings?.shippingCostTiers,
    cityField,
    shipping_info?.city,
    total,
  ]);

  useEffect(() => {
    const toNumber = (value) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : NaN;
    };

    if (!settings?.giftWrapEnabled) {
      setGiftWrapFee(0);
      return;
    }

    const enabled =
      giftWrapEnabledField === true ||
      giftWrapEnabledField === 1 ||
      giftWrapEnabledField === "1" ||
      String(giftWrapEnabledField || "").toLowerCase() === "true" ||
      String(giftWrapEnabledField || "").toLowerCase() === "on";

    if (!enabled) {
      setGiftWrapFee(0);
      return;
    }

    const feeStandard = Number.isFinite(toNumber(settings?.giftWrapFeeStandard))
      ? toNumber(settings?.giftWrapFeeStandard)
      : 0;
    const feePremium = Number.isFinite(toNumber(settings?.giftWrapFeePremium))
      ? toNumber(settings?.giftWrapFeePremium)
      : feeStandard;

    const wrapType = String(giftWrapTypeField || "").trim().toUpperCase();
    setGiftWrapFee(wrapType === "PREMIUM" ? feePremium : feeStandard);
  }, [
    settings?.giftWrapEnabled,
    settings?.giftWrapFeeStandard,
    settings?.giftWrapFeePremium,
    giftWrapEnabledField,
    giftWrapTypeField,
  ]);

  useEffect(() => {
    const toNumber = (value) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : NaN;
    };

    if (!settings?.bundleDiscountEnabled) {
      setBundleDiscountAmount(0);
      return;
    }

    const percent = Number.isFinite(toNumber(settings?.bundleDiscountPercent))
      ? toNumber(settings?.bundleDiscountPercent)
      : 0;
    const rawMinItems = Number.parseInt(String(settings?.bundleDiscountMinItems ?? 2), 10);
    const minItems = Number.isFinite(rawMinItems) && rawMinItems > 1 ? rawMinItems : 2;
    const qty = (cart_products || []).reduce(
      (acc, item) => acc + (Number(item?.orderQuantity) || 0),
      0
    );

    if (percent <= 0 || qty < minItems) {
      setBundleDiscountAmount(0);
      return;
    }

    const amount = Number(((total * percent) / 100).toFixed(2));
    setBundleDiscountAmount(amount > total ? total : amount);
  }, [
    settings?.bundleDiscountEnabled,
    settings?.bundleDiscountPercent,
    settings?.bundleDiscountMinItems,
    cart_products,
    total,
  ]);

  //calculate total and discount value
  useEffect(() => {
    const result = cart_products?.filter(
      (p) => p.productType === discountProductType
    );
    const discountProductTotal = result?.reduce(
      (preValue, currentValue) =>
        preValue + currentValue.price * currentValue.orderQuantity,
      0
    );
    const subTotal = Number((total + shippingCost + giftWrapFee).toFixed(2));
    const discountTotal = Number(
      (discountProductTotal * (discountPercentage / 100)).toFixed(2)
    );
    const totalValue = Number((subTotal - discountTotal - bundleDiscountAmount).toFixed(2));
    setDiscountAmount(discountTotal);
    setCartTotal(totalValue);
  }, [
    total,
    shippingCost,
    giftWrapFee,
    discountPercentage,
    cart_products,
    discountProductType,
    bundleDiscountAmount,
  ]);

  // create payment intent
  useEffect(() => {
    if (selectedPayment !== "Card" || !settings?.paymentCardEnabled) {
      setClientSecret("");
      return;
    }

    if (cartTotal && cart_products.length > 0) {
      const giftWrapEnabled =
        giftWrapEnabledField === true ||
        giftWrapEnabledField === 1 ||
        giftWrapEnabledField === "1" ||
        String(giftWrapEnabledField || "").toLowerCase() === "true" ||
        String(giftWrapEnabledField || "").toLowerCase() === "on";
      const giftWrap = {
        enabled: Boolean(settings?.giftWrapEnabled && giftWrapEnabled),
        type: String(giftWrapTypeField || "").trim().toUpperCase(),
        message: String(giftWrapMessageField || "").trim(),
      };
      createPaymentIntent({
        cart: cart_products.map((item) => ({
          productId: item?._id,
          orderQuantity: item?.orderQuantity,
        })),
        city: cityField || shipping_info?.city,
        shippingCost,
        discount: discountAmount,
        shippingOption: selectedShippingOption,
        giftWrap,
      })
        .unwrap()
        .then((data) => {
          setClientSecret(data?.clientSecret);
        })
        .catch((err) => {
          setClientSecret("");
          notifyError(getThrownErrorMessage(err, t("cardPaymentSetupFailed")));
        });
    }
  }, [
    createPaymentIntent,
    cartTotal,
    selectedPayment,
    settings?.paymentCardEnabled,
    cart_products,
    shippingCost,
    discountAmount,
    selectedShippingOption,
    cityField,
    shipping_info?.city,
    giftWrapEnabledField,
    giftWrapTypeField,
    giftWrapMessageField,
    settings?.giftWrapEnabled,
    t,
  ]);

  // handleCouponCode
  const handleCouponCode = (e) => {
    e.preventDefault();

    if (!couponRef.current?.value) {
      notifyError(t("couponCodeRequiredError"));
      return;
    }
    if (isLoading) {
      setCouponApplyMsg(t("loadingDots"));
      setTimeout(() => setCouponApplyMsg(""), 1500);
      return;
    }
    if (isError) {
      notifyError(t("somethingWentWrong"));
      return;
    }
    const result = offerCoupons?.filter(
      (coupon) => coupon.couponCode === couponRef.current?.value
    );

    if (result.length < 1) {
      notifyError(t("couponInvalidError"));
      return;
    }

    if (dayjs().isAfter(dayjs(result[0]?.endTime))) {
      notifyError(t("couponExpiredError"));
      return;
    }

    if (total < result[0]?.minimumAmount) {
      notifyError(
        t("couponMinimumError", { amount: formatPrice(result[0].minimumAmount) })
      );
      return;
    } else {
      // notifySuccess(
      //   `Your Coupon ${result[0].title} is Applied on ${result[0].productType}!`
      // );
      setCouponApplyMsg(
        t("couponAppliedMessage", { title: result[0].title, productType: result[0].productType })
      );
      setMinimumAmount(result[0]?.minimumAmount);
      setDiscountProductType(result[0].productType);
      setDiscountPercentage(result[0].discountPercentage);
      dispatch(set_coupon(result[0]));
      setTimeout(() => {
        couponRef.current.value = "";
        setCouponApplyMsg("")
      }, 5000);
    }
  };

  // handleShippingCost
  const handleShippingCost = (value) => {
    setShippingCost(value);
  };

  //set values
  useEffect(() => {
    setValue("firstName", shipping_info.firstName);
    setValue("lastName", shipping_info.lastName);
    setValue("country", shipping_info.country);
    setValue("address", shipping_info.address);
    setValue("city", shipping_info.city);
    setValue("zipCode", shipping_info.zipCode);
    setValue("contactNo", shipping_info.contactNo);
    setValue("email", shipping_info.email);
    setValue("orderNote", shipping_info.orderNote);
  }, [user, setValue, shipping_info, router]);

  const getResultErrorMessage = (result, fallback = "Something went wrong") => {
    const data = result?.error?.data;
    if (typeof data === "string") return data;
    return (
      data?.message ||
      data?.error ||
      result?.error?.error ||
      fallback
    );
  };

  const getThrownErrorMessage = (error, fallback = "Something went wrong") => {
    if (!error) return fallback;
    if (typeof error === "string") return error;
    const data = error?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || error?.error || fallback;
  };

  // submitHandler
  const submitHandler = async (data) => {
    if (data.payment === "Card" && !settings?.paymentCardEnabled) {
      notifyError(t("paymentMethodNotEnabledCard"));
      setIsCheckoutSubmit(false);
      return;
    }
    if (data.payment === "COD" && settings?.paymentCodEnabled === false) {
      notifyError(t("paymentMethodNotEnabledCod"));
      setIsCheckoutSubmit(false);
      return;
    }
    if (data.payment === "PAYPAL" && settings?.paymentPaypalEnabled === false) {
      notifyError(t("paymentMethodNotEnabledPaypal"));
      setIsCheckoutSubmit(false);
      return;
    }
    if (data.payment === "BANK_TRANSFER" && settings?.paymentBankTransferEnabled === false) {
      notifyError(t("paymentMethodNotEnabledBankTransfer"));
      setIsCheckoutSubmit(false);
      return;
    }

    dispatch(set_shipping(data));
    setIsCheckoutSubmit(true);

    const giftWrapEnabled =
      data.giftWrapEnabled === true ||
      data.giftWrapEnabled === 1 ||
      data.giftWrapEnabled === "1" ||
      String(data.giftWrapEnabled || "").toLowerCase() === "true" ||
      String(data.giftWrapEnabled || "").toLowerCase() === "on";
    const giftWrap = {
      enabled: Boolean(settings?.giftWrapEnabled && giftWrapEnabled),
      type: String(data.giftWrapType || "").trim().toUpperCase(),
      message: String(data.giftWrapMessage || "").trim(),
    };

    let orderInfo = {
      name: `${data.firstName} ${data.lastName}`,
      address: data.address,
      contact: data.contactNo,
      email: data.email,
      city: data.city,
      country: data.country,
      zipCode: data.zipCode,
      shippingOption: data.shippingOption,
      status: "pending",
      cart: cart_products,
      paymentMethod: data.payment,
      subTotal: total,
      shippingCost: shippingCost,
      discount: discountAmount,
      bundleDiscount: bundleDiscountAmount,
      giftWrap,
      giftWrapFee,
      totalAmount: cartTotal,
      orderNote:data.orderNote,
      user: `${user?._id}`,
    };
    if (data.payment === 'Card') {
      if (!stripe || !elements) {
        notifyError(t("cardPaymentNotAvailable"));
        setIsCheckoutSubmit(false);
        return;
      }
      const card = elements.getElement(CardElement);
      if (card == null) {
        notifyError(t("cardPaymentNotAvailable"));
        setIsCheckoutSubmit(false);
        return;
      }
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
      });
      if (error && !paymentMethod) {
        setCardError(error.message);
        notifyError(error.message);
        setIsCheckoutSubmit(false);
        return;
      } else {
        setCardError('');
        const orderData = {
          ...orderInfo,
          cardInfo: paymentMethod,
        };

       return handlePaymentWithStripe(orderData);
      }
    }
    if (data.payment === 'COD') {
      saveOrder({
        ...orderInfo
      }).then(res => {
        if(res?.error){
          notifyError(getResultErrorMessage(res, t("somethingWentWrong")));
          setIsCheckoutSubmit(false)
        }
        else {
          localStorage.removeItem("cart_products")
          localStorage.removeItem("couponInfo");
          localStorage.removeItem("shipping_info");
          dispatch(get_cart_products());
          setIsCheckoutSubmit(false)
          notifySuccess(t("orderConfirmed"));
          router.push(`/order/${res.data?.order?._id}`);
        }
      })
    }

    if (data.payment === 'PAYPAL') {
      saveOrder({
        ...orderInfo
      }).then(res => {
        if(res?.error){
          notifyError(getResultErrorMessage(res, t("somethingWentWrong")));
          setIsCheckoutSubmit(false)
        }
        else {
          localStorage.removeItem("cart_products")
          localStorage.removeItem("couponInfo");
          localStorage.removeItem("shipping_info");
          dispatch(get_cart_products());
          setIsCheckoutSubmit(false)
          notifySuccess(t("orderConfirmed"));
          router.push(`/order/${res.data?.order?._id}`);
        }
      })
    }

    if (data.payment === 'BANK_TRANSFER') {
      saveOrder({
        ...orderInfo
      }).then(res => {
        if(res?.error){
          notifyError(getResultErrorMessage(res, t("somethingWentWrong")));
          setIsCheckoutSubmit(false)
        }
        else {
          localStorage.removeItem("cart_products")
          localStorage.removeItem("couponInfo");
          localStorage.removeItem("shipping_info");
          dispatch(get_cart_products());
          setIsCheckoutSubmit(false)
          notifySuccess(t("orderConfirmed"));
          router.push(`/order/${res.data?.order?._id}`);
        }
      })
    }
  };

  // handlePaymentWithStripe
  const handlePaymentWithStripe = async (order) => {
    try {
      if (!clientSecret) {
        notifyError(t("cardPaymentNotAvailable"));
        setIsCheckoutSubmit(false);
        return;
      }
      const {paymentIntent, error:intentErr} = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: user?.firstName,
              email: user?.email,
            },
          },
        },
      );
      if (intentErr) {
        notifyError(intentErr.message);
        setIsCheckoutSubmit(false);
        return;
      } else {
        // notifySuccess("Your payment processed successfully");
      }

      const orderData = {
        ...order,
        paymentIntent,
      };

      saveOrder({
        ...orderData
      })
      .then((result) => {
          if(result?.error){
            notifyError(getResultErrorMessage(result, t("somethingWentWrong")));
            setIsCheckoutSubmit(false);
          }
          else {
            localStorage.removeItem("cart_products");
            localStorage.removeItem("couponInfo");
            localStorage.removeItem("shipping_info");
            dispatch(get_cart_products());
            setIsCheckoutSubmit(false);
            notifySuccess(t("orderConfirmed"));
            router.push(`/order/${result.data?.order?._id}`);
          }
        })
       } 
    catch (err) {
      notifyError(getThrownErrorMessage(err, t("paymentFailed")));
      setIsCheckoutSubmit(false);
    }
  };

  return {
    handleCouponCode,
    couponRef,
    handleShippingCost,
    discountAmount,
    total,
    shippingCost,
    discountPercentage,
    discountProductType,
    isCheckoutSubmit,
    setTotal,
    register,
    errors,
    cardError,
    submitHandler,
    stripe,
    handleSubmit,
    clientSecret,
    setClientSecret,
    cartTotal,
    selectedPayment,
    couponApplyMsg,
    showCard,
    setShowCard,
    watch,
    giftWrapFee,
    bundleDiscountAmount,
  };
};

export default useCheckoutSubmit;
