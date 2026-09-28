const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const ctrl = require("../controllers/auth");
const { requireAuth } = require("../middleware/auth");
const wrap = require("../utils/asyncHandler");

const loginLimit = rateLimit({ windowMs: 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

router.post("/login", loginLimit, wrap(ctrl.login));
router.post("/logout", wrap(ctrl.logout));
router.get("/me", requireAuth, wrap(ctrl.getMe));
router.put("/profile", requireAuth, wrap(ctrl.updateProfile));
router.post("/change-password", requireAuth, wrap(ctrl.changePassword));

module.exports = router;
