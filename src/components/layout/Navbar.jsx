import { useState } from "react";
import { Edit2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../utils/cn.js";
import { authService } from "../../services/authService.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks.js";
import { selectCurrentUser, logout } from "../../features/auth/authSlice.js";
import { div } from "motion/react-client";

const NAV_LINKS = [
  { label: "Discover", to: "/feed" },
  { label: "Collabs", to: "/matches" },
  { label: "Messages", to: "/matches/inbox/chat" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials =
    user?.profile?.displayName
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "??";

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cream-200 bg-cream-50/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
        {/* Logo */}
        <Link
          to="/feed"
          className="shrink-0 text-[20px] font-extrabold tracking-tight text-ink"
        >
          devMatch.
        </Link>

        <nav className="hidden items-center gap-0.5 rounded-full border border-cream-200 bg-cream-100 p-1 md:flex">
          {NAV_LINKS.map(({ label, to }) => {
            const active =
              location.pathname === to ||
              (label === "Discover" && location.pathname === "/feed");
            return (
              <motion.div>
                <Link
                  key={label}
                  to={to}
                  className={cn(
                    "relative z-10 rounded-full px-5 py-1.5 text-sm font-medium text-ink-muted",
                  )}
                >
                  <motion.span
                    className="inline-block"
                    whileHover={{
                      y: [0, -2.5, 0],
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {label}
                  </motion.span>

                  {active && (
                    <motion.span
                      layoutId="span"
                      className="absolute inset-0 -z-10 rounded-full bg-white px-5 py-1.5 text-ink shadow-sm shadow-ink/5"
                    ></motion.span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Right */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="group flex items-center gap-2.5"
          >
            {/* Avatar circle — matches the yellow avatar in the screenshot */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-amber-400 text-xs font-bold text-amber-900 shadow-sm transition-all group-hover:ring-2 group-hover:ring-cream-300">
              {user?.profile?.avatarUrl ? (
                <>
                  <img
                    src={user?.profile?.avatarUrl}
                    alt={initials}
                    className="h-full w-full rounded-full object-center"
                  />
                </>
              ) : (
                { initials }
              )}
            </div>
            <span className="hidden text-sm font-semibold text-ink sm:block">
              {user?.profile?.displayName?.split(" ")[0] ?? "You"}
            </span>
            {/* Chevron */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={cn(
                "text-ink-muted transition-transform duration-200",
                menuOpen && "rotate-180",
              )}
            >
              <path
                d="M2 4l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Dropdown */}
          <AnimatePresence mode="wait">
            {menuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 25, filter: "blur(1px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    filter: "blur(2.5px)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="card absolute top-10 w-40 rounded-xl px-5 py-2.5"
                >
                  <div className="flex flex-col items-center justify-between gap-3.5">
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>
                      <div className="flex w-full items-center justify-center gap-1 text-sm tracking-tight text-ink hover:text-ink/50">
                        <Edit2 width={"20px"} />
                        <p>Edit Profile</p>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="rounded-2xl bg-red-500 px-4 py-1 text-xs font-black text-cream-100 transition-colors duration-200 hover:bg-red-700"
                    >
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
