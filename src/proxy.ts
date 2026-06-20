import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Name of the Auth.js / NextAuth v5 JWT session cookie (uses __Secure- prefix on HTTPS). */
const AUTH_COOKIE_NAME = "__Secure-authjs.session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lightweight check — just verify the session cookie exists.
  // The full auth + db verification happens in API routes and pages.
  const hasSession =
    request.cookies.has(AUTH_COOKIE_NAME) ||
    request.cookies.has("authjs.session-token");

  if (!hasSession && pathname !== "/login" && pathname !== "/register") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
