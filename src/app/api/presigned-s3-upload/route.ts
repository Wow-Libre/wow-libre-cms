import { NextRequest, NextResponse } from "next/server";

/**
 * Evita CORS en el PUT directo del navegador → S3: el cliente envía el archivo aquí
 * (mismo origen) y el servidor Node hace el PUT a la URL presignada.
 *
 * Wow Core / tienda suelen documentar CORS en el bucket; si no está configurado,
 * este proxy es el equivalente a subir desde backend.
 */

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function isAllowedPresignedTarget(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    if (host.endsWith(".amazonaws.com")) return true;
    if (host.endsWith(".amazonaws.com.cn")) return true;
    const extra = process.env.S3_UPLOAD_ALLOWED_HOST_SUFFIXES;
    if (extra) {
      for (const suffix of extra.split(",").map((s) => s.trim().toLowerCase())) {
        if (suffix && host.endsWith(suffix)) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  let uploadUrl: string;
  let buffer: ArrayBuffer;
  let contentType: string;

  const contentTypeHeader = request.headers.get("content-type") ?? "";

  if (contentTypeHeader.includes("multipart/form-data")) {
    const form = await request.formData();
    const urlField = form.get("uploadUrl");
    const file = form.get("file");
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
        { status: 400 }
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
      { status: 400 }
    );
  }

  try {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: buffer,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      console.error("[presigned-s3-upload] S3 error", res.status, errText.slice(0, 500));
      return NextResponse.json(
        { message: "S3 rechazó la subida", status: res.status },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[presigned-s3-upload]", e);
    return NextResponse.json({ message: "Error al contactar S3" }, { status: 502 });
  }
}

export const runtime = "nodejs";
