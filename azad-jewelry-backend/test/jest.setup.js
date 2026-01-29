const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.TOKEN_SECRET = process.env.TOKEN_SECRET || "test_token_secret";
process.env.JWT_SECRET_FOR_VERIFY =
  process.env.JWT_SECRET_FOR_VERIFY || "test_verify_secret";
process.env.EMAIL_PASS = process.env.EMAIL_PASS || "";
process.env.STORE_URL = process.env.STORE_URL || "http://localhost:3000";
process.env.ADMIN_URL = process.env.ADMIN_URL || "http://localhost:3001";

let mongoServer;

beforeAll(async () => {
  jest.setTimeout(60000);
  mongoose.set("autoIndex", false);
  mongoose.set("autoCreate", false);
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri("azad_test"));
  try {
    await mongoose.connection.db
      .admin()
      .command({ setParameter: 1, maxTransactionLockRequestTimeoutMillis: 3000 });
  } catch {}
});

afterEach(async () => {
  if (!mongoose.connection?.db) return;
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

afterAll(async () => {
  try {
    await mongoose.disconnect();
  } finally {
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
});
