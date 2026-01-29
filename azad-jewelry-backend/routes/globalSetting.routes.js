const express = require('express');
const router = express.Router();
const globalSettingController = require('../controller/globalSetting.controller');
const verifyToken = require("../middleware/verifyToken");
const authorization = require("../middleware/authorization");

const adminRoles = ["Admin", "Super Admin", "Manager", "CEO", "admin"];

// Get Settings
router.get('/', globalSettingController.getGlobalSettings);

// Update Settings
router.put('/', verifyToken, authorization(...adminRoles), globalSettingController.updateGlobalSettings);

module.exports = router;
