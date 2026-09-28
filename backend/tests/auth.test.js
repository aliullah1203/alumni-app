require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const { prisma } = require("../src/config/prisma");

const TEST_EMAIL = "testadmin@example.com";
const TEST_PASSWORD = "TestPass@1";

beforeAll(async () => {
  await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    create: {
      name: "Test Admin",
      email: TEST_EMAIL,
      passwordHash: await bcrypt.hash(TEST_PASSWORD, 12),
      role: "ADMIN",
      mustChangePassword: false,
    },
    update: {},
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

describe("POST /api/auth/login", () => {
  it("returns 401 for wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: TEST_EMAIL, password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("sets httpOnly cookie on success", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(TEST_EMAIL);
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toMatch(/HttpOnly/i);
  });

  it("rate-limits after 5 failed attempts", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post("/api/auth/login").send({ email: TEST_EMAIL, password: "bad" });
    }
    const res = await request(app).post("/api/auth/login").send({ email: TEST_EMAIL, password: "bad" });
    expect(res.status).toBe(429);
  });
});

describe("GET /api/auth/me", () => {
  let cookie;
  beforeAll(async () => {
    const res = await request(app).post("/api/auth/login").send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    cookie = res.headers["set-cookie"];
  });

  it("returns user when authenticated", async () => {
    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(TEST_EMAIL);
  });

  it("returns 401 without cookie", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
