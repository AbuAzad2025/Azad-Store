require("dotenv").config();
const express = require("express");
const app = express();
const path = require('path');
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss");
const connectDB = require("./config/db");
const { secret } = require("./config/secret");
const PORT = secret.port || 7000;
const morgan = require('morgan')
// error handler
const globalErrorHandler = require("./middleware/global-error-handler");
// routes
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const brandRoutes = require("./routes/brand.routes");
const userOrderRoutes = require("./routes/user.order.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const couponRoutes = require("./routes/coupon.routes");
const reviewRoutes = require("./routes/review.routes");
const adminRoutes = require("./routes/admin.routes");
// const uploadRouter = require('./routes/uploadFile.route');
const cloudinaryRoutes = require("./routes/cloudinary.routes");
const globalSettingRoutes = require("./routes/globalSetting.routes");
const backupRoutes = require("./routes/backup.routes");

// middleware
app.disable("x-powered-by");
if (secret.env === "production") {
  app.set("trust proxy", 1);
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: { action: "deny" },
    hsts:
      secret.env === "production"
        ? { maxAge: 15552000, includeSubDomains: true, preload: true }
        : false,
    referrerPolicy: { policy: "same-origin" },
  })
);

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: secret.env === "production" ? 300 : 10000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const corsAllowedOrigins = Array.from(
  new Set(
    [
      secret.client_url,
      secret.admin_url,
      process.env.CORS_ORIGINS,
    ]
      .filter(Boolean)
      .flatMap((value) => String(value).split(","))
      .map((origin) => origin.trim())
      .filter(Boolean)
  )
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isDevLocalhost = secret.env !== "production" && /^http:\/\/localhost:\d+$/.test(origin);
      const isAllowed = corsAllowedOrigins.includes(origin);
      if (isDevLocalhost || isAllowed) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(
  express.json({
    limit: "1mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(hpp());
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);
app.use((req, res, next) => {
  const sanitize = (value) => {
    if (typeof value === "string") {
      return xss(value, {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ["script"],
      });
    }
    if (!value || typeof value !== "object") return value;
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i += 1) {
        value[i] = sanitize(value[i]);
      }
      return value;
    }
    for (const key of Object.keys(value)) {
      value[key] = sanitize(value[key]);
    }
    return value;
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  next();
});
if (secret.env !== "production") {
  app.use(morgan("dev"));
}
const cachedStaticOptions = {
  maxAge: "30d",
  immutable: true,
};
app.use(
  "/product-images",
  express.static(path.join(__dirname, "public", "product-images"), cachedStaticOptions)
);
app.use(
  "/brand-logos",
  express.static(path.join(__dirname, "public", "brand-logos"), cachedStaticOptions)
);
app.use(
  "/category-images",
  express.static(path.join(__dirname, "public", "category-images"), cachedStaticOptions)
);
app.use(
  "/site-assets",
  express.static(path.join(__dirname, "public", "site-assets"), cachedStaticOptions)
);
app.use(express.static(path.join(__dirname, "public")));

// connect database
const shouldStartServer = require.main === module;

app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/product", productRoutes);
// app.use('/api/upload',uploadRouter);
app.use("/api/order", orderRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/user-order", userOrderRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", globalSettingRoutes);
app.use("/api/backup", backupRoutes);

// root route
app.get("/", (req, res) => res.send("Apps worked successfully"));

//* handle not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
});

// global error handler
app.use(globalErrorHandler);

if (shouldStartServer) {
  connectDB()
    .then(() => {
      app.listen(PORT, "0.0.0.0", () => console.log(`server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = app;
