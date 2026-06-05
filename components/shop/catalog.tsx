import {
  getFilterFacets,
  getProducts,
  type ProductFilters,
} from "@/lib/queries/products";
import { ProductGrid } from "./product-grid";
import { FilterSidebar } from "./filter-sidebar";
import { SortSelect } from "./sort-select";
import { Pagination } from "./pagination";

export async function Catalog({
  filters,
  title,
  description,
}: {
  filters: ProductFilters;
  title: string;
  description?: string;
}) {
  const [result, facets] = await Promise.all([
    getProducts(filters),
    getFilterFacets(),
  ]);
  const { items, total, page, pageCount } = result;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-neutral-500">{description}</p>}
      </header>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <div className="hidden lg:block">
          <FilterSidebar facets={facets} />
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              {total} product{total !== 1 ? "s" : ""}
            </p>
            <SortSelect />
          </div>

          <details className="mt-4 rounded-lg border border-neutral-200 p-4 lg:hidden">
            <summary className="cursor-pointer text-sm font-medium">
              Filters
            </summary>
            <div className="mt-4">
              <FilterSidebar facets={facets} />
            </div>
          </details>

          <div className="mt-6">
            <ProductGrid
              products={items}
              empty="No products match these filters."
            />
          </div>

          <Pagination page={page} pageCount={pageCount} />
        </div>
      </div>
    </div>
  );
}
