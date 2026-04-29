import { cn } from "../../utils/cn";
import { useState } from "react";
import {
  avatarColour,
  initials,
  relativeTime,
} from "../../constants/helperFunction";
import { INTENT_COLOURS, INTENT_LABELS } from "../../constants";

export const MatchCard = ({ match, onOpenChat, onUnmatch }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const other = match.otherUser;
  const name = other?.profile?.displayName ?? "Unknown";
  const col = avatarColour(name);
  const ini = initials(name);
  const ts = relativeTime(match.lastMessageAt ?? match.createdAt);
  const intentLabel = INTENT_LABELS[match.intent] ?? match.intent;
  const intentColour =
    INTENT_COLOURS[match.intent] ?? "bg-cream-200 text-ink-muted";

  return (
    <div
      className="card group relative flex cursor-pointer items-center gap-4 p-4 transition-all duration-200 hover:shadow-lift"
      onClick={() => onOpenChat(match._id)}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
          "text-sm font-bold",
          col,
        )}
      >
        {other?.profile?.avatarUrl ? (
          <img
            src={other.profile.avatarUrl}
            alt={name}
            className="h-full w-full rounded-2xl object-cover"
          />
        ) : (
          ini
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              intentColour,
            )}
          >
            {intentLabel}
          </span>
        </div>

        <p className="truncate text-xs text-ink-muted">
          {match.lastMessageAt
            ? "Tap to continue conversation"
            : "Start a conversation…"}
        </p>
      </div>

      {/* Timestamp + menu */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <p className="text-[11px] text-ink-faint">{ts}</p>

        {/* Kebab menu — stops propagation so it doesn't open chat */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-ink-faint opacity-0 transition-colors group-hover:opacity-100 hover:bg-cream-100 hover:text-ink-muted"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div
                className="card absolute top-full right-0 z-20 mt-1 w-36 animate-fade-in py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onUnmatch(match);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-red-500 transition-colors hover:bg-red-50"
                >
                  Unmatch
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
