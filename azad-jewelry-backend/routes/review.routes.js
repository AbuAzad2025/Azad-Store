const express = require("express");
const router = express.Router();
const { addReview, deleteReviews, getAllReviews, deleteReview } = require("../controller/review.controller");
const verifyToken = require("../middleware/verifyToken");
const authorization = require("../middleware/authorization");

const adminRoles = ["Admin", "Super Admin", "Manager", "CEO"];

// add a review
router.post("/add", verifyToken, addReview);
// get all reviews
router.get("/all", verifyToken, authorization(...adminRoles), getAllReviews);
// delete a specific review
router.delete("/:id", verifyToken, authorization(...adminRoles), deleteReview);
// delete all reviews for a product
router.delete("/delete/:id", verifyToken, authorization(...adminRoles), deleteReviews);

module.exports = router;
