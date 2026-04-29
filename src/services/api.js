import axios from "axios";
import { store } from "../app/store.js";
import { setCredentials, logout } from "../features/auth/authSlice.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// ── Request interceptor ──────────────────────────────────────────
// Attaches the current accessToken to every outgoing request.
// Reads from Redux store — always uses the latest token.
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ─────────────────────────────────────────
// On 401, attempts a silent token refresh using the httpOnly cookie.
// If refresh succeeds → retry the original request with new token.
// If refresh fails → dispatch logout and redirect to /login.

let isRefreshing = false;

// Queue of requests that arrived while a refresh was in progress.
// They wait for the new token, then all retry at once.
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response, // pass successful responses straight through

  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401s. Avoid infinite retry loops with _retry flag.
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the failing request IS the refresh endpoint
    if (originalRequest.url?.includes("/auth/refresh")) {
      store.dispatch(logout());
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // The httpOnly cookie is sent automatically with withCredentials: true
      const { data } = await api.post("/auth/refresh");
      const newAccessToken = data.data.accessToken;

      // Save the new token into Redux
      store.dispatch(setCredentials({ accessToken: newAccessToken }));

      // Update the original request's header
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Unblock all queued requests
      processQueue(null, newAccessToken);

      return api(originalRequest); // retry original request
    } catch (refreshError) {
      processQueue(refreshError, null);
      store.dispatch(logout());
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
