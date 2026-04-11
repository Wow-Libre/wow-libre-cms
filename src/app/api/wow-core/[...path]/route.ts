import { NextRequest, NextResponse } from "next/server";

const CORE_BASE =
  process.env.WOW_CORE_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_BASE_URL_CORE ||
  "http://localhost:8091/core";

const FORWARD_HEADER = new Set(
  ["authorization", "content-type", "transaction_id"].map((h) => h.toLowerCase())
);

function buildTarget(pathSegments: string[], search: string): string {
  const base = CORE_BASE.replace(/\/$/, "");
  const suffix = pathSegments.join("/");
  return `${base}/${suffix}${search}`;
}

function isAllowedPath(segments: string[]): boolean {
  if (segments.length === 0) return false;
  return segments[0] === "api";
}

async function proxy(
  request: NextRequest,
  pathSegments: string[]
): Promise<NextResponse> {
  if (!isAllowedPath(pathSegments)) {
    return NextResponse.json({ message: "Ruta no permitida" }, { status: 403 });
  }

  const target = buildTarget(pathSegments, request.nextUrl.search);
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (FORWARD_HEADER.has(lower)) {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const res = await fetch(target, init);
    const out = new NextResponse(res.body, { status: res.status });
    const passResponse = [
      "content-type",
      "content-length",
      "transaction_id",
    ];
    res.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (passResponse.includes(lower) || lower.startsWith("x-")) {
        out.headers.set(key, value);
      }
    });
    return out;
  } catch (err) {
    console.error("[wow-core proxy]", target, err);
    return NextResponse.json(
      {
        code: 503,
        message: "Wow Core no disponible desde el proxy",
        transaction_id: "",
        data: null,
      },
      { status: 503 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxy(request, path);
}
