import React from "react";
import Image from "next/image";
import payment_option_img from '@assets/img/product/icons/payment-option.png';
import { useLanguage } from "@/context/language-context";

const DetailsBottomInfo = ({sku,category,tag}) => {
  const { t } = useLanguage();
  return (
    <>
      {/* product-details-query */}
      <div className="tp-product-details-query">
        <div className="tp-product-details-query-item d-flex align-items-center">
          <span>{t("sku")}: </span>
          <p>{sku}</p>
        </div>
        <div className="tp-product-details-query-item d-flex align-items-center">
          <span>{t("categories")}: </span>
          <p>{category}</p>
        </div>
        <div className="tp-product-details-query-item d-flex align-items-center">
          <span>{t("tag")}: </span>
          <p>{tag}</p>
        </div>
      </div>

      {/*  product-details-social*/}

      <div className="tp-product-details-social">
        <span>{t("share")} </span>
        <a href="#" aria-label={t("facebook")} title={t("facebook")}>
          <i className="fa-brands fa-facebook-f"></i>
        </a>
        <a href="#" aria-label={t("twitter")} title={t("twitter")}>
          <i className="fa-brands fa-twitter"></i>
        </a>
        <a href="#" aria-label={t("linkedin")} title={t("linkedin")}>
          <i className="fa-brands fa-linkedin-in"></i>
        </a>
        <a href="#" aria-label={t("vimeo")} title={t("vimeo")}>
          <i className="fa-brands fa-vimeo-v"></i>
        </a>
      </div>

      {/* product-details-msg */}

      <div className="tp-product-details-msg mb-15">
        <ul>
          <li>{t("easyReturns")}</li>
          <li>{t("sameDayDispatch")}</li>
          <li>{t("freeShipping")}</li>
          <li>{t("securePayment")}</li>
        </ul>
      </div>
      {/* product-details-payment */}
      <div className="tp-product-details-payment d-flex align-items-center flex-wrap justify-content-between">
        <p>
          {t("secureCheckoutLine1")} <br /> {t("secureCheckoutLine2")}
        </p>
        <Image src={payment_option_img} alt={t("paymentOptions")} />
      </div>
    </>
  );
};

export default DetailsBottomInfo;
