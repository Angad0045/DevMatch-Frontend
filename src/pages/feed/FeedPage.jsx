import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks.js";
import {
  setFeed,
  setPagination,
  removeTopCard,
  setFilters,
  setLoading,
  setError,
  selectFeedUsers,
  selectFeedLoading,
  selectFeedFilters,
} from "../../features/feed/feedSlice.js";
import { cn } from "../../utils/cn.js";
import SwipeCard from "./SwipeCard.jsx";
import { SidePanel } from "./SidePanel.jsx";
import { MatchToast } from "./MatchToast.jsx";
import { EmptyState } from "./EmptyState.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import { INTENT_LABELS } from "../../constants/index.js";
import { feedService } from "../../services/feedService.js";
import { swipeService } from "../../services/swipeService.js";

const INTENT_OPTIONS = [
  { value: "", label: "All" },
  { value: "mentorship", label: "Mentorship" },
  { value: "collaboration", label: "Collaboration" },
  { value: "opensource", label: "Open Source" },
  { value: "learning", label: "Knowledge Share" },
];

export default function FeedPage() {
  const dispatch = useAppDispatch();
  const feedUsers = useAppSelector(selectFeedUsers);
  const isLoading = useAppSelector(selectFeedLoading);
  const filters = useAppSelector(selectFeedFilters);

  const [matchToast, setMatchToast] = useState(null);
  const [activeIntent, setActiveIntent] = useState("");

  // Fetch feed from API
  const fetchFeed = useCallback(
    async (overrideFilters = {}) => {
      dispatch(setLoading(true));
      try {
        const params = {
          ...filters,
          ...overrideFilters,
          limit: 10,
          page: 1,
        };
        // Remove empty values so they don't pollute the query string
        Object.keys(params).forEach((k) => {
          if (!params[k]) delete params[k];
        });
        const { data } = await feedService.getFeed(params);
        dispatch(setFeed(data.data.users));
        dispatch(setPagination(data.data.pagination));
      } catch (err) {
        dispatch(
          setError(err.response?.data?.message ?? "Failed to load feed"),
        );
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, filters],
  );

  useEffect(() => {
    fetchFeed();
  }, []);

  // Filter tab change
  const handleIntentFilter = (intent) => {
    setActiveIntent(intent);
    dispatch(setFilters({ intent: intent || null }));
    fetchFeed({ intent: intent || null });
  };

  // Swipe handlers

  const handleLike = async (user) => {
    dispatch(removeTopCard());
    try {
      const { data } = await swipeService.swipe({
        swipedId: user._id,
        direction: "like",
        intent: user.intent?.[0] ?? "collaboration",
      });
      if (data.data.match) {
        setMatchToast(user);
      }
    } catch (err) {
      console.error("Swipe error:", err.response?.data?.message);
    }
  };

  const handlePass = async (user) => {
    dispatch(removeTopCard());
    try {
      await swipeService.swipe({
        swipedId: user._id,
        direction: "pass",
        intent: user.intent?.[0] ?? "collaboration",
      });
    } catch (err) {
      console.error("Swipe error:", err.response?.data?.message);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (!feedUsers.length) return;
      if (e.key === "ArrowRight") handleLike(feedUsers[0]);
      if (e.key === "ArrowLeft") handlePass(feedUsers[0]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [feedUsers]);

  const topUser = feedUsers[0] ?? null;
  const nextUser = feedUsers[1] ?? null;

  // Render

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <Navbar />

      {/* Match toast */}
      {matchToast && (
        <MatchToast user={matchToast} onClose={() => setMatchToast(null)} />
      )}

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        {/* Intent filter tabs */}
        <div className="scrollbar-none mb-8 flex items-center gap-2 overflow-x-auto pb-1">
          {INTENT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleIntentFilter(value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap",
                "shrink-0 border transition-all duration-150",
                activeIntent === value
                  ? "border-ink bg-ink text-cream-50"
                  : "border-cream-200 bg-white text-ink-muted hover:border-cream-300 hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Main two-column layout */}
        <div className="flex h-full w-full flex-col items-center">
          <div className="grid w-full grid-cols-1 items-start gap-6 lg:max-w-4xl lg:grid-cols-[1fr_380px]">
            {/* Left — swipe card stack */}
            <div className="flex flex-col gap-5">
              {/* Card stack container */}
              <div
                className="relative w-full"
                style={{ paddingBottom: "120%", maxHeight: "640px" }}
              >
                <div className="absolute inset-0">
                  {isLoading && (
                    <div className="absolute inset-0 animate-pulse rounded-3xl bg-cream-200" />
                  )}

                  {!isLoading && feedUsers.length === 0 && (
                    <div className="absolute inset-0 rounded-3xl border border-cream-200 bg-white shadow-card">
                      <EmptyState onReset={() => handleIntentFilter("")} />
                    </div>
                  )}

                  {/* Background card (next user) — slightly scaled down */}
                  {!isLoading && nextUser && (
                    <div className="absolute inset-0 translate-y-3 scale-[0.96] overflow-hidden rounded-3xl border border-cream-200 bg-white opacity-60" />
                  )}

                  {/* Top card — the one being swiped */}
                  {!isLoading && topUser && (
                    <SwipeCard
                      key={topUser._id}
                      user={topUser}
                      onLike={handleLike}
                      onPass={handlePass}
                      isTop
                    />
                  )}
                </div>
              </div>

              {/* Action buttons + bio below the card */}
              {topUser && !isLoading && (
                <div className="card p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-base leading-none font-bold text-ink">
                        {topUser.profile?.displayName}
                      </h3>
                      <p className="text-xs text-ink-muted capitalize">
                        {topUser.profile?.experienceLevel ?? ""} developer
                      </p>
                    </div>
                  </div>

                  {topUser.profile?.bio && (
                    <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                      {topUser.profile.bio}
                    </p>
                  )}

                  <div className="flex gap-3">
                    {/* Pass button */}
                    <button
                      onClick={() => handlePass(topUser)}
                      className="h-12 flex-1 rounded-2xl border-2 border-cream-200 bg-white text-sm font-semibold text-ink transition-all duration-150 hover:border-red-200 hover:bg-red-50 hover:text-red-500 active:scale-[0.97]"
                    >
                      Pass
                    </button>

                    {/* Connect button */}
                    <button
                      onClick={() => handleLike(topUser)}
                      className="h-12 flex-2 rounded-2xl bg-ink text-sm font-semibold text-cream-50 transition-all duration-150 hover:bg-ink/90 active:scale-[0.97]"
                    >
                      Connect with {topUser.profile?.displayName?.split(" ")[0]}
                    </button>
                  </div>
                </div>
              )}

              {/* Next in queue hint */}
              {nextUser && !isLoading && (
                <p className="text-center text-xs text-ink-muted">
                  Next in your queue:{" "}
                  <span className="font-semibold text-ink">
                    {nextUser.profile?.displayName}
                  </span>
                  {feedUsers.length > 2 && (
                    <span>
                      {" "}
                      and {feedUsers.length - 2} other
                      {feedUsers.length - 2 !== 1 ? "s" : ""}
                    </span>
                  )}
                </p>
              )}

              {/* Keyboard hint */}
              <p className="hidden text-center text-xs text-ink/20 lg:block">
                ← Pass · Connect →
              </p>
            </div>

            {/* Right */}
            <div className="hidden lg:block">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="card h-40 animate-pulse bg-cream-200/50 p-5" />
                  <div className="card h-36 animate-pulse bg-cream-200/50 p-5" />
                </div>
              ) : (
                <SidePanel user={topUser} />
              )}
            </div>
          </div>

          {/* Disclaimer */}
          {topUser && !isLoading && (
            <p className="mt-8 text-center text-xs leading-relaxed text-ink/30">
              By clicking "Connect" you're initiating a request for{" "}
              <strong className="font-semibold text-ink/40">
                {INTENT_LABELS[topUser.intent?.[0]] ?? "Collaboration"}
              </strong>
              . Subject to our{" "}
              <a
                href="#"
                className="underline underline-offset-2 transition-colors hover:text-ink/50"
              >
                Terms of Collaboration
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="underline underline-offset-2 transition-colors hover:text-ink/50"
              >
                Privacy Policy
              </a>
              .
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
