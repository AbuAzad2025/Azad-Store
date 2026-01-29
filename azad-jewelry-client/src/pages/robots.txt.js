const normalizeBaseUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const getSiteBaseUrl = (req) => {
  const env = typeof process.env.NEXT_PUBLIC_SITE_URL === "string" ? process.env.NEXT_PUBLIC_SITE_URL : "";
  const normalizedEnv = normalizeBaseUrl(env);
  if (normalizedEnv) return normalizedEnv;
  const host = req?.headers?.["x-forwarded-host"] || req?.headers?.host;
  if (!host) return "";
  const proto = req?.headers?.["x-forwarded-proto"] || "http";
  return normalizeBaseUrl(`${proto}://${host}`);
};

export const getServerSideProps = async ({ res, req }) => {
  const isProd = process.env.NODE_ENV === "production";
  const baseUrl = getSiteBaseUrl(req);
  const sitemapUrl = baseUrl ? `${baseUrl}/sitemap.xml` : "/sitemap.xml";

  const lines = [];
  lines.push("User-agent: *");

  if (!isProd) {
    lines.push("Disallow: /");
  } else {
    lines.push("Allow: /");
    lines.push("Disallow: /admin");
    lines.push("Disallow: /api");
    lines.push("Disallow: /checkout");
    lines.push("Disallow: /profile");
    lines.push("Disallow: /order");
    lines.push("Disallow: /login");
    lines.push("Disallow: /register");
    lines.push("Disallow: /forgot");
    lines.push("Disallow: /forget-password");
  }

  lines.push(`Sitemap: ${sitemapUrl}`);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.write(lines.join("\n"));
  res.end();

  return { props: {} };
};

export default function Robots() {
  return null;
}

