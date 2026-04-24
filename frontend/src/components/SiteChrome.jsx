import { motion as Motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/authSlice";
import { useTheme } from "./ThemeContext";

function NavLink({ to, label, active, className = "", onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-emerald-700 text-white shadow-[0_10px_24px_rgba(20,99,86,0.22)]"
          : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
      } ${className}`}
    >
      {label}
    </Link>
  );
}

export default function SiteChrome({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useSelector((state) => state.auth);
  const { theme, setTheme, systemTheme } = useTheme();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.2,
  });

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());

    if (result.meta.requestStatus === "fulfilled") {
      setIsMobileMenuOpen(false);
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = useMemo(
    () => {
      if (!user) {
        return [
          { to: "/", label: "Home" },
          { to: "/products", label: "Products" },
          { to: "/login", label: "Login" },
          { to: "/register", label: "Sign Up" },
        ];
      }

      const items = [
        { to: "/", label: "Home" },
        { to: "/products", label: "Products" },
        { to: "/dashboard", label: "My Account" },
      ];

      if (user.role === "admin") {
        items.push({ to: "/admin", label: "Admin Panel" });
      }

      return items;
    },
    [user],
  );

  return (
    <div className="relative">
      <Motion.div
        style={{ scaleX: progress, transformOrigin: "0%" }}
        className="fixed left-0 right-0 top-0 z-50 h-1 bg-gradient-to-r from-emerald-700 via-teal-500 to-amber-400"
      />

      <div className="pointer-events-none fixed inset-x-4 top-4 z-40 sm:inset-x-6 lg:inset-x-8">
        <div className="app-shell">
          <div className="glass-panel pointer-events-auto rounded-[28px] px-4 py-3 shadow-[0_22px_50px_rgba(16,24,31,0.12)] sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-500 text-lg font-bold text-white shadow-[0_12px_26px_rgba(20,99,86,0.24)]">
                  b
                </div>
                <div>
                  <p className="font-['Sora'] text-lg font-semibold text-slate-900">
                    budgetFree
                  </p>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Budget shopping rewards
                  </p>
                </div>
              </Link>

              <div className="hidden flex-wrap items-center gap-2 rounded-full bg-white/55 p-1.5 md:flex">
                {navItems.map((item) => {
                  const active =
                    item.to === "/"
                      ? location.pathname === item.to
                      : location.pathname.startsWith(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      label={item.label}
                      active={active}
                    />
                  );
                })}
                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loading}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/70 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Logging out..." : "Logout"}
                  </button>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-2">
                <div className="theme-switcher hidden items-center gap-1 rounded-full px-1.5 py-1 md:flex">
                  {[
                    { id: "light", label: "Light", title: "Force light mode" },
                    { id: "dark", label: "Dark", title: "Force dark mode" },
                    {
                      id: "system",
                      label: "System",
                      title: `Follow system preference (${systemTheme})`,
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTheme(option.id)}
                      title={option.title}
                      className={`theme-chip rounded-full px-3 py-2 text-xs font-semibold ${
                        theme === option.id ? "theme-chip-active" : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {user ? (
                  <div className="theme-meta-chip hidden rounded-full px-4 py-2 text-sm md:block">
                    Signed in as{" "}
                    <span className="font-semibold text-slate-900">
                      {user.name}
                    </span>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen((current) => !current)}
                  aria-expanded={isMobileMenuOpen}
                  aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-slate-700 shadow-[0_12px_26px_rgba(16,24,31,0.08)] md:hidden"
                >
                  <span className="flex flex-col gap-1.5">
                    <span
                      className={`block h-0.5 w-5 rounded-full bg-current transition ${
                        isMobileMenuOpen ? "translate-y-2 rotate-45" : ""
                      }`}
                    />
                    <span
                      className={`block h-0.5 w-5 rounded-full bg-current transition ${
                        isMobileMenuOpen ? "opacity-0" : ""
                      }`}
                    />
                    <span
                      className={`block h-0.5 w-5 rounded-full bg-current transition ${
                        isMobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
                      }`}
                    />
                  </span>
                </button>
              </div>
            </div>

            {isMobileMenuOpen ? (
              <div className="mt-4 space-y-4 border-t border-slate-200/70 pt-4 md:hidden">
                <div className="grid gap-2">
                  {navItems.map((item) => {
                    const active =
                      item.to === "/"
                        ? location.pathname === item.to
                        : location.pathname.startsWith(item.to);

                    return (
                      <NavLink
                        key={`mobile-${item.to}`}
                        to={item.to}
                        label={item.label}
                        active={active}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block rounded-2xl px-4 py-3 text-left"
                      />
                    );
                  })}
                  {user ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loading}
                      className="rounded-2xl bg-white/70 px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Logging out..." : "Logout"}
                    </button>
                  ) : null}
                </div>

                <div className="theme-switcher rounded-[24px] px-3 py-3">
                  <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Choose theme
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { id: "light", label: "Light", title: "Force light mode" },
                      { id: "dark", label: "Dark", title: "Force dark mode" },
                      {
                        id: "system",
                        label: "System",
                        title: `Follow system preference (${systemTheme})`,
                      },
                    ].map((option) => (
                      <button
                        key={`mobile-${option.id}`}
                        type="button"
                        onClick={() => setTheme(option.id)}
                        title={option.title}
                        className={`theme-chip rounded-2xl px-3 py-3 text-xs font-semibold ${
                          theme === option.id ? "theme-chip-active" : ""
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {user ? (
                  <div className="theme-meta-chip rounded-[24px] px-4 py-3 text-sm">
                    Signed in as{" "}
                    <span className="font-semibold text-slate-900">
                      {user.name}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="h-24 sm:h-28" />

      {children}

      <footer className="app-shell relative z-20 pb-8 pt-2">
        <div className="glass-panel rounded-[28px] px-5 py-5 text-sm text-slate-600 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Find affordable products, read reviews, earn points, and redeem
              rewards with BudgetFree.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link className="secondary-button px-4 py-2 text-xs" to="/">
                Home
              </Link>
              <Link
                className="secondary-button px-4 py-2 text-xs"
                to="/products"
              >
                Products
              </Link>
              {user ? (
                <>
                  <Link
                    className="secondary-button px-4 py-2 text-xs"
                    to="/dashboard"
                  >
                    My account
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loading}
                    className="secondary-button px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Logging out..." : "Logout"}
                  </button>
                  {user.role === "admin" ? (
                    <Link
                      className="primary-button px-4 py-2 text-xs"
                      to="/admin"
                    >
                      Admin panel
                    </Link>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
