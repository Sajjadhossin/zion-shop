import type { Metadata } from "next";
import "./globals.css";
import { BrandStyle } from "@/components/brand-style";
import { Analytics } from "@/components/analytics";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Zion Shop — Modern Fashion E-commerce",
    template: "%s | Zion Shop",
  },
  description:
    "A modern, fast, mobile-first fashion store for Bangladesh. bKash, SSLCommerz, and Cash on Delivery supported.",
  metadataBase: new URL(APP_URL),
  keywords: [
    "fashion",
    "Bangladesh",
    "online shopping",
    "bKash",
    "Cash on Delivery",
    "Panjabi",
    "Saree",
    "Three-piece",
  ],
  openGraph: {
    type: "website",
    siteName: "Zion Shop",
    title: "Zion Shop — Modern Fashion E-commerce",
    description:
      "Premium fashion for Bangladesh, delivered fast. bKash, SSLCommerz & Cash on Delivery.",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Zion Shop — Modern Fashion E-commerce",
    description: "Premium fashion for Bangladesh, delivered fast.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <BrandStyle />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
