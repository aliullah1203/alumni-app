const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

// Retry connect with backoff for Neon cold-start
async function connectWithRetry(maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$connect();
      return;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const delay = attempt * 1500;
      console.warn(`DB connect attempt ${attempt} failed; retrying in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

module.exports = { prisma, connectWithRetry };
