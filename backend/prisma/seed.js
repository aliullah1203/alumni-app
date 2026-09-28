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

  console.log("Seed complete.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
