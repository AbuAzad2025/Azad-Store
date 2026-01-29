import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";
import DetailsThumbWrapper from "./details-thumb-wrapper";
import DetailsWrapper from "./details-wrapper";
import DetailsTabNav from "./details-tab-nav";
import RelatedProducts from "./related-products";
import { useLanguage } from "@/context/language-context";
import { useGetProductsByIdsMutation } from "@/redux/features/productApi";
import ProductItem from "../products/beauty/product-item";
import ErrorMsg from "../common/error-msg";
import { HomeNewArrivalPrdLoader } from "../loader";
import { getCachedGlobalSettings, useGetGlobalSettingsQuery } from "@/redux/features/settingApi";

const RECENTLY_VIEWED_KEY = "recently_viewed_product_ids";

const readRecentlyViewedIds = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
};

const writeRecentlyViewedIds = (ids) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids));
  } catch {
  }
};

const slider_setting = {
  slidesPerView: 4,
  spaceBetween: 24,
  autoplay: { delay: 5000 },
  breakpoints: {
    1200: { slidesPerView: 4 },
    992: { slidesPerView: 3 },
    768: { slidesPerView: 2 },
    576: { slidesPerView: 2 },
    0: { slidesPerView: 1 },
  },
};

const ProductDetailsArea = ({ productItem }) => {
  const { _id, img, imageURLs, videoId,status } = productItem || {};
  const [activeImg, setActiveImg] = useState(img);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [fetchProductsByIds, { isLoading: isRecentLoading, isError: isRecentError }] =
    useGetProductsByIdsMutation();
  const { t } = useLanguage();
  const { data: settings } = useGetGlobalSettingsQuery();
  const cachedSettings = getCachedGlobalSettings();
  // active image change when img change
  useEffect(() => {
    setActiveImg(img);
  }, [img]);

  useEffect(() => {
    const id = _id ? String(_id) : "";
    if (!id) return;

    const existing = readRecentlyViewedIds().filter((x) => x !== id);
    const updated = [id, ...existing].slice(0, 12);
    writeRecentlyViewedIds(updated);

    const idsToFetch = updated.filter((x) => x !== id).slice(0, 8);
    if (idsToFetch.length === 0) {
      setRecentlyViewed([]);
      return;
    }

    fetchProductsByIds({ ids: idsToFetch, limit: 8 })
      .unwrap()
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        const index = new Map(idsToFetch.map((v, i) => [String(v), i]));
        setRecentlyViewed(
          data
            .slice()
            .sort(
              (a, b) =>
                (index.get(String(a?._id)) ?? Number.MAX_SAFE_INTEGER) -
                (index.get(String(b?._id)) ?? Number.MAX_SAFE_INTEGER)
            )
        );
      })
      .catch(() => {
        setRecentlyViewed([]);
      });
  }, [_id, fetchProductsByIds]);

  // handle image active
  const handleImageActive = (item) => {
    setActiveImg(item.img);
  };
  return (
    <section className="tp-product-details-area">
      <div className="tp-product-details-top pb-115">
        <div className="container">
          <div className="row">
            <div className="col-xl-7 col-lg-6">
              {/* product-details-thumb-wrapper start */}
              <DetailsThumbWrapper
                activeImg={activeImg}
                handleImageActive={handleImageActive}
                imageURLs={imageURLs}
                imgWidth={580}
                imgHeight={670}
                videoId={videoId}
                status={status}
              />
              {/* product-details-thumb-wrapper end */}
            </div>
            <div className="col-xl-5 col-lg-6">
              {/* product-details-wrapper start */}
              <DetailsWrapper
                productItem={productItem}
                handleImageActive={handleImageActive}
                activeImg={activeImg}
                detailsBottom={true}
              />
              {/* product-details-wrapper end */}
            </div>
          </div>
        </div>
      </div>

      {/* product details description */}
      <div className="tp-product-details-bottom pb-140">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <DetailsTabNav product={productItem} />
            </div>
          </div>
        </div>
      </div>
      {/* product details description */}

      {/* related products start */}
      <section className="tp-related-product pt-95 pb-50">
        <div className="container">
          <div className="row">
            <div className="tp-section-title-wrapper-6 text-center mb-40">
              <span className="tp-section-title-pre-6">{t("bundleSubtitle")}</span>
              <h3 className="tp-section-title-6">{t("completeYourLook")}</h3>
              {(settings?.bundleDiscountEnabled || cachedSettings?.bundleDiscountEnabled) && (
                <div className="mt-10">
                  <span className="badge bg-light text-dark">
                    {t("bundleDiscountHint", {
                      percent: settings?.bundleDiscountPercent ?? cachedSettings?.bundleDiscountPercent ?? 0,
                      minItems: settings?.bundleDiscountMinItems ?? cachedSettings?.bundleDiscountMinItems ?? 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="row">
            <RelatedProducts id={_id} />
          </div>
        </div>
      </section>
      {/* related products end */}

      {isRecentLoading ? (
        <section className="tp-related-product pt-95 pb-50">
          <div className="container">
            <div className="row">
              <div className="tp-section-title-wrapper-6 text-center mb-40">
                <span className="tp-section-title-pre-6">{t("recentlyViewedSubtitle")}</span>
                <h3 className="tp-section-title-6">{t("recentlyViewed")}</h3>
              </div>
            </div>
            <div className="row">
              <HomeNewArrivalPrdLoader loading={true} />
            </div>
          </div>
        </section>
      ) : isRecentError ? (
        <section className="tp-related-product pt-95 pb-50">
          <div className="container">
            <div className="row">
              <div className="tp-section-title-wrapper-6 text-center mb-40">
                <span className="tp-section-title-pre-6">{t("recentlyViewedSubtitle")}</span>
                <h3 className="tp-section-title-6">{t("recentlyViewed")}</h3>
              </div>
            </div>
            <div className="row">
              <ErrorMsg msg={t("errorGeneric")} />
            </div>
          </div>
        </section>
      ) : recentlyViewed.length > 0 ? (
        <section className="tp-related-product pt-95 pb-50">
          <div className="container">
            <div className="row">
              <div className="tp-section-title-wrapper-6 text-center mb-40">
                <span className="tp-section-title-pre-6">{t("recentlyViewedSubtitle")}</span>
                <h3 className="tp-section-title-6">{t("recentlyViewed")}</h3>
              </div>
            </div>
            <div className="row">
              <div className="tp-product-related-slider">
                <Swiper
                  {...slider_setting}
                  modules={[Autoplay]}
                  className="tp-product-related-slider-active swiper-container mb-10"
                >
                  {recentlyViewed.map((item) => (
                    <SwiperSlide key={item._id}>
                      <ProductItem product={item} primary_style={true} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </section>
  );
};

export default ProductDetailsArea;
