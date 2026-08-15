import { NewsModel, NewsStatus } from "@/model/News";

export const NEWS_STATUS_LABELS: Record<NewsStatus, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicada",
  ARCHIVED: "Archivada",
};

export const NEWS_STATUS_SHORT: Record<NewsStatus, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicada",
  ARCHIVED: "Archivada",
};

export const NEWS_STATUS_HELP: Record<NewsStatus, string> = {
  DRAFT: "Visible solo para administradores.",
  PUBLISHED: "Se muestra en la home y la página de noticias.",
  ARCHIVED: "Oculta del listado público, conservada para historial.",
};

export const NEWS_STATUS_TONE: Record<
  NewsStatus,
  { bg: string; text: string; border: string; ring: string; dot: string }
> = {
  DRAFT: {
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    border: "border-amber-500/40",
    ring: "ring-amber-500/20",
    dot: "bg-amber-400",
  },
  PUBLISHED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    ring: "ring-emerald-500/20",
    dot: "bg-emerald-400",
  },
  ARCHIVED: {
    bg: "bg-slate-500/10",
    text: "text-slate-300",
    border: "border-slate-500/40",
    ring: "ring-slate-500/20",
    dot: "bg-slate-400",
  },
};

export function getNewsStatus(n: NewsModel): NewsStatus {
  return n.status ?? "PUBLISHED";
}

export type NewsFilter = "ALL" | NewsStatus;
export type NewsSort = "newest" | "oldest" | "title";

export const NEWS_FILTERS: { id: NewsFilter; label: string }[] = [
  { id: "ALL", label: "Todas" },
  { id: "PUBLISHED", label: "Publicadas" },
  { id: "DRAFT", label: "Borradores" },
  { id: "ARCHIVED", label: "Archivadas" },
];

export const NEWS_SORTS: { id: NewsSort; label: string }[] = [
  { id: "newest", label: "Más recientes" },
  { id: "oldest", label: "Más antiguas" },
  { id: "title", label: "Por título" },
];

export function filterNews(list: NewsModel[], filter: NewsFilter): NewsModel[] {
  if (filter === "ALL") return list;
  return list.filter((n) => getNewsStatus(n) === filter);
}

export function searchNews(list: NewsModel[], query: string): NewsModel[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.sub_title.toLowerCase().includes(q) ||
      n.author.toLowerCase().includes(q),
  );
}

export function sortNews(list: NewsModel[], sort: NewsSort): NewsModel[] {
  const copy = [...list];
  if (sort === "newest") {
    copy.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  } else if (sort === "oldest") {
    copy.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
  } else {
    copy.sort((a, b) => a.title.localeCompare(b.title, "es"));
  }
  return copy;
}

export function summarize(list: NewsModel[]) {
  const total = list.length;
  const published = list.filter((n) => getNewsStatus(n) === "PUBLISHED").length;
  const drafts = list.filter((n) => getNewsStatus(n) === "DRAFT").length;
  const archived = list.filter((n) => getNewsStatus(n) === "ARCHIVED").length;
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const recent = list.filter((n) => {
    const t = Date.parse(n.created_at);
    return Number.isFinite(t) && now - t <= sevenDays;
  }).length;
  return { total, published, drafts, archived, recent };
}

export function formatNewsDate(input: string): string {
  const t = Date.parse(input);
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatRelative(input: string): string {
  const t = Date.parse(input);
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  const min = 60 * 1000;
  const h = 60 * min;
  const d = 24 * h;
  if (diff < min) return "hace un momento";
  if (diff < h) return `hace ${Math.floor(diff / min)} min`;
  if (diff < d) return `hace ${Math.floor(diff / h)} h`;
  if (diff < 7 * d) return `hace ${Math.floor(diff / d)} d`;
  return formatNewsDate(input);
}
