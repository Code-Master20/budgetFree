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
        <div className="app-shell">
          <ProductCatalog
            requestParams={category ? { category } : {}}
            showCategoryFilters={false}
            leadingControl={<StorefrontCategoryBar />}
            title="Browse and compare products"
            subtitle="Use the category pills to jump between laptops, mobiles, eye-tie, clothes, watches, and other relevant shopping sections."
            emptyStateTitle="No products found yet"
            emptyStateCopy="Add or seed products to populate these shopping categories."
          />
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
