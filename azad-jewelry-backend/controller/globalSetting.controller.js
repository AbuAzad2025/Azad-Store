const GlobalSetting = require('../model/GlobalSetting');
const mongoose = require("mongoose");
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
const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "ico"]);

const isDbReady = () => mongoose.connection.readyState === 1;

const isRemoteUrl = (value) => typeof value === "string" && /^https?:\/\//i.test(value.trim());
const isLocalSiteAssetPath = (value) => typeof value === "string" && value.trim().startsWith("/site-assets/");

const normalizeLocalAssetValue = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim().replace(/\\/g, "/");
  if (!trimmed) return trimmed;
  if (isRemoteUrl(trimmed)) return trimmed;

  const noTrailingSlash = trimmed.replace(/\/+$/, "");
  if (!noTrailingSlash) return "";

  if (noTrailingSlash.startsWith("/site-assets/")) return noTrailingSlash;
  if (noTrailingSlash.startsWith("/assets/")) return noTrailingSlash;
  if (noTrailingSlash.startsWith("site-assets/")) return `/${noTrailingSlash}`;
  if (noTrailingSlash.startsWith("assets/")) return `/${noTrailingSlash}`;

  return noTrailingSlash;
};

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

const buildLocalSiteAssetPath = ({ baseName }) => {
  const rel = `/site-assets/${baseName}`;
  const abs = path.join(__dirname, "..", "public", rel.replace(/^\//, "").replace(/\//g, path.sep));
  return { rel, abs };
};

const maybeDownloadSiteAssetToLocal = async ({ assetUrl, assetKey }) => {
  const raw = typeof assetUrl === "string" ? assetUrl.trim() : "";
  if (!raw) return assetUrl;
  if (isLocalSiteAssetPath(raw)) return raw;
  if (!isRemoteUrl(raw)) return raw;

  const extHint = guessExtFromUrl(raw);
  const hash = crypto.createHash("sha1").update(raw).digest("hex").slice(0, 10);
  const { rel, abs } = buildLocalSiteAssetPath({
    baseName: `${assetKey}-${hash}`,
  });

  try {
    const { ext } = await downloadImageToFile(raw, abs, extHint);
    return `${rel}.${ext}`.replace(/\\/g, "/");
  } catch {
    return raw;
  }
};

// Get Settings (Create default if not exists)
exports.getGlobalSettings = async (req, res, next) => {
  try {
    if (!isDbReady()) {
      const defaults = new GlobalSetting().toObject();
      defaults.logo = normalizeLocalAssetValue(defaults.logo);
      defaults.favicon = normalizeLocalAssetValue(defaults.favicon);
      defaults.ogImage = normalizeLocalAssetValue(defaults.ogImage);
      return res.status(200).json(defaults);
    }
    let settings = await GlobalSetting.findOne();
    if (!settings) {
      settings = await GlobalSetting.create({});
    }
    const payload = settings.toObject();
    payload.logo = normalizeLocalAssetValue(payload.logo);
    payload.favicon = normalizeLocalAssetValue(payload.favicon);
    payload.ogImage = normalizeLocalAssetValue(payload.ogImage);
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

// Update Settings
exports.updateGlobalSettings = async (req, res, next) => {
  try {
    if (req?.body?.logo) {
      req.body.logo = normalizeLocalAssetValue(req.body.logo);
      req.body.logo = await maybeDownloadSiteAssetToLocal({
        assetUrl: req.body.logo,
        assetKey: "logo",
      });
    }
    if (req?.body?.favicon) {
      req.body.favicon = normalizeLocalAssetValue(req.body.favicon);
      req.body.favicon = await maybeDownloadSiteAssetToLocal({
        assetUrl: req.body.favicon,
        assetKey: "favicon",
      });
    }
    if (req?.body?.ogImage) {
      req.body.ogImage = normalizeLocalAssetValue(req.body.ogImage);
      req.body.ogImage = await maybeDownloadSiteAssetToLocal({
        assetUrl: req.body.ogImage,
        assetKey: "og-image",
      });
    }
    if (!isDbReady()) {
      return res.status(200).json(new GlobalSetting(req.body).toObject());
    }
    const settings = await GlobalSetting.findOne();
    if (!settings) {
      const newSettings = await GlobalSetting.create(req.body);
      return res.status(200).json(newSettings);
    }
    
    const updatedSettings = await GlobalSetting.findByIdAndUpdate(
      settings._id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedSettings);
  } catch (error) {
    next(error);
  }
};
