import React from "react";
import useCartInfo from "@/hooks/use-cart-info";
import { useLanguage } from "@/context/language-context";
import { useGetGlobalSettingsQuery } from "@/redux/features/settingApi";

const RenderCartProgress = () => {
  const { total } = useCartInfo();
  const { formatPrice, t } = useLanguage();
  const { data: settings } = useGetGlobalSettingsQuery();

  const rawThreshold = Number(settings?.freeShippingMinSubtotal);
  const freeShippingThreshold =
    Number.isFinite(rawThreshold) && rawThreshold > 0 ? rawThreshold : 200;

  const progress = Math.min((total / freeShippingThreshold) * 100, 100);
  if (total < freeShippingThreshold) {
    const remainingAmount = Math.max(freeShippingThreshold - total, 0);
    return (
      <>
        <p>{t("addMoreForFreeShipping", { amount: formatPrice(remainingAmount) })}</p>
        <div className="progress">
          <div
            className="progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar"
            data-width={`${progress}%`}
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </>
    );
  }
  return (
    <>
      <p>{t("eligibleForFreeShipping")}</p>
      <div className="progress">
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          data-width={`${progress}%`}
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </>
  );
};

export default RenderCartProgress;
