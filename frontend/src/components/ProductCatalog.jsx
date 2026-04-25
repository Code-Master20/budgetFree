import { motion as Motion } from "framer-motion";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import API from "../api";
import { fetchProducts } from "../redux/productSlice";

const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "best",
  "buy",
  "for",
  "from",
  "in",
  "is",
  "of",
  "on",
  "or",
  "product",
  "products",
  "the",
  "to",
  "with",
]);

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

function normalizeSearchTerm(value) {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue.length > 3 && normalizedValue.endsWith("s")) {
    return normalizedValue.slice(0, -1);
  }

  return normalizedValue;
}

function extractSearchTerms(search) {
  const rawTerms = search
    .split(/[^a-z0-9]+/i)
    .map(normalizeSearchTerm)
    .filter((term) => term.length >= 2);

  const meaningfulTerms = rawTerms.filter((term) => !SEARCH_STOP_WORDS.has(term));
  return meaningfulTerms.length ? meaningfulTerms : rawTerms;
}

export default function ProductCatalog({
  endpoint = "/products",
  requestParams = {},
  title = "Browse and compare products",
  subtitle = "Filter by category, search by name, and compare price and rating before opening a product page.",
  eyebrow = "Products",
  showCategoryFilters = true,
  categoryOptions = null,
  leadingControl = null,
  emptyStateTitle = "Nothing matches yet",
  emptyStateCopy = "Try another keyword or category to find more products.",
  staticBadge = "Focused picks",
  fetchLimit = 300,
}) {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    showCategoryFilters ? "All" : null,
  );
  const [sortBy, setSortBy] = useState("featured");
  const deferredSearch = useDeferredValue(search);
  const lastTrackedSearch = useRef("");

  const { products, loading, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const normalizedSearch = deferredSearch.trim();
  const searchTerms = extractSearchTerms(normalizedSearch);
  const requestParamsKey = JSON.stringify(requestParams);

  useEffect(() => {
    dispatch(
      fetchProducts({
        endpoint,
        params: {
          limit: fetchLimit,
          ...requestParams,
        },
      }),
    );
  }, [dispatch, endpoint, fetchLimit, requestParamsKey]);

  useEffect(() => {
    setActiveCategory(showCategoryFilters ? "All" : null);
  }, [showCategoryFilters, endpoint, requestParamsKey]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const normalizedQuery = normalizedSearch;

    if (
      normalizedQuery.length < 2 ||
      normalizedQuery.toLowerCase() === lastTrackedSearch.current.toLowerCase()
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      API.post("/dashboard/searches", {
        query: normalizedQuery,
      })
        .then(() => {
          lastTrackedSearch.current = normalizedQuery;
        })
        .catch(() => {});
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [normalizedSearch, user]);

  const categories = categoryOptions?.length
    ? ["All", ...categoryOptions]
    : ["All", ...new Set(products.map((product) => product.category).filter(Boolean))];

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        !showCategoryFilters ||
        activeCategory === "All" ||
        product.category === activeCategory;
      const haystack = normalizeSearchTerm(
        [
          product.title,
          product.description,
          product.category,
          ...(product.features || []),
          ...(product.pros || []),
          ...(product.cons || []),
        ]
          .filter(Boolean)
          .join(" "),
      );
      const matchesSearch = searchTerms.every((term) => haystack.includes(term));

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
    <section className="glass-panel rounded-[32px] p-5 sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="section-title mt-3">{title}</h2>
          <p className="section-copy mt-3 max-w-2xl">{subtitle}</p>
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
          {leadingControl ? (
            leadingControl
          ) : showCategoryFilters ? (
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
          ) : (
            <div className="glass-panel-strong rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              {staticBadge}
            </div>
          )}

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

            {((showCategoryFilters && activeCategory !== "All") ||
              normalizedSearch) && (
              <button
                type="button"
                onClick={() => {
                  if (showCategoryFilters) {
                    setActiveCategory("All");
                  }
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
            {normalizedSearch ? (
              <>
                {" "}
                for{" "}
                <span className="font-semibold text-slate-900">
                  "{normalizedSearch}"
                </span>
              </>
            ) : null}
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Ready to compare
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
          <h3 className="text-2xl font-semibold">{emptyStateTitle}</h3>
          <p className="section-copy mt-3">{emptyStateCopy}</p>
        </div>
      ) : null}
    </section>
  );
}
