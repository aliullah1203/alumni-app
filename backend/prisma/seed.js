require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();
const RESET = process.argv.includes("--reset");

if (RESET && process.env.NODE_ENV === "production") {
  console.error("--reset is blocked in production");
  process.exit(1);
}

const token = () => crypto.randomBytes(32).toString("hex");

async function main() {
  if (RESET) {
    console.log("Resetting database...");
    await prisma.alumni.deleteMany();
    await prisma.notice.deleteMany();
    await prisma.galleryItem.deleteMany();
    await prisma.dailyVisit.deleteMany();
    await prisma.user.deleteMany();
    await prisma.siteContent.deleteMany();
    await prisma.settings.deleteMany();
  }

  // Enable pg_trgm for ILIKE performance
  try {
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS alumni_name_trgm ON "Alumni" USING gin(name gin_trgm_ops)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS alumni_regno_trgm ON "Alumni" USING gin("registrationNo" gin_trgm_ops)`;
  } catch (e) {
    console.warn("pg_trgm setup skipped:", e.message);
  }

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@uits.edu.bd";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      name: "System Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
      mustChangePassword: true,
    },
    update: {},
  });
  console.log(`Admin user: ${adminEmail}`);

  // Default site content
  await prisma.siteContent.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      hero: {
        title: "Welcome to the UITS Alumni Community",
        description: "Reconnecting Friends | Building Networks | Shaping the Future",
        bannerUrl: "",
      },
      about: { heading: "About UITS", text: "University of Information Technology and Sciences (UITS) was founded on August 7, 2003. Our alumni network connects graduates from all faculties." },
      contact: {
        address: "Holding 190, Road 5, Block J, Baridhara, Maddha Naya Nagar, Vatara, Dhaka 1212, Bangladesh",
        website: "uits.edu.bd",
      },
      footer: { copyright: "© 2025 UITS Alumni Association. All rights reserved." },
    },
    update: {},
  });

  // Default settings
  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, siteName: "UITS Alumni Association", tagline: "Future will be better than the past", registrationOpen: true },
    update: {},
  });

  // PLACEHOLDER: sample alumni — not real UITS students
  const sampleAlumni = [
    { name: "Md. Rahman",     registrationNo: "2016-001", email: "rahman@example.com",   phone: "01712-345678", batch: 2016, department: "Computer Science & Engineering",       faculty: "Faculty of Science & Engineering",          address: "Dhaka, Bangladesh", status: "APPROVED" },
    { name: "Fatima Akter",   registrationNo: "2018-027", email: "fatima@example.com",   phone: "01812-345679", batch: 2018, department: "Business Administration",               faculty: "Faculty of Business",                        address: "Chittagong, Bangladesh", status: "APPROVED" },
    { name: "Sabbir Ahmed",   registrationNo: "2019-023", email: "sabbir@example.com",   phone: "01712-345680", batch: 2019, department: "Electrical & Electronic Engineering",   faculty: "Faculty of Science & Engineering",          address: "Sylhet, Bangladesh", status: "APPROVED" },
    { name: "Nusrat Jahan",   registrationNo: "2018-045", email: "nusrat@example.com",   phone: "01912-345681", batch: 2018, department: "Computer Science & Engineering",       faculty: "Faculty of Science & Engineering",          address: "Dhaka, Bangladesh", status: "APPROVED" },
    { name: "Tanzim Hasan",   registrationNo: "2020-012", email: "tanzim@example.com",   phone: "01712-345682", batch: 2020, department: "Information Technology",               faculty: "Faculty of Science & Engineering",          address: "Rajshahi, Bangladesh", status: "APPROVED" },
    { name: "Shakib Rahman",  registrationNo: "2020-030", email: "shakib@example.com",   phone: "01612-345683", batch: 2020, department: "Civil Engineering",                   faculty: "Faculty of Science & Engineering",          address: "Dhaka, Bangladesh", status: "APPROVED" },
    { name: "Rahim Uddin",    registrationNo: "2022-055", email: "rahim@example.com",    phone: "01512-345684", batch: 2022, department: "Computer Science & Engineering",       faculty: "Faculty of Science & Engineering",          address: "Dhaka, Bangladesh", status: "PENDING" },
  ];

  for (const a of sampleAlumni) {
    await prisma.alumni.upsert({
      where: { registrationNo: a.registrationNo },
      create: { ...a, about: "Sample alumni profile.", verifyToken: token(), approvedAt: a.status === "APPROVED" ? new Date() : null },
      update: {},
    });
  }

  // PLACEHOLDER: sample notices
  await prisma.notice.upsert({
    where: { id: "notice-001" },
    create: {
      id: "notice-001",
      title: "Annual Alumni Reunion 2025",
      text: "UITS Alumni Association cordially invites all alumni to the Annual Reunion 2025. Reconnect with your batchmates and celebrate our shared journey.",
      date: new Date("2025-04-15"),
      isPublished: true,
    },
    update: {},
  });

  console.log("Seed complete.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
