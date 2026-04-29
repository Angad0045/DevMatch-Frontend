import api from "./api.js";

export const matchService = {
  getMatches: () => api.get("/matches"),
  getMatch: (matchId) => api.get(`/matches/${matchId}`),
  unmatch: (matchId) => api.delete(`/matches/${matchId}`),
};
