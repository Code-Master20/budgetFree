import { motion as Motion } from "framer-motion";
import { useDeferredValue, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import SiteChrome from "../components/SiteChrome";
import { fetchProducts } from "../redux/productSlice";

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.36,
      delay: index * 0.05,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function ProductSkeleton({ index }) {
  return (
    <Motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="glass-panel overflow-hidden rounded-[28px] p-4"
    >
      <div className="h-44 animate-pulse rounded-[22px] bg-slate-200/80" />
      <div className="mt-4 h-4 w-20 animate-pulse rounded-full bg-emerald-100" />
      <div className="mt-4 h-7 w-3/4 animate-pulse rounded-full bg-slate-200/80" />
      <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-200/60" />
      <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-slate-200/60" />
    </Motion.div>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const deferredSearch = useDeferredValue(search);

  const { products, loading, error, total } = useSelector(
    (state) => state.products,
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const haystack = `${product.title} ${product.description || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(
        deferredSearch.trim().toLowerCase(),
      );

      return matchesCategory && matchesSearch;
    })
    .sort((left, right) => {
      if (sortBy === "price-low") {
        return Number(left.price || 0) - Number(right.price || 0);
      }

      if (sortBy === "price-high") {
        return Number(right.price || 0) - Number(left.price || 0);
      }

      if (sortBy === "rating") {
        return Number(right.rating || 0) - Number(left.rating || 0);
      }

      return 0;
    });

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
            {!user ? (
              <div className="glass-panel-strong flex flex-col gap-4 rounded-[28px] p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Start here
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Need an account?
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Use these quick links to login or sign up from the homepage.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link className="secondary-button" to="/login">
                    Login
                  </Link>
                  <Link className="primary-button" to="/register">
                    Sign up
                  </Link>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <span className="eyebrow">Smarter buying, calmer browsing</span>
                <div>
                  <h1 className="text-3xl font-semibold sm:text-5xl">
                    budgetFree helps your shortlist feel clear, not crowded.
                  </h1>
                  <p className="section-copy mt-4 max-w-2xl">
                    Discover practical products, compare standout details, and
                    move from curiosity to confidence without the noisy marketplace
                    feel.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  className="primary-button"
                  to={user ? "/dashboard" : "/login"}
                >
                  {user ? "Open dashboard" : "Login"}
                </Link>
                <Link
                  className="secondary-button"
                  to={user ? "/dashboard" : "/register"}
                >
                  {user ? "View rewards" : "Sign up"}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  label: "Live picks",
                  value: total || products.length || "10+",
                  note: "Fresh listings surfaced from your catalog.",
                },
                {
                  label: "Member reward flow",
                  value: user?.points ?? "Track",
                  note: "Your points stay visible without digging around.",
                },
                {
                  label: "Browsing style",
                  value: "Faster",
                  note: "Less clutter, stronger hierarchy, smoother transitions.",
                },
              ].map((stat, index) => (
                <Motion.div
                  key={stat.label}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
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
                  What feels better now
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    "Clearer hierarchy across cards and sections.",
                    "Smoother movement between routes and states.",
                    "Filters and search that feel more deliberate.",
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
                  Quick path
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[22px] bg-white/70 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Search, sort, and shortlist in one place
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      The catalog now keeps more of the decision-making flow on a
                      single screen.
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-white/70 px-4 py-4 text-sm text-slate-600">
                    Browse featured picks, compare essentials, then open the product
                    detail page only when you want the deeper view.
                  </div>
                </div>
              </div>
            </div>
          </Motion.header>

          <section className="glass-panel rounded-[32px] p-5 sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="eyebrow">Explore</span>
                <h2 className="section-title mt-3">A smoother catalog view</h2>
                <p className="section-copy mt-3 max-w-2xl">
                  Filter by category, search instantly, and scan the strongest
                  signals before you click through.
                </p>
              </div>

              <label className="block w-full max-w-md">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Search products
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="field"
                  placeholder="Search by name or description"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const isActive = category === activeCategory;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={
                          isActive
                            ? "primary-button px-4 py-2 text-xs"
                            : "secondary-button px-4 py-2 text-xs"
                        }
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-sm text-slate-600">
                    <span className="mr-2 font-medium">Sort</span>
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className="field min-w-[150px] py-2"
                    >
                      <option value="featured">Featured</option>
                      <option value="rating">Top rated</option>
                      <option value="price-low">Price: low to high</option>
                      <option value="price-high">Price: high to low</option>
                    </select>
                  </label>

                  {(activeCategory !== "All" || deferredSearch) && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory("All");
                        setSearch("");
                      }}
                      className="secondary-button px-4 py-2 text-xs"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              <div className="glass-panel-strong flex flex-wrap items-center justify-between gap-3 rounded-[24px] px-4 py-3 text-sm text-slate-600">
                <p>
                  Showing{" "}
                  <span className="font-semibold text-slate-900">
                    {filteredProducts.length}
                  </span>{" "}
                  products
                  {deferredSearch ? (
                    <>
                      {" "}
                      for{" "}
                      <span className="font-semibold text-slate-900">
                        "{deferredSearch}"
                      </span>
                    </>
                  ) : null}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Smooth shortlist mode
                </p>
              </div>
            </div>

            {error ? (
              <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {loading
                ? Array.from({ length: 6 }, (_, index) => (
                    <ProductSkeleton key={index} index={index} />
                  ))
                : filteredProducts.map((product, index) => (
                    <Motion.article
                      key={product._id}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ y: -8 }}
                      className="glass-panel group overflow-hidden rounded-[28px]"
                    >
                      <Link className="block p-4" to={`/product/${product._id}`}>
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="h-52 w-full rounded-[22px] object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-52 w-full items-end rounded-[22px] bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100 p-5">
                            <span className="pill bg-white/65 text-slate-700">
                              No preview available
                            </span>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="pill">{product.category}</span>
                          <span className="text-sm font-medium text-amber-600">
                            {Number(product.rating || 0).toFixed(1)} / 5
                          </span>
                        </div>

                        <h3 className="mt-4 text-xl font-semibold text-slate-900">
                          {product.title}
                        </h3>
                        <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">
                          {product.description ||
                            "A concise product summary will appear here."}
                        </p>

                        <div className="mt-5 flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                              Price
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-emerald-700">
                              Rs {product.price ?? "N/A"}
                            </p>
                          </div>

                          <span className="secondary-button px-4 py-2 text-xs">
                            View details
                          </span>
                        </div>
                      </Link>
                    </Motion.article>
                  ))}
            </div>

            {!loading && filteredProducts.length === 0 ? (
              <div className="glass-panel-strong mt-8 rounded-[28px] px-6 py-8 text-center">
                <h3 className="text-2xl font-semibold">Nothing matches yet</h3>
                <p className="section-copy mt-3">
                  Try another keyword or switch the category to widen the shortlist.
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
