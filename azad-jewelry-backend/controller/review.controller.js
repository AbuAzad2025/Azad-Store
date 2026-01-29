const mongoose = require("mongoose");
const Order = require("../model/Order");
const Products = require("../model/Products");
const Review = require("../model/Review");
const User = require("../model/User");

// add a review
exports.addReview = async (req, res,next) => {
  const userId = req.user?._id;
  const { productId, rating, comment } = req.body || {};
  try {
    if (!userId) {
      return res.status(401).json({ message: "You are not logged in" });
    }
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId." });
    }
    const ratingNumber = Number(rating);
    if (!Number.isFinite(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      return res.status(400).json({ message: "Invalid rating." });
    }
    if (typeof comment !== "string" || comment.trim().length === 0) {
      return res.status(400).json({ message: "Comment is required." });
    }

    // Check if the user has already left a review for this product
    const existingReview = await Review.findOne({
      userId: userId,
      productId: productId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already left a review for this product." });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const checkPurchase = await Order.findOne({
      user: userObjectId,
      $or: [
        { "cart._id": productId },
        { "cart._id": productObjectId },
        { "cart.productId": productId },
        { "cart.productId": productObjectId },
      ],
    }).lean();
    if (!checkPurchase) {
      return res
        .status(400)
        .json({ message: "Without purchase you can not give here review!" });
    }

    const [product, user] = await Promise.all([
      Products.findById(productObjectId),
      User.findById(userObjectId),
    ]);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const review = await Review.create({
      userId: userObjectId,
      productId: productObjectId,
      rating: ratingNumber,
      comment: comment.trim(),
    });

    await Promise.all([
      Products.updateOne(
        { _id: productObjectId },
        { $addToSet: { reviews: review._id } }
      ),
      User.updateOne(
        { _id: userObjectId },
        { $addToSet: { reviews: review._id } }
      ),
    ]);

    return res.status(201).json({ message: "Review added successfully." });
  } catch (error) {
    next(error)
  }
};

// get all reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name email")
      .populate("productId", "title")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// delete a specific review
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Review.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Remove from Product reviews array
    await Products.findByIdAndUpdate(result.productId, {
      $pull: { reviews: id }
    });

    // Remove from User reviews array
    await User.findByIdAndUpdate(result.userId, {
      $pull: { reviews: id }
    });

    res.json({ message: "Review deleted successfully", result });
  } catch (error) {
    next(error);
  }
};

// delete a review
exports.deleteReviews = async (req, res,next) => {
  try {
    const productId = req.params.id;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId." });
    }

    const reviewDocs = await Review.find({ productId })
      .select("_id userId")
      .lean();
    if (reviewDocs.length === 0) {
      return res.status(404).json({ message: "Product reviews not found" });
    }

    const reviewIds = reviewDocs.map((r) => r._id);
    const userIds = Array.from(
      new Set(reviewDocs.map((r) => String(r.userId)).filter(Boolean))
    );

    const [result] = await Promise.all([
      Review.deleteMany({ _id: { $in: reviewIds } }),
      Products.updateOne({ _id: productId }, { $pull: { reviews: { $in: reviewIds } } }),
      User.updateMany(
        { _id: { $in: userIds } },
        { $pull: { reviews: { $in: reviewIds } } }
      ),
    ]);

    res.json({
      message: "All reviews deleted for the product",
      deletedCount: result?.deletedCount || 0,
    });
  } catch (error) {
    next(error)
  }
};
