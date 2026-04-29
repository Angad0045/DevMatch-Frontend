import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks.js";
import {
  setMatches,
  removeMatch,
  setLoading,
  selectMatches,
  selectMatchesLoading,
} from "../../features/matches/matchSlice.js";
import { MatchCard } from "./MatchCard.jsx";
import { EmptyState } from "./EmptyState.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import { matchService } from "../../services/matchService.js";

// Unmatch
function UnmatchModal({ match, onConfirm, onCancel, loading }) {
  const name = match?.otherUser?.profile?.displayName ?? "this person";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="card w-full max-w-sm animate-slide-up p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 text-base font-bold text-ink">
          Unmatch with {name}?
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-ink-muted">
          Your conversation will be removed and they won't appear in your
          matches again.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="h-10 flex-1 rounded-xl border border-cream-200 text-sm font-medium text-ink-muted transition-all hover:border-cream-300 hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50"
          >
            {loading && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            Unmatch
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const matches = useAppSelector(selectMatches);
  const isLoading = useAppSelector(selectMatchesLoading);

  const [unmatchTarget, setUnmatchTarget] = useState(null);
  const [unmatchLoading, setUnmatchLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      dispatch(setLoading(true));
      try {
        const { data } = await matchService.getMatches();
        dispatch(setMatches(data.data.matches));
      } catch (err) {
        console.error("Failed to load matches:", err.response?.data?.message);
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchMatches();
  }, [dispatch]);

  const handleUnmatch = async () => {
    if (!unmatchTarget) return;
    setUnmatchLoading(true);
    try {
      await matchService.unmatch(unmatchTarget._id);
      dispatch(removeMatch(unmatchTarget._id));
      setUnmatchTarget(null);
    } catch (err) {
      console.error("Unmatch failed:", err.response?.data?.message);
    } finally {
      setUnmatchLoading(false);
    }
  };

  const filtered = matches.filter((m) =>
    m.otherUser?.profile?.displayName
      ?.toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <Navbar />
      {unmatchTarget && (
        <UnmatchModal
          match={unmatchTarget}
          onConfirm={handleUnmatch}
          onCancel={() => setUnmatchTarget(null)}
          loading={unmatchLoading}
        />
      )}

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        {/* Page heading */}
        <div className="mb-7">
          <h1 className="mb-1 text-2xl font-bold text-ink">Your Matches</h1>
          <p className="text-sm text-ink-muted">
            {matches.length > 0
              ? `${matches.length} developer${matches.length !== 1 ? "s" : ""} waiting to connect`
              : "Connections you ve made through DevMatch"}
          </p>
        </div>

        {/* Search */}
        {matches.length > 3 && (
          <div className="relative mb-5">
            <svg
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-faint"
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search matches…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-cream-200 bg-white pr-4 pl-9 text-sm text-ink transition-all placeholder:text-ink-faint focus:border-ink/20 focus:ring-2 focus:ring-ink/10 focus:outline-none"
            />
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="card flex animate-pulse items-center gap-4 p-4"
              >
                <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-cream-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded-full bg-cream-200" />
                  <div className="h-2.5 w-1/2 rounded-full bg-cream-200" />
                </div>
                <div className="h-2.5 w-12 rounded-full bg-cream-200" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          search ? (
            <div className="py-16 text-center">
              <p className="text-sm text-ink-muted">
                No matches found for "{search}"
              </p>
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          <div className="space-y-3">
            {filtered.map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                onOpenChat={(id) => navigate(`/matches/${id}/chat`)}
                onUnmatch={(m) => setUnmatchTarget(m)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
