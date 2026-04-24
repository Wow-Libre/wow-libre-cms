"use client";
import { getProduct } from "@/api/store";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import Buy from "@/components/store/purchase";
import { ProductDetail } from "@/model/model";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

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

  if (isError) {
    router.push("/store");
  }

  return (
    <div className="contenedor">
      <NavbarAuthenticated />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-20">
          {/* Columna izquierda: Imagen Grande */}
          <div className="flex-shrink-0 md:w-2/3">
            <img
              src={product?.img_url}
              alt={`Detalle ${id}`}
              className="w-full h-auto max-h-[500px] object-cover rounded-2xl border border-slate-700/70 shadow-[0_20px_55px_rgba(0,0,0,0.35)] transition duration-300 hover:opacity-90"
            />
            <div className="mt-10 rounded-2xl border border-slate-800/80 bg-slate-900/75 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
              <h3 className="text-white text-4xl md:text-5xl mb-5 font-semibold">
                {product?.name}
              </h3>
              <p className="text-gray-300 text-lg md:text-2xl leading-relaxed">
                {product?.description}
              </p>
            </div>
          </div>

          {/* Columna derecha: Título, Subtítulo y Botón */}
          <div className="md:w-1/3 flex flex-col space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/75 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              {product?.name}
            </h2>
            <p className="text-gray-300 text-2xl md:text-3xl pb-1">
              {product?.category}
            </p>
            <p className="text-gray-300 text-2xl md:text-3xl pb-1">
              {product?.partner}
            </p>
            <p className="text-slate-900 bg-yellow-500/95 rounded-xl p-4 leading-tight text-md md:text-xl font-semibold border border-yellow-300/50 shadow-[0_10px_24px_rgba(250,204,21,0.25)]">
              {product?.disclaimer}
            </p>

            <div className="text-white font-bold pt-10 pb-6">
              {product ? (
                <div className="flex items-center space-x-4 text-lg md:text-2xl">
                  {/* Precio con descuento */}
                  {product.discount > 0 ? (
                    <>
                      <p
                        className="font-extrabold text-3xl"
                        style={{ color: "#65d208" }}
                      >
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
                      <p className="line-through text-gray-400 text-4xl">
                        {product.use_points === false
                          ? `$${product.price.toLocaleString()} USD`
                          : `${product.price.toLocaleString()} Points`}
                      </p>
                      <span className="bg-green-500 text-black font-bold px-3 py-1 rounded-full border border-green-200/60 shadow-[0_8px_20px_rgba(101,210,8,0.35)]">
                        {product.discount}% OFF
                      </span>
                    </>
                  ) : (
                    // Sin descuento, solo mostrar el precio normal
                    <>
                      <p
                        className="font-extrabold text-4xl"
                        style={{ color: "#65d208" }}
                      >
                        {product.use_points === false
                          ? `$${product.price.toLocaleString()} USD`
                          : `$${product.price.toLocaleString()} Points`}
                      </p>
                      {/* No se muestra precio tachado ni tooltip de descuento */}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-300">Cargando producto...</p>
              )}
            </div>
            {loggin ? (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-5 rounded-xl border border-blue-400/50 shadow-[0_10px_25px_rgba(37,99,235,0.35)] transition duration-300"
                onClick={openModal}
              >
                Comprar
              </button>
            ) : (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-5 rounded-xl border border-blue-400/50 shadow-[0_10px_25px_rgba(37,99,235,0.35)] transition duration-300"
                onClick={() => router.push("/register")}
              >
                Registrarme
              </button>
            )}
            <button
              className="bg-gray-800 text-white font-bold py-4 px-5 rounded-xl border border-slate-600 hover:border-slate-400 transition duration-300"
              disabled={true}
              onClick={() => alert("Regalar clickeado")}
            >
              Regalar
            </button>

            <p className="text-gray-200 bg-gray-800/90 border border-slate-600 rounded-xl p-3 leading-tight text-md md:text-sm font-serif">
              Al comprar este articulo, estás haciendo una donación para apoyar
              al servidor. ¡Gracias por tu contribución!
            </p>
          </div>
        </div>

        {/* Línea separadora blanca */}
        <div className="my-8 border-t border-gray-700"></div>

        {/* Sección de tarjetas */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {product?.details.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl border border-slate-700/70 bg-slate-900/70 shadow-[0_12px_30px_rgba(0,0,0,0.25)] overflow-hidden"
              >
                <div className="relative w-full h-96">
                  {" "}
                  {/* Altura fija */}
                  <img
                    src={card.img_url}
                    alt={`Imagen de ${card.title}`}
                    className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-2xl font-bold text-white mb-5">
                    {card.title}
                  </h3>
                  <p className="text-gray-300 text-lg">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
