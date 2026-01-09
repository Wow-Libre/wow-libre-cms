import { NextResponse } from "next/server";
import {
  getOnlineUsersConfig,
  saveOnlineUsersConfig,
} from "@/lib/onlineUsersConfig";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const config = await getOnlineUsersConfig();
    return NextResponse.json(config, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to load config." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const config = await saveOnlineUsersConfig(payload);
    return NextResponse.json(config, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to save config." },
      { status: 500 }
    );
  }
}
