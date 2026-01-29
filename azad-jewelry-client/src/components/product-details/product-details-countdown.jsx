import React from "react";
import Timer from "../common/timer";
import dayjs from "dayjs";
import { useLanguage } from "@/context/language-context";

const ProductDetailsCountdown = ({ offerExpiryTime }) => {
  const { t } = useLanguage();
  return (
    <div className="tp-product-details-countdown d-flex align-items-center justify-content-between flex-wrap mt-25 mb-25">
      <h4 className="tp-product-details-countdown-title">
        <i className="fa-solid fa-fire-flame-curved"></i> {t("flashSaleEndsIn")}{" "}
      </h4>
      <div
        className="tp-product-details-countdown-time"
      >
        {dayjs().isAfter(offerExpiryTime) ? (
          <ul>
            <li>
              <span>{0}</span> {t("day")}
            </li>
            <li>
              <span>{0}</span> {t("hrs")}
            </li>
            <li>
              <span>{0}</span> {t("min")}
            </li>
            <li>
              <span>{0}</span> {t("sec")}
            </li>
          </ul>
        ) : (
          <Timer expiryTimestamp={new Date(offerExpiryTime)} />
        )}
      </div>
    </div>
  );
};

export default ProductDetailsCountdown;
