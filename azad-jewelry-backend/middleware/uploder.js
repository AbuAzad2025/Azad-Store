const multer = require("multer");
const path = require("path");

const supportedImageExt = /\.(png|jpg|jpeg|webp)$/i;

const sanitizeBaseName = (value) => {
  const base = path.basename(String(value || ""));
  const replaced = base.replace(/[^\w.\-]+/g, "-").replace(/-+/g, "-");
  return replaced.length > 120 ? replaced.slice(-120) : replaced;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "public", "images"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeOriginal = sanitizeBaseName(file.originalname);
    const ext = path.extname(safeOriginal);
    const name = path.basename(safeOriginal, ext);
    cb(null, `${uniqueSuffix}-${name}${ext}`);
  }
});

const uploader = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname || "");
    const isSupported =
      supportedImageExt.test(extension) && String(file.mimetype || "").startsWith("image/");
    if (isSupported) {
      cb(null, true);
    } else {
      cb(new Error("Must be a png/jpg/jpeg/webp image"));
    }
  },
  limits: {
    fileSize: 4000000,
  }
});

module.exports = uploader;
