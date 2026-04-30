import { cn } from "../../utils/cn.js";
import { useRef, useState } from "react";
import { AVATAR_BG, INTENT_LABELS } from "../../constants/index.js";
import { initials } from "../../constants/helperFunction.jsx";
// How far user must drag before it counts as a swipe
const SWIPE_THRESHOLD = 100;

// Max visual rotation during drag (degrees)
const MAX_ROTATION = 18;

export default function SwipeCard({ user, onLike, onPass, isTop }) {
  // Drag state
  const [dragging, setDragging] = useState(false);
  const [deltaX, setDeltaX] = useState(0);
  const [swiping, setSwiping] = useState(null); // 'left' | 'right' | null
  const startX = useRef(null);
  const cardRef = useRef(null);

  // Derived values used for visual feedback during drag
  const rotation = (deltaX / 400) * MAX_ROTATION;
  const likeAlpha = Math.max(0, Math.min(1, deltaX / SWIPE_THRESHOLD));
  const passAlpha = Math.max(0, Math.min(1, -deltaX / SWIPE_THRESHOLD));

  // ── Drag handlers (unified for mouse + touch) ──────────────────
  const onDragStart = (clientX) => {
    if (!isTop) return;
    startX.current = clientX;
    setDragging(true);
  };

  const onDragMove = (clientX) => {
    if (!dragging || startX.current === null) return;
    setDeltaX(clientX - startX.current);
  };

  const onDragEnd = () => {
    if (!dragging) return;
    setDragging(false);

    if (deltaX > SWIPE_THRESHOLD) {
      setSwiping("right");
      setTimeout(() => onLike(user), 350);
    } else if (deltaX < -SWIPE_THRESHOLD) {
      setSwiping("left");
      setTimeout(() => onPass(user), 350);
    } else {
      // Snap back
      setDeltaX(0);
    }
    startX.current = null;
  };

  // Mouse events
  const onMouseDown = (e) => onDragStart(e.clientX);
  const onMouseMove = (e) => onDragMove(e.clientX);
  const onMouseUp = () => onDragEnd();
  const onMouseLeave = () => {
    if (dragging) onDragEnd();
  };

  // Touch events
  const onTouchStart = (e) => onDragStart(e.touches[0].clientX);
  const onTouchMove = (e) => onDragMove(e.touches[0].clientX);
  const onTouchEnd = () => onDragEnd();

  // ── Derived display data ───────────────────────────────────────

  const { profile, intent } = user;
  const displayName = profile?.displayName ?? "Unknown";
  const avatarIdx = displayName.charCodeAt(0) % AVATAR_BG.length;
  const initial = initials(displayName);

  const primaryIntent = intent?.[0] ?? null;
  const experienceLevel = profile?.experienceLevel ?? null;
  const skills = profile?.skills ?? [];

  // Swipe-out animation class
  const animClass =
    swiping === "right"
      ? "animate-swipe-right"
      : swiping === "left"
        ? "animate-swipe-left"
        : "";

  return (
    <div
      ref={cardRef}
      className={cn(
        "absolute inset-0 touch-none select-none",
        isTop ? "z-10 cursor-grab active:cursor-grabbing" : "z-0",
        animClass,
      )}
      style={
        isTop && dragging
          ? {
              transform: `translateX(${deltaX}px) rotate(${rotation}deg)`,
              transition: "none",
            }
          : undefined
      }
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Card surface */}
      <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white shadow-lift">
        {/* Avatar / photo area */}
        <div className="relative flex-1 overflow-hidden">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={displayName}
              className="pointer-events-none h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            // Initials fallback — warm gradient background
            <div
              className={cn(
                "flex h-full w-full items-center justify-center text-7xl font-bold",
                AVATAR_BG[avatarIdx],
              )}
            >
              {initial}
            </div>
          )}

          {/* Bottom gradient overlay for text legibility */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* LIKE overlay — shown when dragging right */}
          {isTop && likeAlpha > 0.05 && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: likeAlpha }}
            >
              <div className="rotate-[-12deg] rounded-2xl border-4 border-green-400 px-6 py-3">
                <p className="text-3xl font-extrabold tracking-widest text-green-400">
                  CONNECT
                </p>
              </div>
            </div>
          )}

          {/* PASS overlay — shown when dragging left */}
          {isTop && passAlpha > 0.05 && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: passAlpha }}
            >
              <div className="rotate-[12deg] rounded-2xl border-4 border-red-400 px-6 py-3">
                <p className="text-3xl font-extrabold tracking-widest text-red-400">
                  PASS
                </p>
              </div>
            </div>
          )}

          {/* Name + badges pinned to bottom of photo */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-4">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">{displayName}</h2>
              {/* Online dot */}
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-white bg-green-400" />
            </div>

            <div className="flex flex-wrap gap-2">
              {primaryIntent && (
                <span className="rounded-full bg-violet-badge px-3 py-1 text-xs font-semibold text-violet-text backdrop-blur-sm">
                  {INTENT_LABELS[primaryIntent]}
                </span>
              )}
              {experienceLevel && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white capitalize backdrop-blur-sm">
                  {experienceLevel}
                </span>
              )}
              {profile?.timezone && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {profile.timezone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio strip */}
        <div className="shrink-0 border-t border-cream-200 px-5 py-4">
          {profile?.bio ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm text-ink-faint italic">No bio yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
