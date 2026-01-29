const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../index");

const User = require("../model/User");
const Order = require("../model/Order");

const signToken = (payload) =>
  jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1h" });

describe("User order routes", () => {
  it("GET /api/user-order requires token", async () => {
    const res = await request(app).get("/api/user-order");
    expect(res.status).toBe(401);
  });

  it("GET /api/user-order returns orders and status counts", async () => {
    const user = await User.create({
      name: "Buyer",
      email: "buyer@example.com",
      password: "secret123",
      status: "active",
    });

    await Order.create({
      user: user._id,
      cart: [{ _id: user._id, productType: "jewelry", orderQuantity: 1 }],
      name: "Buyer",
      address: "Addr",
      email: user.email,
      contact: "1",
      city: "City",
      country: "Country",
      zipCode: "00000",
      subTotal: 10,
      shippingCost: 0,
      discount: 0,
      totalAmount: 10,
      paymentMethod: "COD",
      status: "pending",
    });
    await Order.create({
      user: user._id,
      cart: [{ _id: user._id, productType: "jewelry", orderQuantity: 1 }],
      name: "Buyer",
      address: "Addr",
      email: user.email,
      contact: "1",
      city: "City",
      country: "Country",
      zipCode: "00000",
      subTotal: 20,
      shippingCost: 0,
      discount: 0,
      totalAmount: 20,
      paymentMethod: "Card",
      status: "processing",
    });

    const token = signToken({
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: "user",
    });

    const res = await request(app)
      .get("/api/user-order?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.orders)).toBe(true);
    expect(res.body?.pending).toBe(1);
    expect(res.body?.processing).toBe(1);
  });

  it("dashboard endpoints return json", async () => {
    const adminToken = signToken({
      _id: "admin-id",
      name: "Admin",
      email: "admin@example.com",
      role: "Admin",
    });

    const res1 = await request(app)
      .get("/api/user-order/dashboard-amount")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res1.status).toBe(200);

    const res2 = await request(app)
      .get("/api/user-order/sales-report")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res2.status).toBe(200);

    const res3 = await request(app)
      .get("/api/user-order/dashboard-recent-order")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res3.status).toBe(200);
  });
});
