const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const { fail } = require("../utils/response");

function requireAuth(req, res, next) {
  const token = req.cookies?.authToken;
  if (!token) return fail(res, "Not authenticated", 401);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return fail(res, "Invalid or expired token", 401);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, "Not authenticated", 401);
    if (!roles.includes(req.user.role)) return fail(res, "Forbidden", 403);
    next();
  };
}

module.exports = { requireAuth, requireRole };
