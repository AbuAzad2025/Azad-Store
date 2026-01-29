require("dotenv").config();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");

const Brand = require("./model/Brand");
const brandData = require("./utils/brands");

const Category = require("./model/Category");
const categoryData = require("./utils/categories");

const Products = require("./model/Products");
const productsData = require("./utils/products");

const Coupon = require("./model/Coupon");
const couponData = require("./utils/coupons");

const Order = require("./model/Order");
const orderData = require("./utils/orders");

const User = require("./model/User");
const userData = require("./utils/users");

const Reviews = require("./model/Review");
const reviewsData = require("./utils/reviews");

const Admin = require("./model/Admin");
const adminData = require("./utils/admin");

const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "gif", "svg", "ico"];

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

const guessExtFromUrl = (url) => {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase().replace(".", "");
    return ALLOWED_EXTS.includes(ext) ? ext : "";
  } catch {
    return "";
  }
};

const resolveLocalAsset = ({ relBase, absBase, extHint }) => {
  for (const ext of ALLOWED_EXTS) {
    const candidate = `${absBase}.${ext}`;
    if (fs.existsSync(candidate)) {
      return `${relBase}.${ext}`.replace(/\\/g, "/");
    }
  }
  const fallbackExt = (extHint && ALLOWED_EXTS.includes(extHint) ? extHint : "") || "png";
  return `${relBase}.${fallbackExt}`.replace(/\\/g, "/");
};

const buildLocalProductImageBase = ({ productType, parent, children, baseName }) => {
  const typeSlug = slugify(productType, "type");
  const parentSlug = slugify(parent, "category");
  const childSlug = slugify(children, "sub");
  const cleanBaseName = slugify(baseName, "image");
  const relBase = `/product-images/${typeSlug}/${parentSlug}/${childSlug}/${cleanBaseName}`;
  const absBase = path.join(__dirname, "public", relBase.replace(/^\//, "").replace(/\//g, path.sep));
  return { relBase, absBase };
};

const buildLocalBrandLogoBase = ({ brandName, baseName }) => {
  const brandSlug = slugify(brandName, "brand");
  const cleanBaseName = slugify(baseName, "logo");
  const relBase = `/brand-logos/${brandSlug}/${cleanBaseName}`;
  const absBase = path.join(__dirname, "public", relBase.replace(/^\//, "").replace(/\//g, path.sep));
  return { relBase, absBase };
};

const buildLocalCategoryImageBase = ({ productType, parent, baseName }) => {
  const typeSlug = slugify(productType, "type");
  const parentSlug = slugify(parent, "category");
  const cleanBaseName = slugify(baseName, "image");
  const relBase = `/category-images/${typeSlug}/${parentSlug}/${cleanBaseName}`;
  const absBase = path.join(__dirname, "public", relBase.replace(/^\//, "").replace(/\//g, path.sep));
  return { relBase, absBase };
};

const toLocalProductImagePath = ({ imageUrl, productType, parent, children, base, suffix }) => {
  const raw = typeof imageUrl === "string" ? imageUrl.trim() : "";
  if (!raw) return imageUrl;
  if (raw.startsWith("/product-images/")) return raw;
  if (!isRemoteUrl(raw)) return raw;

  const extHint = guessExtFromUrl(raw);
  const hash = crypto.createHash("sha1").update(raw).digest("hex").slice(0, 10);
  const { relBase, absBase } = buildLocalProductImageBase({
    productType,
    parent,
    children,
    baseName: `${base}-${suffix}-${hash}`,
  });
  return resolveLocalAsset({ relBase, absBase, extHint });
};

const toLocalBrandLogoPath = ({ logoUrl, brandName }) => {
  const raw = typeof logoUrl === "string" ? logoUrl.trim() : "";
  if (!raw) return logoUrl;
  if (raw.startsWith("/brand-logos/")) return raw;
  if (!isRemoteUrl(raw)) return raw;

  const extHint = guessExtFromUrl(raw);
  const hash = crypto.createHash("sha1").update(raw).digest("hex").slice(0, 10);
  const safeName = typeof brandName === "string" && brandName.trim() ? brandName.trim() : "brand";
  const { relBase, absBase } = buildLocalBrandLogoBase({
    brandName: safeName,
    baseName: `${safeName}-logo-${hash}`,
  });
  return resolveLocalAsset({ relBase, absBase, extHint });
};

const toLocalCategoryImagePath = ({ imageUrl, productType, parent }) => {
  const raw = typeof imageUrl === "string" ? imageUrl.trim() : "";
  if (!raw) return imageUrl;
  if (raw.startsWith("/category-images/")) return raw;
  if (!isRemoteUrl(raw)) return raw;

  const extHint = guessExtFromUrl(raw);
  const hash = crypto.createHash("sha1").update(raw).digest("hex").slice(0, 10);
  const safeParent = typeof parent === "string" && parent.trim() ? parent.trim() : "category";
  const { relBase, absBase } = buildLocalCategoryImageBase({
    productType,
    parent: safeParent,
    baseName: `${safeParent}-image-${hash}`,
  });
  return resolveLocalAsset({ relBase, absBase, extHint });
};

const importData = async () => {
  const brandsToInsert = brandData.map((b) => ({
    ...b,
    logo: toLocalBrandLogoPath({ logoUrl: b?.logo, brandName: b?.name }),
  }));

  const categoriesToInsert = categoryData.map((c) => ({
    ...c,
    img: toLocalCategoryImagePath({
      imageUrl: c?.img,
      productType: c?.productType,
      parent: c?.parent,
    }),
  }));

  const productsToInsert = productsData.map((p) => {
    const base = p?.slug || p?.title || String(p?._id || "product");
    const productType = p?.productType;
    const parent = p?.parent || p?.category?.name;
    const children = p?.children;

    const nextImg = toLocalProductImagePath({
      imageUrl: p?.img,
      productType,
      parent,
      children,
      base,
      suffix: "main",
    });

    const nextImageURLs = Array.isArray(p?.imageURLs)
      ? p.imageURLs.map((item, idx) => ({
          ...item,
          img: toLocalProductImagePath({
            imageUrl: item?.img,
            productType,
            parent,
            children,
            base,
            suffix: `v${idx}`,
          }),
        }))
      : p?.imageURLs;

    return { ...p, img: nextImg, imageURLs: nextImageURLs };
  });

  await Brand.deleteMany();
  await Brand.insertMany(brandsToInsert);

  await Category.deleteMany();
  await Category.insertMany(categoriesToInsert);

  await Products.deleteMany();
  await Products.insertMany(productsToInsert);

  await Coupon.deleteMany();
  await Coupon.insertMany(couponData);

  await Order.deleteMany();
  await Order.insertMany(orderData);

  await User.deleteMany();
  await User.insertMany(userData);

  await Reviews.deleteMany();
  await Reviews.insertMany(reviewsData);

  await Admin.deleteMany();
  await Admin.insertMany(adminData);

  const superAdminEmail =
    (process.env.SUPER_ADMIN_EMAIL || "").trim() || "azad@azad-smart-systems.com";
  const superAdminPassword = (process.env.SUPER_ADMIN_PASSWORD || "").trim() || "123456";

  await Admin.findOneAndUpdate(
    { email: superAdminEmail },
    {
      $set: {
        name: "Azad",
        email: superAdminEmail,
        role: "Super Admin",
        status: "Active",
        password: bcrypt.hashSync(superAdminPassword),
      },
    },
    { upsert: true }
  );
};

const run = async ({ onlyIfEmpty = false } = {}) => {
  await connectDB();

  if (onlyIfEmpty) {
    const existing = await Products.estimatedDocumentCount();
    if (existing > 0) {
      console.log("seed skipped (database is not empty)");
      return;
    }
  }

  await importData();
  console.log("data inserted successfully!");
};

if (require.main === module) {
  const args = new Set(process.argv.slice(2));
  const onlyIfEmpty = args.has("--if-empty");
  run({ onlyIfEmpty })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { importData, run };
