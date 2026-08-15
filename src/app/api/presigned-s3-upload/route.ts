import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 10 * 1024 * 1024;

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "169.254.169.254",
  "::1",
  "[::1]",
]);

function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".").map((p: string) => Number(p));
  if (parts.length !== 4 || parts.some((p: number) => !Number.isInteger(p) || p < 0 || p > 255)) {
    return false;
  }
  const [a, b] = parts as [number, number, number, number];
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 0) return true;
  return false;
}

function isPrivateIpv6(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, "");
  if (h === "::1" || h === "::") return true;
  if (h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true;
  if (/^f[cd][0-9a-f]{2}:/i.test(h)) return true;
  return false;
}

function isAllowedPresignedTarget(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.has(host)) return false;
    if (isPrivateIpv4(host) || isPrivateIpv6(host)) return false;
    if (host.endsWith(".amazonaws.com")) return true;
    if (host.endsWith(".amazonaws.com.cn")) return true;
    if (host.endsWith(".r2.cloudflarestorage.com")) return true;
    if (host.endsWith(".storage.googleapis.com")) return true;
    const extra = process.env.S3_UPLOAD_ALLOWED_HOST_SUFFIXES;
    if (extra) {
      for (const suffix of extra.split(",").map((s: string) => s.trim().toLowerCase())) {
        if (suffix && host.endsWith(suffix)) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let uploadUrl: string;
  let buffer: ArrayBuffer;
  let contentType: string;

  const contentTypeHeader = request.headers.get("content-type") ?? "";

  let uploadContext: string | null = null;
  if (contentTypeHeader.includes("multipart/form-data")) {
    const form = await request.formData();
    const urlField = form.get("uploadUrl");
    const file = form.get("file");
    const context = form.get("context");
    if (context !== null && context !== undefined) {
      if (typeof context !== "string") {
        return NextResponse.json(
          { message: "context debe ser una cadena" },
          { status: 400 },
        );
      }
      uploadContext = context.slice(0, 32).toLowerCase();
    }
    if (typeof urlField !== "string" || !urlField.trim()) {
      return NextResponse.json({ message: "uploadUrl requerido" }, { status: 400 });
    }
    uploadUrl = urlField.trim();
    if (!(file instanceof Blob)) {
      return NextResponse.json({ message: "file requerido" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: "Archivo demasiado grande" }, { status: 413 });
    }
    buffer = await file.arrayBuffer();
    contentType = file.type || "application/octet-stream";
  } else {
    uploadUrl = request.headers.get("x-s3-upload-url")?.trim() ?? "";
    if (!uploadUrl) {
      return NextResponse.json(
        { message: "Falta uploadUrl (multipart) o cabecera x-s3-upload-url" },
        { status: 400 },
      );
    }
    buffer = await request.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ message: "Archivo demasiado grande" }, { status: 413 });
    }
    contentType =
      request.headers.get("x-content-type") ||
      request.headers.get("content-type") ||
      "application/octet-stream";
  }

  if (!isAllowedPresignedTarget(uploadUrl)) {
    return NextResponse.json(
      { message: "URL de subida no permitida (solo hosts S3 / lista en S3_UPLOAD_ALLOWED_HOST_SUFFIXES)" },
      { status: 400 },
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(uploadUrl);
  } catch {
    return NextResponse.json({ message: "URL inválida" }, { status: 400 });
  }
  if (!parsed.searchParams.has("X-Amz-Signature") && !parsed.searchParams.has("x-goog-signature")) {
    return NextResponse.json(
      { message: "La URL no parece ser una URL presignada (falta firma)" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: buffer,
      redirect: "manual",
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      console.error(
        "[presigned-s3-upload] S3 error",
        res.status,
        "context=",
        uploadContext ?? "unknown",
        errText.slice(0, 500),
      );
      return NextResponse.json(
        { message: "S3 rechazó la subida", status: res.status },
        { status: 502 },
      );
    }

    console.log(
      `[presigned-s3-upload] ok context=${uploadContext ?? "unknown"} bytes=${buffer.byteLength} ct=${contentType}`,
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[presigned-s3-upload]", e);
    return NextResponse.json({ message: "Error al contactar S3" }, { status: 502 });
  }
}

export const runtime = "nodejs";

export const dynamic = "force-dynamic";
