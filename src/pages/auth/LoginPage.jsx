import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks.js";
import { setCredentials } from "../../features/auth/authSlice.js";
import { authService } from "../../services/authService.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

const validate = ({ email, password }) => {
  const errors = {};
  if (!email) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(email))
    errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  return errors;
};

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const { data } = await authService.login(form);
      dispatch(
        setCredentials({
          user: data.data.user,
          accessToken: data.data.accessToken,
        }),
      );
      navigate("/feed", { replace: true });
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
    <div className="z-10 h-screen w-full bg-cream-100">
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-3 md:px-10">
        <div className="pointer-events-none z-0 hidden md:block">
          <div className="absolute -bottom-28 -left-20 h-96 w-96 rounded-full bg-violet-200/50" />
          <div className="absolute top-12 -right-14 h-52 w-52 rounded-full bg-amber-200/60" />
          <div className="absolute top-1/2 left-[38%] h-16 w-16 rounded-full bg-teal-200/40" />
        </div>

        <div className="absolute top-3 left-3 lg:top-5 lg:left-10">
          {/* Logo */}
          <div className="z-10 text-[15px] font-extrabold tracking-tight text-ink md:text-[22px]">
            devMatch.
          </div>
          <div className="z-10 flex flex-1 flex-col justify-center">
            <p className="mb-4 text-[8px] font-semibold tracking-[0.18em] text-ink/40 uppercase md:text-[11px]">
              For developers
            </p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="flex w-full flex-col items-center gap-5 rounded-xl bg-cream-200 py-5 md:rounded-full lg:max-w-5xl lg:gap-7">
          <h1 className="text-[40px] leading-[1.05] font-extrabold tracking-tight text-ink md:text-[50px] lg:text-[75px]">
            Find your perfect dev
            <br />
            <span className="text-ink/30">partner.</span>
          </h1>

          <p className="text-[10px] leading-relaxed tracking-tight text-ink/55 md:text-sm lg:text-lg">
            Swipe. Connect. Build. A matching platform built on shared tech
            interests — not just job titles.
          </p>
        </div>

        <div className="mt-5 w-full max-w-lg animate-slide-up p-5">
          {/* API-level error banner */}
          {apiError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span className="mt-px">⚠</span>
              <span>{apiError}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="current-password"
            />
            <div className="pt-1">
              <Button
                type="submit"
                size="lg"
                isLoading={loading}
                className="w-full"
              >
                Sign in
              </Button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-ink/45">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-ink underline decoration-ink/20 underline-offset-2 transition-all hover:decoration-ink"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
