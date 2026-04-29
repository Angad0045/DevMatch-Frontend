import { useEffect } from "react";
import { initials } from "../../constants/helperFunction";

export const MatchToast = ({ user, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const initial = initials(user?.profile?.displayName);

  return (
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
      <div className="card flex min-w-[300px] items-center gap-4 px-6 py-4 shadow-lift">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white bg-amber-400 text-sm font-bold text-amber-900">
          {initial}
        </div>
        <div>
          <p className="mb-0.5 text-xs font-semibold tracking-widest text-ink/40 uppercase">
            It's a match! 🎉
          </p>
          <p className="text-sm font-semibold text-ink">
            You and {user?.profile?.displayName} connected
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto text-lg text-ink/30 transition-colors hover:text-ink"
        >
          ×
        </button>
      </div>
    </div>
  );
};
