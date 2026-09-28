const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const ctrl = require("../controllers/alumniAuth");
const { requireAlumniAuth } = require("../middleware/alumniAuth");
const { upload, verifyMagicBytes } = require("../middleware/upload");
const wrap = require("../utils/asyncHandler");

const loginLimit = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
const forgotLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

// Account setup
router.get("/setup", wrap(ctrl.validateSetupToken));
router.post("/setup", wrap(ctrl.completeSetup));

// Auth
router.post("/login", loginLimit, wrap(ctrl.login));
router.post("/logout", wrap(ctrl.logout));
router.get("/me", requireAlumniAuth, wrap(ctrl.me));

// Password reset
router.post("/forgot-password", forgotLimit, wrap(ctrl.forgotPassword));
router.get("/reset", wrap(ctrl.validateResetToken));
router.post("/reset-password", wrap(ctrl.resetPassword));

// Profile self-service (authenticated)
router.put("/profile",    requireAlumniAuth, upload.single("photo"), verifyMagicBytes, wrap(ctrl.updateProfile));
router.put("/education",  requireAlumniAuth, wrap(ctrl.updateEducation));
router.put("/experience", requireAlumniAuth, wrap(ctrl.updateExperience));
router.put("/password",   requireAlumniAuth, wrap(ctrl.changePassword));
router.get("/gallery",    requireAlumniAuth, wrap(ctrl.listGallery));
router.post("/gallery",   requireAlumniAuth, upload.single("image"), verifyMagicBytes, wrap(ctrl.uploadGallery));
router.delete("/gallery/:id", requireAlumniAuth, wrap(ctrl.deleteGallery));

module.exports = router;
