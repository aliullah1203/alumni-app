const fs = require("fs");
const path = require("path");
const { STORAGE_DRIVER, UPLOAD_DIR, PUBLIC_URL } = require("../config/env");
const { randomFilename } = require("../middleware/upload");

// ── Local disk driver ────────────────────────────────────────────────────────
const localDriver = {
  async save(file) {
    const dir = path.resolve(UPLOAD_DIR);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filename = randomFilename(file);
    fs.writeFileSync(path.join(dir, filename), file.buffer);
    return filename;
  },
  async delete(key) {
    const filePath = path.join(path.resolve(UPLOAD_DIR), key);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  },
  getUrl(key) {
    if (key.startsWith("http://") || key.startsWith("https://")) return key;
    return `${PUBLIC_URL}/uploads/${key}`;
  },
};

// ── Cloudinary driver (stub — install `cloudinary` npm package to activate) ──
const cloudinaryDriver = {
  async save(file) {
    // TODO: npm install cloudinary
    // const { v2: cloudinary } = require("cloudinary");
    // cloudinary.config({ cloud_name, api_key, api_secret });
    // const result = await new Promise((resolve, reject) => {
    //   cloudinary.uploader.upload_stream({ folder: "alumni" }, (err, res) => err ? reject(err) : resolve(res))
    //     .end(file.buffer);
    // });
    // return result.public_id;
    throw new Error("Cloudinary driver not configured. See server/src/services/storage.js");
  },
  async delete(key) {
    // const { v2: cloudinary } = require("cloudinary");
    // await cloudinary.uploader.destroy(key);
  },
  getUrl(key) {
    // return cloudinary.url(key);
    return key;
  },
};

const drivers = { local: localDriver, cloudinary: cloudinaryDriver };
const driver = drivers[STORAGE_DRIVER] || localDriver;

module.exports = {
  saveFile: (file) => driver.save(file),
  deleteFile: (key) => driver.delete(key),
  getFileUrl: (key) => (key ? driver.getUrl(key) : null),
};
