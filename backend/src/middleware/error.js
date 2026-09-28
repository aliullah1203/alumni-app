const { isProd } = require("../config/env");

const PRISMA_CODES = {
  P2002: (e) => ({
    status: 409,
    message: `${e.meta?.target?.[0] ?? "Field"} already exists`,
  }),
  P2025: () => ({ status: 404, message: "Record not found" }),
};

module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Zod validation errors
  if (err.name === "ZodError") {
    return res.status(422).json({
      success: false,
      message: "Validation error",
      data: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
  }

  // Prisma known errors
  const prismaHandler = PRISMA_CODES[err.code];
  if (prismaHandler) {
    const { status, message } = prismaHandler(err);
    return res.status(status).json({ success: false, message, data: null });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Invalid or expired token", data: null });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(isProd ? {} : { detail: err.message }),
    data: null,
  });
};
