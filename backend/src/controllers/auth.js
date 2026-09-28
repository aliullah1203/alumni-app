const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { prisma } = require("../config/prisma");
const { JWT_SECRET, JWT_EXPIRES_IN, isProd } = require("../config/env");
const { ok, fail } = require("../utils/response");

function setAuthCookie(res, payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.cookie("authToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

exports.login = async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  // Generic message to prevent user enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return fail(res, "Invalid credentials", 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return fail(res, "Invalid credentials", 401);

  setAuthCookie(res, { id: user.id, role: user.role, mustChangePassword: user.mustChangePassword });
  ok(res, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  });
};

exports.logout = (req, res) => {
  res.clearCookie("authToken");
  ok(res, null, "Logged out");
};

exports.getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, mustChangePassword: true },
  });
  if (!user) return fail(res, "User not found", 404);
  ok(res, user);
};

const profileSchema = z.object({
  name:  z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
}).strict();

exports.updateProfile = async (req, res) => {
  const { name, email } = profileSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== req.user.id) return fail(res, "Email already in use", 409);
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, email },
    select: { id: true, name: true, email: true, role: true, mustChangePassword: true },
  });
  ok(res, user, "Profile updated");
};

const changePwSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Z]/, "Must contain an uppercase letter").regex(/[0-9]/, "Must contain a number"),
});

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = changePwSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return fail(res, "User not found", 404);

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return fail(res, "Current password is incorrect", 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false },
  });

  // Re-issue token with updated mustChangePassword flag
  setAuthCookie(res, { id: user.id, role: user.role, mustChangePassword: false });
  ok(res, null, "Password changed successfully");
};
