"use client";

import { getProducts } from "@/api/store";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import { useUserContext } from "@/context/UserContext";
import { CategoryDetail } from "@/model/model";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const STORE_HERO_VIDEO =
  "https://video.wixstatic.com/video/5dd8a0_8f4b4a4ca3384ba19443b397721c7282/720p/mp4/file.mp4";
const STORE_SIDE_SWORD =
  "https://static.wixstatic.com/media/5dd8a0_9222be68baa94d82b57cdd840b2ec278~mv2.png";

const Store = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<{
    [key: string]: CategoryDetail[];
  }>({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyDiscount, setShowOnlyDiscount] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">(
    "featured",
  );
  const [loading, setLoading] = useState(true);
  const { user } = useUserContext();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts(user.language);
        let categoriesObject: { [key: string]: CategoryDetail[] } = {};
        if (productsData instanceof Map) {
          categoriesObject = Object.fromEntries(productsData);
        } else if (typeof productsData === "object" && productsData !== null) {
          categoriesObject = productsData as {
            [key: string]: CategoryDetail[];
          };
        }

        setCategories(categoriesObject);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const handleSelectItem = (id: string) => {
    router.push(`/store/${id}`);
  };

  const categoryNames = useMemo(() => Object.keys(categories), [categories]);
  const totalProducts = useMemo(
    () =>
      Object.values(categories).reduce(
        (sum, details) => sum + (details[0]?.products?.length ?? 0),
        0,
      ),
    [categories],
  );

  useEffect(() => {
    if (categoryNames.length === 0) {
      setSelectedCategory("");
      return;
    }

    if (!selectedCategory || !categoryNames.includes(selectedCategory)) {
      setSelectedCategory(categoryNames[0]);
    }
  }, [categoryNames, selectedCategory]);

  const selectedCategoryDetails = selectedCategory
    ? categories[selectedCategory]
    : undefined;
  const selectedProducts = selectedCategoryDetails?.[0]?.products ?? [];

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = selectedProducts.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        product.partner.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;
      if (!showOnlyDiscount) return true;
      return product.discount > 0;
    });

    if (sortBy === "featured") return filtered;

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const priceA = a.discount > 0 ? a.discount_price : a.price;
      const priceB = b.discount > 0 ? b.discount_price : b.price;
      return sortBy === "price-asc" ? priceA - priceB : priceB - priceA;
    });
    return sorted;
  }, [searchTerm, selectedProducts, showOnlyDiscount, sortBy]);

  return (
    <div className="relative min-h-screen overflow-visible text-slate-100">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-45 mix-blend-screen [background-image:radial-gradient(circle,rgba(56,189,248,0.70)_0_2px,transparent_3px),radial-gradient(circle,rgba(14,165,233,0.60)_0_1.6px,transparent_2.6px),radial-gradient(circle,rgba(59,130,246,0.55)_0_1.2px,transparent_2px)] [background-size:180px_180px,240px_220px,300px_260px] [animation:embers-drift-blue_9.2s_ease-in-out_infinite]" />
      <img
        src={STORE_SIDE_SWORD}
        alt="Decoracion espada helada"
        className="store-sword-animated pointer-events-none absolute left-12 bottom-10 z-[1] hidden w-[27rem] opacity-70 lg:block xl:w-[33rem]"
      />
      <div className="relative z-30 contenedor">
        <NavbarAuthenticated />
      </div>
      <main className="relative z-10 pt-16">
        <section className="border-b border-slate-800/60">
          <div className="mx-auto w-full max-w-[92rem] px-4 py-12 sm:px-6 lg:px-12">
            <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={STORE_HERO_VIDEO}
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/85" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(6,182,212,0.32),_rgba(2,6,23,0.1)_45%)]" />
              <div className="relative p-8 sm:p-10">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/90">
                  Wow Libre Store
                </p>
                <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  Catálogo premium de la tienda
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">
                  Compra por categoría, compara precios con claridad y entra
                  rápido al detalle del producto que necesitas.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-2.5">
                    <p className="text-sm uppercase tracking-wide text-slate-400">
                      Categorías
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {categoryNames.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-2.5">
                    <p className="text-sm uppercase tracking-wide text-slate-400">
                      Productos
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {totalProducts}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="relative">
          {loading && (
            <div className="mx-auto flex min-h-[45vh] max-w-[92rem] items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
              <div className="text-center">
                <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400" />
                <h3 className="text-2xl font-semibold text-white">
                  Cargando productos...
                </h3>
                <p className="mt-2 text-base text-slate-400">
                  Preparando el catálogo de la tienda
                </p>
              </div>
            </div>
          )}

          {!loading && categoryNames.length > 0 && (
            <nav className="sticky top-16 z-20 mt-5">
              <div className="mx-auto w-full max-w-[92rem] px-4 py-3 sm:px-6 lg:px-12">
                <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/92 p-2 backdrop-blur-sm">
                  {categoryNames.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`whitespace-nowrap rounded-lg border px-5 py-3 text-lg font-semibold transition ${
                        selectedCategory === category
                          ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-100"
                          : "border-slate-700/80 bg-slate-900/80 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          )}

          {!loading && categoryNames.length === 0 && (
            <div className="mx-auto max-w-[92rem] px-4 py-16 text-center sm:px-6 lg:px-12">
              <p className="text-base text-slate-300">
                No hay productos disponibles por ahora.
              </p>
            </div>
          )}

          {!loading && selectedCategoryDetails && (
            <section className="mx-auto max-w-[92rem] px-4 py-10 sm:px-6 lg:px-12">
              <div className="mb-6 flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white sm:text-4xl">
                    {selectedCategory}
                  </h2>
                  {selectedCategoryDetails[0]?.disclaimer && (
                    <p className="mt-2 max-w-3xl text-base text-slate-300 sm:text-lg">
                      {selectedCategoryDetails[0].disclaimer}
                    </p>
                  )}
                </div>
                <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  {visibleProducts.length} productos
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por nombre, categoría o partner..."
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                />
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value as
                        | "featured"
                        | "price-asc"
                        | "price-desc",
                    )
                  }
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg text-slate-100 outline-none transition focus:border-cyan-400"
                >
                  <option value="featured">Orden: destacado</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                </select>
                <button
                  type="button"
                  onClick={() => setShowOnlyDiscount((prev) => !prev)}
                  className={`rounded-xl border px-4 py-3 text-lg font-medium transition ${
                    showOnlyDiscount
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                      : "border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200"
                  }`}
                >
                  Solo con descuento
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setShowOnlyDiscount(false);
                    setSortBy("featured");
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg font-medium text-slate-300 transition hover:border-cyan-400/60 hover:text-cyan-200"
                >
                  Limpiar filtros
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <article
                    key={product.id}
                    onClick={() => handleSelectItem(product.reference_number)}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/85 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:border-cyan-400/60"
                  >
                    <div className="relative">
                      <img
                        src={product.img_url}
                        alt={`Imagen de ${product.name}`}
                        className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                      {product.discount > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white">
                          -{product.discount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-xl font-semibold text-white transition group-hover:text-cyan-200">
                        {product.name}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-base text-slate-300">
                        {product.disclaimer}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-sm text-slate-300">
                          {product.category}
                        </span>
                        <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-sm text-slate-300">
                          {product.partner}
                        </span>
                      </div>

                      <div className="mt-5 border-t border-slate-800 pt-4">
                        {product.discount > 0 ? (
                          <>
                            <p className="text-2xl font-bold text-cyan-300">
                              {product.use_points === false
                                ? `$${product.discount_price} USD`
                                : `${Math.floor(
                                    product.discount_price,
                                  ).toLocaleString()} Points`}
                            </p>
                            <p className="mt-1 text-sm text-slate-500 line-through">
                              {product.use_points === false
                                ? `$${product.price.toLocaleString()} USD`
                                : `${product.price.toLocaleString()} Points`}
                            </p>
                          </>
                        ) : (
                          <p className="text-2xl font-bold text-cyan-300">
                            {product.use_points === false
                              ? `$${product.price.toLocaleString()} USD`
                              : `${product.price.toLocaleString()} Points`}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 inline-flex items-center gap-2 text-base font-semibold text-cyan-200">
                        Ver detalle
                        <span aria-hidden>→</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {visibleProducts.length === 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-300">
                  No encontramos productos con esos filtros en esta categoría.
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Store;
