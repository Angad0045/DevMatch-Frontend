import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks.js";
import {
  selectCurrentUser,
  selectAccessToken,
  setCredentials,
  logout,
} from "./features/auth/authSlice.js";
import { authService } from "./services/authService.js";
import { ProtectedRoute } from "./components/layout/ProtectedRoute.jsx";
import { GuestRoute } from "./components/layout/GuestRoute.jsx";

import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import OnboardingPage from "./pages/onboarding/OnboardingPage.jsx";
import FeedPage from "./pages/feed/FeedPage.jsx";
import MatchesPage from "./pages/matches/MatchesPage.jsx";
import ChatPage from "./pages/chat/ChatPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";

export default function App() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const accessToken = useAppSelector(selectAccessToken);

  // true while we're checking session validity on mount
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      // Case 1: No user in localStorage → nothing to restore, go straight to routes
      if (!user) {
        setBootstrapping(false);
        return;
      }

      // Case 2: User exists + access token in Redux → fresh load (e.g. HMR), skip refresh
      if (accessToken) {
        setBootstrapping(false);
        return;
      }

      // Case 3: User in localStorage but no access token → page was refreshed.
      // Attempt silent refresh using the httpOnly cookie.
      try {
        const { data } = await authService.refresh();
        dispatch(setCredentials({ accessToken: data.data.accessToken }));
      } catch {
        // Cookie expired or invalid → clear everything, send to login
        dispatch(logout());
      } finally {
        setBootstrapping(false);
      }
    };

    bootstrap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Empty deps: run once on mount only. We intentionally don't re-run
  // when user/accessToken change — that would create an infinite loop.

  // Blank screen while restoring session — prevents a flash of /login
  // before the refresh resolves. Keep this minimal (no spinner) to
  // avoid layout shift.
  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/matches/:matchId/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
