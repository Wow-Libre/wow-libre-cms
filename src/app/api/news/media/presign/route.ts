import { NextRequest, NextResponse } from "next/server";
import { BASE_URL_CORE } from "@/configs/configs";
import { randomUUID } from "crypto";
import { allowedRewriteDestination } from "@/lib/security/proxy-allowlist.mjs";

const MAX_PRESIGN_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
]);

let cachedCoreValid: boolean | null = null;
function coreBaseValid(): boolean {
  if (cachedCoreValid !== null) return cachedCoreValid;
  try {
    const u = new URL(BASE_URL_CORE);
    cachedCoreValid = allowedRewriteDestination(u.hostname);
  } catch {
    cachedCoreValid = false;
  }
  return cachedCoreValid;
}

function unauthorized() {
  return NextResponse.json(
    { message: "Token requerido" },
    { status: 401 },
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!coreBaseValid()) {
    return NextResponse.json(
      { message: "Wow Core no disponible" },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return unauthorized();
  }
  const token = auth.slice(7).trim();
  if (!token) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "JSON inválido" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { message: "Payload inválido" },
      { status: 400 },
    );
  }

  const payload = body as Record<string, unknown>;
  const filename = typeof payload.filename === "string" ? payload.filename.trim() : "";
  const contentType =
    typeof payload.content_type === "string" ? payload.content_type.toLowerCase() : "";
  const byteSizeRaw = payload.byte_size;
  const byteSize = typeof byteSizeRaw === "number" ? byteSizeRaw : NaN;

  if (!filename) {
    return NextResponse.json(
      { message: "filename requerido" },
      { status: 400 },
    );
  }
  if (!ALLOWED_MIMES.has(contentType)) {
    return NextResponse.json(
      { message: "content_type no permitido" },
      { status: 400 },
    );
  }
  if (!Number.isFinite(byteSize) || byteSize <= 0) {
    return NextResponse.json(
      { message: "byte_size inválido" },
      { status: 400 },
    );
  }
  if (byteSize > MAX_PRESIGN_BYTES) {
    return NextResponse.json(
      { message: `byte_size excede el máximo (${MAX_PRESIGN_BYTES} bytes)` },
      { status: 413 },
    );
  }

  const transactionId = randomUUID();
  try {
    const backend = await fetch(`${BASE_URL_CORE}/api/news/media/presign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        transaction_id: transactionId,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        filename,
        content_type: contentType,
        byte_size: byteSize,
      }),
    });

    if (!backend.ok) {
      const errText = await backend.text().catch(() => backend.statusText);
      console.error(
        "[news/media/presign] wow-core error",
        backend.status,
        errText.slice(0, 500),
      );
      return NextResponse.json(
        {
          message:
            backend.status === 404
              ? "Wow Core no expone /api/news/media/presign todavía"
              : "Wow Core rechazó la solicitud de presign",
        },
        { status: backend.status === 404 ? 404 : 502 },
      );
    }

    const data = await backend.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("[news/media/presign]", err);
    return NextResponse.json(
      { message: "Wow Core no disponible" },
      { status: 503 },
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
