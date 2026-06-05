import Link from "next/link";
import { getStoreSettings } from "@/lib/queries/store";

export async function SiteFooter() {
  const store = await getStoreSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-semibold">{store.storeName}</p>
          <p className="mt-2 text-sm text-neutral-500">
            Modern fashion for Bangladesh. bKash, SSLCommerz & Cash on Delivery.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Shop</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li><Link href="/products" className="hover:text-brand-600">All products</Link></li>
            <li><Link href="/wishlist" className="hover:text-brand-600">Wishlist</Link></li>
            <li><Link href="/cart" className="hover:text-brand-600">Cart</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Help</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li><Link href="/faq" className="hover:text-brand-600">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-brand-600">Contact</Link></li>
            <li><Link href="/terms" className="hover:text-brand-600">Terms</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            {store.contactEmail && <li>{store.contactEmail}</li>}
            {store.contactPhone && <li>{store.contactPhone}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-4 text-center text-xs text-neutral-400">
        © {year} {store.storeName}. All rights reserved.
      </div>
    </footer>
  );
}
