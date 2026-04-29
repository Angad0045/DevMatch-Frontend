import { cn } from "../../utils/cn.js";

const variants = {
  primary: "bg-ink text-cream-50 hover:bg-ink/90 focus-visible:ring-ink/30",
  secondary:
    "bg-white border border-cream-200 text-ink hover:border-cream-300 hover:bg-cream-50 focus-visible:ring-ink/20",
  ghost: "text-ink/60 hover:text-ink hover:bg-ink/5 focus-visible:ring-ink/20",
  danger: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-300",
};

const sizes = {
  sm: "h-9  px-4  text-xs  rounded-lg",
  md: "h-10 px-5  text-sm  rounded-xl",
  lg: "h-12 px-6  text-sm  rounded-xl",
  xl: "h-14 px-8  text-base rounded-2xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      disabled={isLoading || props.disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold",
        "transition-all duration-150 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 rounded-full border-2 border-current/25 border-t-current animate-spin" />
      )}
      {children}
    </button>
  );
}
