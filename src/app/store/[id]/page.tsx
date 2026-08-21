"use client";
import { getProduct } from "@/api/store";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import Buy from "@/components/store/purchase";
import {
  getExternalKeyStock,
  isExternalKeyOutOfStock,
  isExternalKeyStoreProduct,
} from "@/features/store/utils/externalKeyStock";
import { ProductDetail } from "@/model/model";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";

const REGISTER_DECORATIVE_TREANT =
  "https://static.wixstatic.com/media/5dd8a0_a1d175976a834a9aa2db34adb6d87d02~mv2.png";

const ctaPrimary =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-5 py-4 text-lg font-semibold text-white shadow-[0_14px_36px_rgba(8,145,178,0.42)] ring-1 ring-cyan-300/35 transition duration-300 hover:from-cyan-500 hover:to-sky-500 hover:shadow-[0_18px_44px_rgba(14,165,233,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

const ctaMuted =
  "inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-slate-800/70 px-5 py-4 text-lg font-semibold text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_24px_rgba(2,6,23,0.35)]";

const StoreDetail = () => {
  const { id } = useParams();
  const reference = String(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = Cookies.get("token");
  const [isError, setError] = useState(false);
  const [loggin, setLoggin] = useState(false);
  const router = useRouter();

  const [product, selectedProduct] = useState<ProductDetail>();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productFetch = await getProduct(reference);
        selectedProduct(productFetch);
        setError(false);
      } catch (err: any) {
        setError(true);
      }
    };

    fetchProducts();
    setLoggin(token != null);
  }, [token]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const isExternalKey = product ? isExternalKeyStoreProduct(product) : false;
  const externalKeyStock = product ? getExternalKeyStock(product) : null;
  const outOfStock = product ? isExternalKeyOutOfStock(product) : false;

  const stockLabel = useMemo(() => {
    if (!isExternalKey || externalKeyStock === null) return null;
    if (externalKeyStock <= 0) return "Agotado";
    if (externalKeyStock === 1) return "1 unidad disponible";
    return `${externalKeyStock} unidades disponibles`;
  }, [externalKeyStock, isExternalKey]);

  if (isError) {
    router.push("/store");
  }

  return (
    <div className="relative overflow-visible bg-midnight pb-16">
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
      <img
        src={REGISTER_DECORATIVE_TREANT}
        alt=""
        className="accounts-decoration-animated pointer-events-none absolute bottom-0 right-4 z-[1] hidden w-[20rem] opacity-80 drop-shadow-[0_0_28px_rgba(56,189,248,0.35)] md:block lg:right-10 lg:w-[24rem] xl:right-16 xl:w-[28rem]"
      />
      <div className="contenedor relative z-30 mb-6">
        <NavbarAuthenticated />
      </div>
      <div className="contenedor relative z-10 px-4 py-10 sm:px-8 lg:px-12">
        <Link
          href="/store"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-200"
        >
          <span aria-hidden>←</span>
          Volver a la tienda
        </Link>
        <div className="mb-20 flex flex-col items-start gap-10 lg:flex-row lg:gap-12">
          <div className="w-full flex-shrink-0 lg:w-2/3">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-[0_22px_60px_rgba(2,6,23,0.55)] ring-1 ring-cyan-400/10">
              <img
                src={product?.img_url}
                alt={product?.name ?? `Detalle ${id}`}
                className="h-auto max-h-[560px] w-full object-cover transition duration-500 hover:scale-[1.02]"
              />
            </div>
            <div className="mt-10 rounded-2xl border border-white/10 bg-slate-900/75 p-8 shadow-[0_18px_48px_rgba(2,6,23,0.5)] backdrop-blur-md sm:p-10 md:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                Descripción
              </p>
              <h3 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {product?.name}
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-slate-300 md:text-2xl">
                {product?.description}
              </p>
            </div>
          </div>

          <aside className="flex w-full flex-col rounded-2xl border border-white/10 bg-slate-900/80 p-8 shadow-[0_22px_55px_rgba(2,6,23,0.58),0_0_40px_rgba(8,145,178,0.08)] backdrop-blur-md sm:p-10 lg:sticky lg:top-28 lg:w-1/3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Resumen de compra
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              {product?.name}
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {product?.category ? (
                <span className="rounded-full border border-slate-700 bg-slate-800/90 px-3 py-1 text-sm text-slate-300 shadow-[0_6px_16px_rgba(0,0,0,0.25)]">
                  {product.category}
                </span>
              ) : null}
              {product?.partner ? (
                <span className="rounded-full border border-slate-700 bg-slate-800/90 px-3 py-1 text-sm text-slate-300 shadow-[0_6px_16px_rgba(0,0,0,0.25)]">
                  {product.partner}
                </span>
              ) : null}
            </div>
            {product?.disclaimer ? (
              <p className="mt-6 rounded-xl border border-amber-300/40 bg-gradient-to-br from-amber-400 to-yellow-500 p-5 text-base font-semibold leading-snug text-slate-950 shadow-[0_12px_28px_rgba(245,158,11,0.28)] md:text-xl">
                {product.disclaimer}
              </p>
            ) : null}

            {stockLabel && (
              <p
                className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold shadow-[0_10px_24px_rgba(2,6,23,0.35)] md:text-base ${
                  outOfStock
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                }`}
              >
                {stockLabel}
              </p>
            )}

            <div className="mt-10 rounded-xl border border-white/10 bg-slate-950/50 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              {product ? (
                <div className="flex flex-wrap items-end gap-4">
                  {product.discount > 0 ? (
                    <>
                      <p className="text-3xl font-extrabold text-cyan-300 drop-shadow-[0_8px_18px_rgba(34,211,238,0.35)] md:text-4xl">
                        {product.use_points === false
                          ? `$${(
                              product.price *
                              (1 - product.discount / 100)
                            ).toLocaleString()} USD`
                          : `${(
                              product.price *
                              (1 - product.discount / 100)
                            ).toLocaleString()} Points`}
                      </p>
                      <p className="text-lg text-slate-500 line-through">
                        {product.use_points === false
                          ? `$${product.price.toLocaleString()} USD`
                          : `${product.price.toLocaleString()} Points`}
                      </p>
                      <span className="rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 px-3 py-1 text-xs font-bold text-slate-950 shadow-[0_8px_20px_rgba(16,185,129,0.4)]">
                        {product.discount}% OFF
                      </span>
                    </>
                  ) : (
                    <p className="text-4xl font-extrabold text-cyan-300 drop-shadow-[0_8px_18px_rgba(34,211,238,0.35)]">
                      {product.use_points === false
                        ? `$${product.price.toLocaleString()} USD`
                        : `${product.price.toLocaleString()} Points`}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-400">Cargando producto...</p>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-4">
              {loggin ? (
                outOfStock ? (
                  <button type="button" disabled className={ctaMuted}>
                    Agotado
                  </button>
                ) : (
                  <button type="button" className={ctaPrimary} onClick={openModal}>
                    Comprar
                  </button>
                )
              ) : (
                <button
                  type="button"
                  className={ctaPrimary}
                  onClick={() => router.push("/register")}
                >
                  Registrarme
                </button>
              )}
              <button type="button" className={ctaMuted} disabled>
                Regalar
              </button>
            </div>

            <p className="mt-6 rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-relaxed text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:text-base">
              Al comprar este artículo, estás haciendo una donación para apoyar
              al servidor. ¡Gracias por tu contribución!
            </p>
          </aside>
        </div>

        {product?.details && product.details.length > 0 ? (
          <section className="border-t border-white/10 py-16 sm:py-20">
            <h3 className="mb-10 font-gaming text-3xl font-semibold tracking-wide text-white sm:text-4xl">
              Detalles del producto
            </h3>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {product.details.map((card) => (
                <article
                  key={card.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/75 shadow-[0_18px_48px_rgba(2,6,23,0.5)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35 hover:shadow-[0_26px_60px_rgba(8,145,178,0.22)]"
                >
                  <div className="relative h-96 w-full overflow-hidden">
                    <img
                      src={card.img_url}
                      alt={`Imagen de ${card.title}`}
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                  </div>
                  <div className="p-7 sm:p-8">
                    <h3 className="text-2xl font-bold text-white transition group-hover:text-cyan-200">
                      {card.title}
                    </h3>
                    <p className="mt-5 text-lg leading-relaxed text-slate-300">
                      {card.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      {loggin && token && product && (
        <Buy
          isOpen={isModalOpen}
          reference={product.reference_number}
          token={token}
          realmId={product.server_id}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default StoreDetail;
