#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const result = spawnSync(
  "npm",
  ["audit", "--omit=optional", "--omit=peer", "--json"],
  { encoding: "utf8" },
);

let payload;
try {
  payload = JSON.parse(result.stdout || "{}");
} catch {
  console.error("No se pudo parsear la salida de npm audit");
  process.exit(2);
}

const SEVERITY_MIN = (process.env.AUDIT_MIN || "high").toLowerCase();
const ORDER = { low: 0, moderate: 1, high: 2, critical: 3 };
const limit = ORDER[SEVERITY_MIN] ?? 2;
if (limit === undefined) {
  console.error(`Severidad inválida: ${SEVERITY_MIN}`);
  process.exit(2);
}

const BLOCKED_PATH_HINTS = [
  "node_modules/npm/node_modules/",
  "node_modules/npm/",
];

const NODE_MODULES = "node_modules/";

function isInBlockedPath(file) {
  if (typeof file !== "string") return true;
  if (!file.startsWith(NODE_MODULES)) return false;
  return BLOCKED_PATH_HINTS.some((hint) => file.includes(hint));
}

const realVulns = [];
for (const [name, advisory] of Object.entries(payload.vulnerabilities ?? {})) {
  const via = advisory.via ?? [];
  const severity = (advisory.severity || "").toLowerCase();
  const rank = ORDER[severity] ?? -1;
  if (rank < limit) continue;
  const paths = Array.isArray(via) ? via.flatMap((v) => v?.location ?? []) : [];
  const isBlocked = paths.length === 0 || paths.every(isInBlockedPath);
  if (!isBlocked) {
    realVulns.push({ name, severity, advisory });
  }
}

if (realVulns.length === 0) {
  console.log(
    `[audit-filter] Sin vulnerabilidades reales >= ${SEVERITY_MIN} fuera de ${BLOCKED_PATH_HINTS.join(", ")}`,
  );
  process.exit(0);
}

console.error(`[audit-filter] ${realVulns.length} vulnerabilidad(es) relevante(s):`);
for (const v of realVulns) {
  console.error(` - ${v.name} (${v.severity})`);
  for (const a of v.advisory.via ?? []) {
    if (typeof a === "object" && a?.title) {
      console.error(`     • ${a.title}`);
    }
  }
}
process.exit(1);
