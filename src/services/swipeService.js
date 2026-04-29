import api from "./api.js";

export const swipeService = {
  // data: { swipedId, direction, intent }
  swipe: (data) => api.post("/swipes", data),
  getSwipes: (params) => api.get("/swipes", { params }),
};
