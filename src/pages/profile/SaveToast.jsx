import { cn } from "../../utils/cn";

export const SaveToast = ({ show }) => {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300",
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <div className="card flex items-center gap-2.5 px-5 py-3 shadow-lift">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5l2 2 4-4"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="text-sm font-medium text-ink">Profile saved</p>
      </div>
    </div>
  );
};
