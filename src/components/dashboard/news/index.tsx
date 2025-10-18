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
import Swal from "sweetalert2";

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
        setNewsList(news);
      } else {
        setNewsList((prev) => [...prev, ...news]);
      }

      // Si recibimos menos noticias de las esperadas, no hay más
      if (news.length < 6) {
        setHasMore(false);
      }

      if (!reset) {
        setPage((prev) => prev + 1);
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
      fetchData();
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

  // Función para actualizar noticia (a completar según backend)
  const handleUpdate = async () => {
    if (!selectedNews) {
      alert("Seleccione una noticia para actualizar.");
      return;
    }
    try {
      await updateNew(
        selectedNews.id,
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

  // Función para crear subnoticia
  const handleCreate = async () => {
    try {
      await createNew(
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
      setNewsList((prev) => prev.filter((n) => n.id !== id));

      await Swal.fire({
        title: "¡Eliminada!",
        text: "La noticia ha sido eliminada correctamente.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      fetchData();
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
      setSubnewsList((prev) =>
        prev.filter((section) => section.id !== sectionId)
      );
      await Swal.fire({
        title: "¡Eliminada!",
        text: "La noticia ha sido eliminada correctamente.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      fetchData();
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

      {showSubnewsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto">
            <h3 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-3">
              Subnoticias de:{" "}
              <span className="text-orange-400">{selectedNews?.title}</span>
            </h3>

            {loadingSubnews ? (
              <p className="text-gray-400 text-center">
                Cargando subnoticias...
              </p>
            ) : subnewsList.length === 0 ? (
              <p className="text-gray-400 text-center">
                No hay subnoticias disponibles.
              </p>
            ) : (
              <ul className="divide-y divide-gray-700">
                {subnewsList.map(({ id, title }) => (
                  <li
                    key={id}
                    className="flex items-center justify-between py-3 hover:bg-gray-700 rounded px-3 transition"
                  >
                    <div>
                      <span className="text-sm font-semibold text-orange-400 mr-2">
                        {id}.
                      </span>
                      <span className="text-white text-base">{title}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSubNews(id)}
                      className="text-red-500 hover:text-red-600 transition"
                      aria-label={`Eliminar subnoticia ${title}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSubnewsModal(false)}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 rounded-md font-semibold text-white shadow-md transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {showCreateSubnewsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-lg">
            <h3 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-3">
              Crear Subnoticia
            </h3>
            <div className="grid gap-4 mb-4">
              <input
                type="text"
                name="title"
                value={subnewsForm.title}
                onChange={(e) =>
                  setSubnewsForm({ ...subnewsForm, title: e.target.value })
                }
                placeholder="Título"
                className="p-3 rounded bg-gray-700 text-white placeholder-gray-400"
              />
              <textarea
                name="content"
                value={subnewsForm.content}
                onChange={(e) =>
                  setSubnewsForm({ ...subnewsForm, content: e.target.value })
                }
                placeholder="Contenido"
                rows={4}
                className="p-3 rounded bg-gray-700 text-white placeholder-gray-400 resize-none"
              />
              <input
                type="text"
                name="imgUrl"
                value={subnewsForm.imgUrl}
                onChange={(e) =>
                  setSubnewsForm({ ...subnewsForm, imgUrl: e.target.value })
                }
                placeholder="URL de imagen"
                className="p-3 rounded bg-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCreateSubnewsForm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!parentNewsId) return;
                    await createNewSection(
                      parentNewsId,
                      subnewsForm.title,
                      subnewsForm.content,
                      subnewsForm.imgUrl,
                      "", // Si también necesitas `author`, agrégalo al form
                      token
                    );
                    await Swal.fire(
                      "Éxito",
                      "Subnoticia creada correctamente",
                      "success"
                    );
                    setShowCreateSubnewsForm(false);
                    fetchData();
                  } catch (err: any) {
                    console.error("Error al crear subnoticia:", err);
                    await Swal.fire("Error", err.message, "error");
                  }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsAdministrator;
