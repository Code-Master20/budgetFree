import { motion as Motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import ProductCatalog from "../components/ProductCatalog";
import SiteChrome from "../components/SiteChrome";
import StorefrontCategoryBar from "../components/StorefrontCategoryBar";

export default function LaptopCollectionPage({
  eyebrow,
  title,
  subtitle,
  requestParams,
  callout,
  emptyStateTitle,
  emptyStateCopy,
  staticBadge = "Laptop picks",
}) {
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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="eyebrow">{eyebrow}</span>
                <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">
                  {title}
                </h1>
                <p className="section-copy mt-4 max-w-2xl">{subtitle}</p>
              </div>

              {callout ? (
                <div className="glass-panel-strong rounded-[24px] px-5 py-4 text-sm text-slate-600 lg:max-w-sm">
                  {callout}
                </div>
              ) : null}
            </div>
          </Motion.header>

          <ProductCatalog
            requestParams={requestParams}
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            showCategoryFilters={false}
            leadingControl={<StorefrontCategoryBar />}
            staticBadge={staticBadge}
            emptyStateTitle={emptyStateTitle}
            emptyStateCopy={emptyStateCopy}
          />
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
