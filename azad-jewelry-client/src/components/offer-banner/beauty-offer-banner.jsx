import React from 'react';
import { useTimer } from 'react-timer-hook';
import { ArrowRightSmTwo } from '@/svg';
import collection_thumb from '@assets/img/product/collection/collection-1.jpg';
import collection_thumb_2 from '@assets/img/product/collection/collection-2.jpg';
import Link from 'next/link';
import { useLanguage } from "@/context/language-context";

const BeautyOfferBanner = () => {
  const expiryTimestamp = new Date('2023-8-16');
  const { seconds, minutes, hours, days } = useTimer({expiryTimestamp});
  const { t } = useLanguage();
  const [offerBefore, offerAfter] = t("beautySelectionOffer", { discount: "__DISCOUNT__" }).split(
    "__DISCOUNT__"
  );
  return (
    <>
      <section className="tp-collection-area pt-120">
        <div className="container">
            <div className="row gx-2 gy-2 gy-md-0">
              <div className="col-xl-7 col-md-6">
                  <div className="tp-collection-item tp-collection-height grey-bg p-relative z-index-1 fix">
                    <div className="tp-collection-thumb include-bg include-bg transition-3" 
                    style={{backgroundImage:`url(${collection_thumb.src})`}}></div>
                    <div className="tp-collection-content">
                        <span>{t("cosmeticsCollection")}</span>
                        <h3 className="tp-collection-title">
                          <Link href="/shop">
                            {t("foundationAndPowderBrushLine1")} <br /> {t("foundationAndPowderBrushLine2")}
                          </Link>
                        </h3>
                        <div className="tp-collection-btn">
                          <Link href="/shop" className="tp-btn">
                              {t("discoverNow")} 
                              {" "}<ArrowRightSmTwo/>
                          </Link>
                        </div>
                    </div>
                  </div>
              </div>
              <div className="col-xl-5 col-md-6">
                  <div className="tp-collection-item tp-collection-height grey-bg p-relative z-index-1 fix">
                    <div className="tp-collection-thumb has-overlay include-bg transition-3" style={{backgroundImage:`url(${collection_thumb_2.src})`}} ></div>
                    <div className="tp-collection-content-1">
                        <h3 className="tp-collection-title-1">
                          <Link href="/shop">
                            {t("topsBlouseShirtsLine1")} <br /> {t("topsBlouseShirtsLine2")}
                          </Link>
                        </h3>
                        <div className="tp-collection-btn-1">
                          <Link href="/shop" className="tp-link-btn-line">{t("shopCollection")}</Link>
                        </div>
                    </div>
                  </div>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-xl-3 col-lg-4 col-md-5">
                  <div className="tp-collection-offer-wrapper mt-20">
                    <p>
                      {offerBefore}
                      <span>{t("beautySelectionDiscount")}</span>
                      {offerAfter}
                    </p>
                  </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-5">
                  <div className="tp-collection-countdown d-flex align-items-center justify-content-center justify-content-md-start ml-20 mt-20">
                    <div className="tp-product-countdown" data-countdown data-date="Sep 30 2024 20:20:22">
                        <div className="tp-product-countdown-inner">
                          <ul>
                              <li><span>{days}</span> {t("day")}</li>
                              <li><span>{hours}</span> {t("hrs")}</li>
                              <li><span>{minutes}</span> {t("min")}</li>
                          </ul>
                          {/* <Timer expiryTimestamp={time} /> */}
                        </div>
                    </div>
                    <div className="tp-product-countdown has-second" data-countdown data-date="Sep 30 2024 20:20:22">
                        <div className="tp-product-countdown-inner">
                          <ul>
                              <li><span suppressHydrationWarning>{seconds}</span> {t("sec")}</li>
                          </ul>
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

export default BeautyOfferBanner;
