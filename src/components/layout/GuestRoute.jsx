import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../app/hooks.js";
import {
  selectIsAuthed,
  selectIsNewUser,
} from "../../features/auth/authSlice.js";

export const GuestRoute = () => {
  const isAuthed = useAppSelector(selectIsAuthed);
  const isNewUser = useAppSelector(selectIsNewUser);

  if (!isAuthed) return <Outlet />;

  return <Navigate to={isNewUser ? "/onboarding" : "/feed"} replace />;
};
