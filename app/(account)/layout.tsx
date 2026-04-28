/**
 * Customer account dashboard layout: /account, /account/orders, etc.
 * Auth-protected — middleware enforces login.
 *
 * Sidebar nav added in Phase 5.
 */
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
