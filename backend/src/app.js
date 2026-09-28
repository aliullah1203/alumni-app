const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { CLIENT_URL, UPLOAD_DIR, NODE_ENV } = require("./config/env");
const errorHandler = require("./middleware/error");

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// Global rate limit
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

// Logging
if (NODE_ENV !== "test") app.use(morgan("dev"));

// Parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Static uploads (local dev only)
app.use("/uploads", express.static(path.resolve(UPLOAD_DIR)));

// Routes
app.use("/api", require("./routes/public"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/alumni-auth", require("./routes/alumniAuth"));
app.use("/api/admin", require("./routes/admin"));

// 404
app.use("/api/*", (_req, res) => res.status(404).json({ success: false, message: "Not found" }));

// Central error handler
app.use(errorHandler);

module.exports = app;
