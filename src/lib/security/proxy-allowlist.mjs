const DEFAULT_TRUSTED_HOSTS = [
    "wowlibre.com",
    "www.wowlibre.com",
    "api.wowlibre.com",
    "wow-core",
    "wow-core-internal",
    "localhost",
    "127.0.0.1",
];

function loadHostsFromEnv() {
    const fromEnv = process.env.NEXT_PUBLIC_TRUSTED_PROXY_HOSTS;
    if (!fromEnv) return [];
    return fromEnv
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}

export const TRUSTED_PROXY_HOSTS = new Set(
    [...DEFAULT_TRUSTED_HOSTS, ...loadHostsFromEnv()].map((h) => h.toLowerCase()),
);

export function allowedRewriteDestination(hostname) {
    if (!hostname) return false;
    const host = hostname.toLowerCase();
    if (TRUSTED_PROXY_HOSTS.has(host)) return true;
    for (const allowed of TRUSTED_PROXY_HOSTS) {
        if (allowed.startsWith("*.") && host.endsWith(allowed.slice(1))) {
            return true;
        }
    }
    return false;
}

export function isPathTraversal(value) {
    if (typeof value !== "string") return false;
    if (value.includes("\0")) return true;
    if (value.includes("\\")) return true;
    const segments = value.split("/");
    for (const seg of segments) {
        if (seg === "..") return true;
    }
    return false;
}

const SEGMENT_RE = /^[A-Za-z0-9._-]{1,128}$/;

export function isSafePathSegment(segment) {
    if (typeof segment !== "string") return false;
    if (segment.length === 0 || segment.length > 128) return false;
    if (segment.includes("%")) return false;
    if (segment.includes("//")) return false;
    return SEGMENT_RE.test(segment);
}

export function safeJoinUrl(base, segments) {
    const cleanBase = base.replace(/\/$/, "");
    const cleanSegments = segments
        .filter((s) => s !== undefined && s !== null)
        .map((s) => encodeURIComponent(String(s)))
        .join("/");
    return `${cleanBase}/${cleanSegments}`;
}
