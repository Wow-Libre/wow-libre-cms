"use client";

import { allCategories, createCategory } from "@/api/productCategory";
import { createProduct, deleteProduct, getAllProducts, getProduct, updateProduct } from "@/api/products";
import { ProductCategoriesResponse } from "@/dto/response/ProductCategoriesResponse";
import { Product as ApiProduct, ProductsDetailsDto } from "@/model/ProductsDetails";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardSection } from "../layout";
import { DashboardModalShell } from "../DashboardModalShell";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

interface ProductFormState {
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

function formatMoney(value: number): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value}`;
  }
}

function ProductsTableIcon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${className}`}>
      {children}
    </span>
  );
}

interface ProductsProps {
  token: string;
  realmId: number;
}
const ProductDashboard: React.FC<ProductsProps> = ({ token, realmId }) => {
  const [product, setProduct] = useState<ProductFormState>({
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

  const [products, setProducts] = useState<ApiProduct[]>([]);
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
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const emptyForm: ProductFormState = {
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
  };

  const openEdit = async (p: ApiProduct) => {
    setEditingProductId(p.id);
    setProduct({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price ?? ""),
      category: p.category_id ?? 0,
      disclaimer: p.disclaimer ?? "",
      discount: String(p.discount ?? 0),
      imageUrl: p.img_url ?? "",
      language: p.language ?? "es",
      tax: p.tax ?? "",
      returnTax: p.return_tax ?? "",
      creditPointsValue: String(p.points_amount ?? 0),
      creditPointsEnabled: p.use_points ?? false,
      packages: [],
      details: "",
      realmName: "",
    });
    setShowForm(true);
    try {
      const full = await getProduct(token, p.id);
      if (full) {
        setProduct((prev) => ({
          ...prev,
          realmName: (full as ApiProduct & { realm_name?: string }).realm_name ?? prev.realmName,
          packages: (full as ApiProduct & { packages?: string[] }).packages ?? prev.packages,
        }));
      }
    } catch {
      // keep form from list data
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProductId(null);
    setProduct(emptyForm);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(token, id);
      setProductsDb((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== id),
        total_products: Math.max(0, prev.total_products - 1),
      }));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      Swal.fire({
        icon: "success",
        title: "Producto eliminado con éxito",
        text: "El producto ha sido eliminado correctamente",
      });
    } catch (error: unknown) {
      console.error("Error al eliminar producto:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "No se pudo eliminar el producto",
        background: "#0B1218",
        color: "white",
      });
    }
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
      price: parseFloat(product.price) || 0,
      discount: parseInt(product.discount, 10) || 0,
      description: product.description,
      image_url: product.imageUrl,
      realm_id: realmId,
      realm_name: product.realmName.trim(),
      language: product.language,
      tax: product.tax,
      return_tax: product.returnTax,
      credit_points_value: parseInt(product.creditPointsValue, 10) || 0,
      credit_points_enabled: product.creditPointsEnabled,
      packages: product.packages,
    };

    setFormLoading(true);
    try {
      if (editingProductId !== null) {
        await updateProduct(token, editingProductId, payload);
        Swal.fire({
          icon: "success",
          title: "Producto actualizado",
          text: "Los cambios se guardaron correctamente",
          background: "#0B1218",
          color: "white",
        });
      } else {
        await createProduct(token, payload);
        Swal.fire({
          icon: "success",
          title: "Producto creado",
          text: "El producto se creó correctamente",
          background: "#0B1218",
          color: "white",
        });
      }
      closeForm();
      setShowNewCategoryInput(false);
      setNewCategory("");
      setCurrentPage(1);
      const refreshed = await getAllProducts(token);
      setProductsDb(refreshed);
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "No se pudo guardar el producto",
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${DASHBOARD_PALETTE.text}`}>
      {/* Modal Ver producto */}
      {selectedProduct && (
        <DashboardModalShell
          open
          onClose={() => setSelectedProduct(null)}
          title="Detalle del producto"
          subtitle={
            <span className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-700/80 px-2 py-0.5 font-mono text-xs text-slate-300">
                #{selectedProduct.id}
              </span>
              <span className="text-slate-500">·</span>
              <span>{selectedProduct.category_name || selectedProduct.category || "Sin categoría"}</span>
            </span>
          }
          maxWidthClass="max-w-2xl"
          accent="cyan"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={`text-xs ${DASHBOARD_PALETTE.textMuted}`}>
                Vista de solo lectura · los cambios se hacen desde el formulario de edición
              </p>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:opacity-95"
              >
                Cerrar
              </button>
            </div>
          }
        >
          <div className={`space-y-6 ${DASHBOARD_PALETTE.text}`}>
            {/* Hero + precio */}
            <div className="overflow-hidden rounded-2xl border border-slate-600/40 bg-slate-800/30 ring-1 ring-white/[0.04]">
              <div className="relative aspect-[21/9] min-h-[140px] w-full bg-gradient-to-br from-slate-800 to-slate-900 sm:aspect-[2/1]">
                <img
                  src={selectedProduct.img_url || "https://via.placeholder.com/800x400?text=Producto"}
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/800x400/1e293b/94a3b8?text=Sin+imagen";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute left-4 right-4 top-4 flex flex-wrap items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      selectedProduct.status
                        ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        : "border border-slate-500/50 bg-slate-800/90 text-slate-400"
                    }`}
                  >
                    {selectedProduct.status ? "Activo" : "Inactivo"}
                  </span>
                  {selectedProduct.discount > 0 && (
                    <span className="rounded-full border border-amber-500/50 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-200 shadow-lg">
                      −{selectedProduct.discount}% OFF
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <h3 className="text-xl font-bold leading-tight text-white drop-shadow-md sm:text-2xl">
                    {selectedProduct.name}
                  </h3>
                </div>
              </div>

              <div className="grid gap-4 border-t border-slate-700/50 p-4 sm:grid-cols-2 sm:p-5">
                <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-slate-900/80 p-4">
                  <p className={`text-xs font-medium uppercase tracking-wider ${DASHBOARD_PALETTE.textMuted}`}>
                    Precio
                  </p>
                  <div className="mt-1 flex flex-wrap items-end gap-2">
                    {selectedProduct.discount > 0 &&
                    selectedProduct.discount_price > 0 &&
                    selectedProduct.discount_price < selectedProduct.price ? (
                      <>
                        <span className="text-2xl font-bold tabular-nums text-cyan-300 sm:text-3xl">
                          {formatMoney(selectedProduct.discount_price)}
                        </span>
                        <span className="mb-1 text-sm text-slate-500 line-through tabular-nums">
                          {formatMoney(selectedProduct.price)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-bold tabular-nums text-cyan-300 sm:text-3xl">
                          {formatMoney(selectedProduct.price)}
                        </span>
                        {selectedProduct.discount > 0 && (
                          <span className={`mb-1 text-xs ${DASHBOARD_PALETTE.textMuted}`}>
                            ({selectedProduct.discount}% sobre precio base)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:content-center">
                  <div
                    className={`rounded-lg border ${DASHBOARD_PALETTE.border} bg-slate-800/50 px-3 py-2.5`}
                  >
                    <p className={`text-[10px] font-semibold uppercase tracking-wide ${DASHBOARD_PALETTE.textMuted}`}>
                      Idioma
                    </p>
                    <p className="mt-0.5 text-sm font-medium">
                      {selectedProduct.language?.toUpperCase() ?? "—"}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg border ${DASHBOARD_PALETTE.border} bg-slate-800/50 px-3 py-2.5`}
                  >
                    <p className={`text-[10px] font-semibold uppercase tracking-wide ${DASHBOARD_PALETTE.textMuted}`}>
                      Puntos
                    </p>
                    <p className="mt-0.5 text-sm font-medium">
                      {selectedProduct.use_points ? (
                        <>
                          <span className="text-emerald-400">Sí</span>
                          {selectedProduct.points_amount != null && (
                            <span className={`ml-1 ${DASHBOARD_PALETTE.textMuted}`}>
                              ({selectedProduct.points_amount})
                            </span>
                          )}
                        </>
                      ) : (
                        "No"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ficha técnica */}
            <div>
              <h4 className={`mb-3 text-xs font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.accent}`}>
                Datos comerciales
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { label: "Categoría (ID)", value: `${selectedProduct.category_name || selectedProduct.category} · #${selectedProduct.category_id}` },
                  { label: "Impuesto", value: selectedProduct.tax?.trim() || "—" },
                  { label: "Devolución imp.", value: selectedProduct.return_tax?.trim() || "—" },
                  {
                    label: "Partner",
                    value:
                      selectedProduct.partner?.trim() ||
                      (selectedProduct.partner_id ? `#${selectedProduct.partner_id}` : "—"),
                  },
                  { label: "Referencia", value: selectedProduct.reference_number?.trim() || "—" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className={`flex items-start justify-between gap-3 rounded-lg border ${DASHBOARD_PALETTE.border} bg-slate-800/25 px-3 py-2.5`}
                  >
                    <span className={`shrink-0 text-xs ${DASHBOARD_PALETTE.textMuted}`}>{row.label}</span>
                    <span className="min-w-0 text-right text-sm font-medium text-slate-200">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedProduct.description?.trim() && (
              <div className={`rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-800/30 p-4`}>
                <h4 className={`mb-2 text-xs font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.accent}`}>
                  Descripción
                </h4>
                <p className={`text-sm leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>{selectedProduct.description}</p>
              </div>
            )}

            {selectedProduct.disclaimer?.trim() && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-950/25 p-4">
                <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-200/90">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden />
                  Disclaimer
                </h4>
                <p className="text-sm leading-relaxed text-amber-100/85">{selectedProduct.disclaimer}</p>
              </div>
            )}
          </div>
        </DashboardModalShell>
      )}

      {showForm && (
        <DashboardSection
          title={editingProductId !== null ? "Editar producto" : "Crear nuevo producto"}
          description={editingProductId !== null ? "Modifica los datos del producto" : "Completa los datos del producto"}
          action={
            <button
              type="button"
              onClick={closeForm}
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
                    onClick={closeForm}
                    disabled={formLoading}
                    className={`py-3 px-6 rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-700/50 font-medium ${DASHBOARD_PALETTE.textMuted} hover:bg-slate-600/50 hover:text-white transition-colors disabled:opacity-50`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`w-full sm:w-auto ${DASHBOARD_PALETTE.btnPrimary} py-3 px-8 disabled:opacity-50`}
                  >
                    {formLoading ? "Guardando…" : editingProductId !== null ? "Actualizar producto" : "Guardar producto"}
                  </button>
                </div>
              </form>
            </DashboardSection>
        )}

        {/* Lista de productos */}
        <DashboardSection
          noPadding
          title="Productos Registrados"
          description="Listado de productos del reino"
          action={
            <button
              type="button"
              onClick={() => {
                setEditingProductId(null);
                setProduct(emptyForm);
                setShowForm(true);
              }}
              className={`inline-flex items-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} shadow-lg shadow-cyan-900/25`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear producto
            </button>
          }
        >
          {productsDb.products.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-8">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-600/50 bg-slate-800/60 text-slate-500 shadow-inner">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <p className={`text-lg font-medium ${DASHBOARD_PALETTE.text}`}>No hay productos registrados</p>
              <p className={`mt-2 max-w-md mx-auto text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                Añade artículos a la tienda con el botón Crear producto. Podrás asignar categoría, precio e idioma.
              </p>
            </div>
          ) : (
            <>
              <div className="border-t border-slate-700/50 bg-slate-950/20">
                <div className="overflow-x-auto px-3 pb-4 pt-1 sm:px-5">
                  <table className="w-full min-w-[920px] border-separate border-spacing-y-3">
                    <thead>
                      <tr>
                        {["Producto", "Categoría", "Precio", "Descuento", "Estado", "Puntos", "Idioma", "Acciones"].map(
                          (label) => (
                            <th
                              key={label}
                              className={`border-b border-slate-700/60 px-4 pb-3 text-left text-[11px] font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.textMuted}`}
                            >
                              {label}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((p) => (
                        <tr key={p.id} className="group">
                          <td className="rounded-l-xl border-b border-l border-t border-slate-700/50 bg-gradient-to-br from-slate-800/95 to-slate-900/90 p-4 align-middle shadow-[0_2px_12px_-4px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.03] transition-all duration-200 group-hover:border-cyan-500/35 group-hover:shadow-[0_8px_28px_-12px_rgba(34,211,238,0.1)]">
                            <div className="flex min-w-[200px] max-w-[280px] items-center gap-4">
                              <div className="relative shrink-0">
                                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-cyan-500/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                <img
                                  className="relative h-16 w-16 rounded-xl border border-slate-600/60 object-cover shadow-md"
                                  src={p.img_url || "https://via.placeholder.com/64"}
                                  alt={p.name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://via.placeholder.com/64/1e293b/64748b?text=·";
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className={`truncate font-semibold leading-snug ${DASHBOARD_PALETTE.text}`}>{p.name}</p>
                                <p className="mt-1 font-mono text-xs text-slate-500">ID · {p.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="border-b border-l border-t border-slate-700/40 bg-slate-800/90 p-4 align-middle group-hover:border-cyan-500/25">
                            <span
                              className={`inline-flex max-w-[140px] truncate rounded-full border px-2.5 py-1 text-xs font-medium ${DASHBOARD_PALETTE.accentBorder} bg-cyan-500/10 ${DASHBOARD_PALETTE.accent}`}
                            >
                              {p.category_name || p.category}
                            </span>
                          </td>
                          <td className="border-b border-l border-t border-slate-700/40 bg-slate-800/90 p-4 align-middle group-hover:border-cyan-500/25">
                            <span className={`text-lg font-bold tabular-nums ${DASHBOARD_PALETTE.accent}`}>
                              {formatMoney(Number(p.price))}
                            </span>
                          </td>
                          <td className="border-b border-l border-t border-slate-700/40 bg-slate-800/90 p-4 align-middle group-hover:border-cyan-500/25">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                p.discount > 0
                                  ? "border-amber-500/45 bg-amber-500/12 text-amber-200"
                                  : "border-slate-600/50 bg-slate-700/40 text-slate-400"
                              }`}
                            >
                              {p.discount}%
                            </span>
                          </td>
                          <td className="border-b border-l border-t border-slate-700/40 bg-slate-800/90 p-4 align-middle group-hover:border-cyan-500/25">
                            {p.status ? (
                              <span className="rounded-full border border-emerald-500/45 bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                                Activo
                              </span>
                            ) : (
                              <span className="rounded-full border border-red-500/45 bg-red-500/12 px-2.5 py-1 text-xs font-semibold text-red-300">
                                Inactivo
                              </span>
                            )}
                          </td>
                          <td className="border-b border-l border-t border-slate-700/40 bg-slate-800/90 p-4 align-middle group-hover:border-cyan-500/25">
                            <span
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                                p.use_points
                                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                  : "border-red-500/35 bg-red-500/10 text-red-400"
                              }`}
                              title={p.use_points ? "Puntos habilitados" : "Sin puntos"}
                            >
                              {p.use_points ? (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </span>
                          </td>
                          <td className="border-b border-l border-t border-slate-700/40 bg-slate-800/90 p-4 align-middle group-hover:border-cyan-500/25">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${DASHBOARD_PALETTE.border} bg-slate-700/45 text-slate-300`}
                            >
                              {p.language?.toUpperCase() || "—"}
                            </span>
                          </td>
                          <td className="rounded-r-xl border-b border-l border-r border-t border-slate-700/50 bg-slate-800/90 p-4 align-middle shadow-[0_2px_12px_-4px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.03] transition-all duration-200 group-hover:border-cyan-500/35 group-hover:shadow-[0_8px_28px_-12px_rgba(34,211,238,0.1)]">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedProduct(p)}
                                aria-label={`Ver ${p.name}`}
                              >
                                <ProductsTableIcon className="border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </ProductsTableIcon>
                              </button>
                              <button type="button" onClick={() => openEdit(p)} aria-label={`Editar ${p.name}`}>
                                <ProductsTableIcon className="border-amber-500/45 bg-amber-500/10 text-amber-300 hover:bg-amber-500/18">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                </ProductsTableIcon>
                              </button>
                              <button type="button" onClick={() => handleDelete(p.id)} aria-label={`Eliminar ${p.name}`}>
                                <ProductsTableIcon className="border-red-500/45 bg-red-500/10 text-red-400 hover:bg-red-500/20">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </ProductsTableIcon>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {productsDb.products.length > PAGE_SIZE && (
                <div className="flex justify-center border-t border-slate-700/40 bg-slate-900/30 px-4 py-4 sm:px-6">
                  <div className="inline-flex items-center gap-1 rounded-xl border border-slate-700/50 bg-slate-800/60 p-1 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${DASHBOARD_PALETTE.text} hover:bg-slate-700/60`}
                    >
                      Anterior
                    </button>
                    <span
                      className={`rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold tabular-nums ${DASHBOARD_PALETTE.accent}`}
                    >
                      {currentPage} / {Math.ceil(productsDb.products.length / PAGE_SIZE)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          Math.min(Math.ceil(productsDb.products.length / PAGE_SIZE), currentPage + 1)
                        )
                      }
                      disabled={currentPage >= Math.ceil(productsDb.products.length / PAGE_SIZE)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${DASHBOARD_PALETTE.text} hover:bg-slate-700/60`}
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
