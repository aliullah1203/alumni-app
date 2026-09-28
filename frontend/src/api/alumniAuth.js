import { api } from "./client";

export const alumniAuthApi = {
  validateSetupToken: (token) => api.get(`/alumni-auth/setup?token=${encodeURIComponent(token)}`),
  completeSetup:      (body)  => api.post("/alumni-auth/setup", body),
  login:              (email, password) => api.post("/alumni-auth/login", { email, password }),
  logout:             ()      => api.post("/alumni-auth/logout"),
  me:                 ()      => api.get("/alumni-auth/me"),
  forgotPassword:     (email) => api.post("/alumni-auth/forgot-password", { email }),
  validateResetToken: (token) => api.get(`/alumni-auth/reset?token=${encodeURIComponent(token)}`),
  resetPassword:      (body)  => api.post("/alumni-auth/reset-password", body),
  updateProfile:      (body)  => api.putForm("/alumni-auth/profile", body),
  updateEducation:    (body)  => api.put("/alumni-auth/education", body),
  updateExperience:   (body)  => api.put("/alumni-auth/experience", body),
  changePassword:     (body)  => api.put("/alumni-auth/password", body),
  listGallery:        ()      => api.get("/alumni-auth/gallery"),
  uploadGallery:      (fd)    => api.postForm("/alumni-auth/gallery", fd),
  deleteGallery:      (id)    => api.delete(`/alumni-auth/gallery/${id}`),
};
