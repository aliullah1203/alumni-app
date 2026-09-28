require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const { prisma } = require("../src/config/prisma");

const ADMIN_EMAIL = "alumnitest_admin@example.com";
const ADMIN_PASS = "TestPass@1";
let adminCookie;
let createdId;

beforeAll(async () => {
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      name: "Alumni Test Admin",
      email: ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(ADMIN_PASS, 12),
      role: "ADMIN",
      mustChangePassword: false,
    },
    update: {},
  });
  const res = await request(app).post("/api/auth/login").send({ email: ADMIN_EMAIL, password: ADMIN_PASS });
  adminCookie = res.headers["set-cookie"];
});

afterAll(async () => {
  if (createdId) await prisma.alumni.deleteMany({ where: { id: createdId } });
  await prisma.alumni.deleteMany({ where: { registrationNo: "2024-999" } });
  await prisma.user.deleteMany({ where: { email: ADMIN_EMAIL } });
  await prisma.$disconnect();
});

describe("POST /api/alumni/register", () => {
  it("creates a PENDING alumni", async () => {
    const res = await request(app)
      .post("/api/alumni/register")
      .field("name", "Test User")
      .field("registrationNo", "2024-999")
      .field("email", "testuser999@example.com")
      .field("phone", "01712000000")
      .field("batch", "2024")
      .field("department", "Computer Science & Engineering")
      .field("faculty", "Faculty of Science & Engineering")
      .field("address", "Test Address, Dhaka");
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("PENDING");
    createdId = res.body.data.id;
  });

  it("returns 409 for duplicate registrationNo", async () => {
    const res = await request(app)
      .post("/api/alumni/register")
      .field("name", "Duplicate User")
      .field("registrationNo", "2024-999")
      .field("email", "different@example.com")
      .field("phone", "01712000001")
      .field("batch", "2024")
      .field("department", "Computer Science & Engineering")
      .field("faculty", "Faculty of Science & Engineering")
      .field("address", "Test Address, Dhaka");
    expect(res.status).toBe(409);
  });
});

describe("Alumni approval flow", () => {
  it("pending alumni does not appear in public directory", async () => {
    const res = await request(app).get("/api/alumni?q=2024-999");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it("admin can approve alumni", async () => {
    const res = await request(app)
      .patch(`/api/admin/alumni/${createdId}/status`)
      .set("Cookie", adminCookie)
      .send({ status: "APPROVED" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("APPROVED");
  });

  it("approved alumni appears in public directory", async () => {
    const res = await request(app).get("/api/alumni?q=2024-999");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("admin can reject alumni", async () => {
    const res = await request(app)
      .patch(`/api/admin/alumni/${createdId}/status`)
      .set("Cookie", adminCookie)
      .send({ status: "REJECTED" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("REJECTED");
  });

  it("rejected alumni not in public directory", async () => {
    const res = await request(app).get("/api/alumni?q=2024-999");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});

describe("GET /api/alumni (filters + pagination)", () => {
  it("returns paginated results", async () => {
    const res = await request(app).get("/api/alumni?page=1&limit=2");
    expect(res.status).toBe(200);
    expect(res.body.meta).toHaveProperty("total");
    expect(res.body.meta).toHaveProperty("totalPages");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("filters by department", async () => {
    const res = await request(app).get("/api/alumni?department=Computer+Science+%26+Engineering");
    expect(res.status).toBe(200);
    res.body.data.forEach((a) => expect(a.department).toBe("Computer Science & Engineering"));
  });
});
