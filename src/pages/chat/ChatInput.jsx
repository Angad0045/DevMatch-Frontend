import { useRef, useState } from "react";
import { cn } from "../../utils/cn";

export const ChatInput = ({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled,
}) => {
  const [text, setText] = useState("");
  const typingRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    onTypingStart();
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(onTypingStop, 1500);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    onTypingStop();
    clearTimeout(typingRef.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <div className="border-t border-cream-200 bg-white px-4 py-3">
      <div className="flex items-end gap-3 rounded-2xl bg-cream-100 px-4 py-3">
        <textarea
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type a message…"
          className="max-h-28 flex-1 resize-none bg-transparent text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint"
          style={{ minHeight: "22px" }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 112)}px`;
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-xl",
            "transition-all duration-150 active:scale-[0.93]",
            text.trim() ? "text-ink" : "cursor-not-allowed text-ink-faint",
          )}
        >
          {/* Seng Svg */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
