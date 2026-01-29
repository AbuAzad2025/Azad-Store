const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../index");

const User = require("../model/User");
const Products = require("../model/Products");
const Order = require("../model/Order");

const signToken = (payload) =>
  jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1h" });

describe("Review routes", () => {
  it("adds review only for purchased product", async () => {
    const user = await User.create({
      name: "Buyer",
      email: "buyer.review@example.com",
      password: "secret123",
      status: "active",
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
      brand: { name: "B", id: user._id },
      category: { name: "C", id: user._id },
      status: "in-stock",
      productType: "jewelry",
      description: "desc",
    });

    await Order.create({
      user: user._id,
      cart: [{ _id: String(product._id), orderQuantity: 1, productType: "jewelry" }],
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

    const userToken = signToken({
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: "user",
    });

    const ok = await request(app)
      .post("/api/review/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId: String(product._id),
        rating: 5,
        comment: "Nice",
      });
    expect(ok.status).toBe(201);

    const dup = await request(app)
      .post("/api/review/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId: String(product._id),
        rating: 4,
        comment: "Again",
      });
    expect(dup.status).toBe(400);
  });

  it("rejects review when no purchase", async () => {
    const user = await User.create({
      name: "Buyer",
      email: "buyer.review2@example.com",
      password: "secret123",
      status: "active",
    });

    const product = await Products.create({
      img: "/product-images/test/main.jpg",
      title: "Prod Two",
      unit: "pcs",
      parent: "C1",
      children: "Sub",
      price: 10,
      discount: 0,
      quantity: 5,
      brand: { name: "B", id: user._id },
      category: { name: "C", id: user._id },
      status: "in-stock",
      productType: "jewelry",
      description: "desc",
    });

    const userToken = signToken({
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: "user",
    });

    const res = await request(app)
      .post("/api/review/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId: String(product._id),
        rating: 5,
        comment: "Nice",
      });
    expect(res.status).toBe(400);
  });
});
