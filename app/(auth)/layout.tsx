/**
 * Auth pages layout: /login, /signup, /forgot-password.
 * Centered, minimal — no header/footer.
 *
 * Built out in Phase 1 (Week 3).
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
