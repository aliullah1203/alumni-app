const ok = (res, data = null, message = "OK", meta = undefined, status = 200) =>
  res.status(status).json({ success: true, data, message, ...(meta && { meta }) });

const fail = (res, message = "Error", status = 400, data = null) =>
  res.status(status).json({ success: false, data, message });

module.exports = { ok, fail };
