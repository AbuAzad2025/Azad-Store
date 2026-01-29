import React from "react";
import { useTimer } from "react-timer-hook";
import { useLanguage } from "@/context/language-context";

const Timer = ({ expiryTimestamp }) => {
  const { seconds, minutes, hours, days } = useTimer({ expiryTimestamp });
  const { t } = useLanguage();
  return (
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
  );
};

export default Timer;
