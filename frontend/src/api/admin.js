import { api } from "./client";

const A = "/admin";

export const adminApi = {
  // Dashboard
  dashboard: () => api.get(`${A}/dashboard`),

  // Alumni
  listAlumni: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "")).toString();
    return api.get(`${A}/alumni${qs ? "?" + qs : ""}`);
  },
  getAlumni: (id) => api.get(`${A}/alumni/${id}`),
  createAlumni: (fd) => fetch(`/api${A}/alumni`, { method: "POST", body: fd, credentials: "include" }).then(parseJson),
  updateAlumni: (id, fd) => fetch(`/api${A}/alumni/${id}`, { method: "PUT", body: fd, credentials: "include" }).then(parseJson),
  deleteAlumni: (id) => api.delete(`${A}/alumni/${id}`),
  patchStatus: (id, status) => api.patch(`${A}/alumni/${id}/status`, { status }),
  resendSetup: (id) => api.post(`${A}/alumni/${id}/resend-setup`),

  // Notices
  listNotices: () => api.get(`${A}/notices`),
  createNotice: (data) => api.post(`${A}/notices`, data),
  updateNotice: (id, data) => api.put(`${A}/notices/${id}`, data),
  deleteNotice: (id) => api.delete(`${A}/notices/${id}`),

  // Gallery
  listGallery: () => api.get(`${A}/gallery`),
  createGalleryItem: (fd) => fetch(`/api${A}/gallery`, { method: "POST", body: fd, credentials: "include" }).then(parseJson),
  deleteGalleryItem: (id) => api.delete(`${A}/gallery/${id}`),

  // Users
  listUsers: () => api.get(`${A}/users`),
  createUser: (data) => api.post(`${A}/users`, data),
  updateUser: (id, data) => api.put(`${A}/users/${id}`, data),
  deleteUser: (id) => api.delete(`${A}/users/${id}`),

  // Settings
  getSettings: () => api.get(`${A}/settings`),
  updateSettings: (data) => api.patch(`${A}/settings`, data),

  // Content
  getContent: () => api.get(`${A}/content`),
  updateContent: (fd) => fetch(`/api${A}/content`, { method: "PUT", body: fd, credentials: "include" }).then(parseJson),
};

async function parseJson(res) {
  const json = await res.json().catch(() => ({ success: false, message: "Invalid response" }));
  if (!res.ok) { const e = new Error(json.message || "Request failed"); e.status = res.status; e.data = json.data; throw e; }
  return json;
}
