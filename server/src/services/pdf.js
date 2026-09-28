const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { PUBLIC_URL, UPLOAD_DIR } = require("../config/env");

async function fetchImageBuffer(url) {
  if (!url) return null;
  // Local file path
  if (!url.startsWith("http")) {
    const localPath = path.resolve(UPLOAD_DIR, path.basename(url));
    if (fs.existsSync(localPath)) return fs.readFileSync(localPath);
    return null;
  }
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", () => resolve(null));
    });
    req.on("error", () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
  });
}

async function generateAlumniPdf(alumni) {
  const verifyUrl = `${PUBLIC_URL}/verify/${alumni.verifyToken}`;
  const qrBuffer = await QRCode.toBuffer(verifyUrl, { type: "png", width: 100, margin: 1 });
  const photoBuffer = alumni.photoUrl ? await fetchImageBuffer(alumni.photoUrl) : null;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width - 100; // usable width
    const BLUE = "#1a6ef2";
    const NAVY = "#0c3f8f";

    // ── Header ────────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill(NAVY);
    doc
      .fillColor("#ffffff")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("UITS Alumni Association", 50, 22);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#b3c8ff")
      .text("University of Information Technology and Sciences", 50, 46);

    // ── Title ─────────────────────────────────────────────────────────────────
    doc
      .fillColor(BLUE)
      .fontSize(15)
      .font("Helvetica-Bold")
      .text("Alumni Profile", 50, 100);
    doc.moveTo(50, 118).lineTo(545, 118).strokeColor(BLUE).lineWidth(1.5).stroke();

    // ── Photo ─────────────────────────────────────────────────────────────────
    const photoX = 50, photoY = 135, photoW = 110, photoH = 130;
    if (photoBuffer) {
      doc.image(photoBuffer, photoX, photoY, { width: photoW, height: photoH, cover: [photoW, photoH] });
    } else {
      doc.rect(photoX, photoY, photoW, photoH).fillColor("#e8edf5").fill();
      doc.fillColor("#8899bb").fontSize(10).text("No Photo", photoX, photoY + 55, { width: photoW, align: "center" });
    }

    // ── Info ─────────────────────────────────────────────────────────────────
    const infoX = 175, infoY = 135;
    doc.fillColor("#111111").fontSize(16).font("Helvetica-Bold").text(alumni.name, infoX, infoY);

    const rows = [
      ["Registration No", alumni.registrationNo],
      ["Batch", String(alumni.batch)],
      ["Department", alumni.department],
      ["Faculty", alumni.faculty],
      ...(alumni.showContact
        ? [["Email", alumni.email], ["Phone", alumni.phone], ["Address", alumni.address]]
        : []),
    ];

    let ry = infoY + 28;
    doc.fontSize(9).font("Helvetica");
    for (const [label, value] of rows) {
      doc.fillColor("#666").text(`${label}:`, infoX, ry, { continued: true });
      doc.fillColor("#111").text(`  ${value}`, { lineBreak: true });
      ry += 16;
    }

    // ── QR ────────────────────────────────────────────────────────────────────
    const qrX = 430, qrY = 135;
    doc.image(qrBuffer, qrX, qrY, { width: 90 });
    doc.fillColor("#666").fontSize(7.5).text("Scan to verify", qrX, qrY + 93, { width: 90, align: "center" });

    // ── About ─────────────────────────────────────────────────────────────────
    const aboutY = Math.max(photoY + photoH, ry) + 20;
    if (alumni.about) {
      doc.moveTo(50, aboutY).lineTo(545, aboutY).strokeColor("#dde2ec").lineWidth(1).stroke();
      doc.fillColor(BLUE).fontSize(11).font("Helvetica-Bold").text("About Me", 50, aboutY + 12);
      doc.fillColor("#444").fontSize(9.5).font("Helvetica").text(alumni.about, 50, aboutY + 28, { width: W });
    }

    // ── Signature ─────────────────────────────────────────────────────────────
    const sigY = doc.page.height - 120;
    doc.moveTo(50, sigY).lineTo(200, sigY).strokeColor("#aaa").lineWidth(0.7).stroke();
    doc.fillColor("#111").fontSize(9).font("Helvetica-Bold").text(alumni.name, 50, sigY + 5);
    doc.fillColor("#555").fontSize(8.5).font("Helvetica").text("UITS Alumni Association", 50, sigY + 18);
    doc.fillColor("#888").text("Authorized Signature", 50, sigY + 30);

    // ── Footer wave ───────────────────────────────────────────────────────────
    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(BLUE);
    doc.rect(0, doc.page.height - 22, doc.page.width, 22).fill(NAVY);
    doc
      .fillColor("#dde6ff")
      .fontSize(8)
      .text(`Date: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`, 0, doc.page.height - 17, {
        width: doc.page.width - 50,
        align: "right",
      });

    doc.end();
  });
}

module.exports = { generateAlumniPdf };
