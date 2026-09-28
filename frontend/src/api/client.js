const BASE = "/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const json = await res.json().catch(() => ({ success: false, message: "Invalid response" }));
  if (!res.ok) {
    const err = new Error(json.message || "Request failed");
    err.status = res.status;
    err.data = json.data;
    throw err;
  }
  return json;
}

export const api = {
  get: (path, opts) => apiFetch(path, { method: "GET", ...opts }),
  post: (path, body, opts) => apiFetch(path, { method: "POST", body: JSON.stringify(body), ...opts }),
  put: (path, body, opts) => apiFetch(path, { method: "PUT", body: JSON.stringify(body), ...opts }),
  patch: (path, body, opts) => apiFetch(path, { method: "PATCH", body: JSON.stringify(body), ...opts }),
  delete: (path, opts) => apiFetch(path, { method: "DELETE", ...opts }),
  // multipart (no Content-Type — browser sets boundary automatically)
  postForm: (path, formData, opts) =>
    fetch(`${BASE}${path}`, { method: "POST", body: formData, credentials: "include", ...opts })
      .then(async (res) => {
        const json = await res.json().catch(() => ({ success: false, message: "Invalid response" }));
        if (!res.ok) { const e = new Error(json.message || "Request failed"); e.status = res.status; e.data = json.data; throw e; }
        return json;
      }),
  putForm: (path, formData, opts) =>
    fetch(`${BASE}${path}`, { method: "PUT", body: formData, credentials: "include", ...opts })
      .then(async (res) => {
        const json = await res.json().catch(() => ({ success: false, message: "Invalid response" }));
        if (!res.ok) { const e = new Error(json.message || "Request failed"); e.status = res.status; e.data = json.data; throw e; }
        return json;
      }),
};
