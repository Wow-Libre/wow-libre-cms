import { NextRequest, NextResponse } from "next/server";
import { allowedRewriteDestination, isPathTraversal, isSafePathSegment } from "@/lib/security/proxy-allowlist.mjs";

const CORE_BASE =
  process.env.WOW_CORE_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_BASE_URL_CORE ||
  "http://localhost:8091/core";

const FORWARD_HEADER = new Set(
  ["authorization", "content-type", "transaction_id"].map((h: string) => h.toLowerCase()),
);

const ALLOWED_FIRST_SEGMENTS = new Set(["api"]);
const ALLOWED_FIRST_PREFIX = "api-v";

function buildTarget(pathSegments: string[], search: string): string {
  const base = CORE_BASE.replace(/\/$/, "");
  const suffix = pathSegments.map((s: string) => encodeURIComponent(s)).join("/");
  return `${base}/${suffix}${search}`;
}

function validateSegments(segments: string[]): boolean {
  if (!Array.isArray(segments) || segments.length === 0) return false;
  for (const seg of segments) {
    if (!isSafePathSegment(seg)) return false;
  }
  const head = segments[0];
  if (ALLOWED_FIRST_SEGMENTS.has(head)) return true;
  if (head.startsWith(ALLOWED_FIRST_PREFIX)) return true;
  return false;
}

function validateBaseHost(): boolean {
  try {
    const u = new URL(CORE_BASE);
    return allowedRewriteDestination(u.hostname);
  } catch {
    return false;
  }
}

async function proxy(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  if (isPathTraversal(pathSegments.join("/"))) {
    return NextResponse.json(
      { code: 400, message: "Ruta no permitida", data: null },
      { status: 400 },
    );
  }
  if (!validateSegments(pathSegments)) {
    return NextResponse.json(
      { code: 403, message: "Ruta no permitida", data: null },
      { status: 403 },
    );
  }
  if (!validateBaseHost()) {
    console.error("[wow-core proxy] base host no permitido:", CORE_BASE);
    return NextResponse.json(
      { code: 503, message: "Wow Core no disponible desde el proxy", data: null },
      { status: 503 },
    );
  }

  const target = buildTarget(pathSegments, request.nextUrl.search);
  const headers = new Headers();
  request.headers.forEach((value: string, key: string) => {
    const lower = key.toLowerCase();
    if (FORWARD_HEADER.has(lower)) {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  let res: Response;
  try {
    res = await fetch(target, init);
  } catch (err) {
    console.error("[wow-core proxy]", target, err);
    return NextResponse.json(
      {
        code: 503,
        message: "Wow Core no disponible desde el proxy",
        transaction_id: "",
        data: null,
      },
      { status: 503 },
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  const buf = await res.arrayBuffer();
  const out = new NextResponse(buf, { status: res.status });
  if (contentType) out.headers.set("Content-Type", contentType);
  res.headers.forEach((value: string, key: string) => {
    const lower = key.toLowerCase();
    if (lower === "transaction_id" || lower.startsWith("x-")) {
      out.headers.set(key, value);
    }
  });
  out.headers.set("Cache-Control", "no-store");
  return out;
}

type RouteCtx = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, ctx: RouteCtx): Promise<NextResponse> {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export const GET = (request: NextRequest, ctx: RouteCtx) => handle(request, ctx);
export const POST = (request: NextRequest, ctx: RouteCtx) => handle(request, ctx);
export const PUT = (request: NextRequest, ctx: RouteCtx) => handle(request, ctx);
export const PATCH = (request: NextRequest, ctx: RouteCtx) => handle(request, ctx);
export const DELETE = (request: NextRequest, ctx: RouteCtx) => handle(request, ctx);
export const HEAD = (request: NextRequest, ctx: RouteCtx) => handle(request, ctx);

export const OPTIONS = (): NextResponse =>
  new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
      "Cache-Control": "no-store",
    },
  });

export const runtime = "nodejs";
