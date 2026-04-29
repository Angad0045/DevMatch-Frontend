// src/components/layout/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../app/hooks.js";
import { selectIsAuthed } from "../../features/auth/authSlice.js";

// Wraps any route that requires authentication.
// If user is not logged in, redirect to /login.
// <Outlet /> renders the child route if authed.
export const ProtectedRoute = () => {
  const isAuthed = useAppSelector(selectIsAuthed);
  return isAuthed ? <Outlet /> : <Navigate to="/login" replace />;
};
