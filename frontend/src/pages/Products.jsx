import { motion as Motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import ProductCatalog from "../components/ProductCatalog";
import SiteChrome from "../components/SiteChrome";

export default function Products() {
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
            <span className="eyebrow">Products</span>
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold sm:text-5xl">
                Compare products before you buy.
              </h1>
              <p className="section-copy mt-4 max-w-2xl">
                Search by name, filter by category, and review price and rating in
                one dedicated products page.
              </p>
            </div>
          </Motion.header>

          <ProductCatalog />
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
