import PageTransition from "../components/PageTransition";
import ProductCatalog from "../components/ProductCatalog";
import SiteChrome from "../components/SiteChrome";
import StorefrontCategoryBar from "../components/StorefrontCategoryBar";

export default function LaptopCollectionPage({
  eyebrow,
  title,
  subtitle,
  requestParams,
  emptyStateTitle,
  emptyStateCopy,
  staticBadge = "Laptop picks",
}) {
  return (
    <PageTransition className="page-wrap">
      <SiteChrome>
        <div className="app-shell">
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
