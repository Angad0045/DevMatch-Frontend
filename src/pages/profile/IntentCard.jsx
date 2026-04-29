import { cn } from "../../utils/cn";

export const IntentCard = ({ option, selected, onToggle }) => {
  return (
    <button
      type="button"
      onClick={() => onToggle(option.value)}
      className={cn(
        "flex flex-col items-start gap-1.5 rounded-2xl border-2 p-5 text-left",
        "transition-all duration-150 active:scale-[0.97]",
        selected
          ? "border-violet-text bg-violet-badge"
          : "border-cream-200 bg-white hover:border-cream-300",
      )}
    >
      <p
        className={cn(
          "text-sm font-semibold",
          selected ? "text-violet-text" : "text-ink",
        )}
      >
        {option.label}
      </p>
      <p className="text-xs leading-relaxed text-ink-muted">{option.desc}</p>
    </button>
  );
};
