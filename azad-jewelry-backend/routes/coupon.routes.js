const express = require('express');
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const authorization = require("../middleware/authorization");
const {
  addCoupon,
  addAllCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} = require('../controller/coupon.controller');

const adminRoles = ["Admin", "Super Admin", "Manager", "CEO"];

//add a coupon
router.post('/add', verifyToken, authorization(...adminRoles), addCoupon);

//add multiple coupon
router.post('/all', verifyToken, authorization(...adminRoles), addAllCoupon);

//get all coupon
router.get('/', getAllCoupons);

//get a coupon
router.get('/:id', getCouponById);

//update a coupon
router.patch('/:id', verifyToken, authorization(...adminRoles), updateCoupon);

//delete a coupon
router.delete('/:id', verifyToken, authorization(...adminRoles), deleteCoupon);

module.exports = router;
