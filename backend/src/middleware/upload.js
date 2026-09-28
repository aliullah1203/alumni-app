const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { fail } = require("../utils/response");

// Magic bytes for allowed image types
const MAGIC = {
  jpeg: [0xff, 0xd8, 0xff],
  png:  [0x89, 0x50, 0x4e, 0x47],
  webp: [0x52, 0x49, 0x46, 0x46], // "RIFF" — checked with str at offset 8
};

function checkMagicBytes(buffer, mimetype) {
  if (mimetype === "image/jpeg" || mimetype === "image/jpg") {
    return MAGIC.jpeg.every((b, i) => buffer[i] === b);
  }
  if (mimetype === "image/png") {
    return MAGIC.png.every((b, i) => buffer[i] === b);
  }
  if (mimetype === "image/webp") {
    const riff = MAGIC.webp.every((b, i) => buffer[i] === b);
    const webp = buffer.toString("ascii", 8, 12) === "WEBP";
    return riff && webp;
  }
  return false;
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, and WebP images are allowed"));
    }
    cb(null, true);
  },
});

function verifyMagicBytes(req, res, next) {
  if (!req.file) return next();
  if (!checkMagicBytes(req.file.buffer, req.file.mimetype)) {
    return fail(res, "File content does not match the declared image type", 422);
  }
  next();
}

// Random filename to prevent path traversal
function randomFilename(file) {
  const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
  return `${crypto.randomBytes(16).toString("hex")}${ext}`;
}

module.exports = { upload, verifyMagicBytes, randomFilename };
