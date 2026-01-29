const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");

const Brand = require("../model/Brand");
const Category = require("../model/Category");
const Products = require("../model/Products");
const Coupon = require("../model/Coupon");

describe("Catalog routes", () => {
  it("brand/category/product/coupon/settings endpoints respond with seeded data", async () => {
    const brand = await Brand.create({
      name: "Test Brand",
      status: "active",
    });

    const category = await Category.create({
      parent: "Test Category",
      children: ["Sub"],
      productType: "jewelry",
      status: "Show",
    });

    const product = await Products.create({
      img: "/product-images/test/main.jpg",
      title: "Test Product",
      unit: "pcs",
      parent: "Test Category",
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

    await Coupon.create({
      title: "Test Coupon",
      logo: "/site-assets/logo.png",
      couponCode: "TEST10",
      endTime: new Date(Date.now() + 86400000),
      discountPercentage: 10,
      minimumAmount: 10,
      productType: "jewelry",
      status: "active",
    });

    const brandRes = await request(app).get("/api/brand/all");
    expect(brandRes.status).toBe(200);
    expect(brandRes.body?.success).toBe(true);
    expect(Array.isArray(brandRes.body?.result)).toBe(true);

    const categoryRes = await request(app).get("/api/category/all");
    expect(categoryRes.status).toBe(200);
    expect(categoryRes.body?.success).toBe(true);
    expect(Array.isArray(categoryRes.body?.result)).toBe(true);

    const productsRes = await request(app).get("/api/product/all");
    expect(productsRes.status).toBe(200);
    expect(productsRes.body?.success).toBe(true);
    expect(Array.isArray(productsRes.body?.data)).toBe(true);
    expect(productsRes.body.data.length).toBe(1);

    const singleRes = await request(app).get(
      `/api/product/single-product/${product._id}`
    );
    expect(singleRes.status).toBe(200);
    expect(String(singleRes.body?._id)).toBe(String(product._id));

    const byIdsRes = await request(app)
      .post("/api/product/by-ids")
      .send({ ids: [String(product._id)] });
    expect(byIdsRes.status).toBe(200);
    expect(byIdsRes.body?.success).toBe(true);
    expect(Array.isArray(byIdsRes.body?.data)).toBe(true);
    expect(String(byIdsRes.body?.data?.[0]?._id)).toBe(String(product._id));

    const couponRes = await request(app).get("/api/coupon");
    expect(couponRes.status).toBe(200);
    expect(Array.isArray(couponRes.body)).toBe(true);
    expect(couponRes.body.length).toBe(1);

    const settingsRes = await request(app).get("/api/settings");
    expect(settingsRes.status).toBe(200);
    expect(settingsRes.body?.siteName).toBeTruthy();

    expect(mongoose.connection.readyState).toBe(1);
  });
});
