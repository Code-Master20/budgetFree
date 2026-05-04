import { motion as Motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import API from "../api";
import LoadingScreen from "../components/LoadingScreen";
import PageTransition from "../components/PageTransition";
import SiteChrome from "../components/SiteChrome";

function DetailGroup({ title, items, toneClass }) {
  if (!items?.length) {
    return null;
  }

  return (
    <div className="glass-panel-strong rounded-[28px] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span className={`pill ${toneClass}`}>{items.length} notes</span>
      </div>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlayButtonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.68L9.54 5.98A1 1 0 0 0 8 6.82Z" />
    </svg>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);
  const touchStartXRef = useRef(null);

  const mediaItems = useMemo(() => {
    if (!product) {
      return [];
    }

    const items = (product.images || []).filter(Boolean).map((src, index) => ({
      id: `image-${index}-${src}`,
      type: "image",
      src,
      label: `Image ${index + 1}`,
    }));

    if (product.video) {
      items.push({
        id: `video-${product.video}`,
        type: "video",
        src: product.video,
        label: "Video",
      });
    }

    return items;
  }, [product]);

  const activeMedia = mediaItems[activeMediaIndex] || null;

  const resetVideoPlayback = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    setIsVideoPlaying(false);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setStatus("loading");
        setError("");
        const res = await API.get(`/products/${id}`);
        resetVideoPlayback();
        setActiveMediaIndex(0);
        setProduct(res.data);
        setStatus("ready");
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || "Unable to load product");
        setStatus("error");
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!user || status !== "ready") {
      return;
    }

    API.post("/dashboard/visits", { productId: id }).catch(() => {});
  }, [id, status, user]);

  const showPreviousMedia = () => {
    if (mediaItems.length <= 1) {
      return;
    }

    resetVideoPlayback();
    setActiveMediaIndex((current) =>
      current === 0 ? mediaItems.length - 1 : current - 1,
    );
  };

  const showNextMedia = () => {
    if (mediaItems.length <= 1) {
      return;
    }

    resetVideoPlayback();
    setActiveMediaIndex((current) => (current + 1) % mediaItems.length);
  };

  const handleMediaTouchStart = (event) => {
    touchStartXRef.current = event.touches?.[0]?.clientX ?? null;
  };

  const handleMediaTouchEnd = (event) => {
    if (touchStartXRef.current === null) {
      return;
    }

    const touchEndX = event.changedTouches?.[0]?.clientX ?? touchStartXRef.current;
    const delta = touchStartXRef.current - touchEndX;
    touchStartXRef.current = null;

    if (Math.abs(delta) < 50) {
      return;
    }

    if (delta > 0) {
      showNextMedia();
      return;
    }

    showPreviousMedia();
  };

  const handlePlayVideo = async () => {
    if (!videoRef.current) {
      return;
    }

    try {
      await videoRef.current.play();
      setIsVideoPlaying(true);
    } catch {
      setIsVideoPlaying(false);
    }
  };

  if (status === "loading") {
    return <LoadingScreen label="Loading product details..." />;
  }

  if (status === "error") {
    return (
      <PageTransition className="page-wrap">
        <SiteChrome>
          <div className="app-shell">
            <div className="glass-panel mx-auto max-w-2xl rounded-[32px] px-6 py-8 text-center">
              <h1 className="text-3xl font-semibold">
                This product is unavailable
              </h1>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link className="secondary-button" to="/">
              Back to catalog
            </Link>
            <span className="pill">{product.category}</span>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <Motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              className="glass-panel overflow-hidden rounded-[34px] p-5 sm:p-6"
            >
              {mediaItems.length ? (
                <div className="space-y-4">
                  <div
                    className="relative overflow-hidden rounded-[28px] bg-slate-950"
                    onTouchStart={handleMediaTouchStart}
                    onTouchEnd={handleMediaTouchEnd}
                  >
                    <div
                      className="flex transition-transform duration-300 ease-out"
                      style={{
                        transform: `translateX(-${activeMediaIndex * 100}%)`,
                      }}
                    >
                      {mediaItems.map((item) => (
                        <div
                          key={item.id}
                          className="relative h-[320px] w-full shrink-0 sm:h-[420px]"
                        >
                          {item.type === "video" ? (
                            <>
                              <video
                                ref={item.id === activeMedia?.id ? videoRef : null}
                                src={item.src}
                                controls
                                playsInline
                                preload="metadata"
                                poster={product.images?.[0] || undefined}
                                onPlay={() => setIsVideoPlaying(true)}
                                onPause={() => setIsVideoPlaying(false)}
                                onEnded={() => setIsVideoPlaying(false)}
                                className="h-full w-full object-cover"
                              />
                              {item.id === activeMedia?.id && !isVideoPlaying ? (
                                <button
                                  type="button"
                                  onClick={handlePlayVideo}
                                  className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-slate-900 shadow-lg transition hover:scale-105"
                                  aria-label="Play product video"
                                >
                                  <PlayButtonIcon />
                                </button>
                              ) : null}
                              <div className="absolute left-4 top-4">
                                <span className="pill bg-slate-950/70 text-white">
                                  Product video
                                </span>
                              </div>
                            </>
                          ) : (
                            <img
                              src={item.src}
                              alt={`${product.title} - ${item.label}`}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {mediaItems.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={showPreviousMedia}
                          className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/60 text-xl text-white backdrop-blur transition hover:bg-slate-950/80"
                          aria-label="Show previous product media"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={showNextMedia}
                          className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/60 text-xl text-white backdrop-blur transition hover:bg-slate-950/80"
                          aria-label="Show next product media"
                        >
                          ›
                        </button>
                      </>
                    ) : null}
                  </div>

                  {mediaItems.length > 1 ? (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {mediaItems.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            resetVideoPlayback();
                            setActiveMediaIndex(index);
                          }}
                          className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-[18px] border transition ${
                            index === activeMediaIndex
                              ? "border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.45)]"
                              : "border-slate-200/80"
                          }`}
                          aria-label={`Show ${item.label.toLowerCase()}`}
                        >
                          {item.type === "video" ? (
                            <>
                              <video
                                src={item.src}
                                muted
                                playsInline
                                preload="metadata"
                                poster={product.images?.[0] || undefined}
                                className="h-full w-full object-cover"
                              />
                              <span className="absolute inset-0 flex items-center justify-center bg-slate-950/30 text-white">
                                <PlayButtonIcon />
                              </span>
                            </>
                          ) : (
                            <img
                              src={item.src}
                              alt={item.label}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-[320px] w-full items-end rounded-[28px] bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100 p-6 sm:h-[420px]">
                  <span className="pill bg-white/75 text-slate-700">
                    Product preview unavailable
                  </span>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="pill">
                  Rating {Number(product.rating || 0).toFixed(1)}
                </span>
                {product.features?.length ? (
                  <span className="pill bg-amber-100/80 text-amber-800">
                    {product.features.length} highlighted features
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
                {product.title}
              </h1>
              <p className="section-copy mt-4 text-base">
                {product.description || "No extended description has been added yet."}
              </p>
            </Motion.section>

            <Motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="space-y-6 xl:sticky xl:top-28 xl:self-start"
            >
              <div className="glass-panel-strong rounded-[34px] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Price
                </p>
                <p className="mt-3 text-4xl font-semibold text-emerald-700">
                  Rs {product.price ?? "N/A"}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Ready to continue? Review the details here, then continue to
                  the source store in a new tab whenever you are comfortable.
                  Pricing, stock, delivery, and final checkout terms are set by
                  the source store.
                </p>
                <a
                  href={product.affiliateLink}
                  target="_blank"
                  rel="noreferrer"
                  className="primary-button mt-6 w-full"
                >
                  Buy from source
                </a>
              </div>

              <div className="glass-panel rounded-[34px] p-6">
                <h2 className="text-xl font-semibold">Quick read</h2>
                <div className="soft-divider my-5" />
                <dl className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Category</dt>
                    <dd className="font-semibold text-slate-900">
                      {product.category}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Rating</dt>
                    <dd className="font-semibold text-slate-900">
                      {Number(product.rating || 0).toFixed(1)} / 5
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Pros listed</dt>
                    <dd className="font-semibold text-slate-900">
                      {product.pros?.length || 0}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Cons listed</dt>
                    <dd className="font-semibold text-slate-900">
                      {product.cons?.length || 0}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="glass-panel-strong rounded-[34px] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Store note
                </p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <div className="rounded-[22px] bg-white/70 px-4 py-4">
                    Disclosure: BudgetFree may earn a commission if you buy
                    through a store link on this page.
                  </div>
                  <div className="rounded-[22px] bg-white/70 px-4 py-4">
                    Availability, pricing, offers, and delivery timelines are
                    controlled by the source store and can change at any time.
                  </div>
                </div>
              </div>
            </Motion.aside>
          </div>

          <section className="grid gap-6 lg:grid-cols-3">
            <DetailGroup
              title="Features"
              items={product.features}
              toneClass="bg-emerald-100/80 text-emerald-800"
            />
            <DetailGroup
              title="Pros"
              items={product.pros}
              toneClass="bg-sky-100/80 text-sky-800"
            />
            <DetailGroup
              title="Cons"
              items={product.cons}
              toneClass="bg-rose-100/80 text-rose-800"
            />
          </section>
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
