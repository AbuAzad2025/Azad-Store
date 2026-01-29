const Brand = require("../model/Brand");
const Category = require("../model/Category");
const Product = require("../model/Products");
const Review = require("../model/Review");
const User = require("../model/User");
const mongoose = require("mongoose");
const productsData = require("../utils/products.json");

const isDbReady = () => mongoose.connection.readyState === 1;

// create product service
exports.createProductService = async (data) => {
  const product = await Product.create(data);
  const { _id: productId, brand, category } = product;
  //update Brand
  await Brand.updateOne(
    { _id: brand.id },
    { $push: { products: productId } }
  );
  //Category Brand
  await Category.updateOne(
    { _id: category.id },
    { $push: { products: productId } }
  );
  return product;
};

// create all product service
exports.addAllProductService = async (data) => {
  await Product.deleteMany();
  const products = await Product.insertMany(data);
  for (const product of products) {
    await Brand.findByIdAndUpdate(product.brand.id, {
      $push: { products: product._id },
    });
    await Category.findByIdAndUpdate(product.category.id, {
      $push: { products: product._id },
    });
  }
  return products;
};

// get product data
exports.getAllProductsService = async () => {
  if (!isDbReady()) {
    return productsData;
  }
  const products = await Product.find({}).populate("reviews").lean();
  return products;
};

exports.getProductsByIdsService = async ({ ids, limit = 12 } = {}) => {
  const src = Array.isArray(ids) ? ids : [];
  const normalizedIds = [];
  const seen = new Set();
  for (const id of src) {
    const str = typeof id === "string" ? id.trim() : "";
    if (!str) continue;
    if (seen.has(str)) continue;
    seen.add(str);
    normalizedIds.push(str);
    if (normalizedIds.length >= limit) break;
  }

  if (!isDbReady()) {
    const byId = new Map(productsData.map((p) => [String(p._id), p]));
    return normalizedIds.map((id) => byId.get(String(id))).filter(Boolean);
  }

  const validIds = normalizedIds.filter((id) => mongoose.isValidObjectId(id));
  if (validIds.length === 0) return [];

  const found = await Product.find({ _id: { $in: validIds } })
    .select("_id title img price discount status tags productType reviews category parent children")
    .populate("reviews")
    .lean();

  const indexById = new Map(validIds.map((id, idx) => [String(id), idx]));
  return found
    .slice()
    .sort((a, b) => {
      const ai = indexById.get(String(a?._id)) ?? Number.MAX_SAFE_INTEGER;
      const bi = indexById.get(String(b?._id)) ?? Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });
};

// get type of product service
exports.getProductTypeService = async (req) => {
  const type = req.params.type;
  const query = req.query;
  let products;
  if (!isDbReady()) {
    const typeProducts = productsData.filter((p) => p.productType === type);
    if (query.new === "true") {
      products = typeProducts
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        )
        .slice(0, 8);
    } else if (query.featured === "true") {
      products = typeProducts.filter((p) => p.featured === true);
    } else if (query.topSellers === "true") {
      products = typeProducts
        .slice()
        .sort((a, b) => Number(b.sellCount || 0) - Number(a.sellCount || 0))
        .slice(0, 8);
    } else {
      products = typeProducts;
    }
    return products;
  }
  if (query.new === "true") {
    products = await Product.find({ productType: type })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("reviews")
      .lean();
  } else if (query.featured === "true") {
    products = await Product.find({
      productType: type,
      featured: true,
    })
      .populate("reviews")
      .lean();
  } else if (query.topSellers === "true") {
    products = await Product.find({ productType: type })
      .sort({ sellCount: -1 })
      .limit(8)
      .populate("reviews")
      .lean();
  } else {
    products = await Product.find({ productType: type }).populate("reviews").lean();
  }
  return products;
};

// get offer product service
exports.getOfferTimerProductService = async (query) => {
  if (!isDbReady()) {
    return productsData.filter(
      (p) =>
        p.productType === query &&
        p.offerDate?.endDate &&
        new Date(p.offerDate.endDate) > new Date()
    );
  }
  const products = await Product.find({
    productType: query,
    "offerDate.endDate": { $gt: new Date() },
  })
    .populate("reviews")
    .lean();
  return products;
};

// get popular product service by type
exports.getPopularProductServiceByType = async (type) => {
  if (!isDbReady()) {
    return productsData
      .filter((p) => p.productType === type)
      .slice()
      .sort(
        (a, b) =>
          Number(b.reviews?.length || 0) - Number(a.reviews?.length || 0)
      )
      .slice(0, 8);
  }
  const products = await Product.find({ productType: type })
    .sort({ sellCount: -1 })
    .limit(8)
    .populate("reviews")
    .lean();
  return products;
};

exports.getTopRatedProductService = async () => {
  if (!isDbReady()) {
    const rated = productsData
      .filter((p) => Array.isArray(p.reviews) && p.reviews.length > 0)
      .map((product) => {
        const totalRating = product.reviews.reduce(
          (sum, review) => sum + Number(review?.rating || 0),
          0
        );
        const averageRating =
          product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
        return {
          ...product,
          rating: averageRating,
        };
      })
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    return rated;
  }
  const products = await Product.aggregate([
    { $match: { reviews: { $exists: true, $ne: [] } } },
    {
      $lookup: {
        from: "reviews",
        localField: "reviews",
        foreignField: "_id",
        as: "reviewDocs",
      },
    },
    { $addFields: { rating: { $avg: "$reviewDocs.rating" } } },
    { $sort: { rating: -1 } },
    { $limit: 20 },
    {
      $project: {
        reviewDocs: 0,
        reviews: 0,
      },
    },
  ]);

  return products;
};

// get product data
exports.getProductService = async (id) => {
  if (!isDbReady()) {
    return productsData.find((p) => String(p._id) === String(id)) || null;
  }
  const product = await Product.findById(id).populate({
    path: "reviews",
    populate: { path: "userId", select: "name email imageURL" },
  }).lean();
  return product;
};

// get product data
exports.getRelatedProductService = async (productId) => {
  if (!isDbReady()) {
    const currentProduct = productsData.find(
      (p) => String(p._id) === String(productId)
    );
    if (!currentProduct) {
      return [];
    }

    const categoryName =
      currentProduct.category?.name ||
      currentProduct.parent ||
      currentProduct.productType;

    return productsData.filter((p) => {
      if (String(p._id) === String(productId)) return false;
      const pCategoryName =
        p.category?.name || p.parent || p.productType;
      return String(pCategoryName) === String(categoryName);
    });
  }
  const currentProduct = await Product.findById(productId).lean();
  if (!currentProduct) {
    return [];
  }

  const relatedProducts = await Product.find({
    "category.name": currentProduct.category.name,
    _id: { $ne: productId }, // Exclude the current product ID
  }).lean();
  return relatedProducts;
};

// update a product
exports.updateProductService = async (id, currProduct) => {
  // console.log('currProduct',currProduct)
  const product = await Product.findById(id);
  if (product) {
    product.title = currProduct.title;
    product.brand.name = currProduct.brand.name;
    product.brand.id = currProduct.brand.id;
    product.category.name = currProduct.category.name;
    product.category.id = currProduct.category.id;
    product.sku = currProduct.sku;
    product.img = currProduct.img;
    product.slug = currProduct.slug;
    product.unit = currProduct.unit;
    product.imageURLs = currProduct.imageURLs;
    product.tags = currProduct.tags;
    product.parent = currProduct.parent;
    product.children = currProduct.children;
    product.price = currProduct.price;
    product.discount = currProduct.discount;
    product.quantity = currProduct.quantity;
    product.status = currProduct.status;
    product.productType = currProduct.productType;
    product.description = currProduct.description;
    product.additionalInformation = currProduct.additionalInformation;
    product.offerDate.startDate = currProduct.offerDate.startDate;
    product.offerDate.endDate = currProduct.offerDate.endDate;

    await product.save();
  }

  return product;
};



// get Reviews Products
exports.getReviewsProducts = async () => {
  if (!isDbReady()) {
    return productsData.filter((p) => Array.isArray(p.reviews) && p.reviews.length > 0);
  }
  const result = await Product.find({
    reviews: { $exists: true, $ne: [] },
  })
    .populate({
      path: "reviews",
      populate: { path: "userId", select: "name email imageURL" },
    })
    .lean();

  const products = result.filter(p => p.reviews.length > 0)

  return products;
};

// get Reviews Products
exports.getStockOutProducts = async () => {
  if (!isDbReady()) {
    return productsData.filter((p) => p.status === "out-of-stock");
  }
  const result = await Product.find({ status: "out-of-stock" }).sort({ createdAt: -1 }).lean()
  return result;
};

// get Reviews Products
exports.deleteProduct = async (id) => {
  if (!isDbReady()) {
    return null;
  }
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const product = await Product.findById(id).select("_id brand category").lean();
  if (!product) {
    return null;
  }

  const reviewDocs = await Review.find({ productId: id }).select("_id").lean();
  const reviewIds = reviewDocs.map((r) => r._id);

  await Promise.all([
    Product.deleteOne({ _id: id }),
    Brand.updateOne({ _id: product?.brand?.id }, { $pull: { products: id } }),
    Category.updateOne({ _id: product?.category?.id }, { $pull: { products: id } }),
    reviewIds.length > 0
      ? User.updateMany(
          { reviews: { $in: reviewIds } },
          { $pull: { reviews: { $in: reviewIds } } }
        )
      : Promise.resolve(),
    reviewIds.length > 0
      ? Review.deleteMany({ _id: { $in: reviewIds } })
      : Promise.resolve(),
  ]);

  return product;
};
