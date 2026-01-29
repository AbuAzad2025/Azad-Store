const express = require('express');
const router = express.Router();
// internal
const brandController = require('../controller/brand.controller');
const verifyToken = require("../middleware/verifyToken");
const authorization = require("../middleware/authorization");

const adminRoles = ["Admin", "Super Admin", "Manager", "CEO"];

// add Brand
router.post('/add', verifyToken, authorization(...adminRoles), brandController.addBrand);
// add All Brand
router.post('/add-all', verifyToken, authorization(...adminRoles), brandController.addAllBrand);
// get Active Brands
router.get('/active',brandController.getActiveBrands);
// get all Brands
router.get('/all',brandController.getAllBrands);
// delete brand
router.delete('/delete/:id', verifyToken, authorization(...adminRoles), brandController.deleteBrand);
// get single
router.get('/get/:id', brandController.getSingleBrand);
// delete product
router.patch('/edit/:id', verifyToken, authorization(...adminRoles), brandController.updateBrand);

module.exports = router;
