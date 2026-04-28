import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware.
 *
 * Phase 0: pass-through. Phase 1 will add Supabase session refresh + protected
 * route guards (block unauthenticated access to /account/* and /admin/*).
 */
export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico  (favicon)
     * - public files (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};
