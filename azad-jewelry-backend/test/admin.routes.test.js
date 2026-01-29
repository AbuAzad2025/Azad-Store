const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../index");

const Admin = require("../model/Admin");

const signToken = (payload) =>
  jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1h" });

describe("Admin routes", () => {
  it("login returns token for valid credentials", async () => {
    await Admin.create({
      name: "Admin One",
      email: "admin.one@example.com",
      password: require("bcryptjs").hashSync("secret123"),
      role: "Admin",
      status: "Active",
    });

    const res = await request(app).post("/api/admin/login").send({
      email: "admin.one@example.com",
      password: "secret123",
    });

    expect(res.status).toBe(200);
    expect(res.body?.token).toBeTruthy();
    expect(res.body?.email).toBe("admin.one@example.com");
  });

  it("protected staff endpoints require token and allowed role", async () => {
    const noToken = await request(app).get("/api/admin/all");
    expect(noToken.status).toBe(401);

    const badRoleToken = signToken({
      _id: "u1",
      name: "User",
      email: "user@example.com",
      role: "user",
    });
    const forbidden = await request(app)
      .get("/api/admin/all")
      .set("Authorization", `Bearer ${badRoleToken}`);
    expect(forbidden.status).toBe(403);

    await Admin.create({
      name: "Staff",
      email: "staff@example.com",
      role: "Manager",
      status: "Active",
    });

    const okToken = signToken({
      _id: "a1",
      name: "Admin",
      email: "admin@example.com",
      role: "Admin",
    });
    const ok = await request(app)
      .get("/api/admin/all")
      .set("Authorization", `Bearer ${okToken}`);
    expect(ok.status).toBe(200);
    expect(ok.body?.status).toBe(true);
    expect(Array.isArray(ok.body?.data)).toBe(true);
    expect(ok.body.data.length).toBe(1);
  });
});

