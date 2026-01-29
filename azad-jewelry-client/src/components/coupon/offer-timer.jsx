import React from "react";
import { useTimer } from "react-timer-hook";
import { useLanguage } from "@/context/language-context";

const OfferTimer = ({ expiryTimestamp }) => {
  const { seconds, minutes, hours, days } = useTimer({ expiryTimestamp });
  const { t } = useLanguage();
  return (
    <div className="tp-coupon-countdown-inner">
      <ul>
        <li>
          <span>{days}</span> {t("day")}
        </li>
        <li>
          <span>{hours}</span> {t("hrs")}
        </li>
        <li>
          <span>{minutes}</span> {t("min")}
        </li>
        <li>
          <span>{seconds}</span> {t("sec")}
        </li>
      </ul>
    </div>
  );
};

export default OfferTimer;
