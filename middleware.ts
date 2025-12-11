import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin");

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const session = req.cookies.get("admin_session")?.value;
  const expected = process.env.ADMIN_SESSION_TOKEN;

  if (!session || !expected || session !== expected) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
