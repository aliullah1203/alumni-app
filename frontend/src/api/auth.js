import { api } from "./client";

export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout", {}),
  me: () => api.get("/auth/me"),
  updateProfile: (body) => api.put("/auth/profile", body),
  changePassword: (currentPassword, newPassword) =>
    api.post("/auth/change-password", { currentPassword, newPassword }),
};
