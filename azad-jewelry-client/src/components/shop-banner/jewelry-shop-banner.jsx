import React from 'react';
import Link from 'next/link';
// internal
import { ArrowRightLong } from '@/svg';
import banner_bg_1 from '@assets/img/banner/4/banner-1.jpg';
import banner_bg_2 from '@assets/img/banner/4/banner-2.jpg';
import banner_bg_3 from '@assets/img/banner/4/banner-3.jpg';
import banner_bg_4 from '@assets/img/banner/4/banner-4.jpg';
import { useLanguage } from "@/context/language-context";

// BannerItem
function BannerItem({ cls, bg_clr, bg, content, title,isBtn=false}) {
  const { t } = useLanguage();
  return (
    <div className={`tp-banner-item-4 tp-banner-height-4 fix p-relative z-index-1 ${cls}`} 
    data-bg-color={`#${bg_clr}`}>
      <div className="tp-banner-thumb-4 include-bg black-bg transition-3" 
      style={{backgroundImage:`url(${bg.src})`}}></div>
      <div className="tp-banner-content-4">
        <span>{content}</span>
        <h3 className="tp-banner-title-4">
          <Link href="/shop">{title}</Link>
        </h3>
        {isBtn && <div className="tp-banner-btn-4">
          <Link href="/shop" className="tp-btn tp-btn-border">
            {t("shopNow")} {" "} <ArrowRightLong/>
          </Link>
        </div>}
      </div>
    </div>
  )
}

const JewelryShopBanner = () => {
  const { t } = useLanguage();
  return (
    <>
      <section className="tp-banner-area">
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-lg-7">
              <div className="row">
                <div className="col-xl-12">
                  <BannerItem
                    cls="mb-25"
                    bg_clr="F3F7FF"
                    bg={banner_bg_1}
                    content={t("collection")}
                    title={
                      <>
                        {t("jewelryBannerTitle1Line1")} <br /> {t("jewelryBannerTitle1Line2")}
                      </>
                    }
                    isBtn={true}
                  />
                </div>
                <div className="col-md-6 col-sm-6">
                <BannerItem
                  cls="has-green sm-banner"
                  bg_clr="F0F6EF"
                  bg={banner_bg_2}
                  content={t("trending")}
                  title={t("jewelryBannerTitle2")}
                />
  
                </div>
                <div className="col-md-6 col-sm-6">
                <BannerItem
                  cls="has-brown sm-banner"
                  bg_clr="F8F1E6"
                  bg={banner_bg_3}
                  content={t("newArrival")}
                  title={t("jewelryBannerTitle3")}
                />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-5">
              <div className="tp-banner-full tp-banner-full-height fix p-relative z-index-1">
                <div className="tp-banner-full-thumb include-bg black-bg transition-3" 
                style={{backgroundImage:`url(${banner_bg_4.src})`}}></div>
                <div className="tp-banner-full-content">
                  <span>{t("collection")}</span>
                  <h3 className="tp-banner-full-title">
                    <Link href="/shop">
                      {t("jewelryBannerFullTitleLine1")} <br /> {t("jewelryBannerFullTitleLine2")}
                    </Link>
                  </h3>
                  <div className="tp-banner-full-btn">
                    <Link href="/shop" className="tp-btn tp-btn-border">
                      {t("shopNow")}{" "}<ArrowRightLong/>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default JewelryShopBanner;
