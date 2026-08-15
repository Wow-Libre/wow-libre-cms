import { BASE_URL_CORE } from "@/configs/configs";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { allowedRewriteDestination } from "@/lib/security/proxy-allowlist.mjs";

const NAME_RE = /^[A-Za-z]{2,12}$/;
const REALM_RE = /^[A-Za-z0-9 _-]{1,64}$/;
const REALM_ID_RE = /^[0-9]{1,12}$/;
const EXPANSION_ID_RE = /^[0-9]{1,4}$/;

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ name: string }> },
): Promise<NextResponse> {
  if (!coreBaseValid()) {
    return NextResponse.json(
      { message: "Armory service unavailable" },
      { status: 503 },
    );
  }

  const { name } = await context.params;
  if (!NAME_RE.test(name)) {
    return NextResponse.json(
      { message: "Nombre de personaje inválido" },
      { status: 400 },
    );
  }

  const sp = request.nextUrl.searchParams;
  const realmId = sp.get("realm_id");
  const realm = sp.get("realm");
  const expansionId = sp.get("expansion_id");

  if (realmId !== null && !REALM_ID_RE.test(realmId)) {
    return NextResponse.json({ message: "realm_id inválido" }, { status: 400 });
  }
  if (realm !== null && !REALM_RE.test(realm)) {
    return NextResponse.json({ message: "realm inválido" }, { status: 400 });
  }
  if (expansionId !== null && !EXPANSION_ID_RE.test(expansionId)) {
    return NextResponse.json({ message: "expansion_id inválido" }, { status: 400 });
  }

  const query = new URLSearchParams();
  if (realmId) query.set("realm_id", realmId);
  if (realm) query.set("realm", realm);
  if (expansionId) query.set("expansion_id", expansionId);

  const url = `${BASE_URL_CORE}/api/armory/profile/${encodeURIComponent(name)}${query.toString() ? `?${query}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        transaction_id: randomUUID(),
      },
      next: { revalidate: 60 },
      redirect: "manual",
    });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Armory service unavailable" },
      { status: 503 },
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
