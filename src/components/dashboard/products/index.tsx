"use client";

import { allCategories, createCategory } from "@/api/productCategory";
import { createProduct, deleteProduct, getAllProducts } from "@/api/products";
import { ProductCategoriesResponse } from "@/dto/response/ProductCategoriesResponse";
import { ProductsDetailsDto } from "@/model/ProductsDetails";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Swal from "sweetalert2";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: number;
  disclaimer: string;
  discount: string;
  imageUrl: string;
  language: string;
  tax: string;
  returnTax: string;
  creditPointsValue: string;
  creditPointsEnabled: boolean;
  packages: string[];
  details: string;
  realmName: string;
}

const PAGE_SIZE = 5;

interface ProductsProps {
  token: string;
  realmId: number;
}
const ProductDashboard: React.FC<ProductsProps> = ({ token, realmId }) => {
  const [product, setProduct] = useState<Omit<Product, "id">>({
    name: "",
    description: "",
    price: "",
    category: 0,
    disclaimer: "",
    discount: "",
    imageUrl: "",
    language: "es",
    tax: "",
    returnTax: "",
    creditPointsValue: "",
    creditPointsEnabled: false,
    packages: [],
    details: "",
    realmName: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategoriesResponse[]>([]);
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [categoryDescriptionId, setCategoryDescriptionId] = useState(0);

  const [newCategoryDisclaimer, setNewCategoryDisclaimer] = useState("");
  const [nextId, setNextId] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsDb, setProductsDb] = useState<ProductsDetailsDto>({
    products: [],
    total_products: 0,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(token, id);
      setProductsDb((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== id),
      }));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      Swal.fire({
        icon: "success",
        title: "Producto eliminado con éxito",
        text: "El producto ha sido eliminado correctamente",
      });
    } catch (error: any) {
      console.error("Error al eliminar producto:", error);
      alert(`❌ Error al eliminar producto: ${error.message}`);
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addCategory = async () => {
    const trimmed = newCategory.trim();

    if (trimmed === "") return;

    try {
      await createCategory(
        token,
        newCategory,
        newCategoryDescription,
        newCategoryDisclaimer
      );

      const updatedCategories = await allCategories(token);
      setCategories(updatedCategories);
      // Buscar la nueva categoría por nombre
      const createdCategory = updatedCategories.find(
        (cat) => cat.name === newCategory
      );

      if (createdCategory) {
        setProduct((prev) => ({
          ...prev,
          category: createdCategory.id,
        }));
      }
    } catch (error: any) {
      console.error("Error al crear categoría:", error);
      alert(`❌ Error al crear categoría: ${error.message}`);
    }

    setShowNewCategoryInput(false);
    setNewCategory("");
  };

  const paginatedProducts = productsDb.products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [apiProducts, categoryResponse] = await Promise.all([
          getAllProducts(token),
          allCategories(token),
        ]);

        setProductsDb(apiProducts);
        setCategories(categoryResponse);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };

    fetchProducts();
  }, [token, realmId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Validar que realmName no esté vacío
      if (!product.realmName || product.realmName.trim() === "") {
        Swal.fire({
          icon: "error",
          title: "Campo requerido",
          text: "El nombre del reino es obligatorio",
          color: "white",
          background: "#0B1218",
        });
        return;
      }

      const payload = {
        name: product.name,
        product_category_id: product.category,
        disclaimer: product.disclaimer,
        price: parseFloat(product.price),
        discount: parseInt(product.discount),
        description: product.description,
        image_url: product.imageUrl,
        realm_id: realmId,
        realm_name: product.realmName.trim(),
        language: product.language,
        tax: product.tax,
        return_tax: product.returnTax,
        credit_points_value: parseInt(product.creditPointsValue),
        credit_points_enabled: product.creditPointsEnabled,
        packages: product.packages,
      };


      await createProduct(token, payload);

      alert("Producto creado con éxito ✅");

      // Resetear formulario si deseas
      setProduct({
        name: "",
        description: "",
        price: "",
        category: 0,
        disclaimer: "",
        discount: "",
        imageUrl: "",
        language: "es",
        tax: "",
        returnTax: "",
        creditPointsValue: "",
        creditPointsEnabled: false,
        packages: [],
        details: "",
        realmName: "",
      });
      setNextId(nextId + 1);
      setShowForm(false);
      setShowNewCategoryInput(false);
      setNewCategory("");
      setCurrentPage(1);

      // Refrescar productos desde API
      const refreshed = await getAllProducts(token);
      setProductsDb(refreshed);
    } catch (error: any) {
     Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
      color: "white",
      background: "#0B1218",
     });
    }
  };

  return (
    <div className={`space-y-6 ${DASHBOARD_PALETTE.text}`}>
      {showForm && (
        <DashboardSection
          title="Crear Nuevo Producto"
          description="Completa los datos del producto"
          action={
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={`text-sm font-medium ${DASHBOARD_PALETTE.textMuted} hover:text-cyan-400`}
            >
              Cerrar formulario
            </button>
          }
        >
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Sección: Información básica */}
                <div className={`rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-800/40 p-5 sm:p-6`}>
                  <h3 className={`mb-1 text-sm font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.accent}`}>
                    Información básica
                  </h3>
                  <p className={`mb-5 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                    Nombre, descripción e imagen del producto
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className={`block mb-2 text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                        Nombre del producto
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        required
                        className={`w-full py-3 text-base ${DASHBOARD_PALETTE.input}`}
                        placeholder="Ej: Paquete de monedas 1000"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block mb-2 text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                        Descripción
                      </label>
                      <textarea
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className={`w-full py-3 text-base resize-none ${DASHBOARD_PALETTE.input}`}
                        placeholder="Describe el producto para que los usuarios sepan qué incluye"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block mb-2 text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                        URL de imagen
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input
                          type="text"
                          name="imageUrl"
                          value={product.imageUrl}
                          onChange={handleChange}
                          className={`flex-1 py-3 text-base ${DASHBOARD_PALETTE.input}`}
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                        {product.imageUrl && (
                          <div className="shrink-0 flex items-center justify-center w-24 h-24 rounded-xl border border-slate-600/50 bg-slate-800/80 overflow-hidden">
                            <img
                              src={product.imageUrl}
                              alt="Vista previa"
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección: Precios */}
                <div className={`rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-800/40 p-5 sm:p-6`}>
                  <h3 className={`mb-1 text-sm font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.accent}`}>
                    Precios y descuentos
                  </h3>
                  <p className={`mb-5 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                    Precio base y porcentaje de descuento
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={`block mb-2 text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                        Precio
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        className={`w-full py-3 text-base ${DASHBOARD_PALETTE.input}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                        Descuento (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={product.discount}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className={`w-full py-3 text-base ${DASHBOARD_PALETTE.input}`}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Sección: Categoría e idioma */}
                <div className={`rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-800/40 p-5 sm:p-6`}>
                  <h3 className={`mb-1 text-sm font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.accent}`}>
                    Categoría e idioma
                  </h3>
                  <p className={`mb-5 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                    Clasificación y nombre del reino
                  </p>
                  <div className="space-y-5">
                    <div>
                      <label className={`block mb-2 text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                        Categoría
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          name="category"
                          value={product.category}
                          onChange={handleChange}
                          required
                          className={`flex-1 py-3 text-base ${DASHBOARD_PALETTE.input}`}
                        >
                          <option value="">Selecciona una categoría</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                          className={`shrink-0 px-5 py-3 rounded-xl border text-sm font-medium transition-colors ${showNewCategoryInput ? "border-slate-500 bg-slate-700/50 text-slate-400 hover:bg-slate-600/50" : `${DASHBOARD_PALETTE.accentBorder} bg-cyan-500/10 ${DASHBOARD_PALETTE.accent} hover:bg-cyan-500/20`}`}
                        >
                          {showNewCategoryInput ? "Cancelar" : "+ Nueva categoría"}
                        </button>
                      </div>
                      {showNewCategoryInput && (
                        <div className={`mt-4 p-5 rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-900/50 space-y-4`}>
                          <p className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>Crear una nueva categoría para usar en este producto.</p>
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className={`w-full py-3 text-base ${DASHBOARD_PALETTE.input}`}
                            placeholder="Nombre de la categoría"
                          />
                          <input
                            type="text"
                            value={newCategoryDescription}
                            onChange={(e) => setNewCategoryDescription(e.target.value)}
                            className={`w-full py-3 text-base ${DASHBOARD_PALETTE.input}`}
                            placeholder="Descripción (opcional)"
                          />
                          <input
                            type="text"
                            value={newCategoryDisclaimer}
                            onChange={(e) => setNewCategoryDisclaimer(e.target.value)}
                            className={`w-full py-3 text-base ${DASHBOARD_PALETTE.input}`}
                            placeholder="Disclaimer (opcional)"
                          />
                          <button
                            type="button"
                            onClick={addCategory}
                            className={DASHBOARD_PALETTE.btnPrimary}
                          >
                            Crear categoría
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className={`block mb-2 text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                          Idioma
                        </label>
                        <select
                          name="language"
                          value={product.language}
                          onChange={handleChange}
                          className={`w-full py-3 text-base ${DASHBOARD_PALETTE.input}`}
                        >
                          <option value="es">Español</option>
                          <option value="en">Inglés</option>
                          <option value="fr">Francés</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block mb-2 text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                          Nombre del reino <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="realmName"
                          value={product.realmName}
                          onChange={handleChange}
                          required
                          className={`w-full py-3 text-base ${DASHBOARD_PALETTE.input}`}
                          placeholder="Ej: Mi Servidor"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección: Impuestos y puntos */}
                <div className={`rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-800/40 p-5 sm:p-6`}>
                  <h3 className={`mb-1 text-sm font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.accent}`}>
                    Impuestos y puntos de crédito
                  </h3>
                  <p className={`mb-5 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                    Impuestos y valor en puntos si aplica
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className={`block mb-2 text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                        Impuesto
                      </label>
                      <input
                        type="text"
                        name="tax"
                        value={product.tax}
                        onChange={handleChange}
                        className={`w-full py-3 text-base ${DASHBOARD_PALETTE.input}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                        Impuesto devolución
                      </label>
                      <input
                        type="text"
                        name="returnTax"
                        value={product.returnTax}
                        onChange={handleChange}
                        className={`w-full py-3 text-base ${DASHBOARD_PALETTE.input}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                        Valor puntos crédito
                      </label>
                      <input
                        type="number"
                        name="creditPointsValue"
                        value={product.creditPointsValue}
                        onChange={handleChange}
                        min="0"
                        className={`w-full py-3 text-base ${DASHBOARD_PALETTE.input}`}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className={`mt-4 flex items-center gap-3 p-4 rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-900/30`}>
                    <input
                      type="checkbox"
                      name="creditPointsEnabled"
                      checked={product.creditPointsEnabled}
                      onChange={(e) =>
                        setProduct((prev) => ({
                          ...prev,
                          creditPointsEnabled: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 rounded border-slate-500 bg-slate-800 text-cyan-600 focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-0"
                    />
                    <label className={`text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                      Habilitar uso de puntos de crédito para este producto
                    </label>
                  </div>
                </div>

                {/* Sección: Paquetes */}
                <div className={`rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-800/40 p-5 sm:p-6`}>
                  <h3 className={`mb-1 text-sm font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.accent}`}>
                    Paquetes (IDs)
                  </h3>
                  <p className={`mb-5 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                    Añade los IDs de paquete asociados. Escribe un ID y pulsa Enter.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.packages.length === 0 ? (
                      <span className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>Ningún paquete añadido</span>
                    ) : (
                      product.packages.map((pkg, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${DASHBOARD_PALETTE.accentBorder} bg-cyan-500/10 ${DASHBOARD_PALETTE.accent} text-sm font-medium`}
                        >
                          {pkg}
                          <button
                            type="button"
                            onClick={() =>
                              setProduct((prev) => ({
                                ...prev,
                                packages: prev.packages.filter((_, i) => i !== idx),
                              }))
                            }
                            className="hover:text-red-400 transition-colors"
                            aria-label="Quitar"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Escribe un ID y pulsa Enter para añadir"
                    className={`w-full py-3 text-base ${DASHBOARD_PALETTE.input}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value !== "") {
                          setProduct((prev) => ({
                            ...prev,
                            packages: [...prev.packages, value],
                          }));
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className={`py-3 px-6 rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-700/50 font-medium ${DASHBOARD_PALETTE.textMuted} hover:bg-slate-600/50 hover:text-white transition-colors`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`w-full sm:w-auto ${DASHBOARD_PALETTE.btnPrimary} py-3 px-8`}
                  >
                    Guardar producto
                  </button>
                </div>
              </form>
            </DashboardSection>
        )}

        {/* Lista de productos */}
        <DashboardSection
          title="Productos Registrados"
          description="Listado de productos del reino"
          action={
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className={DASHBOARD_PALETTE.btnPrimary}
            >
              Crear producto
            </button>
          }
        >
          {productsDb.products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className={`text-xl ${DASHBOARD_PALETTE.textMuted}`}>
                No hay productos registrados
              </p>
              <p className={`mt-2 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                Crea tu primer producto usando el formulario de arriba
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-4">
                  <thead className={DASHBOARD_PALETTE.textMuted}>
                    <tr>
                      <th className="p-4 text-left min-w-[200px] text-sm font-semibold">
                        Producto
                      </th>
                      <th className="p-4 text-left min-w-[120px] text-sm font-semibold">
                        Categoría
                      </th>
                      <th className="p-4 text-left min-w-[100px] text-sm font-semibold">
                        Precio
                      </th>
                      <th className="p-4 text-left text-sm font-semibold">
                        Descuento
                      </th>
                      <th className="p-4 text-left text-sm font-semibold">
                        Estado
                      </th>
                      <th className="p-4 text-left text-sm font-semibold">
                        Puntos
                      </th>
                      <th className="p-4 text-left text-sm font-semibold">
                        Idioma
                      </th>
                      <th className="p-4 text-left text-sm font-semibold">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((p) => (
                      <tr
                        key={p.id}
                        className={`rounded-lg border transition-all duration-200 ${DASHBOARD_PALETTE.border} bg-slate-800/50 hover:bg-slate-700/50`}
                      >
                        <td className="p-4 rounded-l-lg">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <img
                                className={`rounded-lg h-14 w-14 object-cover border ${DASHBOARD_PALETTE.border}`}
                                src={
                                  p.img_url || "https://via.placeholder.com/64"
                                }
                                alt={p.name}
                              />
                              <div className={`absolute -top-1 -right-1 text-xs px-2 py-1 rounded-full border ${DASHBOARD_PALETTE.border} bg-slate-800 ${DASHBOARD_PALETTE.textMuted}`}>
                                #{p.id}
                              </div>
                            </div>
                            <div>
                              <div className={`font-semibold ${DASHBOARD_PALETTE.text}`}>
                                {p.name}
                              </div>
                              <div className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                                ID: {p.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${DASHBOARD_PALETTE.accentBorder} bg-cyan-500/10 ${DASHBOARD_PALETTE.accent}`}>
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className={`font-semibold ${DASHBOARD_PALETTE.accent}`}>
                            ${p.price}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-sm font-medium border border-amber-500/50 bg-amber-500/10 text-amber-300">
                            {p.discount}%
                          </span>
                        </td>
                        <td className="p-4">
                          {p.status ? (
                            <span className="px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/50 bg-emerald-500/10 text-emerald-300">
                              Activo
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-sm font-medium border border-red-500/50 bg-red-500/10 text-red-400">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {p.use_points ? (
                            <span className="text-emerald-400">✓</span>
                          ) : (
                            <span className="text-red-400">✗</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${DASHBOARD_PALETTE.border} bg-slate-700/50 ${DASHBOARD_PALETTE.textMuted}`}>
                            {p.language?.toUpperCase() || "N/A"}
                          </span>
                        </td>
                        <td className="p-4 rounded-r-lg">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => alert(`Ver producto ${p.id}`)}
                              className={`p-2 rounded-lg border transition-colors ${DASHBOARD_PALETTE.accentBorder} bg-cyan-500/10 ${DASHBOARD_PALETTE.accent} hover:bg-cyan-500/20`}
                              aria-label="Ver"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => alert(`Editar producto ${p.id}`)}
                              className={`p-2 rounded-lg border transition-colors border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20`}
                              aria-label="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className={`p-2 rounded-lg ${DASHBOARD_PALETTE.btnDanger}`}
                              aria-label="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {productsDb.products.length > PAGE_SIZE && (
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed ${DASHBOARD_PALETTE.input}`}
                    >
                      Anterior
                    </button>
                    <span className={`px-4 py-2 rounded-xl border ${DASHBOARD_PALETTE.accentBorder} bg-cyan-500/10 ${DASHBOARD_PALETTE.accent}`}>
                      Página {currentPage} de{" "}
                      {Math.ceil(productsDb.products.length / PAGE_SIZE)}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.min(
                            Math.ceil(productsDb.products.length / PAGE_SIZE),
                            currentPage + 1
                          )
                        )
                      }
                      disabled={
                        currentPage >=
                        Math.ceil(productsDb.products.length / PAGE_SIZE)
                      }
                      className={`px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed ${DASHBOARD_PALETTE.input}`}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </DashboardSection>
    </div>
  );
};

export default ProductDashboard;
