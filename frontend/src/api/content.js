import { api } from "./client";

export const contentApi = {
  get: () => api.get("/content"),
  getStats: () => api.get("/stats"),
  getNotices: (limit = 5) => api.get(`/notices?limit=${limit}`),
  getGallery: () => api.get("/gallery"),
  getFilters: () => api.get("/meta/filters"),
  sendContact: (data) => api.post("/contact", data),
};
