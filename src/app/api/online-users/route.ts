import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getOnlineUsersConfig } from "@/lib/onlineUsersConfig";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type OnlineUsersResponse = {
  enabled: boolean;
  count: number;
  users: string[];
};

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
    return NextResponse.json(
      { enabled: false, count: 0, users: [] } satisfies OnlineUsersResponse,
      { status: 500 }
    );
  }

  if (!config.enabled) {
    return NextResponse.json(
      { enabled: false, count: 0, users: [] } satisfies OnlineUsersResponse,
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const db = getPool();
    let count = 0;
    let users: string[] = [];

    if (config.showCount || config.showList) {
      const [countRows] = await db.query<mysql.RowDataPacket[]>(
        "SELECT COUNT(*) AS total FROM characters WHERE online = 1"
      );
      count = Number(countRows?.[0]?.total || 0);
    }

    if (config.showList && config.listLimit > 0) {
      const [rows] = await db.query<mysql.RowDataPacket[]>(
        "SELECT name FROM characters WHERE online = 1 ORDER BY name ASC LIMIT ?",
        [config.listLimit]
      );
      users = rows.map((row) => String(row.name));
    }

    return NextResponse.json(
      { enabled: true, count, users } satisfies OnlineUsersResponse,
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { enabled: true, count: 0, users: [] } satisfies OnlineUsersResponse,
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
