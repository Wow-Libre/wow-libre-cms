import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/accounts",
  "/profile",
  "/register/username",
  "/register/account-ingame",
  "/dashboard",
  "/settings",
  "/character",
  "/realms",
];

const REDIRECT_PREFIX = "/vdp";
const PUBLIC_FILE = /\.(?:ico|png|jpg|jpeg|svg|webp|avif|gif|woff2?|ttf|otf|css|js|map|json|txt|xml|webmanifest)$/i;

function isPublicAsset(pathname: string): boolean {
  return PUBLIC_FILE.test(pathname) || pathname.startsWith("/_next/");
}

function isProtectedPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/{2,}/g, "/");
  if (normalized !== pathname) return false;
  return PROTECTED_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

function isVdpPath(pathname: string): boolean {
  return pathname === REDIRECT_PREFIX || pathname.startsWith(`${REDIRECT_PREFIX}/`);
}

function wantsHtml(request: NextRequest): boolean {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/html") || accept.includes("*/*");
}

function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!wantsHtml(request)) {
    return NextResponse.next();
  }

  if (pathname === "/" || isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  if (isVdpPath(pathname)) {
    const target = new URL("/", request.url);
    if (search) target.search = search;
    return NextResponse.redirect(target, 308);
  }

  if (isProtectedPath(pathname)) {
    const cookie = request.cookies.get("token");

    if (!cookie || !cookie.value) {
      const loginUrl = new URL("/login", request.url);
      if (search) loginUrl.search = search;
      return NextResponse.redirect(loginUrl, 308);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/|.*\\..*).*)",
  ],
};
