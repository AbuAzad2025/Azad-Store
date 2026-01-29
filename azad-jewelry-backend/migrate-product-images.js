require("dotenv").config();

const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const crypto = require("crypto");
const http = require("http");
const https = require("https");
const { pipeline } = require("stream/promises");

const connectDB = require("./config/db");
const Product = require("./model/Products");
const Brand = require("./model/Brand");
const Category = require("./model/Category");
const GlobalSetting = require("./model/GlobalSetting");

const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 30000;
const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "ico"]);

const slugify = (value, fallback) => {
  const base = typeof value === "string" && value.trim().length > 0 ? value : fallback;
  const normalized = String(base ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized.length > 0 ? normalized.slice(0, 60) : "unknown";
};

const isRemoteUrl = (value) => typeof value === "string" && /^https?:\/\//i.test(value.trim());
const isLocalProductImagePath = (value) =>
  typeof value === "string" && value.trim().startsWith("/product-images/");
const isLocalBrandLogoPath = (value) =>
  typeof value === "string" && value.trim().startsWith("/brand-logos/");
const isLocalCategoryImagePath = (value) =>
  typeof value === "string" && value.trim().startsWith("/category-images/");
const isLocalSiteAssetPath = (value) =>
  typeof value === "string" && value.trim().startsWith("/site-assets/");

const guessExtFromUrl = (url) => {
  try {
    const u = new URL(url);
    const ext = path.extname(u.pathname).toLowerCase().replace(".", "");
    return ALLOWED_EXTS.has(ext) ? ext : "";
  } catch {
    return "";
  }
};

const guessExtFromContentType = (contentType) => {
  const ct = typeof contentType === "string" ? contentType.toLowerCase() : "";
  if (ct.includes("image/jpeg")) return "jpg";
  if (ct.includes("image/png")) return "png";
  if (ct.includes("image/webp")) return "webp";
  if (ct.includes("image/gif")) return "gif";
  if (ct.includes("image/svg+xml")) return "svg";
  if (ct.includes("image/x-icon")) return "ico";
  if (ct.includes("image/vnd.microsoft.icon")) return "ico";
  return "";
};

const requestStream = (url, redirectCount = 0) =>
  new Promise((resolve, reject) => {
    let req;
    try {
      const u = new URL(url);
      const lib = u.protocol === "https:" ? https : http;
      req = lib.request(
        u,
        {
          method: "GET",
          headers: {
            "User-Agent": "AzadJewelryImageMigrator/1.0",
            Accept: "image/*,*/*;q=0.8",
          },
        },
        (res) => {
          const status = res.statusCode ?? 0;
          const location = res.headers?.location;
          if (status >= 300 && status < 400 && location) {
            res.resume();
            if (redirectCount >= MAX_REDIRECTS) {
              reject(new Error(`Too many redirects for ${url}`));
              return;
            }
            const redirected = new URL(location, u).toString();
            requestStream(redirected, redirectCount + 1).then(resolve).catch(reject);
            return;
          }
          resolve({ res, finalUrl: u.toString() });
        }
      );
    } catch (err) {
      reject(err);
      return;
    }

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error(`Request timeout for ${url}`));
    });
    req.on("error", reject);
    req.end();
  });

const downloadImageToFile = async (url, destFilePath, extHint) => {
  const { res } = await requestStream(url);
  const status = res.statusCode ?? 0;
  if (status < 200 || status >= 300) {
    res.resume();
    throw new Error(`HTTP ${status} for ${url}`);
  }

  const contentType = res.headers?.["content-type"] ?? "";
  const extFromCt = guessExtFromContentType(contentType);
  const ext = (extHint && ALLOWED_EXTS.has(extHint) ? extHint : "") || extFromCt || "jpg";
  const finalPath = destFilePath.endsWith(`.${ext}`) ? destFilePath : `${destFilePath}.${ext}`;
  const tmpPath = `${finalPath}.tmp`;

  await fsp.mkdir(path.dirname(finalPath), { recursive: true });

  let bytes = 0;
  const fileStream = fs.createWriteStream(tmpPath);

  res.on("data", (chunk) => {
    bytes += chunk.length;
    if (bytes > MAX_BYTES) {
      res.destroy(new Error(`File too large for ${url}`));
    }
  });

  try {
    await pipeline(res, fileStream);
    await fsp.rename(tmpPath, finalPath);
    return { finalPath, ext };
  } catch (err) {
    try {
      await fsp.rm(tmpPath, { force: true });
    } catch {}
    throw err;
  }
};

const buildLocalImagePath = ({ productType, parent, children, baseName }) => {
  const typeSlug = slugify(productType, "type");
  const parentSlug = slugify(parent, "category");
  const childSlug = slugify(children, "sub");
  const cleanBaseName = slugify(baseName, "image");
  const rel = `/product-images/${typeSlug}/${parentSlug}/${childSlug}/${cleanBaseName}`;
  const abs = path.join(__dirname, "public", rel.replace(/^\//, "").replace(/\//g, path.sep));
  return { rel, abs };
};

const buildLocalBrandLogoPath = ({ brandName, baseName }) => {
  const brandSlug = slugify(brandName, "brand");
  const cleanBaseName = slugify(baseName, "logo");
  const rel = `/brand-logos/${brandSlug}/${cleanBaseName}`;
  const abs = path.join(__dirname, "public", rel.replace(/^\//, "").replace(/\//g, path.sep));
  return { rel, abs };
};

const buildLocalCategoryImagePath = ({ productType, parent, baseName }) => {
  const typeSlug = slugify(productType, "type");
  const parentSlug = slugify(parent, "category");
  const cleanBaseName = slugify(baseName, "image");
  const rel = `/category-images/${typeSlug}/${parentSlug}/${cleanBaseName}`;
  const abs = path.join(__dirname, "public", rel.replace(/^\//, "").replace(/\//g, path.sep));
  return { rel, abs };
};

const buildLocalSiteAssetPath = ({ baseName }) => {
  const cleanBaseName = slugify(baseName, "asset");
  const rel = `/site-assets/${cleanBaseName}`;
  const abs = path.join(__dirname, "public", rel.replace(/^\//, "").replace(/\//g, path.sep));
  return { rel, abs };
};

const main = async () => {
  await connectDB();

  const urlToLocal = new Map();
  let downloaded = 0;
  let failed = 0;

  let productScanned = 0;
  let productUpdated = 0;
  let productSkipped = 0;

  let brandScanned = 0;
  let brandUpdated = 0;
  let brandSkipped = 0;

  let categoryScanned = 0;
  let categoryUpdated = 0;
  let categorySkipped = 0;

  let settingsUpdated = 0;
  let settingsSkipped = 0;

  const processOne = async ({ url, isLocalPath, buildPath }) => {
    const raw = typeof url === "string" ? url.trim() : "";
    if (!raw) return { changed: false, value: url };
    if (isLocalPath(raw)) return { changed: false, value: raw };
    if (!isRemoteUrl(raw)) return { changed: false, value: raw };

    if (urlToLocal.has(raw)) {
      return { changed: true, value: urlToLocal.get(raw) };
    }

    const extHint = guessExtFromUrl(raw);
    const hash = crypto.createHash("sha1").update(raw).digest("hex").slice(0, 10);
    const { rel, abs } = buildPath({ hash });

    try {
      const { finalPath, ext } = await downloadImageToFile(raw, abs, extHint);
      const relWithExt = `${rel}.${ext}`.replace(/\\/g, "/");
      urlToLocal.set(raw, relWithExt);
      downloaded += 1;
      return { changed: true, value: relWithExt, savedTo: finalPath };
    } catch (err) {
      failed += 1;
      return { changed: false, value: raw, error: String(err?.message || err) };
    }
  };

  const productCursor = Product.find({}).lean().cursor();
  for await (const product of productCursor) {
    productScanned += 1;
    const updates = {};

    const productType = product.productType;
    const parent = product.parent || product.category?.name;
    const children = product.children;
    const base = product.slug || product.title || String(product._id);

    const mainRes = await processOne({
      url: product.img,
      isLocalPath: isLocalProductImagePath,
      buildPath: ({ hash }) =>
        buildLocalImagePath({
          productType,
          parent,
          children,
          baseName: `${base}-main-${hash}`,
        }),
    });
    if (mainRes.changed) {
      updates.img = mainRes.value;
    }

    if (Array.isArray(product.imageURLs) && product.imageURLs.length > 0) {
      let anyChanged = false;
      const nextImageURLs = product.imageURLs.map((item, idx) => ({ ...item }));
      for (let i = 0; i < nextImageURLs.length; i += 1) {
        const item = nextImageURLs[i];
        const res = await processOne({
          url: item?.img,
          isLocalPath: isLocalProductImagePath,
          buildPath: ({ hash }) =>
            buildLocalImagePath({
              productType,
              parent,
              children,
              baseName: `${base}-v${i}-${hash}`,
            }),
        });
        if (res.changed) {
          anyChanged = true;
          nextImageURLs[i] = { ...item, img: res.value };
        }
      }
      if (anyChanged) {
        updates.imageURLs = nextImageURLs;
      }
    }

    if (Object.keys(updates).length === 0) {
      productSkipped += 1;
      continue;
    }

    await Product.updateOne({ _id: product._id }, { $set: updates });
    productUpdated += 1;
  }

  const brandCursor = Brand.find({}).lean().cursor();
  for await (const brand of brandCursor) {
    brandScanned += 1;
    const rawLogo = brand?.logo;
    const res = await processOne({
      url: rawLogo,
      isLocalPath: isLocalBrandLogoPath,
      buildPath: ({ hash }) =>
        buildLocalBrandLogoPath({
          brandName: brand?.name,
          baseName: `${brand?.name || "brand"}-logo-${hash}`,
        }),
    });
    if (!res.changed) {
      brandSkipped += 1;
      continue;
    }
    await Brand.updateOne({ _id: brand._id }, { $set: { logo: res.value } });
    brandUpdated += 1;
  }

  const categoryCursor = Category.find({}).lean().cursor();
  for await (const category of categoryCursor) {
    categoryScanned += 1;
    const rawImg = category?.img;
    const res = await processOne({
      url: rawImg,
      isLocalPath: isLocalCategoryImagePath,
      buildPath: ({ hash }) =>
        buildLocalCategoryImagePath({
          productType: category?.productType,
          parent: category?.parent,
          baseName: `${category?.parent || "category"}-image-${hash}`,
        }),
    });
    if (!res.changed) {
      categorySkipped += 1;
      continue;
    }
    await Category.updateOne({ _id: category._id }, { $set: { img: res.value } });
    categoryUpdated += 1;
  }

  const settings = await GlobalSetting.findOne().lean();
  if (settings) {
    const updates = {};
    const logoRes = await processOne({
      url: settings?.logo,
      isLocalPath: isLocalSiteAssetPath,
      buildPath: ({ hash }) =>
        buildLocalSiteAssetPath({
          baseName: `logo-${hash}`,
        }),
    });
    if (logoRes.changed) updates.logo = logoRes.value;

    const faviconRes = await processOne({
      url: settings?.favicon,
      isLocalPath: isLocalSiteAssetPath,
      buildPath: ({ hash }) =>
        buildLocalSiteAssetPath({
          baseName: `favicon-${hash}`,
        }),
    });
    if (faviconRes.changed) updates.favicon = faviconRes.value;

    if (Object.keys(updates).length === 0) {
      settingsSkipped += 1;
    } else {
      await GlobalSetting.updateOne({ _id: settings._id }, { $set: updates });
      settingsUpdated += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        products: {
          scanned: productScanned,
          updated: productUpdated,
          skipped: productSkipped,
        },
        brands: {
          scanned: brandScanned,
          updated: brandUpdated,
          skipped: brandSkipped,
        },
        categories: {
          scanned: categoryScanned,
          updated: categoryUpdated,
          skipped: categorySkipped,
        },
        settings: {
          updated: settingsUpdated,
          skipped: settingsSkipped,
        },
        downloaded,
        failed,
      },
      null,
      2
    )
  );
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
