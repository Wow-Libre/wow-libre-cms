export function parseWoWMoney(copper: number): {
  gold: number;
  silver: number;
  copper: number;
} {
  const total = Math.max(0, Math.floor(copper));
  return {
    gold: Math.floor(total / 10000),
    silver: Math.floor((total % 10000) / 100),
    copper: total % 100,
  };
}

export function formatWoWMoney(copper: number): string {
  const { gold, silver, copper: c } = parseWoWMoney(copper);
  return `${gold.toLocaleString()}g ${silver}s ${c}c`;
}

export function formatPlaytimeSeconds(seconds: number): string {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

export function formatUnixTimestamp(unixSeconds?: number): string | null {
  if (!unixSeconds || unixSeconds <= 0) return null;
  return new Date(unixSeconds * 1000).toLocaleString();
}
