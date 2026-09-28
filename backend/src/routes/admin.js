const router = require("express").Router();
const ctrl = require("../controllers/admin");
const { requireAuth, requireRole } = require("../middleware/auth");
const { upload, verifyMagicBytes } = require("../middleware/upload");
const wrap = require("../utils/asyncHandler");

// All admin routes require authentication
router.use(requireAuth);

// Dashboard
router.get("/dashboard", wrap(ctrl.getDashboard));

// Alumni
router.get("/alumni", wrap(ctrl.listAlumni));
router.post("/alumni", upload.single("photo"), verifyMagicBytes, wrap(ctrl.createAlumni));
router.get("/alumni/:id", wrap(ctrl.getAlumni));
router.put("/alumni/:id", upload.single("photo"), verifyMagicBytes, wrap(ctrl.updateAlumni));
router.delete("/alumni/:id", wrap(ctrl.deleteAlumni));
router.patch("/alumni/:id/status", wrap(ctrl.patchStatus));
router.post("/alumni/:id/resend-setup", wrap(ctrl.resendSetup));

// Notices
router.get("/notices", wrap(ctrl.listNotices));
router.post("/notices", wrap(ctrl.createNotice));
router.put("/notices/:id", wrap(ctrl.updateNotice));
router.delete("/notices/:id", wrap(ctrl.deleteNotice));

// Gallery
router.get("/gallery", wrap(ctrl.listGallery));
router.post("/gallery", upload.single("image"), verifyMagicBytes, wrap(ctrl.createGalleryItem));
router.delete("/gallery/:id", wrap(ctrl.deleteGalleryItem));

// Users (ADMIN role only)
router.get("/users", requireRole("ADMIN"), wrap(ctrl.listUsers));
router.post("/users", requireRole("ADMIN"), wrap(ctrl.createUser));
router.put("/users/:id", requireRole("ADMIN"), wrap(ctrl.updateUser));
router.delete("/users/:id", requireRole("ADMIN"), wrap(ctrl.deleteUser));

// Settings
router.get("/settings", wrap(ctrl.getSettings));
router.patch("/settings", requireRole("ADMIN"), wrap(ctrl.updateSettings));

// Content
router.get("/content", wrap(ctrl.getContent));
router.put("/content", upload.single("banner"), verifyMagicBytes, wrap(ctrl.updateContent));

module.exports = router;
