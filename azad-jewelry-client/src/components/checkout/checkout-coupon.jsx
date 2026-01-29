import { useState } from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "@/context/language-context";

const CheckoutCoupon = ({ handleCouponCode, couponRef,couponApplyMsg }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { coupon_info } = useSelector((state) => state.coupon);
  const { t } = useLanguage();
  return (
    <div className="tp-checkout-verify-item">
      <p className="tp-checkout-verify-reveal">
        {t("haveCoupon")}{" "}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="tp-checkout-coupon-form-reveal-btn"
        >
          {t("clickToEnterCode")}
        </button>
      </p>

      {isOpen && (
        <div id="tpCheckoutCouponForm" className="tp-return-customer">
          <form onSubmit={handleCouponCode}>
            <div className="tp-return-customer-input">
              <label>{t("couponCode")} :</label>
              <input ref={couponRef} type="text" placeholder={t("coupon")} />
            </div>
            <button
              type="submit"
              className="tp-return-customer-btn tp-checkout-btn"
            >
              {t("apply")}
            </button>
          </form>
          {couponApplyMsg && <p className="p-2" style={{color:'green'}}>{couponApplyMsg}</p>}
        </div>
      )}
    </div>
  );
};

export default CheckoutCoupon;
