import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/vdp" || pathname.startsWith("/vdp/")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const protectedPaths = [
    "/accounts",
    "/profile",
    "/register/username",
    "/dashboard",
    "/settings",
    "/character",
    "/register/account-ingame",
    "/realms",
  ];

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (isProtectedPath) {
    const cookie = request.cookies.get("token");

    if (!cookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}
