const nodemailer = require("nodemailer");

function createTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendEmail({ to, subject, html }) {
  const transport = createTransport();
  if (!transport) {
    console.log("\n📧 [DEV EMAIL — configure SMTP_HOST to send real emails]");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("---");
    console.log(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    console.log("---\n");
    return;
  }
  await transport.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

function setupEmailHtml(name, setupUrl) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#1e3a5f;padding:24px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:20px">UITS Alumni Association</h1>
  </div>
  <div style="background:#fff;border:1px solid #e0e0e0;border-top:none;padding:32px;border-radius:0 0 8px 8px">
    <p>Dear <strong>${name}</strong>,</p>
    <p>Congratulations! Your alumni registration has been <strong>approved</strong>.</p>
    <p>Click the button below to set up your password and access the alumni portal:</p>
    <div style="text-align:center;margin:32px 0">
      <a href="${setupUrl}" style="background:#1e3a5f;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-size:16px;display:inline-block">Set Up My Account</a>
    </div>
    <p style="color:#666;font-size:13px">Or copy this link: <a href="${setupUrl}" style="color:#1e3a5f">${setupUrl}</a></p>
    <p style="color:#666;font-size:13px"><strong>This link expires in 72 hours.</strong></p>
    <p style="color:#999;font-size:12px">If you did not register with UITS Alumni Association, please ignore this email.</p>
    <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0">
    <p style="color:#999;font-size:12px;text-align:center">UITS Alumni Association &middot; Baridhara, Dhaka</p>
  </div>
</body></html>`;
}

function resetEmailHtml(name, resetUrl) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#1e3a5f;padding:24px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:20px">UITS Alumni Association</h1>
  </div>
  <div style="background:#fff;border:1px solid #e0e0e0;border-top:none;padding:32px;border-radius:0 0 8px 8px">
    <p>Dear <strong>${name}</strong>,</p>
    <p>We received a request to reset your alumni portal password.</p>
    <div style="text-align:center;margin:32px 0">
      <a href="${resetUrl}" style="background:#1e3a5f;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-size:16px;display:inline-block">Reset Password</a>
    </div>
    <p style="color:#666;font-size:13px">Or copy this link: <a href="${resetUrl}" style="color:#1e3a5f">${resetUrl}</a></p>
    <p style="color:#666;font-size:13px"><strong>This link expires in 24 hours.</strong></p>
    <p style="color:#999;font-size:12px">If you did not request this, please ignore this email.</p>
    <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0">
    <p style="color:#999;font-size:12px;text-align:center">UITS Alumni Association &middot; Baridhara, Dhaka</p>
  </div>
</body></html>`;
}

function contactEmailHtml({ name, email, subject, message }) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#1e3a5f;padding:24px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:20px">UITS Alumni — New Contact Message</h1>
  </div>
  <div style="background:#fff;border:1px solid #e0e0e0;border-top:none;padding:32px;border-radius:0 0 8px 8px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 0;color:#666;width:90px">From</td><td style="padding:8px 0"><strong>${name}</strong> &lt;${email}&gt;</td></tr>
      <tr><td style="padding:8px 0;color:#666">Subject</td><td style="padding:8px 0"><strong>${subject}</strong></td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #e0e0e0;margin:18px 0">
    <p style="white-space:pre-wrap;font-size:15px">${message}</p>
    <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0">
    <p style="color:#999;font-size:12px;text-align:center">UITS Alumni Association &middot; Baridhara, Dhaka</p>
  </div>
</body></html>`;
}

module.exports = { sendEmail, setupEmailHtml, resetEmailHtml, contactEmailHtml };
