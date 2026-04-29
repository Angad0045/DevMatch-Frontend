import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks.js";
import {
  setMatches,
  selectMatches,
} from "../../features/matches/matchSlice.js";
import { ChatPanel } from "./ChatPanel.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import { ConversationItem } from "./ConversationItem.jsx";
import { matchService } from "../../services/matchService.js";
import { selectCurrentUser } from "../../features/auth/authSlice.js";

// Empty State
function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cream-200 bg-cream-100">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="text-ink-faint"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-bold text-ink">Select a conversation</h3>
      <p className="max-w-xs text-xs leading-relaxed text-ink-muted">
        Pick a developer from your inbox to start collaborating on your next big
        thing.
      </p>
    </div>
  );
}

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { matchId } = useParams();
  const currentUser = useAppSelector(selectCurrentUser);
  const matches = useAppSelector(selectMatches);

  const [search, setSearch] = useState("");
  const [matchesLoading, setMatchesLoading] = useState(true);

  // Load all matches for the sidebar
  useEffect(() => {
    const load = async () => {
      setMatchesLoading(true);
      try {
        const { data } = await matchService.getMatches();
        dispatch(setMatches(data.data.matches));
      } catch (err) {
        console.error("Failed to load matches:", err.response?.data?.message);
      } finally {
        setMatchesLoading(false);
      }
    };
    if (!matches.length) load();
    else setMatchesLoading(false);
  }, [dispatch, matches.length]);

  // Active match from URL param
  const activeMatch = matches.find((m) => m._id === matchId) ?? null;

  // Filtered sidebar list
  const filtered = matches.filter((m) =>
    m.otherUser?.profile?.displayName
      ?.toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <Navbar />
      {/* Two-panel layout */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-5 overflow-hidden px-5 py-6">
        {/* Left sidebar */}
        <div className="flex w-85 shrink-0 flex-col overflow-hidden rounded-3xl border border-cream-200 bg-cream-50">
          {/* Sidebar header */}
          <div className="shrink-0 px-5 pt-6 pb-4">
            <h2 className="mb-4 text-2xl font-bold text-ink">Messages</h2>
            {/* Search */}
            <div className="relative">
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Name…"
                className="h-10 w-full rounded-xl border border-cream-200 bg-white pr-4 pl-9 text-sm text-ink transition-all placeholder:text-ink-faint focus:border-ink/20 focus:ring-2 focus:ring-ink/10 focus:outline-none"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
            {matchesLoading ? (
              // Skeleton
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex animate-pulse items-center gap-3 px-4 py-3.5"
                >
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-cream-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/5 rounded-full bg-cream-200" />
                    <div className="h-2.5 w-3/5 rounded-full bg-cream-200" />
                    <div className="h-4 w-1/4 rounded bg-cream-200" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-ink-muted">
                  {search ? `No results for "${search}"` : "No matches yet"}
                </p>
              </div>
            ) : (
              filtered.map((match) => (
                <ConversationItem
                  key={match._id}
                  match={match}
                  isActive={match._id === matchId}
                  onlineUsers={[]}
                  onClick={() => navigate(`/matches/${match._id}/chat`)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-cream-200 bg-white">
          {activeMatch ? (
            <ChatPanel match={activeMatch} currentUser={currentUser} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
