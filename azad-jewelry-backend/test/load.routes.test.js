const request = require("supertest");
const app = require("../index");

const runBurst = async ({ path, count }) => {
  const start = Date.now();
  const responses = await Promise.all(
    Array.from({ length: count }, () => request(app).get(path))
  );
  const durationMs = Date.now() - start;
  return { responses, durationMs };
};

describe("Load/pressure smoke", () => {
  it(
    "handles concurrent reads on critical endpoints",
    async () => {
      const targets = [
        { path: "/", count: 30 },
        { path: "/api/product/all", count: 30 },
        { path: "/api/brand/all", count: 30 },
        { path: "/api/category/all", count: 30 },
      ];

      const results = [];
      for (const t of targets) {
        const r = await runBurst(t);
        results.push({ ...t, ...r });
      }

      for (const r of results) {
        for (const res of r.responses) {
          expect([200, 404]).toContain(res.status);
          expect(res.status).not.toBeGreaterThanOrEqual(500);
        }
        expect(Number.isFinite(r.durationMs)).toBe(true);
      }
    },
    30000
  );
});

