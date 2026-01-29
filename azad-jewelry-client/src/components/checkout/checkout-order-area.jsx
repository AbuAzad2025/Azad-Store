import { CardElement } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
// internal
import useCartInfo from "@/hooks/use-cart-info";
import ErrorMsg from "../common/error-msg";
import { useLanguage } from "@/context/language-context";
import { useGetGlobalSettingsQuery } from "@/redux/features/settingApi";

const CheckoutOrderArea = ({ checkoutData }) => {
  const {
    handleShippingCost,
    cartTotal = 0,
    stripe,
    isCheckoutSubmit,
    clientSecret,
    selectedPayment,
    register,
    errors,
    showCard,
    setShowCard,
    shippingCost,
    discountAmount,
    watch,
    giftWrapFee,
    bundleDiscountAmount
  } = checkoutData;
  const { cart_products } = useSelector((state) => state.cart);
  const { total } = useCartInfo();
  const { formatPrice, t } = useLanguage();
  const { data: settings } = useGetGlobalSettingsQuery();
  const isCardSelected = selectedPayment === "Card";
  const isPaypalSelected = selectedPayment === "PAYPAL";
  const isBankTransferSelected = selectedPayment === "BANK_TRANSFER";
  const isCardReady = Boolean(stripe && clientSecret);
  const isCodEnabled = settings?.paymentCodEnabled !== false;
  const isCardEnabled = settings?.paymentCardEnabled === true;
  const isPaypalEnabled = settings?.paymentPaypalEnabled === true;
  const isBankTransferEnabled = settings?.paymentBankTransferEnabled === true;
  const hasAnyPaymentOption = isCardEnabled || isCodEnabled || isPaypalEnabled || isBankTransferEnabled;
  const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : NaN;
  };
  const cityField = typeof watch === "function" ? watch("city") : "";
  const freeMin = toNumber(settings?.freeShippingMinSubtotal);
  const standardCharge = Number.isFinite(toNumber(settings?.deliveryChargeStandard))
    ? toNumber(settings?.deliveryChargeStandard)
    : Number.isFinite(toNumber(settings?.deliveryCharge))
      ? toNumber(settings?.deliveryCharge)
      : 20;
  const expressCharge = Number.isFinite(toNumber(settings?.deliveryChargeExpress))
    ? toNumber(settings?.deliveryChargeExpress)
    : 60;
  const tiers = Array.isArray(settings?.shippingCostTiers) ? settings.shippingCostTiers : [];
  const cityNormalized = String(cityField || "").trim().toLowerCase();
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

  const isStandardFree = Number.isFinite(freeMin) && freeMin > 0 && total >= freeMin;
  const standardChargeShown = (() => {
    if (isStandardFree) return 0;
    const tierCost = findTierCost("STANDARD");
    return tierCost !== null ? tierCost : standardCharge;
  })();
  const expressChargeShown = (() => {
    const tierCost = findTierCost("EXPRESS");
    return tierCost !== null ? tierCost : expressCharge;
  })();
  const giftWrapEnabledSelectedRaw = typeof watch === "function" ? watch("giftWrapEnabled") : false;
  const giftWrapEnabledSelected =
    giftWrapEnabledSelectedRaw === true ||
    giftWrapEnabledSelectedRaw === 1 ||
    giftWrapEnabledSelectedRaw === "1" ||
    String(giftWrapEnabledSelectedRaw || "").toLowerCase() === "true" ||
    String(giftWrapEnabledSelectedRaw || "").toLowerCase() === "on";
  return (
    <div className="tp-checkout-place white-bg">
      <h3 className="tp-checkout-place-title">{t("yourOrder")}</h3>

      <div className="tp-order-info-list">
        <ul>
          {/*  header */}
          <li className="tp-order-info-list-header">
            <h4>{t("product")}</h4>
            <h4>{t("total")}</h4>
          </li>

          {/*  item list */}
          {cart_products.map((item) => (
            <li key={item._id} className="tp-order-info-list-desc">
              <p>
                {item.title} <span> x {item.orderQuantity}</span>
              </p>
              <span>{formatPrice(item.price)}</span>
            </li>
          ))}

          {/*  shipping */}
          <li className="tp-order-info-list-shipping">
            <span>{t("shipping")}</span>
            <div className="tp-order-info-list-shipping-item d-flex flex-column">
              <span>
                <input
                  {...register(`shippingOption`, {
                    required: t("shippingOptionRequired"),
                  })}
                  id="shipping_express"
                  type="radio"
                  name="shippingOption"
                  value="EXPRESS"
                  onChange={() => handleShippingCost(expressChargeShown)}
                />
                <label htmlFor="shipping_express">
                  {t("deliveryToday")}: <span>{formatPrice(expressChargeShown)}</span>
                </label>
                <ErrorMsg msg={errors?.shippingOption?.message} />
              </span>
              <span>
                <input
                  {...register(`shippingOption`, {
                    required: t("shippingOptionRequired"),
                  })}
                  id="shipping_standard"
                  type="radio"
                  name="shippingOption"
                  value="STANDARD"
                  onChange={() => handleShippingCost(standardChargeShown)}
                />
                <label htmlFor="shipping_standard">
                  {t("deliverySevenDays")}: <span>{formatPrice(standardChargeShown)}</span>
                </label>
                <ErrorMsg msg={errors?.shippingOption?.message} />
              </span>
            </div>
          </li>

          {settings?.giftWrapEnabled === true && (
            <li className="tp-order-info-list-shipping">
              <span>{t("giftWrap")}</span>
              <div className="tp-order-info-list-shipping-item d-flex flex-column">
                <span>
                  <input
                    {...register("giftWrapEnabled")}
                    id="gift_wrap_enabled"
                    type="checkbox"
                    name="giftWrapEnabled"
                  />
                  <label htmlFor="gift_wrap_enabled">{t("addGiftWrap")}</label>
                </span>
                {giftWrapEnabledSelected && (
                  <>
                    <span>
                      <select
                        {...register("giftWrapType")}
                        name="giftWrapType"
                        defaultValue="STANDARD"
                        className="tp-checkout-input"
                      >
                        <option value="STANDARD">{t("giftWrapStandard")}</option>
                        <option value="PREMIUM">{t("giftWrapPremium")}</option>
                      </select>
                    </span>
                    <span>
                      <textarea
                        {...register("giftWrapMessage")}
                        name="giftWrapMessage"
                        placeholder={t("giftWrapMessagePlaceholder")}
                      />
                    </span>
                  </>
                )}
              </div>
            </li>
          )}

           {/*  subtotal */}
           <li className="tp-order-info-list-subtotal">
            <span>{t("subtotal")}</span>
            <span>{formatPrice(total)}</span>
          </li>

           {/*  shipping cost */}
           <li className="tp-order-info-list-subtotal">
            <span>{t("shippingCost")}</span>
            <span>{formatPrice(shippingCost)}</span>
          </li>

           {giftWrapFee > 0 && (
             <li className="tp-order-info-list-subtotal">
               <span>{t("giftWrapFee")}</span>
               <span>{formatPrice(giftWrapFee)}</span>
             </li>
           )}

           {/* discount */}
           <li className="tp-order-info-list-subtotal">
            <span>{t("discount")}</span>
            <span>{formatPrice(discountAmount)}</span>
          </li>

          {bundleDiscountAmount > 0 && (
            <li className="tp-order-info-list-subtotal">
              <span>{t("bundleDiscount")}</span>
              <span>-{formatPrice(bundleDiscountAmount)}</span>
            </li>
          )}

          {/* total */}
          <li className="tp-order-info-list-total">
            <span>{t("total")}</span>
            <span>{formatPrice(Number(cartTotal) || 0)}</span>
          </li>
        </ul>
      </div>
      <div className="tp-checkout-payment">
        {!hasAnyPaymentOption && (
          <div className="tp-checkout-payment-item">
            <p className="mb-0">{t("noPaymentMethodsEnabled")}</p>
          </div>
        )}
        {isCardEnabled && (
        <div className="tp-checkout-payment-item">
          <input
            {...register(`payment`, {
              required: t("paymentOptionRequired"),
            })}
            type="radio"
            id="card"
            name="payment"
            value="Card"
            disabled={!stripe}
          />
          <label onClick={() => setShowCard(Boolean(stripe))} htmlFor="card" data-bs-toggle="direct-bank-transfer">
            {t("creditCard")}
          </label>
          {showCard && stripe && (
            <div className="direct-bank-transfer">
              <div className="payment_card">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": {
                          color: "#aab7c4",
                        },
                      },
                      invalid: {
                        color: "#9e2146",
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}
          <ErrorMsg msg={errors?.payment?.message} />
        </div>
        )}

        {isCodEnabled && (
        <div className="tp-checkout-payment-item">
          <input
            {...register(`payment`, {
              required: t("paymentOptionRequired"),
            })}
            onClick={() => setShowCard(false)}
            type="radio"
            id="cod"
            name="payment"
            value="COD"
          />
          <label htmlFor="cod">{t("cashOnDelivery")}</label>
          <ErrorMsg msg={errors?.payment?.message} />
        </div>
        )}

        {isPaypalEnabled && (
        <div className="tp-checkout-payment-item">
          <input
            {...register(`payment`, {
              required: t("paymentOptionRequired"),
            })}
            onClick={() => setShowCard(false)}
            type="radio"
            id="paypal"
            name="payment"
            value="PAYPAL"
          />
          <label htmlFor="paypal">PayPal</label>
          {isPaypalSelected && (
            <div className="direct-bank-transfer">
              <p className="mb-0">{t("paypalPaymentNote")}</p>
            </div>
          )}
          <ErrorMsg msg={errors?.payment?.message} />
        </div>
        )}

        {isBankTransferEnabled && (
        <div className="tp-checkout-payment-item">
          <input
            {...register(`payment`, {
              required: t("paymentOptionRequired"),
            })}
            onClick={() => setShowCard(false)}
            type="radio"
            id="bank_transfer"
            name="payment"
            value="BANK_TRANSFER"
          />
          <label htmlFor="bank_transfer">{t("bankTransferManualPayment")}</label>
          {isBankTransferSelected && settings?.bankTransferInstructions && (
            <div className="direct-bank-transfer">
              <p className="mb-0">{settings.bankTransferInstructions}</p>
            </div>
          )}
          <ErrorMsg msg={errors?.payment?.message} />
        </div>
        )}
      </div>

      <div className="tp-checkout-btn-wrapper">
        <button
          type="submit"
          disabled={!hasAnyPaymentOption || isCheckoutSubmit || (isCardSelected && !isCardReady)}
          className="tp-checkout-btn w-100"
        >
          {t("placeOrder")}
        </button>
      </div>
    </div>
  );
};

export default CheckoutOrderArea;
