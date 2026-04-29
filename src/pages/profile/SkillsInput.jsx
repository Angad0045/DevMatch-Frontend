import { cn } from "../../utils/cn";
import { useRef, useState } from "react";

export const SkillsInput = ({ value, onChange }) => {
  const [inputVal, setInputVal] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);
  const inputRef = useRef(null);

  const add = (skill) => {
    const s = skill.trim().toLowerCase();
    if (s && !value.includes(s) && value.length < 20) onChange([...value, s]);
    setInputVal("");
    inputRef.current?.focus();
  };

  const remove = (skill) => onChange(value.filter((s) => s !== skill));

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputVal.trim()) add(inputVal);
    }
    if (e.key === "Backspace" && !inputVal && value.length)
      remove(value[value.length - 1]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {value.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cream-200 bg-white py-1.5 pr-2 pl-3.5 text-sm font-medium text-ink"
          >
            {skill}
            <button
              type="button"
              onClick={() => remove(skill)}
              className="flex h-4 w-4 items-center justify-center rounded-full text-xs text-ink-faint transition-colors hover:bg-cream-100 hover:text-ink"
            >
              ×
            </button>
          </span>
        ))}

        <button
          type="button"
          onClick={() => {
            inputRef.current?.focus();
            setIsInputVisible(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-cream-300 px-3.5 py-1.5 text-sm text-ink-muted transition-all hover:border-ink/30 hover:text-ink"
        >
          + Add Skill
        </button>
      </div>
      {isInputVisible && (
        <div className={cn("flex items-center gap-2 transition-all")}>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type skill, press Enter…"
            className="h-9 flex-1 rounded-xl border border-cream-200 bg-white px-3.5 text-sm text-ink transition-all placeholder:text-ink-faint focus:border-ink/20 focus:ring-2 focus:ring-ink/10 focus:outline-none"
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => {
                add(inputVal);
                setIsInputVisible(false);
              }}
              className="h-9 rounded-xl bg-ink px-4 text-sm font-medium text-cream-50 transition-all hover:bg-ink/90"
            >
              Add
            </button>
          )}
        </div>
      )}
    </div>
  );
};
