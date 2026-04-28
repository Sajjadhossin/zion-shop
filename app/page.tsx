export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl space-y-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
          Coming Soon
        </p>
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Zion Shop
        </h1>
        <p className="text-lg text-neutral-600">
          A modern white-label fashion e-commerce platform — built for
          Bangladesh, ready to deploy in days.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs text-neutral-500">
          <span className="rounded-full border border-neutral-200 px-3 py-1">
            Next.js 15
          </span>
          <span className="rounded-full border border-neutral-200 px-3 py-1">
            Supabase
          </span>
          <span className="rounded-full border border-neutral-200 px-3 py-1">
            bKash
          </span>
          <span className="rounded-full border border-neutral-200 px-3 py-1">
            SSLCommerz
          </span>
          <span className="rounded-full border border-neutral-200 px-3 py-1">
            COD
          </span>
        </div>
      </div>
    </main>
  );
}
