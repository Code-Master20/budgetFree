import { motion as Motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import ProductCatalog from "../components/ProductCatalog";
import SiteChrome from "../components/SiteChrome";
import StorefrontCategoryBar from "../components/StorefrontCategoryBar";
import { useSearchParams } from "react-router-dom";

export default function Products() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || undefined;

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
            <div className="max-w-3xl">
              <span className="eyebrow">Products</span>
              <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">
                Compare products before you buy.
              </h1>
              <p className="section-copy mt-4 max-w-2xl">
                Search by name, review price and rating, and jump straight into
                the laptop collections you actually want to test.
              </p>
            </div>
          </Motion.header>

          <ProductCatalog
            requestParams={category ? { category } : {}}
            showCategoryFilters={false}
            leadingControl={<StorefrontCategoryBar />}
            title="Browse and compare products"
            subtitle="Use the category pills to jump between laptops, mobiles, electronics, eye-tie, clothes, and more relevant shopping sections."
            emptyStateTitle="No products found yet"
            emptyStateCopy="Add or seed products to populate these shopping categories."
          />
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
