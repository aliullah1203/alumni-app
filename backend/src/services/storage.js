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

// ── Cloudinary driver ────────────────────────────────────────────────────────
const cloudinaryDriver = {
  _client: null,
  _getClient() {
    if (this._client) return this._client;
    const { v2: cloudinary } = require("cloudinary");
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
      require("../config/env");
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error(
        "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env"
      );
    }
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    this._client = cloudinary;
    return cloudinary;
  },
  async save(file) {
    const cloudinary = this._getClient();
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "alumni-app", resource_type: "image" },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(file.buffer);
    });
    return result.secure_url;
  },
  async delete(key) {
    if (!key) return;
    try {
      // key is the full secure_url; extract public_id from it
      const cloudinary = this._getClient();
      // URL format: https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<folder>/<id>.<ext>
      const match = key.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
      if (match) await cloudinary.uploader.destroy(match[1]);
    } catch {
      // non-fatal — file may already be gone
    }
  },
  getUrl(key) {
    // Cloudinary keys are already full https:// URLs
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
