"use client";

import {
  createNew,
  createNewSection,
  deleteNewsById,
  deleteNewSection,
  getNews,
  getNewsById,
  updateNew,
} from "@/api/news";
import { NewsModel } from "@/model/News";
import { Section } from "@/model/NewsSections";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardModalShell } from "@/components/dashboard/DashboardModalShell";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";
import { NewsImageUploader } from "@/components/dashboard/news/NewsImageUploader";
import { NewsCard } from "@/components/dashboard/news/NewsCard";
import { NewsEditor, EMPTY_NEWS_FORM, NewsFormState } from "@/components/dashboard/news/NewsEditor";
import { NewsEmptyState } from "@/components/dashboard/news/NewsEmptyState";
import { NewsStats } from "@/components/dashboard/news/NewsStats";
import { NewsToolbar } from "@/components/dashboard/news/NewsToolbar";
import { NewsCardSkeletonList } from "@/components/dashboard/news/NewsCardSkeleton";
import { NewsToastViewport, showNewsToast } from "@/components/dashboard/news/newsToast";
import {
  searchNews,
  sortNews,
  NewsSort,
} from "@/components/dashboard/news/newsHelpers";

interface NewsProps {
  token: string;
}

const NewsAdministrator: React.FC<NewsProps> = ({ token }) => {
  const [newsList, setNewsList] = useState<NewsModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<NewsSort>("newest");

  const [form, setForm] = useState<NewsFormState>(EMPTY_NEWS_FORM);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [subnewsList, setSubnewsList] = useState<Section[]>([]);
  const [showSubnewsModal, setShowSubnewsModal] = useState(false);
  const [loadingSubnews, setLoadingSubnews] = useState(false);
  const [subnewsForm, setSubnewsForm] = useState({
    title: "",
    content: "",
    imgUrl: "",
  });
  const [showCreateSubnewsForm, setShowCreateSubnewsForm] = useState(false);
  const [parentNewsId, setParentNewsId] = useState<number | null>(null);
  const [globalIdCard, setGlobalIdCard] = useState(0);

  const [subnewsCounts, setSubnewsCounts] = useState<Record<number, number>>({});

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchData = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(0);
      setNewsList([]);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const currentPage = reset ? 0 : page;
      const news = await getNews(6, currentPage);
      setNewsList((prev) => {
        if (reset) return news;
        const existingIds = new Set(prev.map((n) => n.id));
        return [...prev, ...news.filter((n) => !existingIds.has(n.id))];
      });
      setPage((prev) => (reset ? 1 : prev + 1));
      if (news.length < 6) setHasMore(false);
    } catch (error) {
      console.error("Failed to load news:", error);
      showNewsToast("No se pudieron cargar las noticias", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMoreNews = useCallback(() => {
    if (!loadingMore && hasMore) fetchData(false);
  }, [loadingMore, hasMore, fetchData]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) loadMoreNews();
      },
      { threshold: 0.1 },
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMoreNews, hasMore, loadingMore]);

  const filteredNews = useMemo(() => {
    const searched = searchNews(newsList, query);
    return sortNews(searched, sort);
  }, [newsList, query, sort]);

  const resetForm = () => {
    setForm(EMPTY_NEWS_FORM);
    setSelectedId(null);
  };

  const handleSelect = (news: NewsModel) => {
    setForm({
      title: news.title,
      sub_title: news.sub_title,
      img_url: news.img_url,
      author: news.author,
    });
    setSelectedId(news.id);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEdit = (news: NewsModel) => handleSelect(news);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (selectedId !== null) {
        await updateNew(
          selectedId,
          form.title.trim(),
          form.sub_title.trim(),
          form.img_url.trim(),
          form.author.trim(),
          token,
        );
        showNewsToast("Noticia actualizada", "success");
      } else {
        await createNew(
          form.title.trim(),
          form.sub_title.trim(),
          form.img_url.trim(),
          form.author.trim(),
          token,
        );
        showNewsToast("Noticia creada", "success");
      }
      resetForm();
      await fetchData(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Operación fallida";
      showNewsToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNews = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar noticia?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e3342f",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteNewsById(id, token);
      showNewsToast("Noticia eliminada", "success");
      if (selectedId === id) resetForm();
      await fetchData(true);
    } catch {
      showNewsToast("No se pudo eliminar la noticia", "error");
    }
  };

  const handleShowSubnews = async (id: number) => {
    try {
      setLoadingSubnews(true);
      const newsWithSections = await getNewsById(id);
      setSubnewsList(newsWithSections.sections);
      setSubnewsCounts((prev) => ({
        ...prev,
        [id]: newsWithSections.sections.length,
      }));
      setShowSubnewsModal(true);
      setGlobalIdCard(id);
    } catch {
      showNewsToast("Error cargando subnoticias", "error");
    } finally {
      setLoadingSubnews(false);
    }
  };

  const openSubnewsForm = (id: number) => {
    setParentNewsId(id);
    setSubnewsForm({ title: "", content: "", imgUrl: "" });
    setShowCreateSubnewsForm(true);
  };

  const handleCreateSubnews = async () => {
    if (!parentNewsId) return;
    try {
      await createNewSection(
        parentNewsId,
        subnewsForm.title,
        subnewsForm.content,
        subnewsForm.imgUrl,
        "",
        token,
      );
      showNewsToast("Subnoticia creada", "success");
      setShowCreateSubnewsForm(false);
      setSubnewsCounts((prev) => ({
        ...prev,
        [parentNewsId]: (prev[parentNewsId] ?? 0) + 1,
      }));
      await fetchData(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      showNewsToast(msg, "error");
    }
  };

  const handleDeleteSubNews = async (sectionId: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar subnoticia?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e3342f",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteNewSection(globalIdCard, sectionId, token);
      showNewsToast("Subnoticia eliminada", "success");
      if (globalIdCard) {
        const n = await getNewsById(globalIdCard);
        setSubnewsList(n.sections);
        setSubnewsCounts((prev) => ({ ...prev, [globalIdCard]: n.sections.length }));
      }
    } catch {
      showNewsToast("No se pudo eliminar la subnoticia", "error");
    }
  };

  const hasQuery = query.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Columna lista */}
        <div className="space-y-4">
          <NewsToolbar
            query={query}
            onQueryChange={setQuery}
            sort={sort}
            onSortChange={setSort}
            count={filteredNews.length}
            onNew={resetForm}
          />

          <NewsStats list={newsList} />

          {loading ? (
            <NewsCardSkeletonList count={6} />
          ) : filteredNews.length === 0 ? (
            <NewsEmptyState
              hasQuery={hasQuery}
              onClear={() => setQuery("")}
              onNew={resetForm}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredNews.map((news) => (
                  <NewsCard
                    key={news.id}
                    news={news}
                    selected={selectedId === news.id}
                    onSelect={() => handleSelect(news)}
                    onEdit={() => handleEdit(news)}
                    onDelete={() => handleDeleteNews(news.id)}
                    onShowSubnews={() => handleShowSubnews(news.id)}
                    onCreateSubnews={() => openSubnewsForm(news.id)}
                    subnewsCount={subnewsCounts[news.id]}
                  />
                ))}
              </div>

              {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-6">
                  {loadingMore ? (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-500" />
                      Cargando más…
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">
                      Desplaza para cargar más
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Columna editor sticky */}
        <div className="xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)]">
          <NewsEditor
            state={form}
            onChange={setForm}
            token={token}
            selectedId={selectedId}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            onDelete={
              selectedId !== null ? () => handleDeleteNews(selectedId) : () => {}
            }
            submitting={submitting}
          />
        </div>
      </div>

      {/* Modal: listado de subnoticias */}
      <DashboardModalShell
        open={showSubnewsModal}
        onClose={() => {
          setShowSubnewsModal(false);
          setSubnewsList([]);
        }}
        title="Subnoticias"
        subtitle={`${subnewsList.length} elementos`}
        maxWidthClass="max-w-3xl"
        accent="amber"
        footer={
          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setShowSubnewsModal(false);
                if (globalIdCard) openSubnewsForm(globalIdCard);
              }}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
            >
              + Nueva subnoticia
            </button>
            <button
              type="button"
              onClick={() => setShowSubnewsModal(false)}
              className="rounded-xl border border-slate-600/60 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              Cerrar
            </button>
          </div>
        }
      >
        {loadingSubnews ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-amber-500" />
            <p className={`mt-3 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
              Cargando subnoticias…
            </p>
          </div>
        ) : subnewsList.length === 0 ? (
          <NewsEmptyState
            hasQuery={false}
            onClear={() => {}}
            onNew={() => {
              setShowSubnewsModal(false);
              if (globalIdCard) openSubnewsForm(globalIdCard);
            }}
          />
        ) : (
          <ul className="divide-y divide-slate-700/50">
            {subnewsList
              .sort((a, b) => (a.section_order || 0) - (b.section_order || 0))
              .map((section) => (
                <li
                  key={section.id}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  {section.img_url ? (
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={section.img_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-24 shrink-0 rounded-md bg-slate-800" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-300">
                        #{section.section_order || section.id}
                      </span>
                      <h4 className="line-clamp-1 text-sm font-semibold text-white">
                        {section.title}
                      </h4>
                    </div>
                    {section.content && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                        {section.content}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubNews(section.id)}
                    className="shrink-0 rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-500/10"
                    aria-label={`Eliminar ${section.title}`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </DashboardModalShell>

      {/* Modal: crear subnoticia */}
      <DashboardModalShell
        open={showCreateSubnewsForm}
        onClose={() => setShowCreateSubnewsForm(false)}
        title="Nueva subnoticia"
        subtitle={
          parentNewsId != null ? `Adjuntar a noticia #${parentNewsId}` : undefined
        }
        maxWidthClass="max-w-lg"
        accent="emerald"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateSubnewsForm(false)}
              className="rounded-xl border border-slate-600/60 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreateSubnews}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Crear subnoticia
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Título
            </label>
            <input
              type="text"
              value={subnewsForm.title}
              onChange={(e) =>
                setSubnewsForm({ ...subnewsForm, title: e.target.value })
              }
              placeholder="Título de la subnoticia"
              className={DASHBOARD_PALETTE.input}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Contenido
            </label>
            <textarea
              value={subnewsForm.content}
              onChange={(e) =>
                setSubnewsForm({ ...subnewsForm, content: e.target.value })
              }
              placeholder="Cuerpo de la subnoticia"
              rows={4}
              className={`resize-none ${DASHBOARD_PALETTE.input}`}
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-300">
              Imagen <span className="text-slate-500">(opcional)</span>
            </p>
            <NewsImageUploader
              token={token}
              value={subnewsForm.imgUrl}
              onChange={(url) => setSubnewsForm({ ...subnewsForm, imgUrl: url })}
              label=""
              context="news-subnews"
            />
          </div>
        </div>
      </DashboardModalShell>

      <NewsToastViewport />
    </div>
  );
};

export default NewsAdministrator;
