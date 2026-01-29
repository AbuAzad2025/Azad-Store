const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../index");

const User = require("../model/User");

const signToken = (payload) =>
  jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1h" });

describe("Backup routes", () => {
  it("download returns backup payload", async () => {
    await User.create({
      name: "User One",
      email: "u1@example.com",
      password: "secret123",
      status: "active",
    });

    const adminToken = signToken({
      _id: "admin-id",
      name: "Admin",
      email: "admin@example.com",
      role: "Admin",
    });

    const res = await request(app)
      .get("/api/backup/download")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body?.version).toBeTruthy();
    expect(Array.isArray(res.body?.users)).toBe(true);
    expect(res.body.users.length).toBe(1);
  });

  it("restore rejects invalid payload", async () => {
    const adminToken = signToken({
      _id: "admin-id",
      name: "Admin",
      email: "admin@example.com",
      role: "Admin",
    });

    const res = await request(app)
      .post("/api/backup/restore")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ foo: "bar" });
    expect(res.status).toBe(400);
  });
});
