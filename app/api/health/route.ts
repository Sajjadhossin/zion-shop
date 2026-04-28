import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Sanity check used by Vercel monitoring and the Phase 0 dry-run.
 * Returns 200 if the app is running. Database health will be added in Phase 1.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "zion-shop",
    timestamp: new Date().toISOString(),
  });
}
