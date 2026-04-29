import { useState } from "react";
import { cn } from "../../utils/cn";
import {
  avatarColour,
  formatMessageTime,
  initials,
} from "../../constants/helperFunction";

export const MessageBubble = ({
  message,
  isMine,
  showAvatar,
  otherUser,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const name = otherUser?.profile?.displayName ?? "";
  const col = avatarColour(name);
  const ini = initials(name);
  return (
    <div
      className={cn(
        "group flex items-end gap-2",
        isMine ? "flex-row-reverse" : "flex-row",
      )}
    >
      {!isMine && (
        <div
          className={cn(
            "mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
            showAvatar ? col : "opacity-0",
          )}
        >
          {otherUser?.profile?.avatarUrl ? (
            <img
              src={otherUser.profile.avatarUrl}
              alt={name}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            ini
          )}
        </div>
      )}

      <div
        className={cn(
          "relative max-w-[72%]",
          isMine && "flex flex-col items-end",
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            "px-4 py-2.5 text-sm leading-relaxed",
            isMine
              ? "rounded-2xl rounded-br-sm bg-ink text-cream-50"
              : "rounded-2xl rounded-bl-sm border border-cream-200 bg-white text-ink shadow-sm",
          )}
        >
          {message.text}
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            "mt-1 flex items-center gap-2",
            isMine ? "flex-row-reverse" : "flex-row",
          )}
        >
          <span className="text-[10px] text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">
            {formatMessageTime(message.createdAt)}
          </span>

          {/* Delete */}
          {isMine && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 hover:text-ink-muted"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <circle cx="8" cy="3" r="1.5" />
                  <circle cx="8" cy="8" r="1.5" />
                  <circle cx="8" cy="13" r="1.5" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="card absolute -right-8.5 -bottom-4 z-20 mb-1 animate-fade-in py-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(message._id);
                      }}
                      className="w-full px-4 py-1 text-left text-xs text-red-500 transition-all duration-200 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {isMine && <div className="w-7 shrink-0" />}
    </div>
  );
};
