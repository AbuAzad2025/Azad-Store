const Brand = require("../model/Brand");
const productServices = require("../services/product.service");
const Product = require("../model/Products");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const crypto = require("crypto");
const http = require("http");
const https = require("https");
const dns = require("dns").promises;
const net = require("net");
const { pipeline } = require("stream/promises");

const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 30000;
const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);

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
  return "";
};

const isPrivateIpv4 = (ip) => {
  const parts = ip.split(".").map((v) => Number(v));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
};

const isPrivateIpv6 = (ip) => {
  const lower = ip.toLowerCase();
  if (lower === "::" || lower === "::1") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  if (lower.startsWith("fe80")) return true;
  if (lower.startsWith("::ffff:")) {
    const mapped = lower.slice("::ffff:".length);
    return net.isIP(mapped) === 4 ? isPrivateIpv4(mapped) : true;
  }
  return false;
};

const isPrivateIp = (ip) => {
  const family = net.isIP(ip);
  if (family === 4) return isPrivateIpv4(ip);
  if (family === 6) return isPrivateIpv6(ip);
  return true;
};

const assertSafeRemoteUrl = async (value) => {
  const u = new URL(value);
  const hostname = String(u.hostname || "").toLowerCase();
  if (!hostname) throw new Error("Invalid URL hostname");
  if (u.username || u.password) throw new Error("URL credentials are not allowed");
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Localhost URLs are not allowed");
  }
  const records = await dns.lookup(hostname, { all: true });
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("Unable to resolve host");
  }
  for (const record of records) {
    const address = record?.address;
    if (!address || isPrivateIp(address)) {
      throw new Error("Private network URLs are not allowed");
    }
  }
};

const requestStream = async (url, redirectCount = 0) => {
  const u = new URL(url);
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Only http/https URLs are allowed");
  }
  await assertSafeRemoteUrl(u.toString());

  return new Promise((resolve, reject) => {
    const lib = u.protocol === "https:" ? https : http;
    const req = lib.request(
      u,
      {
        method: "GET",
        headers: {
          "User-Agent": "AzadJewelryImageDownloader/1.0",
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
        resolve({ res });
      }
    );

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error(`Request timeout for ${url}`));
    });
    req.on("error", reject);
    req.end();
  });
};

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
  const abs = path.join(process.cwd(), "public", rel.replace(/\//g, path.sep));
  return { rel, abs };
};

const maybeDownloadToLocal = async ({ imageUrl, productType, parent, children, base, suffix }) => {
  const raw = typeof imageUrl === "string" ? imageUrl.trim() : "";
  if (!raw) return imageUrl;
  if (isLocalProductImagePath(raw)) return raw;
  if (!isRemoteUrl(raw)) return raw;

  const extHint = guessExtFromUrl(raw);
  const hash = crypto.createHash("sha1").update(raw).digest("hex").slice(0, 10);
  const { rel, abs } = buildLocalImagePath({
    productType,
    parent,
    children,
    baseName: `${base}-${suffix}-${hash}`,
  });

  try {
    const { ext } = await downloadImageToFile(raw, abs, extHint);
    return `${rel}.${ext}`.replace(/\\/g, "/");
  } catch {
    return raw;
  }
};


// add product
exports.addProduct = async (req, res,next) => {
  try {
    const base = req.body?.slug || req.body?.title || "product";
    const productType = req.body?.productType;
    const parent = req.body?.parent || req.body?.category?.name;
    const children = req.body?.children;

    const mainImg = await maybeDownloadToLocal({
      imageUrl: req.body?.img,
      productType,
      parent,
      children,
      base,
      suffix: "main",
    });

    const incomingImageURLs = Array.isArray(req.body?.imageURLs) ? req.body.imageURLs : [];
    const normalizedExtra = [];
    for (let i = 0; i < incomingImageURLs.length; i += 1) {
      const item = incomingImageURLs[i];
      const nextImg = await maybeDownloadToLocal({
        imageUrl: item?.img,
        productType,
        parent,
        children,
        base,
        suffix: `v${i + 1}`,
      });
      normalizedExtra.push({ ...item, img: nextImg });
    }

    const firstItem = {
      color: {
        name:'',
        clrCode:''
      },
      img: mainImg,
    };
    const imageURLs = [firstItem, ...normalizedExtra];
    const result = await productServices.createProductService({
      ...req.body,
      img: mainImg,
      imageURLs: imageURLs,
    });
 
    res.status(200).json({
      success:true,
      status: "success",
      message: "Product created successfully!",
      data: result,
    });
  } catch (error) {
    next(error)
  }
};


// add all product
module.exports.addAllProducts = async (req,res,next) => {
  try {
    const result = await productServices.addAllProductService(req.body);
    res.json({
      message:'Products added successfully',
      result,
    })
  } catch (error) {
    next(error)
  }
}

// get all products
exports.getAllProducts = async (req,res,next) => {
  try {
    const result = await productServices.getAllProductsService();
    res.status(200).json({
      success:true,
      data:result,
    })
  } catch (error) {
    next(error)
  }
}

exports.getProductsByIds = async (req, res, next) => {
  try {
    const limitRaw = Number(req.body?.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 12) : 12;
    const ids = req.body?.ids ?? req.body?.productIds;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids is required" });
    }

    const result = await productServices.getProductsByIdsService({ ids, limit });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// get all products by type
module.exports.getProductsByType = async (req,res,next) => {
  try {
    const result = await productServices.getProductTypeService(req);
    res.status(200).json({
      success:true, 
      data:result,
    })
  } catch (error) {
    next(error)
  }
}

// get offer product controller
module.exports.getOfferTimerProducts = async (req,res,next) => {
  try {
    const result = await productServices.getOfferTimerProductService(req.query.type);
    res.status(200).json({
      success:true, 
      data:result,
    })
  } catch (error) {
    next(error)
  }
}

// get Popular Product By Type
module.exports.getPopularProductByType = async (req,res,next) => {
  try {
    const result = await productServices.getPopularProductServiceByType(req.params.type);
    res.status(200).json({
      success:true, 
      data:result,
    })
  } catch (error) {
    next(error)
  }
}

// get top rated Products
module.exports.getTopRatedProducts = async (req,res,next) => {
  try {
    const result = await productServices.getTopRatedProductService();
    res.status(200).json({
      success:true, 
      data:result,
    })
  } catch (error) {
    next(error)
  }
}

// getSingleProduct
exports.getSingleProduct = async (req,res,next) => {
  try {
    const product = await productServices.getProductService(req.params.id)
    res.json(product)
  } catch (error) {
    next(error)
  }
}

// get Related Product
exports.getRelatedProducts = async (req,res,next) => {
  try {
    const products = await productServices.getRelatedProductService(req.params.id)
    res.status(200).json({
      success:true, 
      data:products,
    })
  } catch (error) {
    next(error)
  }
}

// update product
exports.updateProduct = async (req, res,next) => {
  try {
    const base = req.body?.slug || req.body?.title || "product";
    const productType = req.body?.productType;
    const parent = req.body?.parent || req.body?.category?.name;
    const children = req.body?.children;

    const nextMainImg = await maybeDownloadToLocal({
      imageUrl: req.body?.img,
      productType,
      parent,
      children,
      base,
      suffix: "main",
    });

    const incomingImageURLs = Array.isArray(req.body?.imageURLs) ? req.body.imageURLs : [];
    const nextImageURLs = [];
    for (let i = 0; i < incomingImageURLs.length; i += 1) {
      const item = incomingImageURLs[i];
      const nextImg = await maybeDownloadToLocal({
        imageUrl: item?.img,
        productType,
        parent,
        children,
        base,
        suffix: `v${i + 1}`,
      });
      nextImageURLs.push({ ...item, img: nextImg });
    }

    const updated = await productServices.updateProductService(req.params.id, {
      ...req.body,
      img: nextMainImg,
      imageURLs: nextImageURLs,
    });
    res.send({ data: updated, message: "Product updated successfully!" });
  } catch (error) {
    next(error)
  }
};

// update product
exports.reviewProducts = async (req, res,next) => {
  try {
    const products = await productServices.getReviewsProducts()
    res.status(200).json({
      success:true, 
      data:products,
    })
  } catch (error) {
    next(error)
  }
};

// update product
exports.stockOutProducts = async (req, res,next) => {
  try {
    const products = await productServices.getStockOutProducts();
    res.status(200).json({
      success:true, 
      data:products,
    })
  } catch (error) {
    next(error)
  }
};

// update product
exports.deleteProduct = async (req, res,next) => {
  try {
    await productServices.deleteProduct(req.params.id);
    res.status(200).json({
      message:'Product delete successfully'
    })
  } catch (error) {
    next(error)
  }
};

