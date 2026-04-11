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
import { useEffect, useState, useRef, useCallback } from "react";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardModalShell } from "@/components/dashboard/DashboardModalShell";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";

interface NewsProps {
  token: string;
}

const NewsAdministrator: React.FC<NewsProps> = ({ token }) => {
  const [newsList, setNewsList] = useState<NewsModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
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
  const [globalIdCard, setGlobalIdCard] = useState<number>(0);

  const [form, setForm] = useState({
    title: "",
    sub_title: "",
    img_url: "",
    author: "",
  });
  const openSubnewsForm = (id: number) => {
    setParentNewsId(id);
    setSubnewsForm({ title: "", content: "", imgUrl: "" });
    setShowCreateSubnewsForm(true);
  };

  // Estado para la noticia seleccionada (para actualizar o crear subnoticias)
  const [selectedNews, setSelectedNews] = useState<NewsModel | null>(null);

  // Estado para la página actual
  const [page, setPage] = useState(0);

  // Referencia para el observer del scroll infinito
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Función para seleccionar noticia y cargar datos en formulario
  const handleSelectNews = (news: NewsModel) => {
    setForm({
      title: news.title,
      sub_title: news.sub_title,
      img_url: news.img_url,
      author: news.author,
    });
    setSelectedNews(news);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (reset = false) => {
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

      if (reset) {
        // Cuando reseteamos, reemplazar toda la lista
        setNewsList(news);
        // Solo incrementar página si hay noticias y hay más por cargar
        if (news.length === 6) {
          setPage(1);
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      } else {
        // Cuando cargamos más, agregar a la lista existente
        setNewsList((prev) => {
          // Evitar duplicados comparando IDs
          const existingIds = new Set(prev.map(n => n.id));
          const newNews = news.filter(n => !existingIds.has(n.id));
          return [...prev, ...newNews];
        });
        setPage((prev) => prev + 1);
      }

      // Si recibimos menos noticias de las esperadas, no hay más
      if (news.length < 6) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load news:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Función para cargar más noticias
  const loadMoreNews = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchData(false);
    }
  }, [loadingMore, hasMore, page]);

  // Configurar Intersection Observer para scroll infinito
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreNews();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreNews, hasMore, loadingMore]);

  // Función para actualizar noticia
  const handleUpdate = async () => {
    if (!selectedNews) {
      await Swal.fire({
        title: "Seleccione una noticia",
        text: "Por favor, seleccione una noticia para actualizar.",
        icon: "warning",
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    // Validar campos requeridos
    if (!form.title || !form.title.trim()) {
      await Swal.fire({
        title: "Campo requerido",
        text: "El título es obligatorio",
        icon: "warning",
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    if (!form.sub_title || !form.sub_title.trim()) {
      await Swal.fire({
        title: "Campo requerido",
        text: "El subtítulo es obligatorio",
        icon: "warning",
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    if (!form.author || !form.author.trim()) {
      await Swal.fire({
        title: "Campo requerido",
        text: "El autor es obligatorio",
        icon: "warning",
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    try {
      await updateNew(
        selectedNews.id,
        form.title.trim(),
        form.sub_title.trim(),
        form.img_url.trim(),
        form.author.trim(),
        token
      );

      await Swal.fire({
        title: "¡Éxito!",
        text: "La noticia ha sido actualizada correctamente.",
        icon: "success",
        color: "white",
        background: "#0B1218",
      });

      // Limpiar formulario
      setForm({
        title: "",
        sub_title: "",
        img_url: "",
        author: "",
      });
      setSelectedNews(null);

      // Resetear y recargar datos
      await fetchData(true);
    } catch (error: any) {
      console.error("Error al actualizar noticia:", error);
      await Swal.fire({
        title: "Error",
        text: error.message || "No se pudo actualizar la noticia",
        icon: "error",
        color: "white",
        background: "#0B1218",
      });
    }
  };

  // Función para crear noticia
  const handleCreate = async () => {
    // Validar campos requeridos
    if (!form.title || !form.title.trim()) {
      await Swal.fire({
        title: "Campo requerido",
        text: "El título es obligatorio",
        icon: "warning",
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    if (!form.sub_title || !form.sub_title.trim()) {
      await Swal.fire({
        title: "Campo requerido",
        text: "El subtítulo es obligatorio",
        icon: "warning",
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    if (!form.author || !form.author.trim()) {
      await Swal.fire({
        title: "Campo requerido",
        text: "El autor es obligatorio",
        icon: "warning",
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    try {
      await createNew(
        form.title.trim(),
        form.sub_title.trim(),
        form.img_url.trim(),
        form.author.trim(),
        token
      );

      await Swal.fire({
        title: "¡Éxito!",
        text: "La noticia ha sido creada correctamente.",
        icon: "success",
        color: "white",
        background: "#0B1218",
      });

      // Limpiar formulario
      setForm({
        title: "",
        sub_title: "",
        img_url: "",
        author: "",
      });
      setSelectedNews(null);

      // Resetear y recargar datos
      await fetchData(true);
    } catch (error: any) {
      console.error("Error al crear noticia:", error);
      await Swal.fire({
        title: "Error",
        text: error.message || "No se pudo crear la noticia",
        icon: "error",
        color: "white",
        background: "#0B1218",
      });
    }
  };

  const handleCreateSubnews = async (id: number) => {
    try {
      await createNewSection(
        id,
        form.title,
        form.sub_title,
        form.img_url,
        form.author,
        token
      );

      await Swal.fire({
        title: "¡Éxito!",
        text: "La subnoticia ha sido creada correctamente.",
        icon: "success",
      });

      fetchData(true);
    } catch (error: any) {
      console.error("Error al crear subnoticia:", error);
      await Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    }
  };

  // Función para mostrar subnoticias
  const handleShowSubnews = async (id: number) => {
    if (!id) {
      alert("Seleccione una noticia para ver sus subnoticias.");
      return;
    }
    try {
      setLoadingSubnews(true);
      const newsWithSections = await getNewsById(id);
      setSubnewsList(newsWithSections.sections);
      setShowSubnewsModal(true);
      setGlobalIdCard(id);
    } catch (error) {
      alert("Error cargando subnoticias: " + error);
    } finally {
      setLoadingSubnews(false);
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

      await Swal.fire({
        title: "¡Eliminada!",
        text: "La noticia ha sido eliminada correctamente.",
        icon: "success",
        confirmButtonColor: "#3085d6",
        color: "white",
        background: "#0B1218",
      });
      // Resetear y recargar para evitar duplicados
      await fetchData(true);
    } catch (error) {
      console.error("Error al eliminar noticia:", error);
      await Swal.fire({
        title: "Error",
        text: "No se pudo eliminar la noticia.",
        icon: "error",
        confirmButtonColor: "#e3342f",
      });
    }
  };

  const handleDeleteSubNews = async (sectionId: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar sub noticia?",
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
      
      await Swal.fire({
        title: "¡Eliminada!",
        text: "La subnoticia ha sido eliminada correctamente.",
        icon: "success",
        confirmButtonColor: "#3085d6",
        color: "white",
        background: "#0B1218",
      });
      
      // Recargar datos de subnoticias
      if (globalIdCard) {
        const newsWithSections = await getNewsById(globalIdCard);
        setSubnewsList(newsWithSections.sections);
      }
    } catch (error) {
      console.error("Error al eliminar noticia:", error);
      await Swal.fire({
        title: "Error",
        text: "No se pudo eliminar la noticia.",
        icon: "error",
        confirmButtonColor: "#e3342f",
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen overflow-y-auto">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border-b border-slate-600/30 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Administrador de Noticias
        </h1>
        <p className="text-slate-300">
          Gestiona las noticias y subnoticias del servidor
        </p>
      </div>

      <div className="p-8">
        <div className="max-w-8xl mx-auto space-y-8">
          {/* Formulario */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-10 shadow-xl hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Agregar / Editar Noticia
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block mb-2 font-semibold text-slate-200 text-lg">
                  Título
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="Título de la noticia"
                  required
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-slate-200 text-lg">
                  Subtítulo
                </label>
                <input
                  type="text"
                  name="sub_title"
                  value={form.sub_title}
                  onChange={handleInputChange}
                  placeholder="Subtítulo de la noticia"
                  required
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-slate-200 text-lg">
                  URL de Imagen
                </label>
                <input
                  type="text"
                  name="img_url"
                  value={form.img_url}
                  onChange={handleInputChange}
                  placeholder="URL de la imagen"
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-slate-200 text-lg">
                  Autor
                </label>
                <input
                  type="text"
                  name="author"
                  value={form.author}
                  onChange={handleInputChange}
                  placeholder="Nombre del autor"
                  required
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCreate}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold px-8 py-4 rounded-lg border border-green-400/30 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 text-lg"
              >
                Crear Noticia
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold px-8 py-4 rounded-lg border border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 text-lg"
              >
                Actualizar Noticia
              </button>
            </div>
          </div>

          {/* Noticias existentes */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-10 shadow-xl hover:shadow-2xl hover:border-orange-400/50 transition-all duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Noticias Existentes
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-orange-400 to-amber-400 mx-auto rounded-full"></div>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="relative">
                  <div className="animate-spin h-12 w-12 text-blue-400"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newsList.map((news) => (
                    <div
                      key={news.id}
                      className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 rounded-xl border border-slate-500/50 hover:border-blue-400/70 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 p-6 shadow-lg transform hover:scale-105 h-[450px] flex flex-col justify-between cursor-pointer backdrop-blur-sm"
                      onClick={() => handleSelectNews(news)}
                    >
                      <div>
                        <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden">
                          <img
                            src={news.img_url}
                            alt={news.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-3 leading-tight line-clamp-2">
                          {news.title}
                        </h4>
                        <p className="text-sm text-slate-200 mb-4 line-clamp-3 leading-relaxed">
                          {news.sub_title}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-300 mt-auto">
                          <span className="font-semibold text-white bg-slate-700/50 px-2 py-1 rounded">
                            {news.author}
                          </span>
                          <span className="text-slate-300 bg-slate-600/50 px-2 py-1 rounded">
                            {new Date(news.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Botones dentro de la tarjeta */}
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openSubnewsForm(news.id);
                          }}
                          className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-lg border border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-sm shadow-md"
                        >
                          Crear Subnoticia
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowSubnews(news.id);
                            }}
                            className="px-3 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-lg border border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 text-sm shadow-md"
                          >
                            Ver Subnoticias
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNews(news.id);
                            }}
                            className="px-3 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg border border-red-500/50 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 text-sm shadow-md"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Indicador de carga para scroll infinito */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center py-8">
                    {loadingMore ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-6 w-6 text-blue-400"></div>
                        <span className="text-slate-300">
                          Cargando más noticias...
                        </span>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-sm">
                        Desplázate hacia abajo para cargar más noticias
                      </div>
                    )}
                  </div>
                )}

                {!hasMore && newsList.length > 0 && (
                  <div className="text-center py-8">
                    <div className="text-slate-400 text-sm">
                      No hay más noticias disponibles
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <DashboardModalShell
        open={showSubnewsModal}
        onClose={() => {
          setShowSubnewsModal(false);
          setSubnewsList([]);
          setGlobalIdCard(0);
        }}
        title="Subnoticias"
        subtitle={selectedNews?.title ?? ""}
        maxWidthClass="max-w-5xl"
        accent="amber"
        footer={
          !loadingSubnews && subnewsList.length > 0 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                Total de subnoticias:{" "}
                <span className="font-bold text-amber-400">{subnewsList.length}</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowSubnewsModal(false);
                  setSubnewsList([]);
                  setGlobalIdCard(0);
                }}
                className="rounded-xl border border-slate-600/60 bg-slate-800/90 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700/90"
              >
                Cerrar
              </button>
            </div>
          ) : undefined
        }
      >
        {loadingSubnews ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 blur-xl" />
            </div>
            <p className={`mt-4 text-lg ${DASHBOARD_PALETTE.textMuted}`}>Cargando subnoticias...</p>
          </div>
        ) : subnewsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mb-4 h-24 w-24 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className={`text-lg font-medium ${DASHBOARD_PALETTE.textMuted}`}>No hay subnoticias disponibles</p>
            <p className={`mt-2 text-sm ${DASHBOARD_PALETTE.textMuted}`}>Crea una subnoticia para comenzar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {subnewsList
              .sort((a, b) => (a.section_order || 0) - (b.section_order || 0))
              .map((section) => (
                <div
                  key={section.id}
                  className="group overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/15"
                >
                  {section.img_url && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={section.img_url}
                        alt={section.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/400x200?text=No+Image";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute right-3 top-3">
                        <span className="rounded-full bg-amber-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                          #{section.section_order || section.id}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    <h4 className="mb-3 line-clamp-2 text-lg font-bold text-white transition-colors duration-200 group-hover:text-amber-400">
                      {section.title}
                    </h4>

                    {section.content && (
                      <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-slate-300">{section.content}</p>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-700/50 pt-3">
                      <span className="rounded bg-slate-700/50 px-2 py-1 text-xs text-slate-400">
                        Orden: {section.section_order || section.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubNews(section.id)}
                        className="flex items-center space-x-2 rounded-lg border border-red-500/50 bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:from-red-500 hover:to-red-600 hover:shadow-lg hover:shadow-red-500/30"
                        aria-label={`Eliminar subnoticia ${section.title}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </DashboardModalShell>
      <DashboardModalShell
        open={showCreateSubnewsForm}
        onClose={() => setShowCreateSubnewsForm(false)}
        title="Crear subnoticia"
        subtitle={parentNewsId != null ? `Noticia padre #${parentNewsId}` : undefined}
        maxWidthClass="max-w-lg"
        accent="emerald"
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateSubnewsForm(false)}
              className="rounded-xl border border-slate-600/60 bg-slate-800/90 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700/90"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  if (!parentNewsId) return;
                  await createNewSection(
                    parentNewsId,
                    subnewsForm.title,
                    subnewsForm.content,
                    subnewsForm.imgUrl,
                    "",
                    token
                  );
                  await Swal.fire("Éxito", "Subnoticia creada correctamente", "success");
                  setShowCreateSubnewsForm(false);
                  fetchData();
                } catch (err: unknown) {
                  console.error("Error al crear subnoticia:", err);
                  const message = err instanceof Error ? err.message : "Error desconocido";
                  await Swal.fire("Error", message, "error");
                }
              }}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Crear
            </button>
          </div>
        }
      >
        <div className={`grid gap-4 ${DASHBOARD_PALETTE.text}`}>
          <div>
            <label className={`mb-2 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>Título</label>
            <input
              type="text"
              name="title"
              value={subnewsForm.title}
              onChange={(e) => setSubnewsForm({ ...subnewsForm, title: e.target.value })}
              placeholder="Título"
              className={DASHBOARD_PALETTE.input}
            />
          </div>
          <div>
            <label className={`mb-2 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>Contenido</label>
            <textarea
              name="content"
              value={subnewsForm.content}
              onChange={(e) => setSubnewsForm({ ...subnewsForm, content: e.target.value })}
              placeholder="Contenido"
              rows={4}
              className={`resize-none ${DASHBOARD_PALETTE.input}`}
            />
          </div>
          <div>
            <label className={`mb-2 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>URL de imagen</label>
            <input
              type="text"
              name="imgUrl"
              value={subnewsForm.imgUrl}
              onChange={(e) => setSubnewsForm({ ...subnewsForm, imgUrl: e.target.value })}
              placeholder="https://..."
              className={DASHBOARD_PALETTE.input}
            />
          </div>
        </div>
      </DashboardModalShell>
    </div>
  );
};

export default NewsAdministrator;
