const request = require("supertest");
const app = require("../index");

describe("User routes", () => {
  it("signup then login works without email service", async () => {
    const signupRes = await request(app).post("/api/user/signup").send({
      name: "Test User",
      email: "test.user@example.com",
      password: "secret123",
    });
    expect(signupRes.status).toBe(200);

    const loginRes = await request(app).post("/api/user/login").send({
      email: "test.user@example.com",
      password: "secret123",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body?.data?.token).toBeTruthy();
    expect(loginRes.body?.data?.user?.email).toBe("test.user@example.com");
  });

  it("login rejects wrong password", async () => {
    await request(app).post("/api/user/signup").send({
      name: "Test User2",
      email: "test.user2@example.com",
      password: "secret123",
    });

    const loginRes = await request(app).post("/api/user/login").send({
      email: "test.user2@example.com",
      password: "wrong",
    });

    expect(loginRes.status).toBe(403);
  });

  it("forget-password returns 503 when email service not configured", async () => {
    await request(app).post("/api/user/signup").send({
      name: "Test User3",
      email: "test.user3@example.com",
      password: "secret123",
    });

    const res = await request(app).patch("/api/user/forget-password").send({
      email: "test.user3@example.com",
    });

    expect(res.status).toBe(503);
  });
});

