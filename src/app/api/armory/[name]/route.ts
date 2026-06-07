import { BASE_URL_CORE } from "@/configs/configs";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

/**
 * Public JSON armory profile (Phase 2) — mirrors wow-mop-registration /api/character/{name}
 * but returns full profile including equipment when backend is available.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  const { name } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const realmId = searchParams.get("realm_id");
  const realm = searchParams.get("realm");
  const expansionId = searchParams.get("expansion_id");

  const query = new URLSearchParams();
  if (realmId) query.set("realm_id", realmId);
  if (realm) query.set("realm", realm);
  if (expansionId) query.set("expansion_id", expansionId);

  const url = `${BASE_URL_CORE}/api/armory/profile/${encodeURIComponent(name)}${query.toString() ? `?${query}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        transaction_id: uuidv4(),
      },
      next: { revalidate: 60 },
    });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Armory service unavailable" },
      { status: 503 }
    );
  }
}
