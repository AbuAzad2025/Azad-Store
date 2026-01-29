import React from "react";
import Image from "next/image";
import Link from "next/link";
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import ShopBreadcrumb from "@/components/breadcrumb/shop-breadcrumb";
import ErrorMsg from "@/components/common/error-msg";
import { useGetProductTypeCategoryQuery } from "@/redux/features/categoryApi";
import { useLanguage } from "@/context/language-context";

import banner1 from "@assets/img/banner/4/banner-1.jpg";
import banner2 from "@assets/img/banner/4/banner-2.jpg";
import banner3 from "@assets/img/banner/4/banner-3.jpg";
import banner4 from "@assets/img/banner/4/banner-4.jpg";

const fallbackBgs = [banner1, banner2, banner3, banner4];

const toSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .replace("&", "")
    .split(" ")
    .filter(Boolean)
    .join("-");

const CollectionsPage = () => {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useGetProductTypeCategoryQuery("jewelry");

  const categories = Array.isArray(data?.result) ? data.result : [];

  return (
    <Wrapper>
      <SEO pageTitle={t("collections")} />
      <HeaderTwo style_2={true} />
      <ShopBreadcrumb title={t("collections")} subtitle={t("collections")} />

      <section className="tp-collection-area pb-120">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-section-title-wrapper-6 text-center mb-40">
                <span className="tp-section-title-pre-6">{t("collectionsSubtitle")}</span>
                <h3 className="tp-section-title-6">{t("collectionsTitle")}</h3>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="row g-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="col-md-6 col-lg-4" key={i}>
                  <div className="p-4 bg-light" style={{ borderRadius: 14, minHeight: 220 }} />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center">
              <ErrorMsg msg="errorGeneric" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center">
              <ErrorMsg msg="noCategoryFound" />
            </div>
          ) : (
            <div className="row g-4">
              {categories.map((item, idx) => {
                const bg = fallbackBgs[idx % fallbackBgs.length];
                const parent = String(item?.parent || "").trim();
                const parentSlug = toSlug(parent);
                const children = Array.isArray(item?.children) ? item.children : [];
                return (
                  <div className="col-md-6 col-lg-4" key={item._id || `${parent}-${idx}`}>
                    <div className="tp-collection-thumb-wrapper-4 p-relative fix z-index-1">
                      <div
                        className="tp-collection-thumb-4 include-bg black-bg"
                        style={{
                          backgroundImage: `url(${(item?.img && String(item.img)) || bg.src})`,
                          minHeight: 320,
                          borderRadius: 14,
                        }}
                      />
                      <div
                        className="p-4"
                        style={{
                          position: "absolute",
                          insetInline: 0,
                          bottom: 0,
                          background:
                            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.72) 65%, rgba(0,0,0,0.78) 100%)",
                          borderRadius: 14,
                        }}
                      >
                        <h3 className="text-white mb-10" style={{ fontSize: 22 }}>
                          {parent || t("collection")}
                        </h3>
                        <div className="d-flex flex-wrap gap-2">
                          <Link href={`/shop?category=${parentSlug}`} className="tp-btn tp-btn-border tp-btn-border-sm">
                            {t("shopCollection")}
                          </Link>
                          {children.slice(0, 4).map((child, i) => (
                            <Link
                              key={`${parentSlug}-${i}`}
                              href={`/shop?subCategory=${toSlug(child)}`}
                              className="badge bg-light text-dark"
                              style={{ textDecoration: "none" }}
                            >
                              {child}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default CollectionsPage;

