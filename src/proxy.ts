import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** NextAuth v5 JWT session cookie (__Secure- prefix on HTTPS, plain on HTTP). */
const AUTH_COOKIE = "authjs.session-token";
const AUTH_COOKIE_SECURE = "__Secure-authjs.session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lightweight check — just verify the session cookie exists.
  // The full auth + db verification happens in API routes and pages.
  const hasSession =
    request.cookies.has(AUTH_COOKIE_SECURE) ||
    request.cookies.has(AUTH_COOKIE);

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
