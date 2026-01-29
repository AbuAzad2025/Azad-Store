const User = require('../model/User');
const Product = require('../model/Products');
const Order = require('../model/Order');
const Category = require('../model/Category');
const Brand = require('../model/Brand');
const Coupon = require('../model/Coupon');
const Review = require('../model/Review');
const GlobalSetting = require('../model/GlobalSetting');

// Export Data (Backup)
exports.createBackup = async (req, res, next) => {
  try {
    const backupData = {
      users: await User.find({}),
      products: await Product.find({}),
      orders: await Order.find({}),
      categories: await Category.find({}),
      brands: await Brand.find({}),
      coupons: await Coupon.find({}),
      reviews: await Review.find({}),
      settings: await GlobalSetting.find({}),
      timestamp: new Date().toISOString(),
      version: "1.0"
    };

    res.status(200).json(backupData);
  } catch (error) {
    next(error);
  }
};

// Import Data (Restore)
exports.restoreBackup = async (req, res, next) => {
  try {
    const data = req.body;
    
    if (!data || !data.version) {
      return res.status(400).json({ message: "Invalid backup file format" });
    }

    // Process Restore (We'll use upsert to avoid duplicates where possible, or deleteAll then insert)
    // For simplicity and "Reset" capability, we might offer options. 
    // Here we will do a "smart merge" based on IDs for now, or simple insert.
    // Safe approach: Loop and update/insert.

    if (data.users && Array.isArray(data.users)) {
        for (const item of data.users) {
            await User.updateOne({ _id: item._id }, { $set: item }, { upsert: true });
        }
    }
    if (data.products && Array.isArray(data.products)) {
        for (const item of data.products) {
            await Product.updateOne({ _id: item._id }, { $set: item }, { upsert: true });
        }
    }
    if (data.categories && Array.isArray(data.categories)) {
        for (const item of data.categories) {
            await Category.updateOne({ _id: item._id }, { $set: item }, { upsert: true });
        }
    }
    if (data.brands && Array.isArray(data.brands)) {
        for (const item of data.brands) {
            await Brand.updateOne({ _id: item._id }, { $set: item }, { upsert: true });
        }
    }
    if (data.coupons && Array.isArray(data.coupons)) {
        for (const item of data.coupons) {
            await Coupon.updateOne({ _id: item._id }, { $set: item }, { upsert: true });
        }
    }
    if (data.settings && Array.isArray(data.settings)) {
        for (const item of data.settings) {
             await GlobalSetting.updateOne({ _id: item._id }, { $set: item }, { upsert: true });
        }
    }
    // Orders and Reviews might be tricky with references, but ID matching should work.
    if (data.orders && Array.isArray(data.orders)) {
        for (const item of data.orders) {
            await Order.updateOne({ _id: item._id }, { $set: item }, { upsert: true });
        }
    }
    if (data.reviews && Array.isArray(data.reviews)) {
        for (const item of data.reviews) {
            await Review.updateOne({ _id: item._id }, { $set: item }, { upsert: true });
        }
    }

    res.status(200).json({ message: "System restored successfully", timestamp: new Date() });
  } catch (error) {
    next(error);
  }
};
