import { NewsModel } from "@/model/News";

export type NewsFilter = "ALL";
export type NewsSort = "newest" | "oldest" | "title";

export const NEWS_FILTERS: { id: NewsFilter; label: string }[] = [
  { id: "ALL", label: "Todas" },
];

export const NEWS_SORTS: { id: NewsSort; label: string }[] = [
  { id: "newest", label: "Más recientes" },
  { id: "oldest", label: "Más antiguas" },
  { id: "title", label: "Por título" },
];

export function filterNews(list: NewsModel[]): NewsModel[] {
  return list;
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
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const recent = list.filter((n) => {
    const t = Date.parse(n.created_at);
    return Number.isFinite(t) && now - t <= sevenDays;
  }).length;
  const subtitled = list.filter((n) => !!n.sub_title?.trim()).length;
  const withImage = list.filter((n) => !!n.img_url?.trim()).length;
  return { total, recent, subtitled, withImage };
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
