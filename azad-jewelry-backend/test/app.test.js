const request = require("supertest");
const app = require("../index");

describe("App basics", () => {
  it("GET / returns ok message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Apps worked successfully");
  });

  it("Unknown route returns 404 json", async () => {
    const res = await request(app).get("/api/__unknown__");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      message: "Not Found",
    });
  });
});

