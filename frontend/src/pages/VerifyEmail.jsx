import { motion as Motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import SiteChrome from "../components/SiteChrome";

export default function VerifyEmail() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const status = searchParams.get("status") || "success";
  const message =
    searchParams.get("message") ||
    (status === "success"
      ? "Your email has been verified successfully."
      : "We could not verify your email.");
  const isSuccess = status === "success";

  return (
    <PageTransition className="page-wrap">
      <SiteChrome>
        <div className="app-shell flex min-h-[72vh] items-center justify-center">
          <Motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-panel-strong max-w-xl rounded-[36px] p-8 text-center"
          >
            <span className="eyebrow">
              {isSuccess ? "Email verified" : "Verification failed"}
            </span>
            <h1 className="mt-4 text-3xl font-semibold">
              {isSuccess ? "Your account is ready." : "This link did not work."}
            </h1>
            <p className="section-copy mt-4">{message}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link className="primary-button" to={isSuccess ? "/login" : "/register"}>
                {isSuccess ? "Continue to login" : "Back to register"}
              </Link>
              <Link
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white/70"
                to="/"
              >
                Go home
              </Link>
            </div>
          </Motion.section>
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
