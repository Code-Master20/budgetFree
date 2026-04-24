import { motion as Motion } from "framer-motion";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import SiteChrome from "../components/SiteChrome";

export default function Home() {
  const { user } = useSelector((state) => state.auth);
  const customerBenefits = [
    {
      label: "Affordable finds",
      value: "Compare",
      note: "Browse budget-friendly products and shortlist what gives you the best value for your money.",
    },
    {
      label: "Real feedback",
      value: "Review",
      note: "Read customer reviews and ratings before you open the final affiliate product link.",
    },
    {
      label: "Rewards",
      value: user ? "Earn" : "Unlock",
      note: "Create an account to collect points from approved reviews and turn them into wallet balance.",
    },
  ];

  const quickSteps = [
    "Search products that fit your budget and compare the best options.",
    "Open product pages to check price, rating, images, and review details.",
    "Sign up to submit reviews, earn points, and request Amazon Pay gift cards.",
  ];

  const reasonsToUseBudgetFree = [
    {
      title: "Budget-first product discovery",
      body: "BudgetFree helps shoppers find useful products without wasting time on overpriced or low-value listings.",
    },
    {
      title: "Buy, review, and earn points",
      body: "If you visit a relevant ecommerce website through a BudgetFree product link and buy that specific product, come back after the product is delivered and write a review on the same product page. Once your review is approved, you get reward points.",
    },
    {
      title: "Rewards for genuine participation",
      body: "When your reviews are approved, you earn points that can be converted into wallet balance and used for gift card requests.",
    },
    {
      title: "One place for shopping activity",
      body: "Your account keeps your searches, visited products, review status, wallet balance, and reward history together.",
    },
  ];

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
                <span className="eyebrow">Budget shopping rewards</span>
                <div>
                  <h1 className="text-3xl font-semibold sm:text-5xl">
                    Find better products without overspending.
                  </h1>
                  <p className="section-copy mt-4 max-w-2xl">
                    BudgetFree is for shoppers who want affordable products,
                    honest reviews, and a simple way to earn points from
                    approved participation that turn into wallet balance and
                    Amazon Pay gift cards. Partner-store purchases opened
                    through BudgetFree can also qualify for affiliate tracking
                    when completed within the store's valid attribution window.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className="primary-button" to="/products">
                  Explore products
                </Link>
                {user ? (
                  <Link className="secondary-button" to="/dashboard">
                    Open my dashboard
                  </Link>
                ) : (
                  <Link className="secondary-button" to="/register">
                    Create free account
                  </Link>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {customerBenefits.map((stat) => (
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
                  Why customers use BudgetFree
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {reasonsToUseBudgetFree.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[22px] bg-white/75 px-4 py-4 text-sm leading-6 text-slate-600"
                    >
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-2">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-[28px] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  How it works
                </p>
                <div className="mt-4 space-y-3">
                  {quickSteps.map((item, index) => (
                    <div
                      key={item}
                      className="rounded-[22px] bg-white/70 px-4 py-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Step {index + 1}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Motion.header>
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
