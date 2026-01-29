import React, { useEffect, useRef } from 'react';
import Head from "next/head";
import { useRouter } from "next/router";
import SEO from '@/components/seo';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import Wrapper from '@/layout/wrapper';
import ErrorMsg from '@/components/common/error-msg';
import { useGetProductQuery } from '@/redux/features/productApi';
import ProductDetailsBreadcrumb from '@/components/breadcrumb/product-details-breadcrumb';
import ProductDetailsArea from '@/components/product-details/product-details-area';
import PrdDetailsLoader from '@/components/loader/prd-details-loader';
import { useLanguage } from "@/context/language-context";
import { getCachedGlobalSettings, useGetGlobalSettingsQuery } from "@/redux/features/settingApi";

const safeAsPath = (value) => {
  const raw = typeof value === "string" ? value : "";
  const pathOnly = raw.split("#")[0].split("?")[0] || "/";
  return pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
};

const trimTrailingSlash = (value) => String(value || "").trim().replace(/\/+$/, "");

const ProductDetailsPage = ({ query }) => {
  const { data: product, isLoading, isError } = useGetProductQuery(query.id);
  const { data: settings } = useGetGlobalSettingsQuery();
  const cachedSettings = getCachedGlobalSettings();
  const router = useRouter();
  const { t } = useLanguage();
  const viewTrackedRef = useRef("");

  const trackEvent = (event, payload = {}) => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });
  };

  useEffect(() => {
    const id = product?._id ? String(product._id) : "";
    if (!id) return;
    if (viewTrackedRef.current === id) return;
    viewTrackedRef.current = id;
    trackEvent("view_product", {
      productId: id,
      title: String(product?.title || ""),
      price: Number(product?.price) || 0,
    });
  }, [product]);

  const siteUrl = trimTrailingSlash(
    settings?.siteUrl || cachedSettings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || ""
  );
  const canonicalPath = safeAsPath(router?.asPath || router?.pathname || "/");
  const canonicalUrl = siteUrl ? `${siteUrl}${canonicalPath === "/" ? "/" : canonicalPath}` : "";

  const images = (() => {
    const urls = [];
    if (product?.img) urls.push(String(product.img));
    if (Array.isArray(product?.imageURLs)) {
      for (const item of product.imageURLs) {
        if (item?.img) urls.push(String(item.img));
      }
    }
    return Array.from(new Set(urls)).filter(Boolean);
  })();

  const pageDescription = product?.description
    ? String(product.description).trim().slice(0, 160)
    : undefined;

  const breadcrumbJsonLd = (() => {
    if (!siteUrl) return null;
    const shopUrl = `${siteUrl}/shop`;
    const productUrl = canonicalUrl || undefined;
    if (!productUrl) return null;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: t("home"),
          item: `${siteUrl}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: t("shop"),
          item: shopUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: String(product?.title || ""),
          item: productUrl,
        },
      ],
    };

    return JSON.parse(JSON.stringify(jsonLd));
  })();

  const productJsonLd = (() => {
    if (!product) return null;

    const priceNum = Number(product?.price);
    const discountNum = Number(product?.discount);
    const discountPct = Number.isFinite(discountNum) && discountNum > 0 ? discountNum : 0;
    const finalPrice =
      Number.isFinite(priceNum) && priceNum >= 0
        ? Number((priceNum - (priceNum * discountPct) / 100).toFixed(2))
        : null;

    const currency = String(settings?.currency || cachedSettings?.currency || "ILS")
      .trim()
      .toUpperCase();
    const availability =
      product?.status === "out-of-stock"
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock";

    const ratingValues = Array.isArray(product?.reviews)
      ? product.reviews.map((r) => Number(r?.rating)).filter((n) => Number.isFinite(n) && n > 0)
      : [];
    const avgRating =
      ratingValues.length > 0
        ? Number((ratingValues.reduce((acc, n) => acc + n, 0) / ratingValues.length).toFixed(2))
        : null;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: String(product?.title || ""),
      image: images.length > 0 ? images : undefined,
      description: product?.description ? String(product.description) : undefined,
      sku: product?.sku ? String(product.sku) : undefined,
      brand: product?.brand?.name
        ? { "@type": "Brand", name: String(product.brand.name) }
        : undefined,
      category: product?.category?.name ? String(product.category.name) : undefined,
      offers:
        finalPrice !== null
          ? {
              "@type": "Offer",
              url: canonicalUrl || undefined,
              priceCurrency: currency,
              price: String(finalPrice),
              availability,
            }
          : undefined,
      aggregateRating:
        avgRating !== null
          ? {
              "@type": "AggregateRating",
              ratingValue: String(avgRating),
              reviewCount: String(ratingValues.length),
            }
          : undefined,
    };

    return JSON.parse(JSON.stringify(jsonLd));
  })();

  const faqJsonLd = (() => {
    if (!siteUrl || !product) return null;
    const min = settings?.deliveryEstimateMinDays ?? cachedSettings?.deliveryEstimateMinDays ?? 1;
    const max = settings?.deliveryEstimateMaxDays ?? cachedSettings?.deliveryEstimateMaxDays ?? 3;
    const returnDays = settings?.returnsWindowDays ?? cachedSettings?.returnsWindowDays ?? 30;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: t("faqShippingQuestion"),
          acceptedAnswer: {
            "@type": "Answer",
            text: t("faqShippingAnswer", { min, max }),
          },
        },
        {
          "@type": "Question",
          name: t("faqReturnsQuestion"),
          acceptedAnswer: {
            "@type": "Answer",
            text: t("faqReturnsAnswer", { days: returnDays }),
          },
        },
        {
          "@type": "Question",
          name: t("faqSizeQuestion"),
          acceptedAnswer: {
            "@type": "Answer",
            text: t("faqSizeAnswer"),
          },
        },
      ],
    };
    return JSON.parse(JSON.stringify(jsonLd));
  })();

  // decide what to render
  let content = null;
  if (isLoading) {
    content = <PrdDetailsLoader loading={isLoading}/>;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg={t("errorGeneric")} />;
  }
  if (!isLoading && !isError && product) {
    content = (
      <>
        <ProductDetailsBreadcrumb category={product.category.name} title={product.title} />
        <ProductDetailsArea productItem={product} />
      </>
    );
  }
  return (
    <Wrapper>
      <SEO
        pageTitle={product?.title || t("productDetails")}
        pageDescription={pageDescription}
        canonicalUrl={canonicalUrl || undefined}
        ogImage={images?.[0] || undefined}
        ogType="product"
      />
      {productJsonLd || breadcrumbJsonLd || faqJsonLd ? (
        <Head>
          {productJsonLd ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
          ) : null}
          {breadcrumbJsonLd ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
          ) : null}
          {faqJsonLd ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
          ) : null}
        </Head>
      ) : null}
      <HeaderTwo style_2={true} />
      {content}
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default ProductDetailsPage;

export const getServerSideProps = async (context) => {
  const { query } = context;

  return {
    props: {
      query,
    },
  };
};
