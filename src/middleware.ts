import { NextRequest, NextResponse } from "next/server";

/**
 * Route protection middleware.
 *
 * - Customer routes: require any valid access token → redirect to /login
 * - Admin routes (/admin/**): require token + ADMIN/SUPER_ADMIN role cookie
 *   → redirect to /admin/login
 * - /admin/login: redirect already-authenticated admins to /admin
 *
 * Token storage note: Zustand persists auth state to localStorage which is
 * inaccessible in Edge middleware. We mirror two cookies after login:
 *   phonex_access_token  — presence signals "logged in"
 *   phonex_role          — value signals role (CUSTOMER | ADMIN | SUPER_ADMIN)
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PROTECTED_PREFIXES = [
  "/account",
  "/cart",
  "/checkout",
  "/orders",
  "/wishlist",
  "/designs",
];

const AUTH_ONLY_PATHS = ["/login", "/signup", "/forgot-password"];

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isAuthPage(pathname: string): boolean {
  return AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("phonex_access_token")?.value;
  const role  = request.cookies.get("phonex_role")?.value ?? "";

  const isLoggedIn  = Boolean(token);
  const isAdmin     = ADMIN_ROLES.has(role);

  // ---- Admin routes --------------------------------------------------------

  if (pathname.startsWith("/admin")) {
    // /admin/login is public for unauthenticated admins
    if (pathname.startsWith("/admin/login")) {
      // Already an admin → skip login page
      if (isLoggedIn && isAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // Every other /admin/** requires an admin token
    if (!isLoggedIn || !isAdmin) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ---- Customer auth routes ------------------------------------------------

  if (isProtected(pathname) && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
