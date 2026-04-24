import { motion as Motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import LoadingScreen from "../components/LoadingScreen";
import PageTransition from "../components/PageTransition";
import SiteChrome from "../components/SiteChrome";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SummaryCard({ label, value, note, delay = 0 }) {
  return (
    <Motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="glass-panel-strong rounded-[28px] p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>
    </Motion.article>
  );
}

function DataList({ title, subtitle, emptyText, items, renderItem }) {
  return (
    <div className="glass-panel rounded-[34px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="section-copy mt-2">{subtitle}</p>
        </div>
        <span className="pill">{items.length} items</span>
      </div>

      <div className="mt-5 space-y-3">
        {items.length ? (
          items.map(renderItem)
        ) : (
          <div className="rounded-[22px] bg-white/70 px-4 py-4 text-sm text-slate-600">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setStatus("loading");
        setError("");
        const response = await API.get("/admin/dashboard");
        setData(response.data);
        setStatus("ready");
      } catch (fetchError) {
        setError(
          fetchError.response?.data?.message ||
            "Unable to load admin dashboard",
        );
        setStatus("error");
      }
    };

    loadDashboard();
  }, []);

  const summaryCards = useMemo(() => {
    if (!data?.overview) {
      return [];
    }

    const { overview } = data;

    return [
      {
        label: "Users",
        value: overview.totalUsers,
        note: `${overview.verifiedUsers} verified accounts and ${overview.totalAdmins} admins.`,
      },
      {
        label: "Products",
        value: overview.totalProducts,
        note: "All products currently available for browsing and moderation.",
      },
      {
        label: "Reviews",
        value: overview.totalReviews,
        note: `${overview.pendingReviews} pending and ${overview.approvedReviews} approved reviews.`,
      },
      {
        label: "Reward requests",
        value: overview.totalRewardRequests,
        note: `${overview.pendingRewardRequests} requests still waiting to be fulfilled.`,
      },
      {
        label: "User wallet balance",
        value: formatCurrency(overview.totalWalletBalance),
        note: "Combined wallet balance across member accounts.",
      },
      {
        label: "User points",
        value: overview.totalPoints,
        note: "Total points currently sitting across all accounts.",
      },
    ];
  }, [data]);

  if (status === "loading") {
    return <LoadingScreen label="Loading admin dashboard..." />;
  }

  if (status === "error") {
    return (
      <PageTransition className="page-wrap">
        <SiteChrome>
          <div className="app-shell">
            <div className="glass-panel mx-auto max-w-2xl rounded-[32px] px-6 py-8 text-center">
              <h1 className="text-3xl font-semibold">Admin panel unavailable</h1>
              <p className="section-copy mt-3">{error}</p>
              <Link className="primary-button mt-6" to="/">
                Back to catalog
              </Link>
            </div>
          </div>
        </SiteChrome>
      </PageTransition>
    );
  }

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
                <span className="eyebrow">Admin control room</span>
                <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">
                  Manage reviews, rewards, and platform health.
                </h1>
                <p className="section-copy mt-4 max-w-2xl">
                  This admin panel is built from the current backend models so you
                  can monitor users, products, review moderation, and reward
                  requests in one place.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className="primary-button" to="/dashboard">
                  Open member dashboard
                </Link>
                <Link className="secondary-button" to="/">
                  Browse products
                </Link>
              </div>
            </div>
          </Motion.section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card, index) => (
              <SummaryCard
                key={card.label}
                label={card.label}
                value={card.value}
                note={card.note}
                delay={index * 0.05}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <DataList
              title="Pending review moderation"
              subtitle="Newest reviews waiting on an admin decision."
              emptyText="There are no pending reviews right now."
              items={data?.recentPendingReviews || []}
              renderItem={(review) => (
                <div
                  key={review._id}
                  className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">
                      {review.productId?.title || "Unknown product"}
                    </p>
                    <span className="pill bg-amber-100/90 text-amber-800">
                      {review.status}
                    </span>
                  </div>
                  <p className="mt-2">
                    By {review.userId?.name || "Unknown user"} ({review.userId?.email || "No email"})
                  </p>
                  <p className="mt-2 line-clamp-3 text-slate-600">
                    {review.reviewText || "No review text submitted."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>Rating: {review.rating}/5</span>
                    <span>Submitted: {formatDate(review.createdAt)}</span>
                  </div>
                </div>
              )}
            />

            <DataList
              title="Reward requests"
              subtitle="Latest Amazon gift card requests across the platform."
              emptyText="No reward requests have been submitted yet."
              items={data?.recentRewardRequests || []}
              renderItem={(reward) => (
                <div
                  key={reward._id}
                  className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">
                      {reward.userId?.name || "Unknown user"}
                    </p>
                    <span
                      className={`pill ${
                        reward.status === "pending"
                          ? "bg-amber-100/90 text-amber-800"
                          : "bg-emerald-100/90 text-emerald-800"
                      }`}
                    >
                      {reward.status}
                    </span>
                  </div>
                  <p className="mt-2">{reward.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>Amount: {formatCurrency(reward.rewardAmount)}</span>
                    <span>Requested: {formatDate(reward.createdAt)}</span>
                  </div>
                </div>
              )}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <DataList
              title="Recent users"
              subtitle="Latest registrations and account verification status."
              emptyText="No users found."
              items={data?.recentUsers || []}
              renderItem={(user) => (
                <div
                  key={user._id}
                  className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="pill bg-slate-100/90 text-slate-700">
                        {user.role}
                      </span>
                      <span
                        className={`pill ${
                          user.isVerified
                            ? "bg-emerald-100/90 text-emerald-800"
                            : "bg-rose-100/90 text-rose-800"
                        }`}
                      >
                        {user.isVerified ? "verified" : "unverified"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2">{user.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>Points: {user.points || 0}</span>
                    <span>Wallet: {formatCurrency(user.walletBalance)}</span>
                    <span>Joined: {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              )}
            />

            <DataList
              title="Recently added products"
              subtitle="The newest catalog entries available in the store."
              emptyText="No products have been added yet."
              items={data?.recentProducts || []}
              renderItem={(product) => (
                <div
                  key={product._id}
                  className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">
                      {product.title}
                    </p>
                    <span className="pill">{product.category}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>Price: {formatCurrency(product.price)}</span>
                    <span>Rating: {Number(product.rating || 0).toFixed(1)}</span>
                    <span>Added: {formatDate(product.createdAt)}</span>
                  </div>
                </div>
              )}
            />
          </section>
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
