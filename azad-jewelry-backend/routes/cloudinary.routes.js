const express = require('express');
const router = express.Router();
const { cloudinaryController } = require('../controller/cloudinary.controller');
const multer = require('multer');
const path = require("path");
const verifyToken = require("../middleware/verifyToken");
const authorization = require("../middleware/authorization");

const adminRoles = ["Admin", "Super Admin", "Manager", "CEO"];

const supportedImageExt = /\.(png|jpg|jpeg|webp)$/i;
const memoryUpload = multer({
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const isSupported = supportedImageExt.test(ext) && String(file.mimetype || "").startsWith("image/");
    if (isSupported) return cb(null, true);
    return cb(new Error("Must be a png/jpg/jpeg/webp image"));
  },
});
//add image
router.post(
  '/add-img',
  verifyToken,
  authorization(...adminRoles),
  memoryUpload.single('image'),
  cloudinaryController.saveImageCloudinary
);

//add image
router.post(
  '/add-multiple-img',
  verifyToken,
  authorization(...adminRoles),
  memoryUpload.array('images', 5),
  cloudinaryController.addMultipleImageCloudinary
);

//delete image
router.delete(
  '/img-delete',
  verifyToken,
  authorization(...adminRoles),
  cloudinaryController.cloudinaryDeleteController
);

module.exports = router;
