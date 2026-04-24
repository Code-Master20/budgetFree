import { motion as Motion } from "framer-motion";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import SiteChrome from "../components/SiteChrome";

export default function Home() {
  const { user } = useSelector((state) => state.auth);

  return (
    <PageTransition className="page-wrap">
      <SiteChrome>
        <div className="app-shell space-y-8">
          <Motion.header
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-panel flex flex-col gap-5 rounded-[32px] px-5 py-5 sm:px-7"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <span className="eyebrow">Shop smarter</span>
                <div>
                  <h1 className="text-3xl font-semibold sm:text-5xl">
                    Start at home, then jump into products.
                  </h1>
                  <p className="section-copy mt-4 max-w-2xl">
                    Use the products page to search, filter, and compare items
                    before you open a product detail page.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className="primary-button" to="/products">
                  View products
                </Link>
                {user ? (
                  <Link className="secondary-button" to="/dashboard">
                    My account
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  label: "Home",
                  value: "Start",
                  note: "Use home for quick direction and featured entry points.",
                },
                {
                  label: "Products",
                  value: "Compare",
                  note: "Browse the full product list on its own dedicated page.",
                },
                {
                  label: "Account",
                  value: user ? "Ready" : "Optional",
                  note: "Use your account for rewards, review status, and history.",
                },
              ].map((stat) => (
                <Motion.div
                  key={stat.label}
                  className="glass-panel-strong rounded-[24px] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{stat.note}</p>
                </Motion.div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="glass-panel-strong rounded-[28px] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  How to use the site
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    "Start on home when you want a quick overview.",
                    "Open products when you want filters and comparison tools.",
                    "Open a product detail page when you are ready for specifics.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[22px] bg-white/75 px-4 py-4 text-sm leading-6 text-slate-600"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-[28px] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Fast path
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[22px] bg-white/70 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Home for overview, products for comparison
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      You now have a separate products page for searching and
                      filtering.
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-white/70 px-4 py-4 text-sm text-slate-600">
                    Product details still give you the final product information
                    before opening the affiliate link.
                  </div>
                </div>
              </div>
            </div>
          </Motion.header>
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
