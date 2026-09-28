const { z } = require("zod");
const { prisma } = require("../config/prisma");
const { ok, fail } = require("../utils/response");
const { generateVerifyToken } = require("../utils/token");
const { saveFile, getFileUrl } = require("../services/storage");
const { generateAlumniPdf } = require("../services/pdf");

// ── Health ───────────────────────────────────────────────────────────────────
exports.health = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    ok(res, { db: "ok" }, "Healthy");
  } catch (e) {
    fail(res, "DB unavailable", 503);
  }
};

// ── Content ──────────────────────────────────────────────────────────────────
exports.getContent = async (req, res) => {
  const row = await prisma.siteContent.findUnique({ where: { id: 1 } });
  ok(res, row ?? defaultContent());
};

// ── Stats ────────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  const [totalApproved, totalRegistered, batchGroups] = await Promise.all([
    prisma.alumni.count({ where: { status: "APPROVED" } }),
    prisma.alumni.count({ where: { status: { not: "REJECTED" } } }),
    prisma.alumni.groupBy({ by: ["batch"], where: { status: "APPROVED" } }),
  ]);
  ok(res, {
    totalAlumni: totalApproved,
    registeredMembers: totalRegistered,
    batches: batchGroups.length,
  });
};

// ── Notices ───────────────────────────────────────────────────────────────────
exports.getNotices = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 5, 20);
  const notices = await prisma.notice.findMany({
    where: { isPublished: true },
    orderBy: { date: "desc" },
    take: limit,
  });
  ok(res, notices);
};

// ── Gallery ───────────────────────────────────────────────────────────────────
exports.getGallery = async (req, res) => {
  const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
  ok(res, items.map((i) => ({ ...i, imageUrl: getFileUrl(i.imageUrl) })));
};

// ── Meta/filters ──────────────────────────────────────────────────────────────
exports.getFilters = async (req, res) => {
  const [batches, departments] = await Promise.all([
    prisma.alumni.findMany({
      where: { status: "APPROVED" },
      select: { batch: true },
      distinct: ["batch"],
      orderBy: { batch: "asc" },
    }),
    prisma.alumni.findMany({
      where: { status: "APPROVED" },
      select: { department: true },
      distinct: ["department"],
      orderBy: { department: "asc" },
    }),
  ]);
  ok(res, {
    batches: batches.map((b) => b.batch),
    departments: departments.map((d) => d.department),
  });
};

// ── Alumni registration ────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  registrationNo: z.string().regex(/^\d{4}-\d{3,4}$/).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().min(7).max(20).trim(),
  batch: z.coerce.number().int().min(1).max(200),
  department: z.string().min(2).max(100).trim(),
  faculty: z.string().min(2).max(100).trim(),
  address: z.string().min(5).max(500).trim(),
  about: z.string().max(1000).optional().default(""),
});

exports.registerAlumni = async (req, res) => {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (settings && !settings.registrationOpen) {
    return fail(res, "Alumni registration is currently closed", 403);
  }

  const data = registerSchema.parse(JSON.parse(req.body.data || JSON.stringify(req.body)));

  let photoUrl = null;
  if (req.file) {
    photoUrl = await saveFile(req.file);
  }

  const alumni = await prisma.alumni.create({
    data: { ...data, photoUrl, verifyToken: generateVerifyToken() },
    select: { id: true, name: true, registrationNo: true, status: true },
  });
  ok(res, alumni, "Registration submitted for approval", undefined, 201);
};

// ── Alumni list (APPROVED only, public) ───────────────────────────────────────
exports.getAlumniList = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(parseInt(req.query.limit) || 12, 50);
  const q = (req.query.q || "").trim();
  const batch = req.query.batch ? parseInt(req.query.batch) : undefined;
  const department = req.query.department?.trim();

  const where = {
    status: "APPROVED",
    ...(batch && { batch }),
    ...(department && { department }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { registrationNo: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const [total, alumni] = await Promise.all([
    prisma.alumni.count({ where }),
    prisma.alumni.findMany({
      where,
      select: {
        id: true,
        name: true,
        registrationNo: true,
        batch: true,
        department: true,
        faculty: true,
        photoUrl: true,
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  ok(
    res,
    alumni.map((a) => ({ ...a, photoUrl: getFileUrl(a.photoUrl) })),
    "OK",
    { page, limit, total, totalPages: Math.ceil(total / limit) }
  );
};

// ── Single alumni (APPROVED only) ────────────────────────────────────────────
const ALUMNI_PUBLIC_SELECT = {
  id: true,
  name: true,
  registrationNo: true,
  batch: true,
  department: true,
  faculty: true,
  about: true,
  photoUrl: true,
  socialLinks: true,
  showContact: true,
  verifyToken: true,
  email: true,
  phone: true,
  address: true,
  education: { orderBy: { startYear: "asc" } },
  experience: { orderBy: { startYear: "asc" } },
};

exports.getAlumni = async (req, res) => {
  const alumni = await prisma.alumni.findFirst({
    where: { registrationNo: req.params.registrationNo, status: "APPROVED" },
    select: ALUMNI_PUBLIC_SELECT,
  });
  if (!alumni) return fail(res, "Alumni not found", 404);
  const result = { ...alumni, photoUrl: getFileUrl(alumni.photoUrl) };
  if (!alumni.showContact) {
    delete result.email;
    delete result.phone;
    delete result.address;
  }
  ok(res, result);
};

// ── Alumni PDF ────────────────────────────────────────────────────────────────
exports.getAlumniPdf = async (req, res) => {
  const alumni = await prisma.alumni.findFirst({
    where: { registrationNo: req.params.registrationNo, status: "APPROVED" },
  });
  if (!alumni) return fail(res, "Alumni not found", 404);

  const pdfBuffer = await generateAlumniPdf({
    ...alumni,
    photoUrl: alumni.photoUrl,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${alumni.registrationNo}-profile.pdf"`
  );
  res.send(pdfBuffer);
};

// ── Verify ────────────────────────────────────────────────────────────────────
exports.verifyAlumni = async (req, res) => {
  const alumni = await prisma.alumni.findFirst({
    where: { verifyToken: req.params.verifyToken, status: "APPROVED" },
    select: {
      name: true, registrationNo: true, batch: true,
      department: true, photoUrl: true, approvedAt: true,
    },
  });
  if (!alumni) return ok(res, { valid: false });
  ok(res, {
    valid: true,
    name: alumni.name,
    registrationNo: alumni.registrationNo,
    batch: alumni.batch,
    department: alumni.department,
    photoUrl: getFileUrl(alumni.photoUrl),
    verifiedAt: alumni.approvedAt,
  });
};

function defaultContent() {
  return {
    hero: {
      title: "Welcome to the UITS Alumni Community",
      description: "Reconnecting Friends | Building Networks | Shaping the Future",
      bannerUrl: "",
    },
    about: {},
    contact: {},
    footer: {},
  };
}
