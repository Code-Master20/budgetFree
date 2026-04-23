import { motion as Motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import PageTransition from "../components/PageTransition";
import SiteChrome from "../components/SiteChrome";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await API.post("/auth/register", form);
      setFeedback({
        tone: "success",
        message: res.data.message,
        verifyLink: res.data.verifyLink,
      });
      setForm({
        name: "",
        email: "",
        password: "",
      });
    } catch (err) {
      setFeedback({
        tone: "error",
        message: err.response?.data?.message || "Registration failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="page-wrap">
      <SiteChrome>
        <div className="app-shell grid min-h-[72vh] items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Motion.form
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.38 }}
            onSubmit={handleSubmit}
            className="glass-panel-strong rounded-[36px] p-6 sm:p-8"
          >
            <span className="eyebrow">Create account</span>
            <h1 className="mt-4 text-3xl font-semibold">
              Join the smoother side of shopping
            </h1>
            <p className="section-copy mt-3">
              Register once, verify your email, and come back to a cleaner dashboard
              and browsing flow.
            </p>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Name
                </span>
                <input
                  value={form.name}
                  placeholder="Your name"
                  className="field"
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </label>

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
                    placeholder="Create a secure password"
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

            {feedback ? (
              <div
                className={`mt-5 rounded-[22px] px-4 py-4 text-sm ${
                  feedback.tone === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                <p>{feedback.message}</p>
                {feedback.verifyLink ? (
                  <a
                    href={feedback.verifyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex font-semibold text-emerald-700 underline"
                  >
                    Open verification link
                  </a>
                ) : null}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="primary-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Creating your account..." : "Register"}
            </button>

            <p className="mt-5 text-sm text-slate-600">
              Already have an account?{" "}
              <Link className="font-semibold text-emerald-700" to="/login">
                Login
              </Link>
            </p>
          </Motion.form>

          <Motion.section
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.38, delay: 0.05 }}
            className="glass-panel rounded-[36px] p-8"
          >
            <span className="eyebrow">Better onboarding</span>
            <h2 className="mt-6 text-4xl font-semibold">
              Less interruption, more clarity.
            </h2>
            <p className="section-copy mt-5 max-w-xl">
              Registration now feels more polished because success and error states
              stay inside the page instead of breaking flow with popups.
            </p>

            <div className="mt-8 grid gap-4">
              {[
                "A softer visual system with stronger hierarchy.",
                "Smoother inputs and clearer submit states.",
                "Verification guidance presented right where you need it.",
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
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
