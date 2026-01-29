const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../index");

const signToken = (payload) =>
  jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1h" });

describe("Cloudinary routes", () => {
  it("add-img returns error when no file provided", async () => {
    const adminToken = signToken({
      _id: "admin-id",
      name: "Admin",
      email: "admin@example.com",
      role: "Admin",
    });

    const res = await request(app)
      .post("/api/cloudinary/add-img")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    expect(res.body?.success).toBe(false);
  });
});
