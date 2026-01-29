import Head from "next/head";
import { useRouter } from "next/router";
import { useLanguage } from "@/context/language-context";
import { getCachedGlobalSettings, useGetGlobalSettingsQuery } from "@/redux/features/settingApi";

const trimTrailingSlash = (value) => String(value || "").trim().replace(/\/+$/, "");

const getOriginFallback = () => {
  if (typeof window === "undefined") return "";
  return window.location?.origin || "";
};

const safeAsPath = (value) => {
  const raw = typeof value === "string" ? value : "";
  const pathOnly = raw.split("#")[0].split("?")[0] || "/";
  return pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
};

const normalizeImgHref = (value, fallback = "") => {
  const raw = typeof value === "string" ? value.trim().replace(/\\/g, "/") : "";
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw)) return raw;
  const noTrailing = raw.replace(/\/+$/, "");
  if (!noTrailing) return fallback;
  if (noTrailing.startsWith("/")) return noTrailing;
  return `/${noTrailing}`;
};

const SEO = ({
  pageTitle,
  pageDescription,
  canonicalUrl,
  canonicalPath,
  ogImage,
  ogType = "website",
  noIndex,
}) => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { data: settings } = useGetGlobalSettingsQuery();
  const cachedSettings = getCachedGlobalSettings();
  const siteName = settings?.siteName || cachedSettings?.siteName || t("siteName");
  const defaultTitle = settings?.metaTitle || cachedSettings?.metaTitle || siteName;
  const resolvedTitle = pageTitle ? `${pageTitle} | ${siteName}` : defaultTitle;
  const metaDescription =
    pageDescription || settings?.metaDescription || cachedSettings?.metaDescription || t("footerDesc");

  const favicon = normalizeImgHref(
    settings?.favicon || cachedSettings?.favicon,
    "/assets/img/logo/logo.svg"
  );

  const isProd = process.env.NODE_ENV === "production";
  const autoNoIndex = router?.pathname?.startsWith("/admin");
  const robots = !isProd || noIndex || autoNoIndex ? "noindex, nofollow" : "index, follow";

  const settingsSiteUrl = settings?.siteUrl || cachedSettings?.siteUrl;
  const envSiteUrl =
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string" ? process.env.NEXT_PUBLIC_SITE_URL : "";
  const baseUrl = trimTrailingSlash(settingsSiteUrl || envSiteUrl || getOriginFallback());

  const derivedPath = canonicalPath || safeAsPath(router?.asPath || router?.pathname || "/");
  const resolvedCanonicalUrl =
    canonicalUrl ||
    (baseUrl ? `${baseUrl}${derivedPath === "/" ? "/" : derivedPath}` : "");

  const resolvedOgImage = normalizeImgHref(
    ogImage || settings?.ogImage || cachedSettings?.ogImage || "",
    ""
  );

  const locale = language === "ar" ? "ar_AR" : "en_US";

  const jsonLd =
    resolvedCanonicalUrl && siteName
      ? {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteName,
          url: resolvedCanonicalUrl,
        }
      : null;

  return (
    <>
      <Head>
        <title>{resolvedTitle}</title>
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="description" content={metaDescription} />
        <meta name="robots" content={robots} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link rel="icon" href={favicon} />

        {resolvedCanonicalUrl ? <link rel="canonical" href={resolvedCanonicalUrl} /> : null}

        <meta property="og:site_name" content={siteName} />
        <meta property="og:title" content={resolvedTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content={ogType} />
        {resolvedCanonicalUrl ? <meta property="og:url" content={resolvedCanonicalUrl} /> : null}
        <meta property="og:locale" content={locale} />
        {resolvedOgImage ? <meta property="og:image" content={resolvedOgImage} /> : null}

        <meta
          name="twitter:card"
          content={resolvedOgImage ? "summary_large_image" : "summary"}
        />
        <meta name="twitter:title" content={resolvedTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {resolvedOgImage ? <meta name="twitter:image" content={resolvedOgImage} /> : null}

        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        ) : null}
      </Head>
    </>
  );
};

export default SEO;
