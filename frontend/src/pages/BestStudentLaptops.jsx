import { motion as Motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import ProductCatalog from "../components/ProductCatalog";
import SiteChrome from "../components/SiteChrome";

export default function BestStudentLaptops() {
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
            <span className="eyebrow">Student laptop shortlist</span>
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold sm:text-5xl">
                Best student laptops between Rs 16,000 and Rs 25,000.
              </h1>
              <p className="section-copy mt-4 max-w-2xl">
                Browse a focused laptop list for students, sorted to surface
                stronger-rated options within a budget-friendly range.
              </p>
            </div>
          </Motion.header>

          <ProductCatalog
            endpoint="/products/best-student-laptops-under-16000-25000"
            eyebrow="Budget student laptops"
            title="Laptop picks for study, browsing, and daily work"
            subtitle="This shortlist only includes laptop listings priced from Rs 16,000 to Rs 25,000, so it is easier to compare practical student options."
            showCategoryFilters={false}
            emptyStateTitle="No student laptops in this range yet"
            emptyStateCopy="Add laptop products priced between Rs 16,000 and Rs 25,000 to populate this route."
          />
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
