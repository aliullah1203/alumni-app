require("dotenv").config();
const app = require("./app");
const { PORT } = require("./config/env");
const { connectWithRetry } = require("./config/prisma");

async function main() {
  await connectWithRetry();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
