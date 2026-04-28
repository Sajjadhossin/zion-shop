import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Zion Shop — Modern Fashion E-commerce",
    template: "%s | Zion Shop",
  },
  description:
    "A modern, fast, mobile-first fashion store for Bangladesh. bKash, SSLCommerz, and Cash on Delivery supported.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
