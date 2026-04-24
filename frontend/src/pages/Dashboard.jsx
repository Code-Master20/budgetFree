import { motion as Motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import API from "../api";
import LoadingScreen from "../components/LoadingScreen";
import OtpVerificationCard from "../components/OtpVerificationCard";
import PageTransition from "../components/PageTransition";
import SiteChrome from "../components/SiteChrome";
import { fetchUser } from "../redux/authSlice";

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

function StatusPill({ status }) {
  const toneClass =
    status === "approved" || status === "sent"
      ? "bg-emerald-100/90 text-emerald-800"
      : status === "rejected"
        ? "bg-rose-100/90 text-rose-800"
        : "bg-amber-100/90 text-amber-800";

  return <span className={`pill ${toneClass}`}>{status}</span>;
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
      <p className="mt-4 break-words text-3xl font-semibold text-slate-900">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>
    </Motion.article>
  );
}

function SectionCard({ title, subtitle, children, badge }) {
  return (
    <section className="glass-panel rounded-[34px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="section-copy mt-2">{subtitle}</p>
        </div>
        {badge ? <div>{badge}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rewardOtpCode, setRewardOtpCode] = useState("");
  const [rewardOtpMessage, setRewardOtpMessage] = useState("");
  const [sendingRewardOtp, setSendingRewardOtp] = useState(false);
  const [verifyingRewardOtp, setVerifyingRewardOtp] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [rewardEmail, setRewardEmail] = useState("");
  const [submitting, setSubmitting] = useState({
    convert: false,
      reward: false,
  });
  const hasRewardOtpVerification = Boolean(user?.otpVerification?.rewardRequest);

  const loadDashboard = async ({ showLoader = true } = {}) => {
    try {
      if (showLoader) {
        setStatus("loading");
      }

      setError("");
      const response = await API.get("/dashboard");
      setDashboard(response.data);
      setRewardEmail((current) => current || response.data.profile.email || "");
      setStatus("ready");
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message || "Unable to load your dashboard",
      );
      setStatus("error");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleConvertPoints = async () => {
    try {
      setSubmitting((current) => ({ ...current, convert: true }));
      setMessage("");
      setError("");
      await API.post("/points/convert");
      await Promise.all([loadDashboard({ showLoader: false }), dispatch(fetchUser())]);
      setMessage("Points converted successfully.");
    } catch (actionError) {
      setError(
        actionError.response?.data?.message || "Unable to convert points",
      );
    } finally {
      setSubmitting((current) => ({ ...current, convert: false }));
    }
  };

  const handleRewardRequest = async (event) => {
    event.preventDefault();

    try {
      setSubmitting((current) => ({ ...current, reward: true }));
      setMessage("");
      setError("");
      await API.post("/rewards/request", { email: rewardEmail.trim() });
      await Promise.all([loadDashboard({ showLoader: false }), dispatch(fetchUser())]);
      setMessage("Amazon Pay gift card request submitted.");
    } catch (actionError) {
      if (actionError.response?.data?.code === "OTP_REQUIRED") {
        setError("Verify the email OTP before submitting your gift card request.");
        await dispatch(fetchUser());
        return;
      }

      setError(
        actionError.response?.data?.message ||
          "Unable to submit your gift card request",
      );
    } finally {
      setSubmitting((current) => ({ ...current, reward: false }));
    }
  };

  const handleSendRewardOtp = async () => {
    try {
      setSendingRewardOtp(true);
      setError("");
      setRewardOtpMessage("");
      await API.post("/auth/otp/request", { purpose: "reward_request" });
      setRewardOtpMessage("A 6-digit OTP was sent to your email.");
    } catch (actionError) {
      setError(actionError.response?.data?.message || "Unable to send reward OTP");
    } finally {
      setSendingRewardOtp(false);
    }
  };

  const handleVerifyRewardOtp = async () => {
    try {
      setVerifyingRewardOtp(true);
      setError("");
      setRewardOtpMessage("");
      await API.post("/auth/otp/verify", {
        purpose: "reward_request",
        code: rewardOtpCode.trim(),
      });
      setRewardOtpCode("");
      setRewardOtpMessage("Reward OTP verified. You can submit the request now.");
      await dispatch(fetchUser());
    } catch (actionError) {
      setError(actionError.response?.data?.message || "Unable to verify reward OTP");
    } finally {
      setVerifyingRewardOtp(false);
    }
  };

  if (status === "loading") {
    return <LoadingScreen label="Loading your dashboard..." />;
  }

  if (status === "error") {
    return (
      <PageTransition className="page-wrap">
        <SiteChrome>
          <div className="app-shell">
            <div className="glass-panel mx-auto max-w-2xl rounded-[32px] px-6 py-8 text-center">
              <h1 className="text-3xl font-semibold">Dashboard unavailable</h1>
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

  const overview = dashboard?.overview || {};
  const reviewCounts = overview.reviewCounts || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  const latestRewardRequest = overview.latestRewardRequest;

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
                  Welcome back, {dashboard?.profile?.name || "Member"}.
                </h1>
                <p className="section-copy mt-4 max-w-2xl">
                  Check your recent activity, review status, points, wallet
                  balance, and Amazon Pay gift card requests.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link className="primary-button" to="/">
                  Browse products
                </Link>
                <Link className="secondary-button" to="/">
                  Continue searching
                </Link>
              </div>
            </div>
          </Motion.section>

          {message ? (
            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Reward points",
                value: overview.points || 0,
                note: overview.canConvertPoints
                  ? "You are eligible to convert points to wallet balance."
                  : "Reach 100 points to unlock the next conversion.",
              },
              {
                label: "Wallet balance",
                value: formatCurrency(overview.walletBalance),
                note: "Reach Rs 500 to request an Amazon Pay gift card.",
              },
              {
                label: "Pending reviews",
                value: reviewCounts.pending,
                note: "These reviews are still waiting for admin moderation.",
              },
              {
                label: "Gift card status",
                value: latestRewardRequest?.status || "none",
                note: latestRewardRequest
                  ? `Latest request submitted on ${formatDate(latestRewardRequest.createdAt)}.`
                  : "No Amazon Pay gift card request submitted yet.",
              },
            ].map((card, index) => (
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
            <SectionCard
              title="Points and wallet"
              subtitle="Track your balance and convert points when eligible."
              badge={
                <span className="pill bg-slate-100/90 text-slate-700">
                  Last conversion: {formatDate(overview.lastConversion)}
                </span>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white/72 px-4 py-4">
                  <p className="text-sm text-slate-500">Current points</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {overview.points || 0}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Approved reviews add points to your account.
                  </p>
                </div>
                <div className="rounded-[24px] bg-white/72 px-4 py-4">
                  <p className="text-sm text-slate-500">Current wallet</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {formatCurrency(overview.walletBalance)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Use your wallet balance when you request a gift card.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConvertPoints}
                disabled={!overview.canConvertPoints || submitting.convert}
                className="primary-button mt-5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting.convert ? "Converting..." : "Convert 100 points to Rs 50"}
              </button>
            </SectionCard>

            <SectionCard
              title="Amazon Pay gift card"
              subtitle="See your current request status or submit a new request."
              badge={
                latestRewardRequest ? (
                  <StatusPill status={latestRewardRequest.status} />
                ) : (
                  <span className="pill bg-slate-100/90 text-slate-700">
                    No request yet
                  </span>
                )
              }
            >
              {latestRewardRequest ? (
                <div className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">
                    Latest Amazon Pay request
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>Amount: {formatCurrency(latestRewardRequest.rewardAmount)}</span>
                    <span>Submitted: {formatDate(latestRewardRequest.createdAt)}</span>
                  </div>
                  {latestRewardRequest.giftCardLink ? (
                    <a
                      className="primary-button mt-4"
                      href={latestRewardRequest.giftCardLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open gift card
                    </a>
                  ) : null}
                </div>
              ) : null}

              <form onSubmit={handleRewardRequest} className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">
                    Gift card delivery email
                  </span>
                  <input
                    type="email"
                    value={rewardEmail}
                    onChange={(event) => setRewardEmail(event.target.value)}
                    className="field"
                    placeholder="you@example.com"
                  />
                </label>

                {!hasRewardOtpVerification ? (
                  <OtpVerificationCard
                    title="Verify reward request OTP"
                    description="Before we submit a gift card request, send a one-time code to your email and verify it here."
                    code={rewardOtpCode}
                    onCodeChange={setRewardOtpCode}
                    message={rewardOtpMessage}
                    onSend={handleSendRewardOtp}
                    onVerify={handleVerifyRewardOtp}
                    sending={sendingRewardOtp}
                    verifying={verifyingRewardOtp}
                    sendLabel="Send reward OTP"
                    verifyLabel="Verify OTP"
                  />
                ) : (
                  <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Security check complete. Your reward request is unlocked for a
                    limited time.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    !overview.canRequestGiftCard ||
                    !rewardEmail.trim() ||
                    !hasRewardOtpVerification ||
                    submitting.reward
                  }
                  className="primary-button disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting.reward
                    ? "Submitting..."
                    : "Request Amazon Pay gift card"}
                </button>

                {!overview.canRequestGiftCard ? (
                  <p className="text-sm text-slate-600">
                    You need at least Rs 500 in wallet balance and no pending gift
                    card request to submit a new request.
                  </p>
                ) : null}
              </form>
            </SectionCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              title="Recently searched products"
              subtitle="Your latest saved search terms."
              badge={
                <span className="pill bg-slate-100/90 text-slate-700">
                  {dashboard?.recentSearches?.length || 0} saved
                </span>
              }
            >
              <div className="space-y-3">
                {dashboard?.recentSearches?.length ? (
                  dashboard.recentSearches.map((entry) => (
                    <div
                      key={`${entry.query}-${entry.searchedAt}`}
                      className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600"
                    >
                      <p className="font-semibold text-slate-900">{entry.query}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        Searched on {formatDate(entry.searchedAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600">
                    Search the catalog while logged in and your recent search terms
                    will appear here.
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Recently visited products"
              subtitle="The latest product pages you opened."
              badge={
                <span className="pill bg-slate-100/90 text-slate-700">
                  {dashboard?.recentlyVisitedProducts?.length || 0} visits
                </span>
              }
            >
              <div className="space-y-4">
                {dashboard?.recentlyVisitedProducts?.length ? (
                  dashboard.recentlyVisitedProducts.map((entry) => (
                    <Link
                      key={`${entry.product?._id}-${entry.visitedAt}`}
                      to={`/product/${entry.product?._id}`}
                      className="block rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">
                          {entry.product?.title}
                        </p>
                        <span className="pill">{entry.product?.category}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>Price: {formatCurrency(entry.product?.price)}</span>
                        <span>
                          Rating: {Number(entry.product?.rating || 0).toFixed(1)}
                        </span>
                        <span>Visited: {formatDate(entry.visitedAt)}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600">
                    Open a product page while logged in and it will show up in this
                    list.
                  </div>
                )}
              </div>
            </SectionCard>
          </section>

          <SectionCard
            title="Your reviews"
            subtitle="See review status, likes, and rejection reasons. Review images stay hidden here."
            badge={
              <div className="flex flex-wrap gap-2">
                <span className="pill bg-amber-100/90 text-amber-800">
                  Pending {reviewCounts.pending}
                </span>
                <span className="pill bg-emerald-100/90 text-emerald-800">
                  Approved {reviewCounts.approved}
                </span>
                <span className="pill bg-rose-100/90 text-rose-800">
                  Rejected {reviewCounts.rejected}
                </span>
              </div>
            }
          >
            <div className="space-y-4">
              {dashboard?.reviews?.length ? (
                dashboard.reviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded-[26px] bg-white/72 px-4 py-4 text-sm text-slate-600"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">
                          {review.productId?.title || "Unknown product"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span>Rating: {review.rating}/5</span>
                          <span>Likes: {review.likesCount || 0}</span>
                          <span>Submitted: {formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                      <StatusPill status={review.status} />
                    </div>

                    <p className="mt-4 leading-6">{review.reviewText}</p>

                    {review.status === "rejected" && review.rejectionReason ? (
                      <div className="mt-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                        Rejection reason: {review.rejectionReason}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600">
                  You have not submitted any reviews yet.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Gift card request history"
            subtitle="Your latest Amazon Pay reward requests and their status."
            badge={
              <span className="pill bg-slate-100/90 text-slate-700">
                {dashboard?.rewardRequests?.length || 0} requests
              </span>
            }
          >
            <div className="space-y-4">
              {dashboard?.rewardRequests?.length ? (
                dashboard.rewardRequests.map((request) => (
                  <div
                    key={request._id}
                    className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">
                        Amazon Pay gift card
                      </p>
                      <StatusPill status={request.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>Amount: {formatCurrency(request.rewardAmount)}</span>
                      <span>Requested: {formatDate(request.createdAt)}</span>
                      <span>Delivery: {request.email}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] bg-white/72 px-4 py-4 text-sm text-slate-600">
                  Your reward request history will appear here once you submit a
                  request.
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
