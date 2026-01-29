import React from "react";
import Link from "next/link";
import useCartInfo from "@/hooks/use-cart-info";
import { useState } from "react";
import { useLanguage } from "@/context/language-context";
import { useGetGlobalSettingsQuery } from "@/redux/features/settingApi";

const CartCheckout = () => {
  const { total } = useCartInfo();
  const [shipCost, setShipCost] = useState(0);
  const { formatPrice, t } = useLanguage();
  const { data: settings } = useGetGlobalSettingsQuery();

  const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : NaN;
  };

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

  const findTierCost = (option) => {
    if (!option) return null;
    for (const tier of tiers) {
      if (!tier || typeof tier !== "object") continue;
      const tierCity = String(tier.city || "").trim();
      if (tierCity) continue;
      const tierOption = String(tier.option || "").trim().toUpperCase();
      const minSubtotal = Number.isFinite(toNumber(tier.minSubtotal)) ? toNumber(tier.minSubtotal) : 0;
      const maxSubtotalRaw = toNumber(tier.maxSubtotal);
      const hasMax = Number.isFinite(maxSubtotalRaw) && maxSubtotalRaw > 0;
      const cost = toNumber(tier.cost);
      if (!Number.isFinite(cost) || cost < 0) continue;

      const optionOk = !tierOption || tierOption === option;
      const minOk = total >= minSubtotal;
      const maxOk = !hasMax || total <= maxSubtotalRaw;
      if (optionOk && minOk && maxOk) return cost;
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

  return (
    <div className="tp-cart-checkout-wrapper">
      <div className="tp-cart-checkout-top d-flex align-items-center justify-content-between">
        <span className="tp-cart-checkout-top-title">{t("subtotal")}</span>
        <span className="tp-cart-checkout-top-price">{formatPrice(total)}</span>
      </div>
      <div className="tp-cart-checkout-shipping">
        <h4 className="tp-cart-checkout-shipping-title">{t("shipping")}</h4>
        <div className="tp-cart-checkout-shipping-option-wrapper">
          <div className="tp-cart-checkout-shipping-option">
            <input id="shipping_express" type="radio" name="shipping" />
            <label htmlFor="shipping_express" onClick={() => setShipCost(expressChargeShown)}>
              {t("deliveryToday")}: <span>{formatPrice(expressChargeShown)}</span>
            </label>
          </div>
          <div className="tp-cart-checkout-shipping-option">
            <input id="shipping_standard" type="radio" name="shipping" />
            <label htmlFor="shipping_standard" onClick={() => setShipCost(standardChargeShown)}>
              {t("deliverySevenDays")}: <span>{formatPrice(standardChargeShown)}</span>
            </label>
          </div>
        </div>
      </div>
      <div className="tp-cart-checkout-total d-flex align-items-center justify-content-between">
        <span>{t("total")}</span>
        <span>{formatPrice(total + shipCost)}</span>
      </div>
      <div className="tp-cart-checkout-proceed">
        <Link href="/checkout" className="tp-cart-checkout-btn w-100">
          {t("proceedToCheckout")}
        </Link>
      </div>
    </div>
  );
};

export default CartCheckout;
