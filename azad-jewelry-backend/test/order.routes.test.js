const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../index");

const Brand = require("../model/Brand");
const Category = require("../model/Category");
const Products = require("../model/Products");
const User = require("../model/User");
const Order = require("../model/Order");

const signToken = (payload) =>
  jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1h" });

describe("Order routes", () => {
  it("blocks protected endpoints without token", async () => {
    const res = await request(app).post("/api/order/saveOrder").send({});
    expect(res.status).toBe(401);
  });

  it("creates order, lists orders for admin, updates status", async () => {
    const brand = await Brand.create({ name: "B1", status: "active" });
    const category = await Category.create({
      parent: "C1",
      children: ["Sub"],
      productType: "jewelry",
      status: "Show",
    });
    const product = await Products.create({
      img: "/product-images/test/main.jpg",
      title: "Prod One",
      unit: "pcs",
      parent: "C1",
      children: "Sub",
      price: 10,
      discount: 0,
      quantity: 5,
      brand: { name: brand.name, id: brand._id },
      category: { name: category.parent, id: category._id },
      status: "in-stock",
      productType: "jewelry",
      description: "desc",
    });

    const user = await User.create({
      name: "User One",
      email: "user.one@example.com",
      password: "secret123",
      status: "active",
      role: "user",
    });

    const userToken = signToken({
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: "user",
    });

    const orderRes = await request(app)
      .post("/api/order/saveOrder")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        cart: [
          {
            _id: String(product._id),
            productId: String(product._id),
            title: product.title,
            price: product.price,
            orderQuantity: 1,
            productType: product.productType,
          },
        ],
        name: "Buyer",
        address: "Addr",
        email: user.email,
        contact: "123",
        city: "City",
        country: "Country",
        zipCode: "00000",
        subTotal: 10,
        shippingCost: 0,
        discount: 0,
        totalAmount: 10,
        paymentMethod: "COD",
      });

    expect(orderRes.status).toBe(200);
    expect(orderRes.body?.success).toBe(true);
    expect(orderRes.body?.order?._id).toBeTruthy();
    expect(orderRes.body?.order?.cardInfo).toBeUndefined();
    expect(orderRes.body?.order?.paymentIntent).toBeUndefined();

    const adminToken = signToken({
      _id: "admin-id",
      name: "Admin",
      email: "admin@example.com",
      role: "Admin",
    });

    const listRes = await request(app)
      .get("/api/order/orders")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body?.success).toBe(true);
    expect(listRes.body?.totalDoc).toBe(1);

    const orderId = listRes.body?.data?.[0]?._id;
    expect(orderId).toBeTruthy();

    const singleRes = await request(app)
      .get(`/api/order/${orderId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(singleRes.status).toBe(200);
    expect(String(singleRes.body?._id)).toBe(String(orderId));

    const updateRes = await request(app)
      .patch(`/api/order/update-status/${orderId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "processing" });
    expect(updateRes.status).toBe(200);

    const updated = await Order.findById(orderId).lean();
    expect(updated?.status).toBe("processing");
  });

  it("create-payment-intent returns 500 when stripe not configured", async () => {
    const token = signToken({
      _id: "user-id",
      name: "User",
      email: "user@example.com",
      role: "user",
    });

    const res = await request(app)
      .post("/api/order/create-payment-intent")
      .set("Authorization", `Bearer ${token}`)
      .send({ price: 10 });

    expect(res.status).toBe(500);
    expect(res.body?.success).toBe(false);
  });
});
