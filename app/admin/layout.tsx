/**
 * Admin panel layout: /admin, /admin/products, /admin/orders, etc.
 * Auth-protected — only users with role = ADMIN may enter.
 *
 * Sidebar + topbar built in Phase 6 (Week 11).
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
