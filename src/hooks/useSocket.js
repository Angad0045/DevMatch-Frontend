import { io } from "socket.io-client";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks.js";
import { selectAccessToken } from "../features/auth/authSlice.js";
import {
  appendMessage,
  setTyping,
  clearTyping,
  userOnline,
  userOffline,
} from "../features/chat/chatSlice.js";

let socketInstance = null;

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);

  const ref = useRef(null);

  useEffect(() => {
    if (!accessToken || !import.meta.env.VITE_SOCKET_URL) return;

    // Reuse existing connection if already open
    if (socketInstance?.connected) {
      ref.current = socketInstance;
      return;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: accessToken },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("message:new", (message) => {
      dispatch(appendMessage(message));
    });

    socket.on("typing:start", ({ userId, displayName }) => {
      dispatch(setTyping({ userId, displayName }));
    });

    socket.on("typing:stop", ({ userId }) => {
      dispatch(clearTyping(userId));
    });

    socket.on("user:online", ({ userId }) => dispatch(userOnline(userId)));
    socket.on("user:offline", ({ userId }) => dispatch(userOffline(userId)));

    socket.on("error", ({ message }) => {
      console.error("Socket error from server:", message);
    });

    socketInstance = socket;
    ref.current = socket;

    return () => {};
  }, [accessToken, dispatch]);
  return ref.current;
};
