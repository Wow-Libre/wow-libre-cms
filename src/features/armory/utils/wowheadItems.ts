"use client";

const iconCache = new Map<number, string>();

export function wowheadItemUrl(itemId: number): string {
  return `https://www.wowhead.com/item=${itemId}`;
}

export function itemIconUrl(iconName: string): string {
  return `https://wow.zamimg.com/images/wow/icons/large/${iconName}.jpg`;
}

export async function resolveItemIcon(itemId: number): Promise<string | null> {
  if (iconCache.has(itemId)) {
    return iconCache.get(itemId) ?? null;
  }

  const envs = ["", "?dataEnv=8", "?dataEnv=12"];
  for (const env of envs) {
    try {
      const response = await fetch(
        `https://nether.wowhead.com/tooltip/item/${itemId}${env}`,
        { mode: "cors" }
      );
      if (!response.ok) continue;
      const data = await response.json();
      const icon = data?.icon as string | undefined;
      if (icon) {
        iconCache.set(itemId, icon);
        return icon;
      }
    } catch {
      // try next env
    }
  }
  return null;
}
