const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { z } = require("zod");
const { prisma } = require("../config/prisma");
const { JWT_SECRET, JWT_EXPIRES_IN, PUBLIC_URL, NODE_ENV } = require("../config/env");
const { ok, fail } = require("../utils/response");
const { sendEmail, setupEmailHtml, resetEmailHtml } = require("../services/email");
const { getFileUrl, saveFile, deleteFile } = require("../services/storage");

const SETUP_TTL_MS  = 72 * 60 * 60 * 1000;
const RESET_TTL_MS  = 24 * 60 * 60 * 1000;
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

function setAlumniCookie(res, payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.cookie("alumniToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
  });
}

// GET /api/alumni-auth/setup?token=xxx — validate a setup token
exports.validateSetupToken = async (req, res) => {
  const { token } = req.query;
  if (!token) return fail(res, "Token is required", 400);

  const alumni = await prisma.alumni.findUnique({
    where: { setupToken: token },
    select: { id: true, name: true, email: true, setupTokenExpiry: true, status: true },
  });

  if (!alumni || alumni.status !== "APPROVED") return fail(res, "Invalid setup link", 400);
  if (!alumni.setupTokenExpiry || alumni.setupTokenExpiry < new Date()) {
    return fail(res, "This setup link has expired. Ask your administrator to resend it.", 400);
  }

  ok(res, { name: alumni.name, email: alumni.email });
};

// POST /api/alumni-auth/setup — complete account setup (set password)
exports.completeSetup = async (req, res) => {
  const schema = z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
  }).strict();

  const { token, password } = schema.parse(req.body);

  const alumni = await prisma.alumni.findUnique({
    where: { setupToken: token },
    include: { alumniUser: { select: { id: true } } },
  });

  if (!alumni || alumni.status !== "APPROVED") return fail(res, "Invalid setup link", 400);
  if (!alumni.setupTokenExpiry || alumni.setupTokenExpiry < new Date()) {
    return fail(res, "This setup link has expired", 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const alumniUser = await prisma.$transaction(async (tx) => {
    const au = alumni.alumniUser
      ? await tx.alumniUser.update({ where: { alumniId: alumni.id }, data: { passwordHash } })
      : await tx.alumniUser.create({ data: { alumniId: alumni.id, passwordHash } });

    await tx.alumni.update({
      where: { id: alumni.id },
      data: { setupToken: null, setupTokenExpiry: null },
    });

    return au;
  });

  setAlumniCookie(res, {
    type: "alumni",
    id: alumniUser.id,
    alumniId: alumni.id,
    email: alumni.email,
    name: alumni.name,
    registrationNo: alumni.registrationNo,
  });

  ok(res, { name: alumni.name, email: alumni.email, registrationNo: alumni.registrationNo });
};

// POST /api/alumni-auth/login
exports.login = async (req, res) => {
  const schema = z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(1),
  }).strict();

  const { email, password } = schema.parse(req.body);

  const alumni = await prisma.alumni.findUnique({
    where: { email },
    include: { alumniUser: { select: { id: true, passwordHash: true } } },
  });

  // Generic message prevents user enumeration
  const invalid = () => fail(res, "Invalid email or password", 401);

  if (!alumni || alumni.status !== "APPROVED") return invalid();
  if (!alumni.alumniUser) return fail(res, "Account not set up yet. Check your email for the setup link.", 401);

  const ok_ = await bcrypt.compare(password, alumni.alumniUser.passwordHash);
  if (!ok_) return invalid();

  setAlumniCookie(res, {
    type: "alumni",
    id: alumni.alumniUser.id,
    alumniId: alumni.id,
    email: alumni.email,
    name: alumni.name,
    registrationNo: alumni.registrationNo,
  });

  ok(res, { name: alumni.name, email: alumni.email, registrationNo: alumni.registrationNo });
};

// POST /api/alumni-auth/logout
exports.logout = (req, res) => {
  res.clearCookie("alumniToken");
  ok(res, null, "Logged out");
};

// GET /api/alumni-auth/me — requires alumni auth
exports.me = async (req, res) => {
  const alumni = await prisma.alumni.findUnique({
    where: { id: req.alumniUser.alumniId },
    select: {
      id: true, name: true, registrationNo: true, email: true, phone: true,
      batch: true, department: true, faculty: true, address: true, about: true,
      photoUrl: true, showContact: true, socialLinks: true, status: true,
    },
  });

  if (!alumni) return fail(res, "Not found", 404);
  ok(res, { ...alumni, photoUrl: getFileUrl(alumni.photoUrl) });
};

// POST /api/alumni-auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const schema = z.object({ email: z.string().email().toLowerCase().trim() }).strict();
  const { email } = schema.parse(req.body);

  // Always return 200 to avoid email enumeration
  const alumni = await prisma.alumni.findUnique({
    where: { email },
    include: { alumniUser: { select: { id: true } } },
  });

  if (alumni?.status === "APPROVED" && alumni.alumniUser) {
    const resetToken = randomToken();
    const resetTokenExpiry = new Date(Date.now() + RESET_TTL_MS);

    await prisma.alumniUser.update({
      where: { alumniId: alumni.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetUrl = `${PUBLIC_URL}/alumni/reset-password?token=${resetToken}`;
    await sendEmail({
      to: alumni.email,
      subject: "UITS Alumni — Reset your password",
      html: resetEmailHtml(alumni.name, resetUrl),
    });
  }

  ok(res, null, "If an account with that email exists, you will receive a reset link shortly.");
};

// GET /api/alumni-auth/reset?token=xxx — validate reset token
exports.validateResetToken = async (req, res) => {
  const { token } = req.query;
  if (!token) return fail(res, "Token is required", 400);

  const alumniUser = await prisma.alumniUser.findUnique({
    where: { resetToken: token },
    include: { alumni: { select: { name: true, email: true } } },
  });

  if (!alumniUser || !alumniUser.resetTokenExpiry || alumniUser.resetTokenExpiry < new Date()) {
    return fail(res, "Invalid or expired reset link", 400);
  }

  ok(res, { name: alumniUser.alumni.name, email: alumniUser.alumni.email });
};

// POST /api/alumni-auth/reset-password
exports.resetPassword = async (req, res) => {
  const schema = z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
  }).strict();

  const { token, password } = schema.parse(req.body);

  const alumniUser = await prisma.alumniUser.findUnique({
    where: { resetToken: token },
  });

  if (!alumniUser || !alumniUser.resetTokenExpiry || alumniUser.resetTokenExpiry < new Date()) {
    return fail(res, "Invalid or expired reset link", 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.alumniUser.update({
    where: { id: alumniUser.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  ok(res, null, "Password updated. You can now log in.");
};

// PUT /api/alumni-auth/profile — update own profile (requires alumniAuth)
const profileSchema = z.object({
  about: z.string().max(1000).optional(),
  phone: z.string().min(7).max(20).trim().optional(),
  address: z.string().min(5).max(500).trim().optional(),
  showContact: z.coerce.boolean().optional(),
  socialLinks: z.record(z.string().max(300)).optional(),
}).strict();

exports.updateProfile = async (req, res) => {
  const body = JSON.parse(req.body.data || JSON.stringify(req.body));
  const data = profileSchema.parse(body);

  const existing = await prisma.alumni.findUnique({ where: { id: req.alumniUser.alumniId } });
  if (!existing) return fail(res, "Not found", 404);

  let photoUrl = existing.photoUrl;
  if (req.file) {
    if (existing.photoUrl) {
      try { await deleteFile(existing.photoUrl.split("/uploads/").pop()); } catch {}
    }
    const key = await saveFile(req.file);
    photoUrl = key;
  }

  const alumni = await prisma.alumni.update({
    where: { id: req.alumniUser.alumniId },
    data: { ...data, photoUrl },
    select: {
      id: true, name: true, registrationNo: true, email: true, phone: true,
      batch: true, department: true, faculty: true, address: true, about: true,
      photoUrl: true, showContact: true, socialLinks: true,
    },
  });

  ok(res, { ...alumni, photoUrl: getFileUrl(alumni.photoUrl) });
};

// PUT /api/alumni-auth/password — change password (requires alumniAuth)
exports.changePassword = async (req, res) => {
  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
  }).strict();

  const { currentPassword, newPassword } = schema.parse(req.body);

  const alumniUser = await prisma.alumniUser.findUnique({
    where: { id: req.alumniUser.id },
  });
  if (!alumniUser) return fail(res, "Not found", 404);

  const valid = await bcrypt.compare(currentPassword, alumniUser.passwordHash);
  if (!valid) return fail(res, "Current password is incorrect", 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.alumniUser.update({ where: { id: alumniUser.id }, data: { passwordHash } });

  ok(res, null, "Password updated");
};
