import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import feedReducer from "../features/feed/feedSlice.js";
import matchReducer from "../features/matches/matchSlice.js";
import chatReducer from "../features/chat/chatSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
    matches: matchReducer,
    chat: chatReducer,
  },
});
