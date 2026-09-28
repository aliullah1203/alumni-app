const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const ctrl = require("../controllers/public");
const { upload, verifyMagicBytes } = require("../middleware/upload");
const visitCounter = require("../middleware/visit");
const wrap = require("../utils/asyncHandler");

const registerLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
const verifyLimit = rateLimit({ windowMs: 60 * 1000, max: 20 });
const contactLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

router.get("/health", wrap(ctrl.health));
router.get("/content", visitCounter, wrap(ctrl.getContent));
router.get("/stats", wrap(ctrl.getStats));
router.get("/notices", wrap(ctrl.getNotices));
router.get("/gallery", wrap(ctrl.getGallery));
router.get("/meta/filters", wrap(ctrl.getFilters));

router.post("/contact", contactLimit, wrap(ctrl.sendContact));
router.post("/alumni/register", registerLimit, upload.single("photo"), verifyMagicBytes, wrap(ctrl.registerAlumni));
router.get("/alumni", wrap(ctrl.getAlumniList));
router.get("/alumni/:registrationNo", wrap(ctrl.getAlumni));
router.get("/alumni/:registrationNo/pdf", wrap(ctrl.getAlumniPdf));
router.get("/verify/:verifyToken", verifyLimit, wrap(ctrl.verifyAlumni));

module.exports = router;
