import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Rating } from "react-simple-star-rating";
// internal
import { add_cart_product } from "@/redux/features/cartSlice";
import { remove_compare_product } from "@/redux/features/compareSlice";
import { useLanguage } from "@/context/language-context";

const CompareArea = () => {
  const { compareItems } = useSelector((state) => state.compare);
  const dispatch = useDispatch();
  const { formatPrice, t } = useLanguage();

  const isSafeImageSrc = (value) => {
    const src = typeof value === "string" ? value.trim() : "";
    if (!src) return false;
    if (src.startsWith("/")) return true;
    try {
      const u = new URL(src);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const safeCompareItems = (Array.isArray(compareItems) ? compareItems : []).filter(
    (item) => item && typeof item === "object" && item._id && item.title
  );

  // handle add product
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };
  // handle add product
  const handleRemoveComparePrd = (prd) => {
    dispatch(remove_compare_product(prd));
  };

  return (
    <>
      <section className="tp-compare-area pb-120">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              {safeCompareItems.length === 0 && (
                <div className="text-center pt-50">
                  <h3>{t("compareEmpty")}</h3>
                  <Link href="/shop" className="tp-cart-checkout-btn mt-20">
                    {t("goToShop")}
                  </Link>
                </div>
              )}
              {safeCompareItems.length > 0 && (
                <div className="tp-compare-table table-responsive text-center">
                  <table className="table">
                    <tbody>
                      <tr>
                        <th>{t("product")}</th>
                        {safeCompareItems.map((item) => (
                          <td key={String(item._id)} className="">
                            <div className="tp-compare-thumb">
                              {isSafeImageSrc(item.img) && (
                                <Image
                                  src={item.img}
                                  alt="compare"
                                  width={205}
                                  height={176}
                                />
                              )}
                              <h4 className="tp-compare-product-title">
                                <Link href={`/product-details/${item._id}`}>
                                  {item.title}
                                </Link>
                              </h4>
                            </div>
                          </td>
                        ))}
                      </tr>
                      {/* Description */}
                      <tr>
                        <th>{t("description")}</th>
                        {safeCompareItems.map((item) => (
                          <td key={String(item._id)}>
                            <div className="tp-compare-desc">
                              <p>
                                {item?.description?.trim()
                                  ? item.description
                                  : t("noDescription")}
                              </p>
                            </div>
                          </td>
                        ))}
                      </tr>
                      {/* Price */}
                      <tr>
                        <th>{t("price")}</th>
                        {safeCompareItems.map((item) => (
                          <td key={String(item._id)}>
                            <div className="tp-compare-price">
                              <span>{formatPrice(item.price)}</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                      {/* Add to cart*/}
                      <tr>
                        <th>{t("addToCart")}</th>
                        {safeCompareItems.map((item) => (
                          <td key={String(item._id)}>
                            <div className="tp-compare-add-to-cart">
                              <button onClick={() => handleAddProduct(item)} type="button" className="tp-btn">
                                {t("addToCart")}
                              </button>
                            </div>
                          </td>
                        ))}
                      </tr>
                      {/* Rating */}
                      <tr>
                        <th>{t("rating")}</th>
                        {safeCompareItems.map((item) => (
                          <td key={String(item._id)}>
                            <div className="tp-compare-rating">
                              {(() => {
                                const reviews = Array.isArray(item?.reviews) ? item.reviews : [];
                                const avg =
                                  reviews.length > 0
                                    ? reviews.reduce((acc, review) => acc + Number(review?.rating || 0), 0) /
                                      reviews.length
                                    : 0;
                                return (
                              <Rating
                                allowFraction
                                size={16}
                                initialValue={avg}
                                readonly={true}
                              />
                                );
                              })()}
                            </div>
                          </td>
                        ))}
                      </tr>
                      {/* Remove */}
                      <tr>
                        <th>{t("remove")}</th>
                        {safeCompareItems.map((item) => (
                          <td key={String(item._id)}>
                            <div className="tp-compare-remove">
                              <button
                                onClick={() =>
                                  handleRemoveComparePrd({
                                    title: item.title,
                                    id: item._id,
                                  })
                                }
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CompareArea;
