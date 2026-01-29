const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const authorization = require("../middleware/authorization");
const {
  paymentIntent,
  stripeWebhook,
  addOrder,
  getOrders,
  updateOrderStatus,
  getSingleOrder,
} = require("../controller/order.controller");

// router
const router = express.Router();

router.post("/stripe-webhook", stripeWebhook);

// get orders
router.get(
  "/orders",
  verifyToken,
  authorization("Admin", "Super Admin", "Manager", "CEO"),
  getOrders
);
// single order
router.get(
  "/:id",
  verifyToken,
  authorization("Admin", "Super Admin", "Manager", "CEO"),
  getSingleOrder
);
// add a create payment intent
router.post("/create-payment-intent", verifyToken, paymentIntent);
// save Order
router.post("/saveOrder", verifyToken, addOrder);
// update status
router.patch(
  "/update-status/:id",
  verifyToken,
  authorization("Admin", "Super Admin", "Manager", "CEO"),
  updateOrderStatus
);

module.exports = router;
