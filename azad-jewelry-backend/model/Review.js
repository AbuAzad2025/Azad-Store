const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "User", required: true },
    productId: {
      type: ObjectId,
      ref: "Products",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, productId: 1 });

const Reviews = mongoose.model("Reviews", reviewSchema);
module.exports = Reviews;
