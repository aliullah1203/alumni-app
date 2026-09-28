const crypto = require("crypto");
const { prisma } = require("../config/prisma");

// Increment DailyVisit once per session per day; no PII stored.
module.exports = async function visitCounter(req, res, next) {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const cookieName = "_vsid";
    const visitedKey = `_vsdate`;

    let sessionId = req.cookies?.[cookieName];
    const lastVisitDate = req.cookies?.[visitedKey];

    const todayStr = today.toISOString().slice(0, 10);
    if (lastVisitDate === todayStr) {
      return next(); // already counted today
    }

    if (!sessionId) {
      sessionId = crypto.randomBytes(16).toString("hex");
      res.cookie(cookieName, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
    }

    res.cookie(visitedKey, todayStr, { httpOnly: true, sameSite: "lax", maxAge: 25 * 60 * 60 * 1000 });

    await prisma.dailyVisit.upsert({
      where: { date: today },
      create: { date: today, count: 1 },
      update: { count: { increment: 1 } },
    });
  } catch {
    // Never block the response for a stats failure
  }
  next();
};
