"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  MapPin,
  Package,
  Star,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/profile", label: "Profile", icon: UserIcon },
];

export function AccountNav() {
  const path = usePathname();
  return (
    <nav className="space-y-1">
      {LINKS.map((l) => {
        const Icon = l.icon;
        const active =
          l.href === "/account" ? path === "/account" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
              active
                ? "bg-brand-50 font-medium text-brand-700"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            <Icon size={16} /> {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
