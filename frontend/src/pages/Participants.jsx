import { motion as Motion } from "framer-motion";
import { useEffect, useState } from "react";
import API from "../api";
import LoadingScreen from "../components/LoadingScreen";
import PageTransition from "../components/PageTransition";
import SiteChrome from "../components/SiteChrome";

function formatCurrency(amount) {
  return `Rs ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function SummaryCard({ label, value, note }) {
  return (
    <div className="glass-panel-strong rounded-[24px] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{note}</p>
    </div>
  );
}

export default function Participants() {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [likingReviewIds, setLikingReviewIds] = useState({});

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setStatus("loading");
        setError("");
        const response = await API.get("/participants");
        setData(response.data);
        setStatus("ready");
      } catch (fetchError) {
        setError(
          fetchError.response?.data?.message ||
            "Unable to load participants right now.",
        );
        setStatus("error");
      }
    };

    fetchParticipants();
  }, []);

  const handleReviewLike = async (productId, reviewId) => {
    if (!reviewId) {
      return;
    }

    try {
      setLikingReviewIds((current) => ({ ...current, [reviewId]: true }));
      const response = await API.post(`/reviews/${reviewId}/like`);
      const { liked, likesCount } = response.data;

      setData((currentData) => {
        if (!currentData) {
          return currentData;
        }

        return {
          ...currentData,
          productParticipation: currentData.productParticipation.map((entry) => {
            if (entry.product.id !== productId) {
              return entry;
            }

            return {
              ...entry,
              participants: entry.participants.map((participant) =>
                participant.reviewId === reviewId
                  ? {
                      ...participant,
                      viewerHasLiked: liked,
                      likesCount,
                    }
                  : participant,
              ),
            };
          }),
        };
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update the like right now.",
      );
    } finally {
      setLikingReviewIds((current) => {
        const nextState = { ...current };
        delete nextState[reviewId];
        return nextState;
      });
    }
  };

  if (status === "loading") {
    return <LoadingScreen label="Loading participants..." />;
  }

  if (status === "error") {
    return (
      <PageTransition className="page-wrap">
        <SiteChrome>
          <div className="app-shell">
            <div className="glass-panel mx-auto max-w-2xl rounded-[32px] px-6 py-8 text-center">
              <h1 className="text-3xl font-semibold">
                Participants are unavailable
              </h1>
              <p className="section-copy mt-3">{error}</p>
            </div>
          </div>
        </SiteChrome>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="page-wrap">
      <SiteChrome>
        <div className="app-shell space-y-8">
          <Motion.header
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-panel flex flex-col gap-6 rounded-[32px] px-5 py-5 sm:px-7"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="eyebrow">Participants</span>
                <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">
                  See who is reviewing, earning points, and receiving rewards.
                </h1>
                <p className="section-copy mt-4 max-w-2xl">
                  This public page highlights approved reviewers, the first 10
                  highest review-point earners, and everyone who has received an
                  Amazon Pay gift card through BudgetFree.
                </p>
              </div>

              <div className="glass-panel-strong max-w-xl rounded-[28px] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Defined here
                </p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <div className="rounded-[22px] bg-white/70 px-4 py-4">
                    <span className="font-semibold text-slate-900">
                      Participants:
                    </span>{" "}
                    {data.definitions.participants}
                  </div>
                  <div className="rounded-[22px] bg-white/70 px-4 py-4">
                    <span className="font-semibold text-slate-900">
                      High gainers:
                    </span>{" "}
                    {data.definitions.highGainers}
                  </div>
                  <div className="rounded-[22px] bg-white/70 px-4 py-4">
                    <span className="font-semibold text-slate-900">
                      Amazon Pay recipients:
                    </span>{" "}
                    {data.definitions.amazonPayRecipients}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <SummaryCard
                label="Participants"
                value={data.summary.participantsCount}
                note="Users with at least one approved review."
              />
              <SummaryCard
                label="Reviewed Products"
                value={data.summary.reviewedProductsCount}
                note="Products that already have public approved reviews."
              />
              <SummaryCard
                label="Approved Reviews"
                value={data.summary.approvedReviewsCount}
                note="Reviews currently visible in approved participant totals."
              />
              <SummaryCard
                label="Gift Card Users"
                value={data.summary.amazonPayRecipientsCount}
                note="Users who have received an Amazon Pay gift card."
              />
            </div>
          </Motion.header>

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-panel rounded-[32px] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    First 10 High Gainers
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Review-point leaderboard
                  </h2>
                </div>
                <span className="pill">
                  {data.topPointEarners.length} ranked users
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {data.topPointEarners.length ? (
                  data.topPointEarners.map((participant, index) => (
                    <div
                      key={participant.userId}
                      className="rounded-[24px] bg-white/75 px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Rank {index + 1}
                          </p>
                          <p className="mt-1 text-xl font-semibold text-slate-900">
                            {participant.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-semibold text-emerald-700">
                            {participant.reviewPointsEarned} pts
                          </p>
                          <p className="text-xs text-slate-500">
                            from approved reviews
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[18px] border border-slate-200/70 bg-white/80 px-3 py-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Approved reviews
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {participant.approvedReviewsCount}
                          </p>
                        </div>
                        <div className="rounded-[18px] border border-slate-200/70 bg-white/80 px-3 py-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Current points
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {participant.currentPoints}
                          </p>
                        </div>
                        <div className="rounded-[18px] border border-slate-200/70 bg-white/80 px-3 py-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Wallet balance
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {formatCurrency(participant.walletBalance)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] bg-white/75 px-4 py-5 text-sm text-slate-600">
                    No approved review earners are available yet.
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel-strong rounded-[32px] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Amazon Pay Gift Cards
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    All recipient users
                  </h2>
                </div>
                <span className="pill bg-amber-100/80 text-amber-800">
                  {data.amazonPayRecipients.length} users listed
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {data.amazonPayRecipients.length ? (
                  data.amazonPayRecipients.map((recipient) => (
                    <div
                      key={recipient.userId}
                      className="rounded-[24px] bg-white/80 px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">
                            {recipient.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            Last sent on {formatDate(recipient.lastSentAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-semibold text-amber-700">
                            {formatCurrency(recipient.totalRewardAmount)}
                          </p>
                          <p className="text-xs text-slate-500">
                            across {recipient.totalGiftCardsSent} gift card
                            {recipient.totalGiftCardsSent === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {recipient.rewards.map((reward, index) => (
                          <span
                            key={`${recipient.userId}-${reward.sentAt}-${index}`}
                            className="pill bg-white/85 text-slate-700"
                          >
                            {formatCurrency(reward.rewardAmount)} on{" "}
                            {formatDate(reward.sentAt)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] bg-white/75 px-4 py-5 text-sm text-slate-600">
                    No Amazon Pay gift cards have been sent yet.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[32px] p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Product Participants
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Approved reviewers by product
                </h2>
              </div>
              <p className="section-copy max-w-2xl text-sm">
                Every card below shows the product details and the users whose
                approved reviews are publicly counted for that product.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {data.productParticipation.length ? (
                data.productParticipation.map((entry) => (
                  <div
                    key={entry.product.id}
                    className="glass-panel-strong rounded-[30px] p-5"
                  >
                    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                      <div className="rounded-[26px] bg-white/80 p-4">
                        {entry.product.image ? (
                          <img
                            src={entry.product.image}
                            alt={entry.product.title}
                            className="h-52 w-full rounded-[22px] object-cover"
                          />
                        ) : (
                          <div className="flex h-52 items-end rounded-[22px] bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100 p-4">
                            <span className="pill bg-white/80 text-slate-700">
                              Product image unavailable
                            </span>
                          </div>
                        )}

                        <div className="mt-4 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            <span className="pill">{entry.product.category}</span>
                            <span className="pill bg-amber-100/80 text-amber-800">
                              Rating {Number(entry.product.rating || 0).toFixed(1)}
                            </span>
                            <span className="pill bg-white/80 text-slate-700">
                              {entry.approvedReviewsCount} approved reviews
                            </span>
                          </div>

                          <h3 className="text-2xl font-semibold text-slate-900">
                            {entry.product.title}
                          </h3>
                          <p className="text-lg font-semibold text-emerald-700">
                            {formatCurrency(entry.product.price)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {entry.participants.map((participant) => (
                          <div
                            key={`${entry.product.id}-${participant.userId}`}
                            className="rounded-[24px] bg-white/80 px-4 py-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-lg font-semibold text-slate-900">
                                  {participant.name}
                                </p>
                                <p className="text-sm text-slate-500">
                                  Added on {formatDate(participant.submittedAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-slate-900">
                                  {participant.rating}/5 rating
                                </p>
                                <p className="text-sm text-emerald-700">
                                  {participant.reviewPointsEarned} review points
                                </p>
                              </div>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                              {participant.reviewText}
                            </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleReviewLike(
                                  entry.product.id,
                                  participant.reviewId,
                                )
                              }
                              disabled={Boolean(likingReviewIds[participant.reviewId])}
                              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                participant.viewerHasLiked
                                  ? "bg-emerald-700 text-white shadow-[0_10px_20px_rgba(20,99,86,0.18)]"
                                  : "border border-slate-200 bg-white/85 text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              {participant.viewerHasLiked ? "Liked" : "Like"} ·{" "}
                              {participant.likesCount}
                            </button>
                            <span className="pill bg-sky-100/80 text-sky-800">
                              Approved review
                            </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[28px] bg-white/75 px-5 py-6 text-sm text-slate-600">
                  No approved product participants are available yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
