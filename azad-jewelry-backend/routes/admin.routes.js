const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const verifyToken = require("../middleware/verifyToken");
const authorization = require("../middleware/authorization");
const { secret } = require("../config/secret");
const {
  registerAdmin,
  loginAdmin,
  updateStaff,
  changePassword,
  addStaff,
  getAllStaff,
  deleteStaff,
  getStaffById,
  forgetPassword,
  confirmAdminEmail,
  confirmAdminForgetPass,
} = require("../controller/admin.controller");
const { getOrderPaymentDetailsForAzad } = require("../controller/order.controller");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: secret.env === "production" ? 5 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

//login a admin
router.post("/login", authLimiter, loginAdmin);

//forget-password
router.patch("/forget-password", authLimiter, forgetPassword);

//forget-password
router.patch("/confirm-forget-password", authLimiter, confirmAdminForgetPass);

router.use(
  verifyToken,
  authorization("Admin", "Super Admin", "Manager", "CEO")
);

//register a staff
router.post("/register", registerAdmin);

router.patch("/change-password", changePassword);

router.post("/add", addStaff);

router.get("/all", getAllStaff);

//get a staff
router.get("/get/:id", getStaffById);

router.get("/orders/:id/payment-details", getOrderPaymentDetailsForAzad);

// update a staff
router.patch("/update-stuff/:id", updateStaff);

//update staf status
// router.put("/update-status/:id", updatedStatus);

//delete a staff
router.delete("/:id", deleteStaff);

module.exports = router;
