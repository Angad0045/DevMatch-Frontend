import {
  avatarColour,
  initials,
  relativeTime,
} from "../../constants/helperFunction";
import { cn } from "../../utils/cn";

export const ConversationItem = ({ match, isActive, onClick, onlineUsers }) => {
  const other = match.otherUser;
  const name = other?.profile?.displayName ?? "Unknown";
  const col = avatarColour(name);
  const ini = initials(name);
  const skills = (other?.profile?.skills ?? []).slice(0, 2);
  const ts = relativeTime(match.lastMessageAt ?? match.createdAt);
  const isOnline = onlineUsers.includes(other?._id);
  const unread = match._unread ?? 0;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl px-4 py-3.5 text-left transition-all duration-150",
        "flex items-start gap-3",
        isActive
          ? "border border-violet-text/20 bg-violet-badge"
          : "hover:bg-cream-200/50",
      )}
    >
      {/* Avatar with online dot */}
      <div className="relative mt-0.5 shrink-0">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold",
            col,
          )}
        >
          {other?.profile?.avatarUrl ? (
            <img
              src={other.profile.avatarUrl}
              alt={name}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            ini
          )}
        </div>
        {/* Online indicator */}
        <span
          className={cn(
            "absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-cream-50",
            isOnline ? "bg-green-400" : "bg-cream-300",
          )}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center justify-between">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <div className="ml-2 flex shrink-0 items-center gap-1.5">
            <span className="text-[11px] text-ink-faint">{ts}</span>
            {unread > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-text text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </div>
        </div>

        <p className="mb-2 truncate text-xs text-ink-muted">
          {match._lastPreview ?? "Start a Conversation…"}
        </p>

        {/* Skill tags */}
        {skills.length > 0 && (
          <div className="flex gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-sm bg-cream-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-ink-muted uppercase"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
};
