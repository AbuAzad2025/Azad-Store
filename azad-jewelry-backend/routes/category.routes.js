const express = require('express');
const router = express.Router();
// internal
const categoryController = require('../controller/category.controller');
const verifyToken = require("../middleware/verifyToken");
const authorization = require("../middleware/authorization");

const adminRoles = ["Admin", "Super Admin", "Manager", "CEO"];

// get
router.get('/get/:id', categoryController.getSingleCategory);
// add
router.post('/add', verifyToken, authorization(...adminRoles), categoryController.addCategory);
// add All Category
router.post('/add-all', verifyToken, authorization(...adminRoles), categoryController.addAllCategory);
// get all Category
router.get('/all', categoryController.getAllCategory);
// get Product Type Category
router.get('/show/:type', categoryController.getProductTypeCategory);
// get Show Category
router.get('/show', categoryController.getShowCategory);
// delete category
router.delete('/delete/:id', verifyToken, authorization(...adminRoles), categoryController.deleteCategory);
// delete product
router.patch('/edit/:id', verifyToken, authorization(...adminRoles), categoryController.updateCategory);

module.exports = router;
