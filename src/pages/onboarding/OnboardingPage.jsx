import { useState } from "react";
import { cn } from "../../utils/cn.js";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks.js";
import Button from "../../components/ui/Button.jsx";
import { userService } from "../../services/userService.js";
import {
  setCredentials,
  setNewUser,
  selectCurrentUser,
} from "../../features/auth/authSlice.js";
import { AVATAR_COLOURS } from "../../constants/index.js";

// Static data
const EXPERIENCE_LEVELS = [
  {
    value: "junior",
    label: "Junior",
    desc: "0 – 2 years. Still learning the ropes.",
    icon: "🌱",
  },
  {
    value: "mid",
    label: "Mid-level",
    desc: "2 – 5 years. Shipping independently.",
    icon: "⚡",
  },
  {
    value: "senior",
    label: "Senior",
    desc: "5 – 10 years. Leading and mentoring.",
    icon: "🚀",
  },
  {
    value: "principal",
    label: "Principal",
    desc: "10+ years. Shaping architecture.",
    icon: "🏛️",
  },
];

const INTENT_OPTIONS = [
  {
    value: "mentorship",
    label: "Mentorship",
    desc: "You're open to guiding less experienced developers.",
    icon: "🎓",
  },
  {
    value: "collaboration",
    label: "Project Partner",
    desc: "You're looking to build something new together.",
    icon: "🛠️",
  },
  {
    value: "opensource",
    label: "Open Source",
    desc: "Contribute to or maintain open source projects.",
    icon: "🌐",
  },
  {
    value: "learning",
    label: "Knowledge Share",
    desc: "Exchange skills, pair program, or teach each other.",
    icon: "💡",
  },
];

const SKILL_SUGGESTIONS = [
  "React",
  "Node.js",
  "Python",
  "TypeScript",
  "Rust",
  "Go",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "Next.js",
  "Vue",
  "Swift",
  "Kotlin",
  "Redis",
  "Terraform",
  "WebAssembly",
  "Solidity",
];

// Step components
function StepPhoto({ displayName, value, onChange }) {
  const [urlInput, setUrlInput] = useState(value);
  const [imgError, setImgError] = useState(false);
  const [previewing, setPreviewing] = useState(!!value);

  // Derive avatar fallback from display name
  const ini = (displayName || "You")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const col =
    AVATAR_COLOURS[(displayName?.charCodeAt(0) || 0) % AVATAR_COLOURS.length];

  const handleApply = () => {
    const trimmed = urlInput.trim();
    onChange(trimmed);
    setImgError(false);
    setPreviewing(!!trimmed);
  };

  const handleClear = () => {
    setUrlInput("");
    onChange("");
    setImgError(false);
    setPreviewing(false);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Live preview circle */}
      <div className="relative">
        <div
          className={cn(
            "flex h-28 w-28 items-center justify-center rounded-full",
            "overflow-hidden border-4 border-white text-3xl font-bold shadow-lift",
            (!previewing || imgError) && col,
          )}
        >
          {previewing && !imgError ? (
            <img
              src={value}
              alt="Avatar preview"
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            ini
          )}
        </div>

        {/* Success indicator */}
        {previewing && !imgError && (
          <div className="absolute right-1 bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-green-500">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="white"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* Error indicator */}
        {previewing && imgError && (
          <div className="absolute right-1 bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-red-400">
            <span className="text-xs font-bold text-white">!</span>
          </div>
        )}
      </div>

      {/* URL input */}
      <div className="w-full space-y-2">
        <label className="text-[11px] font-semibold tracking-widest text-ink/30 uppercase">
          Image URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setImgError(false);
              setPreviewing(false);
              // Clear parent value if user is editing
              if (!e.target.value.trim()) onChange("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="https://example.com/your-photo.jpg"
            className="h-11 flex-1 rounded-xl border border-cream-200 bg-white px-4 text-sm text-ink transition-all placeholder:text-ink-faint focus:border-ink/20 focus:ring-2 focus:ring-ink/10 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={!urlInput.trim()}
            className="h-11 rounded-xl bg-ink px-4 text-sm font-semibold text-cream-50 transition-all hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Preview
          </button>
        </div>

        {/* Error message */}
        {imgError && (
          <p className="text-xs text-red-500">
            Couldn't load that image. Check the URL and try again.
          </p>
        )}

        {/* Success message */}
        {previewing && !imgError && (
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-green-600">✓ Photo set</p>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-ink-faint underline transition-colors hover:text-ink"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Skip hint */}
      <p className="text-center text-xs text-ink-faint">
        You can always update this later in your profile settings.
      </p>
    </div>
  );
}

function StepExperience({ value, onChange }) {
  return (
    <div className="space-y-3">
      {EXPERIENCE_LEVELS.map((level) => (
        <button
          key={level.value}
          type="button"
          onClick={() => onChange(level.value)}
          className={cn(
            "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left",
            "transition-all duration-150 active:scale-[0.98]",
            value === level.value
              ? "border-ink bg-ink text-cream-50"
              : "border-cream-200 bg-white text-ink hover:border-cream-300",
          )}
        >
          <span className="flex-shrink-0 text-2xl">{level.icon}</span>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "mb-1 text-sm leading-none font-semibold",
                value === level.value ? "text-cream-50" : "text-ink",
              )}
            >
              {level.label}
            </p>
            <p
              className={cn(
                "text-xs leading-relaxed",
                value === level.value ? "text-cream-200" : "text-ink-muted",
              )}
            >
              {level.desc}
            </p>
          </div>
          {/* Selection indicator */}
          <div
            className={cn(
              "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all",
              value === level.value
                ? "border-cream-50 bg-cream-50"
                : "border-cream-300",
            )}
          >
            {value === level.value && (
              <div className="h-2.5 w-2.5 rounded-full bg-ink" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function StepSkills({ value, onChange }) {
  const [inputVal, setInputVal] = useState("");

  const addSkill = (skill) => {
    const normalized = skill.trim().toLowerCase();
    if (normalized && !value.includes(normalized) && value.length < 20) {
      onChange([...value, normalized]);
    }
    setInputVal("");
  };

  const removeSkill = (skill) => onChange(value.filter((s) => s !== skill));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputVal.trim()) addSkill(inputVal);
    }
    if (e.key === "Backspace" && !inputVal && value.length) {
      removeSkill(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex min-h-[80px] flex-wrap items-start gap-2 rounded-2xl border-2 border-cream-200 bg-white p-3 transition-all focus-within:border-ink/20 focus-within:ring-2 focus-within:ring-ink/10">
        {value.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink py-1 pr-2 pl-3 text-xs font-medium text-cream-50"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="flex h-4 w-4 items-center justify-center rounded-full text-cream-200 transition-colors hover:bg-cream-50/20 hover:text-cream-50"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            value.length === 0 ? "Type a skill and press Enter…" : ""
          }
          className="min-w-[140px] flex-1 bg-transparent py-0.5 text-sm text-ink outline-none placeholder:text-ink-faint"
        />
      </div>

      <p className="text-center text-xs text-ink-muted">
        {value.length}/20 skills added
      </p>

      {/* Quick-add suggestions */}
      <div>
        <p className="mb-2 text-[10px] font-semibold tracking-widest text-ink/30 uppercase">
          Quick add
        </p>
        <div className="flex flex-wrap gap-2">
          {SKILL_SUGGESTIONS.filter((s) => !value.includes(s.toLowerCase()))
            .slice(0, 12)
            .map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="tag transition-all hover:border-ink/30 hover:text-ink active:scale-95"
              >
                + {skill}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function StepIntent({ value, onChange }) {
  const toggle = (intent) => {
    if (value.includes(intent)) {
      // Keep at least one intent selected
      if (value.length > 1) onChange(value.filter((i) => i !== intent));
    } else {
      onChange([...value, intent]);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {INTENT_OPTIONS.map((option) => {
        const selected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-2xl border-2 p-5 text-left",
              "transition-all duration-150 active:scale-[0.97]",
              selected
                ? "border-violet-text bg-violet-badge"
                : "border-cream-200 bg-white hover:border-cream-300",
            )}
          >
            <span className="text-2xl">{option.icon}</span>
            <div>
              <p
                className={cn(
                  "mb-1 text-sm leading-none font-semibold",
                  selected ? "text-violet-text" : "text-ink",
                )}
              >
                {option.label}
              </p>
              <p className="text-xs leading-relaxed text-ink-muted">
                {option.desc}
              </p>
            </div>
            {/* Check mark */}
            {selected && (
              <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-text">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5l2 2 4-4"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Main page
const STEPS = [
  {
    key: "photo",
    title: "Add a profile photo",
    subtitle:
      "A face to the name helps other developers trust and connect with you. Paste any image URL or skip for now.",
  },
  {
    key: "experience",
    title: "Your experience level",
    subtitle:
      "This helps us surface the right matches for where you are in your career.",
  },
  {
    key: "skills",
    title: "Your technical stack",
    subtitle: "Add the technologies you work with day-to-day.",
  },
  {
    key: "intent",
    title: "What are you here for?",
    subtitle: "Select all that apply — you can change this anytime.",
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const storeUser = useAppSelector(selectCurrentUser);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    avatarUrl: "",
    experienceLevel: "",
    skills: [],
    intent: [],
  });

  const currentStep = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const canProceed = () => {
    if (currentStep.key === "photo") return true;
    if (currentStep.key === "experience") return !!form.experienceLevel;
    if (currentStep.key === "skills") return form.skills.length >= 1;
    if (currentStep.key === "intent") return form.intent.length >= 1;
    return false;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await userService.updateMe({
        avatarUrl: form.avatarUrl || undefined,
        experienceLevel: form.experienceLevel,
        skills: form.skills,
        intent: form.intent,
      });

      dispatch(setCredentials({ user: data.data.user }));
      dispatch(setNewUser(false));
      navigate("/feed", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      {/* Top bar */}
      <div className="mx-auto flex w-full items-center justify-between bg-cream-50/80 px-6 py-5">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
          <span className="text-[20px] font-extrabold tracking-tight text-ink">
            devMatch.
          </span>
          <button
            onClick={() => navigate("/feed")}
            className="text-sm text-ink-muted transition-colors hover:text-ink hover:underline"
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-cream-200">
        <div
          className="h-full bg-ink transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center p-6 py-10">
        <div className="w-full max-w-lg animate-slide-up">
          {/* Step counter */}
          <div className="mb-6 flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i <= step ? "flex-[2] bg-ink" : "flex-1 bg-cream-300",
                )}
              />
            ))}
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-ink/30 uppercase">
              Step {step + 1} of {STEPS.length}
            </p>
            <h1 className="mb-1.5 text-2xl font-bold text-ink">
              {currentStep.title}
            </h1>
            <p className="text-sm leading-relaxed text-ink-muted">
              {currentStep.subtitle}
            </p>
          </div>

          {/* Step content */}
          <div className="relative" key={step}>
            {currentStep.key === "photo" && (
              <StepPhoto
                displayName={storeUser?.profile?.displayName ?? ""}
                value={form.avatarUrl}
                onChange={(v) => setForm((p) => ({ ...p, avatarUrl: v }))}
              />
            )}
            {currentStep.key === "experience" && (
              <StepExperience
                value={form.experienceLevel}
                onChange={(v) => setForm((p) => ({ ...p, experienceLevel: v }))}
              />
            )}
            {currentStep.key === "skills" && (
              <StepSkills
                value={form.skills}
                onChange={(v) => setForm((p) => ({ ...p, skills: v }))}
              />
            )}
            {currentStep.key === "intent" && (
              <div className="relative">
                <StepIntent
                  value={form.intent}
                  onChange={(v) => setForm((p) => ({ ...p, intent: v }))}
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 text-center text-sm text-red-500">{error}</p>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center gap-3">
            {!isFirst && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1"
              >
                ← Back
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleNext}
              isLoading={loading}
              disabled={!canProceed()}
              className="flex-[2]"
            >
              {isLast ? "Finish setup" : "Continue →"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
