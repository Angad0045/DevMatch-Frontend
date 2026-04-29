import React from "react";

export const EmptyState = ({ onReset }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-cream-200 text-4xl">
        🎉
      </div>
      <h3 className="mb-2 text-lg font-bold text-ink">You've seen everyone!</h3>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-ink-muted">
        No more profiles matching your current filters. Try adjusting your
        filters or check back later.
      </p>
      <button
        onClick={onReset}
        className="text-sm font-semibold text-ink underline decoration-ink/20 underline-offset-2 transition-all hover:decoration-ink"
      >
        Reset filters
      </button>
    </div>
  );
};
