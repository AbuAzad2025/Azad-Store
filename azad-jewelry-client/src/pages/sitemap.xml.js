import blogData from "@/data/blog-data";

const normalizeBaseUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const getApiBaseUrl = () => {
  const env = typeof process.env.NEXT_PUBLIC_API_BASE_URL === "string" ? process.env.NEXT_PUBLIC_API_BASE_URL : "";
  const isDev = process.env.NODE_ENV === "development";
  return normalizeBaseUrl(env || (isDev ? "http://localhost:7000" : ""));
};

const getSiteBaseUrl = (req) => {
  const env = typeof process.env.NEXT_PUBLIC_SITE_URL === "string" ? process.env.NEXT_PUBLIC_SITE_URL : "";
  const normalizedEnv = normalizeBaseUrl(env);
  if (normalizedEnv) return normalizedEnv;
  const host = req?.headers?.["x-forwarded-host"] || req?.headers?.host;
  if (!host) return "";
  const proto = req?.headers?.["x-forwarded-proto"] || "http";
  return normalizeBaseUrl(`${proto}://${host}`);
};

const escapeXml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const toUrlEntry = ({ loc, lastmod }) => {
  const parts = [
    "<url>",
    `<loc>${escapeXml(loc)}</loc>`,
    lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : "",
    "</url>",
  ].filter(Boolean);
  return parts.join("");
};

const tryFetchJson = async (url) => {
  try {
    if (typeof fetch === "function") {
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (!r.ok) return null;
      return await r.json();
    }

    const lib = url.startsWith("https://") ? require("https") : require("http");
    return await new Promise((resolve) => {
      const req = lib.request(url, { method: "GET", headers: { Accept: "application/json" } }, (res) => {
        const status = res.statusCode ?? 0;
        if (status < 200 || status >= 300) {
          res.resume();
          resolve(null);
          return;
        }
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
          if (body.length > 1024 * 1024) {
            req.destroy();
            resolve(null);
          }
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(null);
          }
        });
      });
      req.on("error", () => resolve(null));
      req.end();
    });
  } catch {
    return null;
  }
};

export const getServerSideProps = async ({ res, req }) => {
  const siteBaseUrl = getSiteBaseUrl(req);
  const apiBaseUrl = getApiBaseUrl();
  const now = new Date().toISOString();

  const staticPaths = [
    "/",
    "/shop",
    "/shop-right-sidebar",
    "/shop-hidden-sidebar",
    "/shop-category",
    "/blog",
    "/blog-grid",
    "/blog-list",
    "/about",
    "/careers",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/shipping-policy",
    "/returns",
    "/compare",
    "/wishlist",
    "/cart",
    "/search",
  ];

  const urls = staticPaths
    .filter((p) => siteBaseUrl)
    .map((path) => toUrlEntry({ loc: `${siteBaseUrl}${path}`, lastmod: now }));

  if (siteBaseUrl) {
    const blogList = Array.isArray(blogData) ? blogData : [];
    for (const b of blogList) {
      const id = b?.id;
      if (!id) continue;
      urls.push(toUrlEntry({ loc: `${siteBaseUrl}/blog-details/${id}`, lastmod: now }));
    }
  }

  if (siteBaseUrl && apiBaseUrl) {
    const products = await tryFetchJson(`${apiBaseUrl}/api/product/all`);
    const productList = Array.isArray(products?.data) ? products.data : [];
    for (const p of productList) {
      const id = p?._id;
      if (!id) continue;
      const lastmod = p?.updatedAt ? new Date(p.updatedAt).toISOString() : now;
      urls.push(toUrlEntry({ loc: `${siteBaseUrl}/product-details/${id}`, lastmod }));
    }

    const categories = await tryFetchJson(`${apiBaseUrl}/api/category/all`);
    const categoryList = Array.isArray(categories?.result) ? categories.result : [];
    for (const c of categoryList) {
      const id = c?._id;
      if (!id) continue;
      const lastmod = c?.updatedAt ? new Date(c.updatedAt).toISOString() : now;
      urls.push(toUrlEntry({ loc: `${siteBaseUrl}/shop-category?category=${id}`, lastmod }));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.join("") +
    `</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
