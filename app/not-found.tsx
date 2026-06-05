import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-neutral-500">
        The page you’re looking for doesn’t exist or may have moved.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Go home
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:border-neutral-400"
        >
          Shop products
        </Link>
      </div>
    </div>
  );
}
