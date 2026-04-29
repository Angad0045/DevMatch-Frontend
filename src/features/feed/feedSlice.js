import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
  name: "feed",
  initialState: {
    users: [],
    pagination: null,
    isLoading: false,
    error: null,
    filters: {
      intent: null,
      skills: null,
      experienceLevel: null,
    },
  },
  reducers: {
    setFeed: (state, action) => {
      state.users = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    removeTopCard: (state) => {
      state.users.shift();
    }, // pop after swipe
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setFeed,
  setPagination,
  removeTopCard,
  setFilters,
  setLoading,
  setError,
} = feedSlice.actions;

export const selectFeedUsers = (state) => state.feed.users;
export const selectFeedLoading = (state) => state.feed.isLoading;
export const selectFeedFilters = (state) => state.feed.filters;

export default feedSlice.reducer;
