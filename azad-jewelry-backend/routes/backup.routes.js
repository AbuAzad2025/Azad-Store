const express = require('express');
const router = express.Router();
const backupController = require('../controller/backup.controller');
const verifyToken = require("../middleware/verifyToken");
const authorization = require("../middleware/authorization");

const adminRoles = ["Admin", "Super Admin", "Manager", "CEO"];

// Download Backup
router.get('/download', verifyToken, authorization(...adminRoles), backupController.createBackup);

// Restore Backup
router.post('/restore', verifyToken, authorization(...adminRoles), backupController.restoreBackup);

module.exports = router;
