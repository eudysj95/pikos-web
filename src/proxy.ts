import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_SECURE = "__Secure-authjs.session-token";
const AUTH_COOKIE = "authjs.session-token";

export async function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has(AUTH_COOKIE_SECURE) ||
    request.cookies.has(AUTH_COOKIE);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/operaciones/:path*",
    "/cuadre-caja/:path*",
    "/egresos/:path*",
    "/ingresos/:path*",
    "/inventario/:path*",
    "/plan-cuentas/:path*",
    "/pos-movimientos/:path*",
    "/prestamos/:path*",
    "/reportes/:path*",
    "/sucursales/:path*",
    "/tasa-cambio/:path*",
    "/usuarios/:path*",
  ],
};
