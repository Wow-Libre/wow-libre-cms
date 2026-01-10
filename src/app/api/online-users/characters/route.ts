import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getOnlineUsersConfig } from "@/lib/onlineUsersConfig";
import type { OnlineCharacterDto } from "@/types/onlineUsers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let pool: mysql.Pool | null = null;

const getPool = () => {
  if (pool) return pool;

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = Number(process.env.DB_PORT || "3306");

  if (!host || !user || !database) {
    throw new Error("Missing database configuration.");
  }

  pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });

  return pool;
};

export async function GET() {
  let config;
  try {
    config = await getOnlineUsersConfig();
  } catch (error) {
    return NextResponse.json({ characters: [] }, { status: 500 });
  }

  if (!config.enabled) {
    return NextResponse.json(
      { characters: [] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const db = getPool();
    const [rows] = await db.query<mysql.RowDataPacket[]>(
      "SELECT name, level, race, class FROM characters WHERE online = 1 ORDER BY name ASC"
    );

    const characters: OnlineCharacterDto[] = rows.map((row) => ({
      name: String(row.name),
      level: Number(row.level || 0),
      raceId: Number(row.race || 0),
      classId: Number(row.class || 0),
    }));

    return NextResponse.json(
      { characters },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { characters: [] },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
