import { api } from "./client";

export const alumniApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    return api.get(`/alumni${qs ? "?" + qs : ""}`);
  },
  get: (registrationNo) => api.get(`/alumni/${registrationNo}`),
  pdfUrl: (registrationNo) => `/api/alumni/${registrationNo}/pdf`,
  verify: (verifyToken) => api.get(`/verify/${verifyToken}`),
  register: (formData) => {
    return fetch("/api/alumni/register", {
      method: "POST",
      body: formData,
      credentials: "include",
    }).then(async (res) => {
      const json = await res.json().catch(() => ({ success: false, message: "Invalid response" }));
      if (!res.ok) { const e = new Error(json.message || "Request failed"); e.status = res.status; e.data = json.data; throw e; }
      return json;
    });
  },
};
