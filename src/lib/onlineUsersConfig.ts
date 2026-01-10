import fs from "fs/promises";
import path from "path";

export type OnlineUsersConfig = {
  enabled: boolean;
  showCount: boolean;
  showList: boolean;
  refreshSeconds: number;
  listLimit: number;
  label: string;
};

const DEFAULT_CONFIG: OnlineUsersConfig = {
  enabled: true,
  showCount: true,
  showList: true,
  refreshSeconds: 30,
  listLimit: 10,
  label: "Usuarios conectados",
};

const CONFIG_PATH = path.join(process.cwd(), "data", "online-users.json");

const normalizeConfig = (
  value: Partial<OnlineUsersConfig>
): OnlineUsersConfig => {
  const refreshSeconds = Number(value.refreshSeconds);
  const listLimit = Number(value.listLimit);

  return {
    enabled: Boolean(value.enabled),
    showCount: Boolean(value.showCount),
    showList: Boolean(value.showList),
    refreshSeconds: Number.isFinite(refreshSeconds)
      ? Math.min(Math.max(refreshSeconds, 5), 300)
      : DEFAULT_CONFIG.refreshSeconds,
    listLimit: Number.isFinite(listLimit)
      ? Math.min(Math.max(listLimit, 1), 50)
      : DEFAULT_CONFIG.listLimit,
    label:
      typeof value.label === "string" && value.label.trim().length > 0
        ? value.label.trim().slice(0, 40)
        : DEFAULT_CONFIG.label,
  };
};

const ensureConfigFile = async (): Promise<OnlineUsersConfig> => {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const merged = normalizeConfig({ ...DEFAULT_CONFIG, ...parsed });
    return merged;
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
  return DEFAULT_CONFIG;
};

export const getOnlineUsersConfig = async (): Promise<OnlineUsersConfig> => {
  const config = await ensureConfigFile();
  return normalizeConfig(config);
};

export const saveOnlineUsersConfig = async (
  updates: Partial<OnlineUsersConfig>
): Promise<OnlineUsersConfig> => {
  const current = await ensureConfigFile();
  const next = normalizeConfig({ ...current, ...updates });
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(next, null, 2));
  return next;
};
