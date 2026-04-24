import { motion as Motion } from "framer-motion";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import SiteChrome from "../components/SiteChrome";
import { loginUser } from "../redux/authSlice";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector((state) => state.auth);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await dispatch(loginUser(form));

    if (result.meta.requestStatus === "fulfilled") {
      navigate(result.payload?.role === "admin" ? "/admin" : "/dashboard");
      setForm({
        email: "",
        password: "",
      });
    }
  };

  return (
    <PageTransition className="page-wrap">
      <SiteChrome>
        <div className="app-shell grid min-h-[72vh] items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Motion.section
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.38 }}
            className="glass-panel hidden rounded-[36px] p-8 lg:block"
          >
            <span className="eyebrow">Welcome back</span>
            <h1 className="mt-6 text-4xl font-semibold">
              Sign in to continue shopping.
            </h1>
            <p className="section-copy mt-5 max-w-xl">
              Access your saved activity, review status, points, wallet balance,
              and gift card requests.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Continue from your recent product visits and searches.",
                "Check review approvals, rejections, and likes.",
                "Track points, wallet balance, and reward requests.",
              ].map((item) => (
                <div
                  key={item}
                  className="glass-panel-strong rounded-[24px] px-5 py-4 text-sm text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </Motion.section>

          <Motion.form
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.38, delay: 0.05 }}
            onSubmit={handleSubmit}
            className="glass-panel-strong rounded-[36px] p-6 sm:p-8"
          >
            <span className="eyebrow">Sign in</span>
            <h2 className="mt-4 text-3xl font-semibold">Login to BudgetFree</h2>
            <p className="section-copy mt-3">
              Access your account, rewards, and saved activity.
            </p>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Email
                </span>
                <input
                  value={form.email}
                  type="email"
                  placeholder="you@example.com"
                  className="field"
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Password
                </span>
                <div className="relative">
                  <input
                    value={form.password}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="field pr-20"
                    onChange={(event) =>
                      setForm({ ...form, password: event.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
            </div>

            {error ? (
              <div className="mt-5 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="primary-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing you in..." : "Login"}
            </button>

            <p className="mt-5 text-sm text-slate-600">
              New here?{" "}
              <Link className="font-semibold text-emerald-700" to="/register">
                Create an account
              </Link>
            </p>
          </Motion.form>
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
