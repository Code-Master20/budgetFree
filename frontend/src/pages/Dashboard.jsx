import { motion as Motion } from "framer-motion";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import SiteChrome from "../components/SiteChrome";

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const points = user?.points || 0;
  const tier = points >= 500 ? "Gold" : points >= 150 ? "Plus" : "Starter";
  const tierMax = tier === "Gold" ? 800 : tier === "Plus" ? 500 : 150;
  const progress = Math.min((points / tierMax) * 100, 100);

  return (
    <PageTransition className="page-wrap">
      <SiteChrome>
        <div className="app-shell space-y-6">
          <Motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-panel overflow-hidden rounded-[34px] p-6 sm:p-8"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="eyebrow">Member dashboard</span>
                <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">
                  Welcome back, {user?.name || "Member"}.
                </h1>
                <p className="section-copy mt-4 max-w-2xl">
                  Your account overview now surfaces the essentials first so it
                  feels easier to check progress and jump back into the catalog.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className="primary-button" to="/">
                  Browse products
                </Link>
                <Link className="secondary-button" to="/">
                  Review catalog
                </Link>
              </div>
            </div>
          </Motion.section>

          <section className="grid gap-5 md:grid-cols-3">
            {[
              {
                label: "Reward points",
                value: points,
                note: "Keep collecting points as you browse and engage.",
              },
              {
                label: "Membership tier",
                value: tier,
                note: "A simple snapshot of your current standing.",
              },
              {
                label: "Account email",
                value: user?.email || "No email",
                note: "Your sign-in identity stays visible at a glance.",
              },
            ].map((card, index) => (
              <Motion.article
                key={card.label}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: index * 0.06 }}
                className="glass-panel-strong rounded-[28px] p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {card.label}
                </p>
                <p className="mt-4 break-words text-3xl font-semibold text-slate-900">
                  {card.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.note}</p>
              </Motion.article>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="glass-panel-strong rounded-[34px] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Progress to next level
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    {tier} member progress
                  </h2>
                </div>
                <span className="pill bg-amber-100/90 text-amber-800">
                  {Math.round(progress)}%
                </span>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200/70">
                <Motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-700 via-teal-500 to-amber-400"
                />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Current points", value: points },
                  { label: "Current tier", value: tier },
                  { label: "Tier cap", value: tierMax },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[22px] bg-white/72 px-4 py-4 text-center"
                  >
                    <p className="text-2xl font-semibold text-slate-900">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[34px] p-6">
              <h2 className="text-2xl font-semibold">Today’s smooth path</h2>
              <div className="mt-4 space-y-3">
                {[
                  "Open the refreshed catalog and filter faster.",
                  "Use product detail pages for richer comparison.",
                  "Keep an eye on reward progress without extra clicks.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] bg-white/70 px-4 py-4 text-sm leading-6 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="glass-panel rounded-[34px] p-6">
              <h2 className="text-2xl font-semibold">Account rhythm</h2>
              <p className="section-copy mt-3">
                This view is now tuned for quick check-ins instead of dense account
                clutter.
              </p>
              <div className="soft-divider my-6" />
              <div className="space-y-4 text-sm text-slate-600">
                <div className="rounded-[22px] bg-white/70 px-4 py-4">
                  Personalized greeting and clean account summary.
                </div>
                <div className="rounded-[22px] bg-white/70 px-4 py-4">
                  Reward status surfaced without extra clicks.
                </div>
                <div className="rounded-[22px] bg-white/70 px-4 py-4">
                  Clear path back to product discovery.
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[34px] p-6">
              <h2 className="text-2xl font-semibold">Next best actions</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Link className="glass-panel-strong rounded-[24px] p-5" to="/">
                  <p className="text-lg font-semibold">Continue browsing</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Re-enter the catalog with the new filters and cleaner cards.
                  </p>
                </Link>
                <div className="glass-panel-strong rounded-[24px] p-5">
                  <p className="text-lg font-semibold">Stay ready for rewards</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your points snapshot is updated in a calmer, easier-to-scan
                    block.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
