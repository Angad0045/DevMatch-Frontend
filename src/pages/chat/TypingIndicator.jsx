export const TypingIndicator = ({ typers }) => {
  if (!typers.length) return null;
  const names = typers.map((t) => t.displayName).join(", ");
  return (
    <div className="flex items-end gap-2 px-4 pb-2">
      <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-cream-100 px-3 py-4">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
