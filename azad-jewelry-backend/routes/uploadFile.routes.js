const express = require('express');
const { fileUpload } = require('../controller/upload.controller');
const uploader = require('../middleware/uploder');
const verifyToken = require("../middleware/verifyToken");
const authorization = require("../middleware/authorization");

const router = express.Router();
const adminRoles = ["Admin", "Super Admin", "Manager", "CEO"];

// routes
router.post('/single', verifyToken, authorization(...adminRoles), uploader.single('file'), fileUpload)

module.exports = router;
