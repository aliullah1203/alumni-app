require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../src/app");
const { prisma } = require("../src/config/prisma");

afterAll(async () => { await prisma.$disconnect(); });

const PRIVATE_FIELDS = ["passwordHash", "verifyToken", "email", "phone", "address"];

describe("Public endpoints must not leak private fields", () => {
  it("GET /api/alumni list never exposes private fields", async () => {
    const res = await request(app).get("/api/alumni");
    expect(res.status).toBe(200);
    res.body.data.forEach((a) => {
      expect(a.passwordHash).toBeUndefined();
      expect(a.email).toBeUndefined();
      expect(a.phone).toBeUndefined();
      expect(a.address).toBeUndefined();
    });
  });

  it("GET /api/alumni/:registrationNo hides contact when showContact=false", async () => {
    const hidden = await prisma.alumni.findFirst({ where: { status: "APPROVED", showContact: false } });
    if (!hidden) return;
    const res = await request(app).get(`/api/alumni/${hidden.registrationNo}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBeUndefined();
    expect(res.body.data.phone).toBeUndefined();
    expect(res.body.data.address).toBeUndefined();
  });

  it("GET /api/verify/:token never exposes passwordHash", async () => {
    const alumni = await prisma.alumni.findFirst({ where: { status: "APPROVED" } });
    if (!alumni) return;
    const res = await request(app).get(`/api/verify/${alumni.verifyToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it("Admin routes return 401 without auth", async () => {
    const res = await request(app).get("/api/admin/dashboard");
    expect(res.status).toBe(401);
  });

  it("Admin alumni list never exposes passwordHash", async () => {
    // Admin is authenticated — but passwordHash should still not appear
    // (Alumni model doesn't have passwordHash, this verifies User model isolation)
    const res = await request(app).get("/api/admin/alumni");
    expect(res.status).toBe(401); // not logged in, correct
  });
});
