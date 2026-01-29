const express = require('express');
const router = express.Router();
const userOrderController = require('../controller/user.order.controller');
const verifyToken = require('../middleware/verifyToken');
const authorization = require("../middleware/authorization");

const adminRoles = ["Admin", "Super Admin", "Manager", "CEO", "admin"];


// get dashboard amount
router.get('/dashboard-amount', verifyToken, authorization(...adminRoles), userOrderController.getDashboardAmount);

// get sales-report
router.get('/sales-report', verifyToken, authorization(...adminRoles), userOrderController.getSalesReport);

// get sales-report
router.get('/most-selling-category', verifyToken, authorization(...adminRoles), userOrderController.mostSellingCategory);

// get sales-report
router.get('/dashboard-recent-order', verifyToken, authorization(...adminRoles), userOrderController.getDashboardRecentOrder);

// get sold products report
router.get('/sold-products-report', verifyToken, authorization(...adminRoles), userOrderController.getSoldProductsReport);

//get a order by id
router.get('/:id', verifyToken, userOrderController.getOrderById);

//get all order by a user
router.get('/',verifyToken, userOrderController.getOrderByUser);

module.exports = router;
