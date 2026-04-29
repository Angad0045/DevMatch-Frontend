import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    isLoading: false,
    typingUsers: [], // { userId, displayName }
    onlineUsers: [],
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    appendMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    removeMessage: (state, action) => {
      state.messages = state.messages.filter((m) => m._id !== action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setTyping: (state, action) => {
      const exists = state.typingUsers.find(
        (u) => u.userId === action.payload.userId,
      );
      if (!exists) state.typingUsers.push(action.payload);
    },
    clearTyping: (state, action) => {
      state.typingUsers = state.typingUsers.filter(
        (u) => u.userId !== action.payload,
      );
    },
    userOnline: (state, action) => {
      if (!state.onlineUsers.includes(action.payload))
        state.onlineUsers.push(action.payload);
    },
    userOffline: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(
        (id) => id !== action.payload,
      );
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setMessages,
  appendMessage,
  removeMessage,
  clearMessages,
  setTyping,
  clearTyping,
  userOnline,
  userOffline,
  setLoading,
} = chatSlice.actions;

export const selectMessages = (state) => state.chat.messages;
export const selectTypingUsers = (state) => state.chat.typingUsers;
export const selectOnlineUsers = (state) => state.chat.onlineUsers;
export default chatSlice.reducer;
