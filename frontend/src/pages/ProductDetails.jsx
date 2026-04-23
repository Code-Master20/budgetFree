import { motion as Motion } from "framer-motion";
import { useEffect, useState } from "react";
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

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setStatus("loading");
        setError("");
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
        setStatus("ready");
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || "Unable to load product");
        setStatus("error");
      }
    };

    fetchProduct();
  }, [id]);

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
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="h-[320px] w-full rounded-[28px] object-cover sm:h-[420px]"
                />
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
                  Ready to compare on the store page? Open the affiliate link in a
                  new tab when you are comfortable with the details here.
                </p>
                <a
                  href={product.affiliateLink}
                  target="_blank"
                  rel="noreferrer"
                  className="primary-button mt-6 w-full"
                >
                  Open affiliate link
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
                  Snapshot
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Features", value: product.features?.length || 0 },
                    { label: "Pros", value: product.pros?.length || 0 },
                    { label: "Cons", value: product.cons?.length || 0 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[22px] bg-white/70 px-3 py-4"
                    >
                      <p className="text-2xl font-semibold text-slate-900">
                        {item.value}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {item.label}
                      </p>
                    </div>
                  ))}
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
