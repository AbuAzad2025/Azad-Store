import React, { useEffect, useState } from 'react';
import { Rating } from 'react-simple-star-rating';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
// internal
import { AskQuestion, CompareTwo, WishlistTwo } from '@/svg';
import DetailsBottomInfo from './details-bottom-info';
import ProductDetailsCountdown from './product-details-countdown';
import ProductQuantity from './product-quantity';
import { add_cart_product } from '@/redux/features/cartSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { add_to_compare } from '@/redux/features/compareSlice';
import { handleModalClose } from '@/redux/features/productModalSlice';
import { useLanguage } from "@/context/language-context";
import { getCachedGlobalSettings, useGetGlobalSettingsQuery } from "@/redux/features/settingApi";

const DetailsWrapper = ({ productItem, handleImageActive, activeImg, detailsBottom = false }) => {
  const { sku, img, title, imageURLs, category, description, discount, price, status, reviews, tags, offerDate, quantity } = productItem || {};
  const [ratingVal, setRatingVal] = useState(0);
  const [textMore, setTextMore] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const dispatch = useDispatch()
  const { orderQuantity } = useSelector((state) => state.cart);
  const { formatPrice, t } = useLanguage();
  const { data: settings } = useGetGlobalSettingsQuery();
  const cachedSettings = getCachedGlobalSettings();
  const quantityValueRaw = Number(quantity);
  const quantityValue = Number.isFinite(quantityValueRaw) ? quantityValueRaw : null;
  const lowStockThresholdRaw = Number(settings?.lowStockThreshold ?? cachedSettings?.lowStockThreshold);
  const lowStockThreshold = Number.isFinite(lowStockThresholdRaw) && lowStockThresholdRaw > 0 ? lowStockThresholdRaw : 5;
  const isOutOfStock = status === "out-of-stock" || quantityValue === 0;
  const isLowStock = !isOutOfStock && quantityValue !== null && quantityValue > 0 && quantityValue <= lowStockThreshold;

  const trackEvent = (event, payload = {}) => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });
  };

  const toInternationalPhone = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const compact = raw.replace(/\s+/g, "").replace(/-/g, "");
    if (compact.startsWith("+")) return compact;
    if (compact.startsWith("00")) return `+${compact.slice(2)}`;
    const digits = compact.replace(/[^\d]/g, "");
    if (!digits) return raw;
    if (digits.startsWith("970")) return `+${digits}`;
    if (digits.startsWith("0") && digits.length >= 9) return `+970${digits.slice(1)}`;
    return `+${digits}`;
  };

  const openWhatsappConsultation = (question) => {
    const configured = settings?.whatsappNumber || cachedSettings?.whatsappNumber || settings?.contactPhone || cachedSettings?.contactPhone;
    const phone = toInternationalPhone(configured);
    const digits = phone.replace(/[^\d]/g, "");
    if (!digits) return;

    const defaultMsg = String(settings?.whatsappDefaultMessage || cachedSettings?.whatsappDefaultMessage || "").trim();
    const url = typeof window !== "undefined" ? window.location.href : "";
    const questionLine = String(question || "").trim();
    const priceLine = Number.isFinite(Number(price)) ? formatPrice(price) : "";
    const msg = defaultMsg
      ? `${defaultMsg}\n\n${String(title || "")}\n${priceLine ? `${priceLine}\n` : ""}${url}${questionLine ? `\n\n${questionLine}` : ""}`
      : `${String(title || "")}\n${priceLine ? `${priceLine}\n` : ""}${url}${questionLine ? `\n\n${questionLine}` : ""}`;
    const href = `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
    trackEvent("whatsapp_click", {
      location: "product_details",
      productId: productItem?._id ? String(productItem._id) : "",
      question: questionLine,
    });
    if (typeof window !== "undefined") {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const rating =
        reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length;
      setRatingVal(rating);
    } else {
      setRatingVal(0);
    }
  }, [reviews]);

  // handle add product
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
    trackEvent("add_to_cart", {
      productId: prd?._id ? String(prd._id) : "",
      title: String(prd?.title || ""),
      price: Number(prd?.price) || 0,
      quantity: Number(orderQuantity) || 1,
    });
  };

  // handle wishlist product
  const handleWishlistProduct = (prd) => {
    dispatch(add_to_wishlist(prd));
  };

  // handle compare product
  const handleCompareProduct = (prd) => {
    dispatch(add_to_compare(prd));
  };

  return (
    <div className="tp-product-details-wrapper">
      <div className="tp-product-details-category">
        <span>{category.name}</span>
      </div>
      <h3 className="tp-product-details-title">{title}</h3>
      <div className="tp-product-details-rating-wrapper d-flex align-items-center mb-10">
        <div className="tp-product-details-rating">
          <Rating allowFraction size={16} initialValue={ratingVal} readonly={true} />
        </div>
        <div className="tp-product-details-reviews">
          <span>
            {ratingVal > 0 ? `${ratingVal.toFixed(1)} ` : ""}
            ({reviews && reviews.length > 0 ? reviews.length : 0} {t("review")})
          </span>
        </div>
      </div>

      {/* inventory details */}
      <div className="tp-product-details-inventory d-flex align-items-center mb-10">
        <div className="tp-product-details-stock mb-10">
          <span>{isOutOfStock ? t("outOfStock") : t("inStock")}</span>
          {isLowStock && (
            <span className="ms-2 text-danger">{t("onlyXLeft", { count: quantityValue })}</span>
          )}
        </div>
      </div>
      <div className="tp-product-details-inventory d-flex align-items-center mb-10">
        <span className="me-2">{t("deliveryEstimate")}:</span>
        <span>
          {t("deliveryEstimateDaysRange", {
            min: settings?.deliveryEstimateMinDays ?? cachedSettings?.deliveryEstimateMinDays ?? 1,
            max: settings?.deliveryEstimateMaxDays ?? cachedSettings?.deliveryEstimateMaxDays ?? 3,
          })}
        </span>
      </div>
      <p>{textMore ? description : `${description.substring(0, 100)}...`}
        <span onClick={() => setTextMore(!textMore)}>{textMore ? t("seeLess") : t("seeMore")}</span>
      </p>

      {/* price */}
      <div className="tp-product-details-price-wrapper mb-20">
        {discount > 0 ? (
          <>
            <span className="tp-product-details-price old-price">
              {formatPrice(price)}
            </span>
            <span className="tp-product-details-price new-price">
              {formatPrice(Number(price) - (Number(price) * Number(discount)) / 100)}
            </span>
          </>
        ) : (
          <span className="tp-product-details-price new-price">{formatPrice(price)}</span>
        )}
      </div>

      {/* variations */}

      {/* variations */}
      {imageURLs.some(item => item?.color && item?.color?.name) && <div className="tp-product-details-variation">
        <div className="tp-product-details-variation-item">
          <h4 className="tp-product-details-variation-title">{t("color")} :</h4>
          <div className="tp-product-details-variation-list">
            {imageURLs.map((item, i) => (
              <button onClick={() => handleImageActive(item)} key={i} type="button"
                className={`color tp-color-variation-btn ${item.img === activeImg ? "active" : ""}`} >
                <span
                  data-bg-color={`${item.color.clrCode}`}
                  style={{ backgroundColor: `${item.color.clrCode}` }}
                ></span>
                {item.color && item.color.name && (
                  <span className="tp-color-variation-tootltip">
                    {item.color.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>}

      {/* if ProductDetailsCountdown true start */}
      {offerDate?.endDate && <ProductDetailsCountdown offerExpiryTime={offerDate?.endDate} />}
      {/* if ProductDetailsCountdown true end */}

      <div className="tp-product-details-msg mb-15">
        <ul>
          <li>{t("sameDayDispatch")}</li>
          <li>{t("easyReturns")}</li>
          <li>{t("securePayment")}</li>
        </ul>
      </div>
      <div className="mb-15">
        <Link href="/shipping-policy" className="me-3">
          {t("shippingPolicy")}
        </Link>
        <Link href="/returns">{t("returns")}</Link>
      </div>

      <div className="tp-product-details-category mb-15">
        <button type="button" className="tp-product-details-buy-now-btn w-100" onClick={() => setShowSizeGuide((v) => !v)}>
          {t("sizeGuide")}
        </button>
        {showSizeGuide && (
          <div className="mt-3">
            <div className="tp-product-details-desc-content">
              <h4 className="mb-10">{t("sizeGuideRingTitle")}</h4>
              <p className="mb-15">{t("sizeGuideRingDesc")}</p>
              <h4 className="mb-10">{t("sizeGuideBraceletTitle")}</h4>
              <p className="mb-15">{t("sizeGuideBraceletDesc")}</p>
              <h4 className="mb-10">{t("sizeGuideNecklaceTitle")}</h4>
              <p className="mb-0">{t("sizeGuideNecklaceDesc")}</p>
            </div>
          </div>
        )}
      </div>

      {/* actions */}
      <div className="tp-product-details-action-wrapper">
        <h3 className="tp-product-details-action-title">{t("quantity")}</h3>
        <div className="tp-product-details-action-item-wrapper d-sm-flex align-items-center">
          {/* product quantity */}
          <ProductQuantity />
          {/* product quantity */}
          <div className="tp-product-details-add-to-cart mb-15 w-100">
            <button type="button" onClick={() => handleAddProduct(productItem)} disabled={isOutOfStock} className="tp-product-details-add-to-cart-btn w-100">{t("addToCart")}</button>
          </div>
        </div>
        <Link href="/cart" onClick={() => dispatch(handleModalClose())} className="tp-product-details-buy-now-btn w-100">
          {t("buyNow")}
        </Link>
        <button type="button" onClick={() => openWhatsappConsultation(t("whatsappQuestionGeneral"))} className="tp-product-details-buy-now-btn w-100">
          {t("quickConsultation")}
        </button>
        <div className="d-flex flex-column gap-2 mt-10">
          <button type="button" onClick={() => openWhatsappConsultation(t("whatsappQuestionSize"))} className="tp-product-details-buy-now-btn w-100">
            {t("askAboutSize")}
          </button>
          <button type="button" onClick={() => openWhatsappConsultation(t("whatsappQuestionMaterial"))} className="tp-product-details-buy-now-btn w-100">
            {t("askAboutMaterial")}
          </button>
          <button type="button" onClick={() => openWhatsappConsultation(t("whatsappQuestionAvailability"))} className="tp-product-details-buy-now-btn w-100">
            {t("askAboutAvailability")}
          </button>
        </div>
      </div>

      {Array.isArray(reviews) && reviews.length > 0 && (
        <div className="tp-product-details-category mt-20">
          <h4 className="mb-15">{t("featuredReviews")}</h4>
          {reviews
            .slice()
            .sort((a, b) => {
              const ar = Number(a?.rating) || 0;
              const br = Number(b?.rating) || 0;
              if (br !== ar) return br - ar;
              const ad = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
              const bd = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
              return bd - ad;
            })
            .slice(0, 3)
            .map((r, idx) => (
              <div key={r?._id || idx} className="mb-15">
                <div className="d-flex align-items-center gap-2 mb-5">
                  <Rating allowFraction size={14} initialValue={Number(r?.rating) || 0} readonly={true} />
                  <span className="tp-product-details-reviews">
                    {String(r?.userId?.name || "").trim() || t("customer")}
                  </span>
                </div>
                <p className="mb-0">{String(r?.comment || "").trim()}</p>
              </div>
            ))}
        </div>
      )}
      {/* product-details-action-sm start */}
      <div className="tp-product-details-action-sm">
        <button disabled={isOutOfStock} onClick={() => handleCompareProduct(productItem)} type="button" className="tp-product-details-action-sm-btn">
          <CompareTwo />
          {t("compareProducts")}
        </button>
        <button disabled={isOutOfStock} onClick={() => handleWishlistProduct(productItem)} type="button" className="tp-product-details-action-sm-btn">
          <WishlistTwo />
          {t("addToWishlist")}
        </button>
        <button type="button" onClick={() => openWhatsappConsultation(t("whatsappQuestionGeneral"))} className="tp-product-details-action-sm-btn">
          <AskQuestion />
          {t("askQuestion")}
        </button>
      </div>
      {/* product-details-action-sm end */}

      {detailsBottom && <DetailsBottomInfo category={category?.name} sku={sku} tag={tags[0]} />}
    </div>
  );
};

export default DetailsWrapper;
