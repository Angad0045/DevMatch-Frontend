import { useNavigate } from "react-router-dom";

export const EmptyState = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-cream-200 text-4xl">
        🤝
      </div>
      <h3 className="mb-2 text-lg font-bold text-ink">No matches yet</h3>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-ink-muted">
        When you and another developer both connect, they'll show up here.
      </p>
      <button
        onClick={() => navigate("/feed")}
        className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-cream-50 transition-all hover:bg-ink/90 active:scale-[0.97]"
      >
        Discover developers →
      </button>
    </div>
  );
};
