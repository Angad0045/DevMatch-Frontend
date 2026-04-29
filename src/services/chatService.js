import api from "./api.js";

export const chatService = {
  getMessages: (matchId, params) =>
    api.get(`/chat/${matchId}/messages`, { params }),
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),
};
