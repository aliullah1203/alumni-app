const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { z } = require("zod");
const { prisma } = require("../config/prisma");
const { ok, fail } = require("../utils/response");
const { generateVerifyToken } = require("../utils/token");
const { saveFile, deleteFile, getFileUrl } = require("../services/storage");
const { sendEmail, setupEmailHtml } = require("../services/email");
const { PUBLIC_URL } = require("../config/env");

const SETUP_TTL_MS = 72 * 60 * 60 * 1000;

function generateSetupToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function sendSetupEmail(alumni) {
  const setupToken = generateSetupToken();
  const setupTokenExpiry = new Date(Date.now() + SETUP_TTL_MS);

  await prisma.alumni.update({
    where: { id: alumni.id },
    data: { setupToken, setupTokenExpiry },
  });

  const setupUrl = `${PUBLIC_URL}/alumni/setup-password?token=${setupToken}`;
  await sendEmail({
    to: alumni.email,
    subject: "UITS Alumni — Set up your account",
    html: setupEmailHtml(alumni.name, setupUrl),
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);

  const [pending, approved, rejected, totalVisits, todayVisit, recentAlumni] = await Promise.all([
    prisma.alumni.count({ where: { status: "PENDING" } }),
    prisma.alumni.count({ where: { status: "APPROVED" } }),
    prisma.alumni.count({ where: { status: "REJECTED" } }),
    prisma.dailyVisit.aggregate({ _sum: { count: true } }),
    prisma.dailyVisit.findUnique({ where: { date: today } }),
    prisma.alumni.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, registrationNo: true, department: true, batch: true, status: true, createdAt: true },
    }),
  ]);

  ok(res, {
    counts: { pending, approved, rejected, total: pending + approved + rejected },
    visits: { today: todayVisit?.count ?? 0, total: totalVisits._sum.count ?? 0 },
    recentAlumni,
  });
};

// ── Alumni management ─────────────────────────────────────────────────────────
exports.listAlumni = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(parseInt(req.query.limit) || 15, 50);
  const q = (req.query.q || "").trim();
  const status = req.query.status;
  const department = req.query.department?.trim();

  const where = {
    ...(status && ["PENDING", "APPROVED", "REJECTED"].includes(status) && { status }),
    ...(department && { department }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { registrationNo: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const [total, alumni] = await Promise.all([
    prisma.alumni.count({ where }),
    prisma.alumni.findMany({
      where,
      select: {
        id: true, name: true, registrationNo: true, email: true,
        batch: true, department: true, status: true, createdAt: true, photoUrl: true,
        alumniUser: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  ok(res, alumni.map((a) => ({ ...a, photoUrl: getFileUrl(a.photoUrl), hasAccount: !!a.alumniUser })), "OK",
    { page, limit, total, totalPages: Math.ceil(total / limit) });
};

exports.getAlumni = async (req, res) => {
  const alumni = await prisma.alumni.findUnique({
    where: { id: req.params.id },
    include: { education: true, experience: true, approvedBy: { select: { name: true } } },
  });
  if (!alumni) return fail(res, "Alumni not found", 404);
  ok(res, { ...alumni, photoUrl: getFileUrl(alumni.photoUrl) });
};

const alumniBodySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  registrationNo: z.string().regex(/^\d{4}-\d{3,4}$/).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().min(7).max(20).trim(),
  batch: z.coerce.number().int().min(1).max(200),
  department: z.string().min(2).max(100).trim(),
  faculty: z.string().min(2).max(100).trim(),
  address: z.string().min(5).max(500).trim(),
  about: z.string().max(1000).optional().default(""),
  bloodGroup: z.enum(["A+","A-","B+","B-","AB+","AB-","O+","O-"]).optional().nullable(),
  showContact: z.coerce.boolean().optional().default(false),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
}).strict();

exports.createAlumni = async (req, res) => {
  const data = alumniBodySchema.parse(
    JSON.parse(req.body.data || JSON.stringify(req.body))
  );
  let photoUrl = null;
  if (req.file) {
    photoUrl = await saveFile(req.file);
  }
  const alumni = await prisma.alumni.create({
    data: { ...data, photoUrl, verifyToken: generateVerifyToken() },
  });
  ok(res, { ...alumni, photoUrl: getFileUrl(alumni.photoUrl) }, "Created", undefined, 201);
};

exports.updateAlumni = async (req, res) => {
  const existing = await prisma.alumni.findUnique({ where: { id: req.params.id } });
  if (!existing) return fail(res, "Alumni not found", 404);

  const data = alumniBodySchema.partial().parse(
    JSON.parse(req.body.data || JSON.stringify(req.body))
  );

  let photoUrl = existing.photoUrl;
  if (req.file) {
    if (existing.photoUrl) {
      try { await deleteFile(existing.photoUrl.split("/uploads/").pop()); } catch {}
    }
    photoUrl = await saveFile(req.file);
  }

  const alumni = await prisma.alumni.update({
    where: { id: req.params.id },
    data: { ...data, photoUrl },
  });
  ok(res, { ...alumni, photoUrl: getFileUrl(alumni.photoUrl) });
};

exports.deleteAlumni = async (req, res) => {
  const existing = await prisma.alumni.findUnique({ where: { id: req.params.id } });
  if (!existing) return fail(res, "Alumni not found", 404);
  if (existing.photoUrl) {
    try { await deleteFile(new URL(existing.photoUrl).pathname.split("/uploads/")[1]); } catch {}
  }
  await prisma.alumni.delete({ where: { id: req.params.id } });
  ok(res, null, "Deleted");
};

exports.patchStatus = async (req, res) => {
  const statusSchema = z.object({ status: z.enum(["APPROVED", "REJECTED"]) });
  const { status } = statusSchema.parse(req.body);

  let alumni;
  if (status === "APPROVED") {
    alumni = await prisma.$transaction(async (tx) => {
      const existing = await tx.alumni.findUnique({ where: { id: req.params.id } });
      if (!existing) throw Object.assign(new Error("Not found"), { code: "P2025" });
      return tx.alumni.update({
        where: { id: req.params.id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedById: req.user.id,
          verifyToken: existing.verifyToken || generateVerifyToken(),
        },
        include: { alumniUser: { select: { id: true } } },
      });
    });

    // Send setup email only if AlumniUser doesn't exist yet
    if (!alumni.alumniUser) {
      try { await sendSetupEmail(alumni); } catch (err) {
        console.error("Failed to send setup email:", err.message);
      }
    }
  } else {
    alumni = await prisma.alumni.update({
      where: { id: req.params.id },
      data: { status: "REJECTED", approvedAt: null, approvedById: null },
    });
  }
  ok(res, alumni);
};

exports.resendSetup = async (req, res) => {
  const alumni = await prisma.alumni.findUnique({
    where: { id: req.params.id },
    include: { alumniUser: { select: { id: true } } },
  });

  if (!alumni) return fail(res, "Alumni not found", 404);
  if (alumni.status !== "APPROVED") return fail(res, "Alumni is not approved", 400);
  if (alumni.alumniUser) return fail(res, "Alumni has already set up their account", 400);

  try {
    await sendSetupEmail(alumni);
  } catch (err) {
    console.error("Failed to send setup email:", err.message);
    return fail(res, "Failed to send email. Check SMTP configuration.", 500);
  }

  ok(res, null, "Setup email sent");
};

// ── Notices ────────────────────────────────────────────────────────────────────
const noticeSchema = z.object({
  title: z.string().min(2).max(200).trim(),
  text: z.string().min(2).max(2000).trim(),
  date: z.coerce.date().optional(),
  isPublished: z.coerce.boolean().optional().default(true),
}).strict();

exports.listNotices = async (req, res) => {
  const notices = await prisma.notice.findMany({ orderBy: { date: "desc" } });
  ok(res, notices);
};

exports.createNotice = async (req, res) => {
  const data = noticeSchema.parse(req.body);
  const notice = await prisma.notice.create({ data });
  ok(res, notice, "Created", undefined, 201);
};

exports.updateNotice = async (req, res) => {
  const data = noticeSchema.partial().parse(req.body);
  const notice = await prisma.notice.update({ where: { id: req.params.id }, data });
  ok(res, notice);
};

exports.deleteNotice = async (req, res) => {
  await prisma.notice.delete({ where: { id: req.params.id } });
  ok(res, null, "Deleted");
};

// ── Gallery ────────────────────────────────────────────────────────────────────
exports.listGallery = async (req, res) => {
  const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
  ok(res, items.map((i) => ({ ...i, imageUrl: getFileUrl(i.imageUrl) })));
};

exports.createGalleryItem = async (req, res) => {
  if (!req.file) return fail(res, "Image is required", 422);
  const schema = z.object({ title: z.string().min(1).max(200).trim(), caption: z.string().max(500).trim().optional() });
  const data = schema.parse(req.body);
  const key = await saveFile(req.file);
  const item = await prisma.galleryItem.create({ data: { ...data, imageUrl: key } });
  ok(res, { ...item, imageUrl: getFileUrl(item.imageUrl) }, "Created", undefined, 201);
};

exports.deleteGalleryItem = async (req, res) => {
  const item = await prisma.galleryItem.findUnique({ where: { id: req.params.id } });
  if (!item) return fail(res, "Item not found", 404);
  try { await deleteFile(item.imageUrl); } catch {}
  await prisma.galleryItem.delete({ where: { id: req.params.id } });
  ok(res, null, "Deleted");
};

// ── Users ──────────────────────────────────────────────────────────────────────
const userCreateSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "EDITOR"]).default("EDITOR"),
}).strict();

exports.listUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  ok(res, users);
};

exports.createUser = async (req, res) => {
  const data = userCreateSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash, role: data.role, mustChangePassword: true },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  ok(res, user, "User created", undefined, 201);
};

exports.updateUser = async (req, res) => {
  if (req.params.id === req.user.id) return fail(res, "Cannot modify your own account here", 400);
  const schema = z.object({
    name: z.string().min(2).max(100).trim().optional(),
    role: z.enum(["ADMIN", "EDITOR"]).optional(),
    isActive: z.coerce.boolean().optional(),
  }).strict();
  const data = schema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  ok(res, user);
};

exports.deleteUser = async (req, res) => {
  if (req.params.id === req.user.id) return fail(res, "Cannot delete your own account", 400);
  await prisma.user.delete({ where: { id: req.params.id } });
  ok(res, null, "Deleted");
};

// ── Settings ───────────────────────────────────────────────────────────────────
exports.getSettings = async (req, res) => {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  ok(res, settings);
};

exports.updateSettings = async (req, res) => {
  const schema = z.object({
    siteName: z.string().min(2).max(200).trim().optional(),
    tagline: z.string().max(300).trim().optional(),
    registrationOpen: z.coerce.boolean().optional(),
  }).strict();
  const data = schema.parse(req.body);
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, siteName: data.siteName ?? "UITS Alumni Association", tagline: data.tagline ?? "", registrationOpen: data.registrationOpen ?? true },
    update: data,
  });
  ok(res, settings);
};

// ── Site Content ───────────────────────────────────────────────────────────────
exports.getContent = async (req, res) => {
  const row = await prisma.siteContent.findUnique({ where: { id: 1 } });
  ok(res, row ?? defaultContent());
};

exports.updateContent = async (req, res) => {
  const contentSchema = z.object({
    hero: z.object({
      title: z.string().min(1).max(200).trim().optional(),
      description: z.string().max(500).trim().optional(),
      bannerUrl: z.string().optional(),
    }).optional(),
    about: z.record(z.any()).optional(),
    contact: z.record(z.any()).optional(),
    footer: z.record(z.any()).optional(),
  }).strict();

  const existing = await prisma.siteContent.findUnique({ where: { id: 1 } });
  const body = JSON.parse(req.body.data || JSON.stringify(req.body));
  const data = contentSchema.parse(body);

  let bannerUrl = existing?.hero?.bannerUrl ?? "";
  if (req.file) {
    const key = await saveFile(req.file);
    bannerUrl = getFileUrl(key);
  } else if (data.hero?.bannerUrl === "") {
    bannerUrl = "";
  }

  const hero = { ...(existing?.hero ?? {}), ...data.hero, bannerUrl };
  const row = await prisma.siteContent.upsert({
    where: { id: 1 },
    create: { id: 1, hero, about: data.about ?? {}, contact: data.contact ?? {}, footer: data.footer ?? {} },
    update: { hero, ...(data.about && { about: data.about }), ...(data.contact && { contact: data.contact }), ...(data.footer && { footer: data.footer }) },
  });
  ok(res, row);
};

function defaultContent() {
  return {
    id: 1,
    hero: {
      title: "Welcome to the UITS Alumni Community",
      description: "Reconnecting Friends | Building Networks | Shaping the Future",
      bannerUrl: "",
    },
    about: {}, contact: {}, footer: {},
  };
}
