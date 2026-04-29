import api from "./api.js";

export const feedService = {
  // params: { intent, skills, experienceLevel, page, limit }
  getFeed: (params) => api.get("/feed", { params }),
};
