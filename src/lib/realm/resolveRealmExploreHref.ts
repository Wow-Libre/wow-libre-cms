/** Returns null when the CMS redirect still points at the removed /vdp route. */
export function resolveRealmExploreHref(redirect: string | undefined | null): string | null {
  const value = redirect?.trim();
  if (!value) return null;

  try {
    const pathname = value.startsWith("http")
      ? new URL(value).pathname
      : value.split("?")[0];
    if (pathname === "/vdp" || pathname.endsWith("/vdp")) {
      return null;
    }
  } catch {
    if (value.includes("/vdp")) return null;
  }

  return value;
}
