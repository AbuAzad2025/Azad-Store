import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
//internal
import thumb_bg from '@assets/img/product/collection/4/collection-1.jpg';
import side_text from '@assets/img/product/collection/4/side-text.png';
import collection_sm from '@assets/img/product/collection/4/collection-sm-1.jpg';
import { ArrowRightSm, PlusTwo } from '@/svg';
import { useLanguage } from "@/context/language-context";

const JewelryCollectionBanner = () => {
  const { t } = useLanguage();
  return (
    <>
      <section className="tp-collection-area">
        <div className="container-fluid">
          <div className="tp-collection-inner-4 pl-100 pr-100">
            <div className="row gx-0">
              <div className="col-xl-6 col-lg-6">
                <div className="tp-collection-thumb-wrapper-4 p-relative fix z-index-1" >
                  <div className="tp-collection-thumb-4 include-bg black-bg" 
                    style={{backgroundImage:`url(${thumb_bg.src})`}}>
                  </div>
                  <span className="tp-collection-thumb-info-4">{t("withNewLookCollection")}</span>

                  <div className="tp-collection-hotspot-item tp-collection-hotspot-1">
                    <span className="tp-hotspot tp-pulse-border ">
                      <PlusTwo />
                    </span>
                    <div className="tp-collection-hotspot-content">
                      <h3 className="tp-collection-hotspot-title">{t("spotlightProductTitle")}</h3>
                      <p>{t("spotlightProductDesc")}</p>
                    </div>
                  </div>

                  <div className="tp-collection-hotspot-item tp-collection-hotspot-2">
                    <span className="tp-hotspot tp-pulse-border ">
                      <PlusTwo />
                    </span>
                    <div className="tp-collection-hotspot-content on-top">
                      <h3 className="tp-collection-hotspot-title">{t("spotlightProductTitle")}</h3>
                      <p>{t("spotlightProductDesc")}</p>
                    </div>
                  </div>

                </div>
              </div>
              <div className="col-xl-6 col-lg-6">
                <div className="tp-collection-wrapper-4 p-relative pt-90 pb-95" 
                style={{backgroundColor:`#F6F6F6`}}>
                  <span className="tp-collection-side-text">
                    <Image src={side_text} alt="text img" />
                  </span>
                  <div className="row justify-content-center">
                    <div className="col-xl-6 col-lg-8">
                      <div className="tp-collection-item-4 text-center">
                        <span className="tp-collection-subtitle-4">{t("buildYourOwnSets")}</span>
                        <div className="tp-collection-thumb-banner-4 m-img">
                          <Link href="/shop">
                            <Image src={collection_sm} alt="collection_sm img" />
                          </Link>
                        </div>
                        <div className="tp-collection-content-4">
                          <h3 className="tp-collection-title-4">
                            <Link href="/shop">{t("ourFinestJewelry")}</Link>
                          </h3>
                          <div className="tp-collection-btn-4">
                            <Link href="/shop" className="tp-link-btn-line-2">
                              {t("shopThisCollection")} {" "} <ArrowRightSm />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
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

export default JewelryCollectionBanner;
