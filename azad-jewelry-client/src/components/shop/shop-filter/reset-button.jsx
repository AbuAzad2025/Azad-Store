import { useRouter } from "next/router";
import React from "react";
import { useLanguage } from "@/context/language-context";

const ResetButton = ({ shop_right = false }) => {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <div className="tp-shop-widget mb-50">
      <h3 className="tp-shop-widget-title">{t("resetFilter")}</h3>
      <button
        onClick={() =>
          router.push(`/${shop_right ? "shop-right-sidebar" : "shop"}`)
        }
        className="tp-btn"
      >
        {t("resetFilter")}
      </button>
    </div>
  );
};

export default ResetButton;
