import React from "react";
import Link from "next/link";
// internal
import { ArrowRight } from "@/svg";
import banner_1 from "@assets/img/product/banner/product-banner-1.jpg";
import banner_2 from "@assets/img/product/banner/product-banner-2.jpg";
import { useLanguage } from "@/context/language-context";


// banner item
function BannerItem({ sm = false, bg, title }) {
  const { t } = useLanguage();
  return (
    <div
      className={`tp-banner-item ${
        sm ? "tp-banner-item-sm" : ""
      } tp-banner-height p-relative mb-30 z-index-1 fix`}
    >
      <div
        className="tp-banner-thumb include-bg transition-3"
        style={{ backgroundImage: `url(${bg.src})` }}
      ></div>
      <div className="tp-banner-content">
        {!sm && <span>{t("sale20OffAllStore")}</span>}
        <h3 className="tp-banner-title">
          <Link href="/shop">{title}</Link>
        </h3>
        {sm && <p>{t("sale35Off")}</p>}
        <div className="tp-banner-btn">
          <Link href="/shop" className="tp-link-btn">
            {t("shopNow")}
            <ArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}

const BannerArea = () => {
  const { t } = useLanguage();
  return (
    <section className="tp-banner-area pb-70">
      <div className="container">
        <div className="row">
          <div className="col-xl-8 col-lg-7">
            <BannerItem
              bg={banner_1}
              title={
                <>
                  {t("bannerSmartphoneLine1")} <br /> {t("bannerSmartphoneLine2")}
                </>
              }
            />
          </div>
          <div className="col-xl-4 col-lg-5">
            <BannerItem
              sm={true}
              bg={banner_2}
              title={
                <>
                  {t("bannerHyperXLine1")} <br /> {t("bannerHyperXLine2")}
                </>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerArea;
