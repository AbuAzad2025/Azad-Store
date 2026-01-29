const express = require('express');
const router = express.Router();
const rateLimit = require("express-rate-limit");
const userController= require('../controller/user.controller');
const verifyToken = require('../middleware/verifyToken');
const authorization = require("../middleware/authorization");
const { secret } = require("../config/secret");

const adminRoles = ["Admin", "Super Admin", "Manager", "CEO", "admin"];

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: secret.env === "production" ? 10 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

const allowSelfOrAdmin = (req, res, next) => {
  const targetUserId = req.params.id;
  const actorId = req.user?._id;
  if (!actorId) {
    return res.status(401).json({
      status: "fail",
      error: "You are not logged in",
    });
  }
  const isAdmin = adminRoles.includes(req.user?.role);
  if (isAdmin || String(actorId) === String(targetUserId)) return next();
  return res.status(403).json({
    status: "fail",
    error: "You are not authorized to access this",
  });
};


// add a user
router.post("/signup", authLimiter, userController.signup);
// login
router.post("/login", authLimiter, userController.login);
// get me
router.get("/me", verifyToken, userController.getMe);
// forget-password
router.patch('/forget-password', authLimiter, userController.forgetPassword);
// confirm-forget-password
router.patch('/confirm-forget-password', authLimiter, userController.confirmForgetPassword);
// change password
router.patch('/change-password', verifyToken, userController.changePassword);
// confirmEmail
router.get('/confirmEmail/:token', userController.confirmEmail);
// updateUser
router.put('/update-user/:id', verifyToken, allowSelfOrAdmin, userController.updateUser);
// get all users
router.get('/all', verifyToken, authorization(...adminRoles), userController.getAllUsers);
// delete user
router.delete('/:id', verifyToken, authorization(...adminRoles), userController.deleteUser);
// add user by admin
router.post('/add-by-admin', verifyToken, authorization(...adminRoles), userController.addUserByAdmin);
// update user by admin
router.put('/update-by-admin/:id', verifyToken, authorization(...adminRoles), userController.updateUserByAdmin);
// register or login with google
router.post("/register/:token", authLimiter, userController.signUpWithProvider);

module.exports = router;
