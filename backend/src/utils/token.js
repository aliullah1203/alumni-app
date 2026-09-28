const crypto = require("crypto");

const generateVerifyToken = () => crypto.randomBytes(32).toString("hex");

module.exports = { generateVerifyToken };
