import { createSlice } from "@reduxjs/toolkit";

const matchSlice = createSlice({
  name: "matches",
  initialState: { list: [], isLoading: false, error: null },
  reducers: {
    setMatches: (state, action) => {
      state.list = action.payload;
    },
    removeMatch: (state, action) => {
      state.list = state.list.filter((m) => m._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setMatches, removeMatch, setLoading, setError } =
  matchSlice.actions;
export const selectMatches = (state) => state.matches.list;
export const selectMatchesLoading = (state) => state.matches.isLoading;
export default matchSlice.reducer;
