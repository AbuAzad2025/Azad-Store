const mongoose = require("mongoose");
const Order = require("../model/Order");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const isToday = require("dayjs/plugin/isToday");
const isYesterday = require("dayjs/plugin/isYesterday");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");

// Apply necessary plugins to dayjs
dayjs.extend(customParseFormat);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// get all orders user
module.exports.getOrderByUser = async (req, res,next) => {
  try {
    const { page, limit } = req.query;

    const pages = Number(page) || 1;
    const limits = Math.min(Number(limit) || 8, 100);
    const skip = (pages - 1) * limits;

    const totalDoc = await Order.countDocuments({ user: req.user._id });

    const statusCounts = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusMap = statusCounts.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const orders = await Order.find({ user: req.user._id })
      .select("-cardInfo -paymentIntent")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limits)
      .lean();

    res.send({
      orders,
      pending: statusMap.pending || 0,
      processing: statusMap.processing || 0,
      delivered: statusMap.delivered || 0,
      page: pages,
      limit: limits,
      totalDoc,
    });
  } catch (error) {
    next(error)
  }
};

// getOrderById
module.exports.getOrderById = async (req, res,next) => {
  try {
    const actorId = req.user?._id;
    if (!actorId) {
      return res.status(401).json({
        success: false,
        message: "You are not logged in",
      });
    }

    const order = await Order.findById(req.params.id)
      .select("-cardInfo -paymentIntent")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const adminRoles = ["Admin", "Super Admin", "Manager", "CEO", "admin"];
    const isAdmin = adminRoles.includes(req.user?.role);
    const isOwner = String(order.user) === String(actorId);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error)
  }
};

// getDashboardAmount
exports.getDashboardAmount = async (req, res,next) => {
  try {
    const todayStart = dayjs().startOf("day");
    const todayEnd = dayjs().endOf("day");

    const yesterdayStart = dayjs().subtract(1, "day").startOf("day");
    const yesterdayEnd = dayjs().subtract(1, "day").endOf("day");

    const monthStart = dayjs().startOf("month");
    const monthEnd = dayjs().endOf("month");

    const [summary] = await Order.aggregate([
      {
        $facet: {
          today: [
            {
              $match: {
                createdAt: { $gte: todayStart.toDate(), $lte: todayEnd.toDate() },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$totalAmount" },
                card: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentMethod", "Card"] },
                      "$totalAmount",
                      0,
                    ],
                  },
                },
                cash: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentMethod", "COD"] },
                      "$totalAmount",
                      0,
                    ],
                  },
                },
              },
            },
          ],
          yesterday: [
            {
              $match: {
                createdAt: {
                  $gte: yesterdayStart.toDate(),
                  $lte: yesterdayEnd.toDate(),
                },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$totalAmount" },
                card: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentMethod", "Card"] },
                      "$totalAmount",
                      0,
                    ],
                  },
                },
                cash: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentMethod", "COD"] },
                      "$totalAmount",
                      0,
                    ],
                  },
                },
              },
            },
          ],
          month: [
            {
              $match: {
                createdAt: { $gte: monthStart.toDate(), $lte: monthEnd.toDate() },
              },
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ],
          total: [{ $group: { _id: null, total: { $sum: "$totalAmount" } } }],
        },
      },
    ]);

    const todayAgg = (summary?.today || [])[0] || {};
    const yesterdayAgg = (summary?.yesterday || [])[0] || {};
    const monthAgg = (summary?.month || [])[0] || {};
    const totalAgg = (summary?.total || [])[0] || {};

    res.status(200).send({
      todayOrderAmount: todayAgg.total || 0,
      yesterdayOrderAmount: yesterdayAgg.total || 0,
      monthlyOrderAmount: monthAgg.total || 0,
      totalOrderAmount: totalAgg.total || 0,
      todayCardPaymentAmount: todayAgg.card || 0,
      todayCashPaymentAmount: todayAgg.cash || 0,
      yesterDayCardPaymentAmount: yesterdayAgg.card || 0,
      yesterDayCashPaymentAmount: yesterdayAgg.cash || 0,
    });
  } catch (error) {
    next(error)
  }
};
// get sales report
exports.getSalesReport = async (req, res,next) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const endDate = new Date();
    const salesReportData = await Order.aggregate([
      { $match: { updatedAt: { $gte: startOfWeek, $lte: endDate } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$updatedAt",
            },
          },
          total: { $sum: "$totalAmount" },
          order: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", total: 1, order: 1 } },
    ]);

    // Send the response to the client site
    res.status(200).json({ salesReport: salesReportData });
  } catch (error) {
    // Handle error if any
    next(error)
  }
};

// Most Selling Category
exports.mostSellingCategory = async (req, res,next) => {
  try {
    const categoryData = await Order.aggregate([
      {
        $match: { status: { $in: ["processing", "delivered"] } },
      },
      {
        $unwind: "$cart", // Deconstruct the cart array
      },
      {
        $group: {
          _id: "$cart.productType",
          count: { $sum: "$cart.orderQuantity" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    res.status(200).json({ categoryData });
  } catch (error) {
    next(error)
  }
};

// dashboard recent order
exports.getDashboardRecentOrder = async (req, res,next) => {
  try {
    const { page, limit } = req.query;

    const pages = Number(page) || 1;
    const limits = Math.min(Number(limit) || 8, 100);
    const skip = (pages - 1) * limits;

    const queryObject = {
      status: { $in: ["pending", "processing", "delivered", "cancel"] },
    };

    const totalDoc = await Order.countDocuments(queryObject);

    const orders = await Order.aggregate([
      { $match: queryObject },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limits },
      {
        $project: {
          invoice: 1,
          createdAt: 1,
          updatedAt: 1,
          paymentMethod: 1,
          name: 1,
          user: 1,
          totalAmount: 1,
          status:1,
        },
      },
    ]);

    res.status(200).send({
      orders: orders,
      page: pages,
      limit: limits,
      totalOrder: totalDoc,
    });
  } catch (error) {
    next(error)
  }
};

// get sold products report
exports.getSoldProductsReport = async (req, res, next) => {
  try {
    const limits = Math.min(Number(req.query?.limit) || 50, 200);
    const soldProducts = await Order.aggregate([
      {
        $match: {
          status: { $in: ["processing", "delivered"] } // Only count confirmed sales
        }
      },
      {
        $unwind: "$cart"
      },
      {
        $group: {
          _id: "$cart.productId", // Assuming productId exists in cart item
          title: { $first: "$cart.title" },
          price: { $first: "$cart.price" },
          totalSold: { $sum: "$cart.orderQuantity" },
          totalRevenue: { $sum: { $multiply: ["$cart.price", "$cart.orderQuantity"] } }
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: limits
      },
    ]);

    res.status(200).json(soldProducts);
  } catch (error) {
    next(error);
  }
};
