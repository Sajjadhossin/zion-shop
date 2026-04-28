/**
 * Public store layout.
 *
 * All public-facing customer pages live in this route group:
 *   /, /products, /product/[slug], /cart, /checkout, /wishlist, /search, etc.
 *
 * Header + footer will be added in Phase 2.
 */
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
