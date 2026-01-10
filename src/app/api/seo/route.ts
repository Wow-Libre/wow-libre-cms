import { NextResponse } from "next/server";
import { loadSEOConfig, saveSEOConfig } from "@/lib/seo";
import { SEOConfig } from "@/types/seo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const config = await loadSEOConfig();
    return NextResponse.json(config, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("SEO config load error", error);
    return NextResponse.json({ error: "Unable to load SEO config." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as SEOConfig;
    const saved = await saveSEOConfig(body);
    return NextResponse.json(saved, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("SEO config save error", error);
    return NextResponse.json({ error: "Unable to save SEO config." }, { status: 500 });
  }
}
