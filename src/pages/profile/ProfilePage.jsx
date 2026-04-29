import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks.js";
import {
  selectCurrentUser,
  setCredentials,
} from "../../features/auth/authSlice.js";
import { cn } from "../../utils/cn.js";
import { Toggle } from "./Toggle.jsx";
import { SaveToast } from "./SaveToast.jsx";
import { IntentCard } from "./IntentCard.jsx";
import { SkillsInput } from "./SkillsInput.jsx";
import { SectionLabel } from "./SectionLabel.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import { userService } from "../../services/userService.js";
import { EXPERIENCE_LEVELS } from "../../constants/index.js";
import { avatarColour, initials } from "../../constants/helperFunction.jsx";

const INTENT_OPTIONS = [
  {
    value: "mentorship",
    label: "Mentorship",
    desc: "You're open to guiding less experienced developers.",
  },
  {
    value: "collaboration",
    label: "Project Partner",
    desc: "You're looking to build something new together.",
  },
  {
    value: "learning",
    label: "Knowledge Share",
    desc: "Exchange skills and pair program.",
  },
  {
    value: "opensource",
    label: "Open Source",
    desc: "Contribute to or maintain open source projects.",
  },
];

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const storeUser = useAppSelector(selectCurrentUser);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    githubHandle: "",
    timezone: "",
    skills: [],
    experienceLevel: "",
    intent: [],
    isActive: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await userService.getMe();
        const u = data.data.user;
        setForm({
          displayName: u.profile?.displayName ?? "",
          bio: u.profile?.bio ?? "",
          githubHandle: u.profile?.githubHandle ?? "",
          timezone: u.profile?.timezone ?? "",
          skills: u.profile?.skills ?? [],
          experienceLevel: u.profile?.experienceLevel ?? "",
          intent: u.intent ?? [],
          isActive: u.isActive ?? true,
        });
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const set = (key) => (value) => setForm((p) => ({ ...p, [key]: value }));

  const toggleIntent = (value) => {
    setForm((p) => ({
      ...p,
      intent: p.intent.includes(value)
        ? p.intent.length > 1
          ? p.intent.filter((i) => i !== value)
          : p.intent
        : [...p.intent, value],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await userService.updateMe({
        displayName: form.displayName,
        bio: form.bio || undefined,
        githubHandle: form.githubHandle || undefined,
        timezone: form.timezone || undefined,
        skills: form.skills,
        experienceLevel: form.experienceLevel || undefined,
        intent: form.intent,
      });
      dispatch(setCredentials({ user: data.data.user }));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const displayName = form.displayName || storeUser?.profile?.displayName || "";
  const col = avatarColour(displayName);
  const ini = initials(displayName);

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <Navbar />
      <SaveToast show={showToast} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        {fetching ? (
          // Skeleton
          <div className="grid animate-pulse grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
            <div className="space-y-4">
              <div className="card h-64 bg-cream-200/50 p-6" />
              <div className="card h-24 bg-cream-200/50 p-5" />
            </div>
            <div className="card h-96 bg-cream-200/50 p-8" />
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_1fr]">
            {/* Left panel */}
            <div className="space-y-4">
              {/* Avatar card */}
              <div className="card relative flex flex-col items-center overflow-hidden p-6 text-center">
                {/* Decorative blob */}
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-amber-200/60" />
                {/* Avatar with edit button */}
                <div className="relative mb-4">
                  <div
                    className={cn(
                      "flex h-20 w-20 items-center justify-center rounded-full",
                      "border-4 border-white text-2xl font-bold shadow-sm",
                      col,
                    )}
                  >
                    {storeUser?.profile?.avatarUrl ? (
                      <img
                        src={storeUser.profile.avatarUrl}
                        alt={displayName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      ini
                    )}
                  </div>
                  {/* Edit icon button */}
                  <button
                    className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-ink shadow-sm transition-colors hover:bg-ink/80"
                    title="Upload photo (coming soon)"
                  >
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="white"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                      />
                    </svg>
                  </button>
                </div>
                <h2 className="text-base font-bold text-ink">
                  {displayName || "Your name"}
                </h2>
                <p className="mt-0.5 text-xs text-ink-muted capitalize">
                  {form.experienceLevel
                    ? `${form.experienceLevel} developer`
                    : "Add your experience level"}
                </p>
              </div>

              {/* Available for Collabs toggle */}
              <div className="card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Available for Collabs
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      Visible in discovery
                    </p>
                  </div>
                  <Toggle checked={form.isActive} onChange={set("isActive")} />
                </div>
              </div>

              {/* Hint copy */}
              <p className="px-2 text-center text-xs leading-relaxed text-ink-muted">
                Your profile is seen by developers looking for mentors and
                project partners. Keep it fresh!
              </p>
            </div>

            {/* Right panel */}
            <div className="card space-y-8 p-7 lg:p-9">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-ink">Edit Profile</h1>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              {/* Headline & Bio */}
              <div>
                <SectionLabel>Headline &amp; Bio</SectionLabel>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Software Engineer @ Company"
                    value={form.displayName}
                    onChange={(e) => set("displayName")(e.target.value)}
                    className="h-11 w-full rounded-xl border border-cream-200 bg-white px-4 text-sm text-ink transition-all placeholder:text-ink-faint hover:border-cream-300 focus:border-ink/20 focus:ring-2 focus:ring-ink/10 focus:outline-none"
                  />
                  <textarea
                    placeholder="Tell other developers about yourself, your interests, and what you're looking for…"
                    value={form.bio}
                    onChange={(e) => set("bio")(e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-cream-200 bg-white px-4 py-3 text-sm text-ink transition-all placeholder:text-ink-faint hover:border-cream-300 focus:border-ink/20 focus:ring-2 focus:ring-ink/10 focus:outline-none"
                  />
                  <p className="text-right text-[11px] text-ink-faint">
                    {form.bio.length}/500
                  </p>
                </div>
              </div>

              {/* Technical Stack */}
              <div>
                <SectionLabel>Technical Stack</SectionLabel>
                <SkillsInput value={form.skills} onChange={set("skills")} />
              </div>

              {/* Experience level */}
              <div>
                <SectionLabel>Experience Level</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => set("experienceLevel")(level.value)}
                      className={cn(
                        "rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all",
                        form.experienceLevel === level.value
                          ? "border-ink bg-ink text-cream-50"
                          : "border-cream-200 bg-white text-ink-muted hover:border-cream-300 hover:text-ink",
                      )}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collaboration Preferences */}
              <div>
                <SectionLabel>Collaboration Preferences</SectionLabel>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {INTENT_OPTIONS.map((option) => (
                    <IntentCard
                      key={option.value}
                      option={option}
                      selected={form.intent.includes(option.value)}
                      onToggle={toggleIntent}
                    />
                  ))}
                </div>
              </div>

              {/* Additional info */}
              <div>
                <SectionLabel>Additional Info</SectionLabel>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold tracking-widest text-ink/30 uppercase">
                      GitHub Handle
                    </label>
                    <div className="relative">
                      <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-ink-faint">
                        @
                      </span>
                      <input
                        type="text"
                        placeholder="yourhandle"
                        value={form.githubHandle}
                        onChange={(e) => set("githubHandle")(e.target.value)}
                        className="h-11 w-full rounded-xl border border-cream-200 bg-white pr-4 pl-8 text-sm text-ink transition-all placeholder:text-ink-faint hover:border-cream-300 focus:border-ink/20 focus:ring-2 focus:ring-ink/10 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold tracking-widest text-ink/30 uppercase">
                      Timezone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Asia/Kolkata"
                      value={form.timezone}
                      onChange={(e) => set("timezone")(e.target.value)}
                      className="h-11 w-full rounded-xl border border-cream-200 bg-white px-4 text-sm text-ink transition-all placeholder:text-ink-faint hover:border-cream-300 focus:border-ink/20 focus:ring-2 focus:ring-ink/10 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="flex items-center justify-center border-t border-cream-200 pt-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-cream-50 transition-all hover:bg-ink/90 active:scale-[0.97] disabled:opacity-50 md:w-[25%]"
                >
                  {loading && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cream-50/30 border-t-cream-50 text-center" />
                  )}
                  {loading ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
