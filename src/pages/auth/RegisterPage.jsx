import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks.js";
import { setCredentials, setNewUser } from "../../features/auth/authSlice.js";
import { authService } from "../../services/authService.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const STRENGTH_META = [
  null,
  { label: "Weak", color: "bg-red-400" },
  { label: "Fair", color: "bg-amber-400" },
  { label: "Good", color: "bg-teal-400" },
  { label: "Strong", color: "bg-green-400" },
];

const validate = ({ displayName, email, password }) => {
  const errors = {};
  if (!displayName || displayName.trim().length < 2)
    errors.displayName = "Display name must be at least 2 characters";
  if (!email) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(email))
    errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  else if (password.length < 8)
    errors.password = "Password must be at least 8 characters";
  else if (!/[A-Z]/.test(password))
    errors.password = "Must contain at least one uppercase letter";
  else if (!/[0-9]/.test(password))
    errors.password = "Must contain at least one number";
  return errors;
};

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getStrength(form.password);
  const strengthMeta = STRENGTH_META[strength];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const { data } = await authService.register({
        displayName: form.displayName.trim(),
        email: form.email,
        password: form.password,
      });

      dispatch(setNewUser(true));
      dispatch(
        setCredentials({
          user: data.data.user,
          accessToken: data.data.accessToken,
        }),
      );
      // After registration → onboarding to fill skills, intent, experience level
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/*  Left panel */}
      <aside className="relative hidden flex-col overflow-hidden bg-cream-100 p-12 md:flex md:w-1/2">
        <div className="pointer-events-none">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-violet-200/50" />
          <div className="absolute -bottom-16 left-8 h-56 w-56 rounded-full bg-amber-200/55" />
          <div className="absolute top-1/3 right-1/3 h-14 w-14 rounded-full bg-teal-200/45" />
        </div>

        {/* Logo */}
        <div className="relative z-10 text-[22px] font-extrabold tracking-tight text-ink">
          devMatch.
        </div>

        {/* Hero copy — slightly different from login to feel fresh */}
        <div className="relative z-10 flex flex-1 flex-col justify-center">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-ink/40 uppercase lg:text-[15px]">
            Join the community
          </p>

          <h1 className="mb-5 text-[40px] leading-[1.05] font-black tracking-tight text-ink lg:text-[75px]">
            Connect with
            <br />
            engineers who
            <br />
            <span className="text-ink/30">get it.</span>
          </h1>

          <p className="mb-10 max-w-lg text-[11px] leading-relaxed text-ink/55 lg:text-lg">
            Stop searching LinkedIn. Find developers who share your stack, your
            intent, and your ambition.
          </p>
        </div>

        {/* Footer note */}
        <p className="relative z-10 max-w-xs text-[1px] leading-relaxed tracking-tighter text-ink/30">
          By creating an account you agree to our Terms of Service and Privacy
          Policy.
        </p>
      </aside>

      {/* ── Right panel — form ────────────────────────────────── */}
      <main className="flex flex-1 items-center justify-center bg-white p-6 sm:p-10">
        <div className="w-full max-w-lg animate-slide-up lg:max-w-md">
          {/* Mobile-only logo */}
          <div className="mb-10 text-xl font-extrabold tracking-tight text-ink md:hidden">
            devMatch.
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="mb-1 text-2xl font-bold text-ink">
              Create your account
            </h2>
            <p className="text-sm text-ink/45">
              Takes less than a minute. No credit card needed.
            </p>
          </div>

          {/* API error banner */}
          {apiError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span className="mt-px">⚠</span>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Display name"
              name="displayName"
              type="text"
              placeholder="How other devs will see you"
              value={form.displayName}
              onChange={handleChange}
              error={errors.displayName}
              autoComplete="name"
              autoFocus
            />

            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />

            {/* Password + strength indicator */}
            <div className="space-y-2">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
              />

              {/* Strength bars — only shown once user starts typing */}
              {form.password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          bar <= strength
                            ? (strengthMeta?.color ?? "bg-cream-200")
                            : "bg-cream-200"
                        }`}
                      />
                    ))}
                  </div>
                  {strengthMeta && (
                    <p className="text-[11px] text-ink/40">
                      Password strength:{" "}
                      <span className="font-semibold text-ink/60">
                        {strengthMeta.label}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-1">
              <Button
                type="submit"
                size="lg"
                isLoading={loading}
                className="w-full"
              >
                Create account
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-ink/45">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-ink underline decoration-ink/20 underline-offset-2 transition-all hover:decoration-ink"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
