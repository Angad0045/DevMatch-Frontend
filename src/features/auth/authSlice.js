// src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const storedUser = JSON.parse(localStorage.getItem("devmatch_user") || "null");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser || null,
    accessToken: null,
    isNewUser: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      if (user) {
        state.user = user;
        localStorage.setItem("devmatch_user", JSON.stringify(user));
      }
      if (accessToken) {
        state.accessToken = accessToken;
      }
    },

    setNewUser: (state, action) => {
      state.isNewUser = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isNewUser = false;
      state.error = null;
      localStorage.removeItem("devmatch_user");
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  setNewUser,
  logout,
  setLoading,
  setError,
  clearError,
} = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthed = (state) => !!state.auth.user;
export const selectIsNewUser = (state) => state.auth.isNewUser; // ← NEW

export default authSlice.reducer;
