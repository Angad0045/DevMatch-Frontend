import api from "./api.js";

export const userService = {
  getMe: () => api.get("/users/me"),
  updateMe: (data) => api.patch("/users/me", data),
  deleteMe: () => api.delete("/users/me"),
  getProfile: (userId) => api.get(`/users/${userId}`),
};
