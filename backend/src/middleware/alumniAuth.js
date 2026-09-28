const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const { fail } = require("../utils/response");

const requireAlumniAuth = (req, res, next) => {
  const token = req.cookies.alumniToken;
  if (!token) return fail(res, "Authentication required", 401);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.type !== "alumni") return fail(res, "Invalid token type", 401);
    req.alumniUser = payload;
    next();
  } catch {
    return fail(res, "Invalid or expired session", 401);
  }
};

module.exports = { requireAlumniAuth };
