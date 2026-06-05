import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { AccountNav } from "@/components/account/account-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";

/**
 * Customer dashboard layout — shares the store header/footer and adds the
 * account sidebar. Middleware enforces login for all /account routes.
 */
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
          <aside className="space-y-6">
            <AccountNav />
            <SignOutButton />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
      <SiteFooter />
      <CartDrawer />
    </div>
  );
}
