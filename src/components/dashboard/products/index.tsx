"use client";

import { allCategories, createCategory } from "@/api/productCategory";
import { createProduct, getAllProducts, getProductByReference, updateProduct, updateProductStatus } from "@/api/products";
import { ProductCategoriesResponse } from "@/dto/response/ProductCategoriesResponse";
import { ProductDeliveryType } from "@/dto/request/ProductRequestDto";
import { uploadImageFile } from "@/lib/upload/presignedMediaUpload";
import { Product as ApiProduct, ProductsDetailsDto } from "@/model/ProductsDetails";
import React, { useState, ChangeEvent, FormEvent, useEffect, useMemo } from "react";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardSection } from "../layout";
import { DashboardModalShell } from "../DashboardModalShell";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

interface ProductDetailFormItem {
  clientId: string;
  title: string;
  description: string;
  imageUrl: string;
  uploadingImage: boolean;
}

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
  detailItems: ProductDetailFormItem[];
  realmName: string;
  deliveryType: ProductDeliveryType;
  redeemInstructions: string;
  redeemKeys: string[];
  availableRedeemKeys: number;
  mainImageUploading: boolean;
}

const PAGE_SIZE = 5;

type ProductStatusFilter = "active" | "all" | "inactive";

const STATUS_FILTERS: { value: ProductStatusFilter; label: string }[] = [
  { value: "active", label: "Activos" },
  { value: "all", label: "Todos" },
  { value: "inactive", label: "Inactivos" },
];

const FORM_LABEL = `block mb-2.5 text-base font-semibold text-slate-200`;
const FORM_HINT = `mb-5 text-base leading-relaxed text-slate-400`;
const FORM_SECTION = `rounded-2xl border border-slate-600/45 bg-slate-800/35 p-6 sm:p-7`;
const FORM_SECTION_TITLE = `text-lg font-bold tracking-tight text-cyan-300`;
const FORM_INPUT = `w-full rounded-xl border border-slate-600/60 bg-slate-900/70 px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/25`;

function deliveryTypeLabel(type?: string): string {
  if (type === "EXTERNAL_KEY") return "Clave externa";
  return "En el juego";
}

function parseRedeemKeysInput(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((key) => key.trim())
    .filter(Boolean);
}

function newDetailItem(): ProductDetailFormItem {
  return {
    clientId: crypto.randomUUID(),
    title: "",
    description: "",
    imageUrl: "",
    uploadingImage: false,
  };
}

function mapDetailFromApi(detail: {
  title: string;
  description: string;
  img_url?: string;
  imgUrl?: string;
}): ProductDetailFormItem {
  return {
    clientId: crypto.randomUUID(),
    title: detail.title ?? "",
    description: detail.description ?? "",
    imageUrl: detail.img_url ?? detail.imgUrl ?? "",
    uploadingImage: false,
  };
}

function buildDetailsPayload(items: ProductDetailFormItem[]) {
  return items
    .filter(
      (item) =>
        item.title.trim() && item.description.trim() && item.imageUrl.trim()
    )
    .map((item) => ({
      title: item.title.trim(),
      description: item.description.trim(),
      image_url: item.imageUrl.trim(),
    }));
}

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
    detailItems: [],
    realmName: "",
    deliveryType: "IN_GAME",
    redeemInstructions: "",
    redeemKeys: [],
    availableRedeemKeys: 0,
    mainImageUploading: false,
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
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("active");
  const [productsDb, setProductsDb] = useState<ProductsDetailsDto>({
    products: [],
    total_products: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [redeemKeysDraft, setRedeemKeysDraft] = useState("");

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
    detailItems: [],
    realmName: "",
    deliveryType: "IN_GAME",
    redeemInstructions: "",
    redeemKeys: [],
    availableRedeemKeys: 0,
    mainImageUploading: false,
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
      detailItems: [],
      realmName: "",
      deliveryType:
        p.delivery_type === "EXTERNAL_KEY" ? "EXTERNAL_KEY" : "IN_GAME",
      redeemInstructions: p.redeem_instructions ?? "",
      redeemKeys: [],
      availableRedeemKeys: p.available_redeem_keys ?? 0,
      mainImageUploading: false,
    });
    setShowForm(true);
    try {
      const full = await getProductByReference(token, p.reference_number);
      if (full) {
        setProduct((prev) => ({
          ...prev,
          realmName: full.partner ?? prev.realmName,
          detailItems:
            full.details?.map((detail) => mapDetailFromApi(detail)) ?? prev.detailItems,
        }));
      }
    } catch {
      // keep form from list data
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProductId(null);
    setRedeemKeysDraft("");
    setProduct(emptyForm);
  };

  const applyProductStatus = (productId: number, active: boolean) => {
    const patch = (item: ApiProduct) =>
      item.id === productId ? { ...item, status: active } : item;

    setProductsDb((prev) => ({
      ...prev,
      products: prev.products.map(patch),
    }));
    setProducts((prev) => prev.map(patch));
    setSelectedProduct((prev) =>
      prev?.id === productId ? { ...prev, status: active } : prev
    );
  };

  const handleToggleStatus = async (p: ApiProduct) => {
    const nextActive = !p.status;
    const actionLabel = nextActive ? "activar" : "desactivar";

    const result = await Swal.fire({
      title: nextActive ? "¿Activar producto?" : "¿Desactivar producto?",
      text: nextActive
        ? `"${p.name}" volverá a mostrarse en la tienda.`
        : `"${p.name}" dejará de mostrarse en la tienda, pero se conservará en el dashboard.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: nextActive ? "Sí, activar" : "Sí, desactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: nextActive ? "#059669" : "#d97706",
      color: "white",
      background: "#0B1218",
    });

    if (!result.isConfirmed) return;

    try {
      await updateProductStatus(token, p.id, nextActive);
      applyProductStatus(p.id, nextActive);
      Swal.fire({
        icon: "success",
        title: nextActive ? "Producto activado" : "Producto desactivado",
        text: nextActive
          ? "El producto ya está visible en la tienda."
          : "El producto quedó inactivo y ya no aparece en la tienda.",
        background: "#0B1218",
        color: "white",
      });
    } catch (error: unknown) {
      console.error(`Error al ${actionLabel} producto:`, error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error instanceof Error
            ? error.message
            : `No se pudo ${actionLabel} el producto`,
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

  const filteredProducts = useMemo(() => {
    if (statusFilter === "active") {
      return productsDb.products.filter((p) => p.status);
    }
    if (statusFilter === "inactive") {
      return productsDb.products.filter((p) => !p.status);
    }
    return productsDb.products;
  }, [productsDb.products, statusFilter]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleStatusFilterChange = (value: ProductStatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredProducts.length, currentPage]);

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

    const incompleteDetail = product.detailItems.find(
      (item) =>
        (item.title.trim() || item.description.trim() || item.imageUrl.trim()) &&
        !(item.title.trim() && item.description.trim() && item.imageUrl.trim())
    );
    if (incompleteDetail) {
      Swal.fire({
        icon: "error",
        title: "Detalle incompleto",
        text: "Cada bloque de detalle debe tener título, descripción e imagen.",
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    if (product.detailItems.some((item) => item.uploadingImage) || product.mainImageUploading) {
      Swal.fire({
        icon: "info",
        title: "Espera la subida",
        text: "Hay imágenes subiendo todavía. Intenta de nuevo en unos segundos.",
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    const isExternalKey = product.deliveryType === "EXTERNAL_KEY";

    if (isExternalKey && editingProductId === null && product.redeemKeys.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Claves requeridas",
        text: "Agrega al menos una clave de canje para productos de tipo clave externa.",
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
      packages: isExternalKey ? [] : product.packages,
      delivery_type: product.deliveryType,
      redeem_instructions: isExternalKey ? product.redeemInstructions : undefined,
      redeem_keys: isExternalKey && product.redeemKeys.length > 0 ? product.redeemKeys : undefined,
      details: buildDetailsPayload(product.detailItems),
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

  const appendRedeemKeysFromDraft = () => {
    const parsed = parseRedeemKeysInput(redeemKeysDraft);
    if (parsed.length === 0) return;
    setProduct((prev) => ({
      ...prev,
      redeemKeys: [...new Set([...prev.redeemKeys, ...parsed])],
    }));
    setRedeemKeysDraft("");
  };

  const uploadMainProductImage = async (file: File) => {
    setProduct((prev) => ({ ...prev, mainImageUploading: true }));
    try {
      const publicUrl = await uploadImageFile(token, file);
      setProduct((prev) => ({ ...prev, imageUrl: publicUrl, mainImageUploading: false }));
    } catch (error: unknown) {
      setProduct((prev) => ({ ...prev, mainImageUploading: false }));
      Swal.fire({
        icon: "error",
        title: "Error al subir imagen",
        text: error instanceof Error ? error.message : "No se pudo subir la imagen principal",
        background: "#0B1218",
        color: "white",
      });
    }
  };

  const uploadDetailImage = async (clientId: string, file: File) => {
    setProduct((prev) => ({
      ...prev,
      detailItems: prev.detailItems.map((item) =>
        item.clientId === clientId ? { ...item, uploadingImage: true } : item
      ),
    }));
    try {
      const publicUrl = await uploadImageFile(token, file);
      setProduct((prev) => ({
        ...prev,
        detailItems: prev.detailItems.map((item) =>
          item.clientId === clientId
            ? { ...item, imageUrl: publicUrl, uploadingImage: false }
            : item
        ),
      }));
    } catch (error: unknown) {
      setProduct((prev) => ({
        ...prev,
        detailItems: prev.detailItems.map((item) =>
          item.clientId === clientId ? { ...item, uploadingImage: false } : item
        ),
      }));
      Swal.fire({
        icon: "error",
        title: "Error al subir imagen",
        text: error instanceof Error ? error.message : "No se pudo subir la imagen del detalle",
        background: "#0B1218",
        color: "white",
      });
    }
  };

  const updateDetailItem = (
    clientId: string,
    field: keyof Pick<ProductDetailFormItem, "title" | "description" | "imageUrl">,
    value: string
  ) => {
    setProduct((prev) => ({
      ...prev,
      detailItems: prev.detailItems.map((item) =>
        item.clientId === clientId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const isExternalKeyProduct = product.deliveryType === "EXTERNAL_KEY";

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
                  {
                    label: "Entrega",
                    value: deliveryTypeLabel(selectedProduct.delivery_type),
                  },
                  ...(selectedProduct.delivery_type === "EXTERNAL_KEY"
                    ? [
                        {
                          label: "Claves disponibles",
                          value: String(selectedProduct.available_redeem_keys ?? 0),
                        },
                      ]
                    : []),
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
        <DashboardModalShell
          open={showForm}
          onClose={closeForm}
          title={editingProductId !== null ? "Editar producto" : "Nuevo producto"}
          subtitle={
            editingProductId !== null
              ? "Actualiza la información y guarda los cambios."
              : "Configura precio, entrega y visibilidad en la tienda."
          }
          maxWidthClass="max-w-4xl"
          accent="emerald"
          footer={
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={formLoading}
                className="rounded-xl border border-slate-600/60 bg-slate-800/80 px-6 py-3.5 text-base font-semibold text-slate-300 transition hover:bg-slate-700/80 hover:text-white disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={formLoading}
                className={`rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-lg disabled:opacity-50 ${DASHBOARD_PALETTE.btnPrimary}`}
              >
                {formLoading
                  ? "Guardando…"
                  : editingProductId !== null
                    ? "Guardar cambios"
                    : "Crear producto"}
              </button>
            </div>
          }
        >
          <form id="product-form" onSubmit={handleSubmit} className="space-y-7">
            {/* Tipo de entrega */}
            <div className={FORM_SECTION}>
              <h3 className={FORM_SECTION_TITLE}>Tipo de entrega</h3>
              <p className={FORM_HINT}>
                Elige cómo se entrega el producto al completar la compra.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    {
                      value: "IN_GAME" as ProductDeliveryType,
                      title: "En el juego",
                      description: "Entrega ítems al personaje mediante paquetes del realm.",
                    },
                    {
                      value: "EXTERNAL_KEY" as ProductDeliveryType,
                      title: "Clave externa",
                      description: "Envía una clave por correo (Steam, Epic, etc.).",
                    },
                  ] as const
                ).map((option) => {
                  const selected = product.deliveryType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setProduct((prev) => ({
                          ...prev,
                          deliveryType: option.value,
                        }))
                      }
                      className={`rounded-2xl border p-5 text-left transition ${
                        selected
                          ? "border-emerald-400/60 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                          : "border-slate-600/50 bg-slate-900/40 hover:border-slate-500/70"
                      }`}
                    >
                      <p className="text-lg font-bold text-white">{option.title}</p>
                      <p className="mt-2 text-base leading-relaxed text-slate-400">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Información básica */}
            <div className={FORM_SECTION}>
              <h3 className={FORM_SECTION_TITLE}>Información básica</h3>
              <p className={FORM_HINT}>Nombre, descripción, aviso legal e imagen.</p>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className={FORM_LABEL} htmlFor="product-name">
                    Nombre del producto
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                    className={FORM_INPUT}
                    placeholder="Ej: Paquete de monedas 1000"
                  />
                </div>
                <div>
                  <label className={FORM_LABEL} htmlFor="product-description">
                    Descripción
                  </label>
                  <textarea
                    id="product-description"
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className={`${FORM_INPUT} resize-none`}
                    placeholder="Qué incluye el producto y para quién es"
                  />
                </div>
                <div>
                  <label className={FORM_LABEL} htmlFor="product-disclaimer">
                    Disclaimer
                  </label>
                  <textarea
                    id="product-disclaimer"
                    name="disclaimer"
                    value={product.disclaimer}
                    onChange={handleChange}
                    required
                    rows={2}
                    className={`${FORM_INPUT} resize-none`}
                    placeholder="Aviso legal o condiciones de la compra"
                  />
                </div>
                <div>
                  <label className={FORM_LABEL} htmlFor="product-image">
                    Imagen principal
                  </label>
                  <p className="mb-3 text-base text-slate-400">
                    Sube una imagen o pega una URL. Se usa en la tarjeta del producto en la tienda.
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex-1 space-y-3">
                      <input
                        id="product-image"
                        type="url"
                        name="imageUrl"
                        value={product.imageUrl}
                        onChange={handleChange}
                        required
                        className={FORM_INPUT}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-base font-semibold text-violet-200 transition hover:bg-violet-500/20">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          disabled={product.mainImageUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void uploadMainProductImage(file);
                            e.target.value = "";
                          }}
                        />
                        {product.mainImageUploading ? "Subiendo imagen…" : "Subir imagen"}
                      </label>
                    </div>
                    {product.imageUrl && (
                      <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-600/50 bg-slate-900/80">
                        <img
                          src={product.imageUrl}
                          alt="Vista previa"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={FORM_SECTION}>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className={FORM_SECTION_TITLE}>Detalles del producto</h3>
                  <p className={`mt-2 ${FORM_HINT.replace("mb-5 ", "")}`}>
                    Galería opcional con título, descripción e imagen (se muestra en la ficha del producto).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setProduct((prev) => ({
                      ...prev,
                      detailItems: [...prev.detailItems, newDetailItem()],
                    }))
                  }
                  className="shrink-0 rounded-xl border border-violet-500/40 bg-violet-500/10 px-5 py-3 text-base font-semibold text-violet-200 transition hover:bg-violet-500/20"
                >
                  + Agregar detalle
                </button>
              </div>

              {product.detailItems.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-600/50 bg-slate-900/30 px-4 py-8 text-center text-base text-slate-500">
                  Sin bloques de detalle. Usa &quot;Agregar detalle&quot; para añadir imágenes explicativas del producto.
                </p>
              ) : (
                <div className="space-y-5">
                  {product.detailItems.map((item, index) => (
                    <div
                      key={item.clientId}
                      className="rounded-xl border border-slate-600/45 bg-slate-900/40 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-base font-semibold text-white">Detalle #{index + 1}</p>
                        <button
                          type="button"
                          onClick={() =>
                            setProduct((prev) => ({
                              ...prev,
                              detailItems: prev.detailItems.filter(
                                (d) => d.clientId !== item.clientId
                              ),
                            }))
                          }
                          className="text-base font-medium text-red-400 hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_140px]">
                        <div className="space-y-4">
                          <div>
                            <label className={FORM_LABEL}>Título</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) =>
                                updateDetailItem(item.clientId, "title", e.target.value)
                              }
                              maxLength={60}
                              className={FORM_INPUT}
                              placeholder="Ej: Contenido incluido"
                            />
                          </div>
                          <div>
                            <label className={FORM_LABEL}>Descripción</label>
                            <textarea
                              value={item.description}
                              onChange={(e) =>
                                updateDetailItem(item.clientId, "description", e.target.value)
                              }
                              rows={3}
                              className={`${FORM_INPUT} resize-none`}
                              placeholder="Describe este detalle o beneficio"
                            />
                          </div>
                          <div>
                            <label className={FORM_LABEL}>Imagen (URL)</label>
                            <input
                              type="url"
                              value={item.imageUrl}
                              onChange={(e) =>
                                updateDetailItem(item.clientId, "imageUrl", e.target.value)
                              }
                              className={FORM_INPUT}
                              placeholder="https://..."
                            />
                            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20">
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                disabled={item.uploadingImage}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) void uploadDetailImage(item.clientId, file);
                                  e.target.value = "";
                                }}
                              />
                              {item.uploadingImage ? "Subiendo…" : "Subir imagen"}
                            </label>
                          </div>
                        </div>
                        <div className="flex items-start justify-center lg:justify-end">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title || `Detalle ${index + 1}`}
                              className="h-32 w-full max-w-[140px] rounded-xl border border-slate-600/50 object-cover"
                            />
                          ) : (
                            <div className="flex h-32 w-full max-w-[140px] items-center justify-center rounded-xl border border-dashed border-slate-600/50 bg-slate-950/40 text-sm text-slate-500">
                              Sin imagen
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Precios */}
            <div className={FORM_SECTION}>
              <h3 className={FORM_SECTION_TITLE}>Precio y descuento</h3>
              <p className={FORM_HINT}>
                {product.creditPointsEnabled
                  ? "Con puntos habilitados, el precio se cobra en puntos de la wallet."
                  : "Precio en dinero para checkout con pasarela de pago."}
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className={FORM_LABEL} htmlFor="product-price">
                    Precio {product.creditPointsEnabled ? "(puntos)" : "(USD)"}
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className={FORM_INPUT}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={FORM_LABEL} htmlFor="product-discount">
                    Descuento (%)
                  </label>
                  <input
                    id="product-discount"
                    type="number"
                    name="discount"
                    value={product.discount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className={FORM_INPUT}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Categoría e idioma */}
            <div className={FORM_SECTION}>
              <h3 className={FORM_SECTION_TITLE}>Categoría e idioma</h3>
              <p className={FORM_HINT}>Clasificación en la tienda y datos del reino.</p>
              <div className="space-y-6">
                <div>
                  <label className={FORM_LABEL} htmlFor="product-category">
                    Categoría
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <select
                      id="product-category"
                      name="category"
                      value={product.category}
                      onChange={handleChange}
                      required
                      className={`${FORM_INPUT} flex-1`}
                    >
                      <option value={0}>Selecciona una categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                      className={`shrink-0 rounded-xl border px-5 py-3.5 text-base font-semibold transition ${
                        showNewCategoryInput
                          ? "border-slate-500 bg-slate-700/50 text-slate-400"
                          : "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                      }`}
                    >
                      {showNewCategoryInput ? "Cancelar" : "+ Nueva categoría"}
                    </button>
                  </div>
                  {showNewCategoryInput && (
                    <div className="mt-4 space-y-4 rounded-xl border border-slate-600/45 bg-slate-900/50 p-5">
                      <p className="text-base text-slate-400">
                        Crea una categoría nueva para usar en este producto.
                      </p>
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className={FORM_INPUT}
                        placeholder="Nombre de la categoría"
                      />
                      <input
                        type="text"
                        value={newCategoryDescription}
                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                        className={FORM_INPUT}
                        placeholder="Descripción (opcional)"
                      />
                      <input
                        type="text"
                        value={newCategoryDisclaimer}
                        onChange={(e) => setNewCategoryDisclaimer(e.target.value)}
                        className={FORM_INPUT}
                        placeholder="Disclaimer (opcional)"
                      />
                      <button type="button" onClick={addCategory} className={DASHBOARD_PALETTE.btnPrimary}>
                        Crear categoría
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className={FORM_LABEL} htmlFor="product-language">
                      Idioma
                    </label>
                    <select
                      id="product-language"
                      name="language"
                      value={product.language}
                      onChange={handleChange}
                      className={FORM_INPUT}
                    >
                      <option value="es">Español</option>
                      <option value="en">Inglés</option>
                      <option value="pt">Portugués</option>
                    </select>
                  </div>
                  <div>
                    <label className={FORM_LABEL} htmlFor="product-realm">
                      Nombre del reino <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="product-realm"
                      type="text"
                      name="realmName"
                      value={product.realmName}
                      onChange={handleChange}
                      required
                      className={FORM_INPUT}
                      placeholder="Ej: Mi Servidor"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={FORM_SECTION}>
              <h3 className={FORM_SECTION_TITLE}>Pago e impuestos</h3>
              <p className={FORM_HINT}>
                Permite comprar con puntos o dinero. Los impuestos aplican en checkout con tarjeta.
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className={FORM_LABEL} htmlFor="product-tax">
                    Impuesto
                  </label>
                  <input
                    id="product-tax"
                    type="text"
                    name="tax"
                    value={product.tax}
                    onChange={handleChange}
                    required
                    className={FORM_INPUT}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={FORM_LABEL} htmlFor="product-return-tax">
                    Base devolución
                  </label>
                  <input
                    id="product-return-tax"
                    type="text"
                    name="returnTax"
                    value={product.returnTax}
                    onChange={handleChange}
                    required
                    className={FORM_INPUT}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={FORM_LABEL} htmlFor="product-points-value">
                    Valor referencial (puntos)
                  </label>
                  <input
                    id="product-points-value"
                    type="number"
                    name="creditPointsValue"
                    value={product.creditPointsValue}
                    onChange={handleChange}
                    min="0"
                    className={FORM_INPUT}
                    placeholder="0"
                  />
                </div>
              </div>
              <label className="mt-5 flex cursor-pointer items-start gap-4 rounded-xl border border-slate-600/45 bg-slate-900/35 p-4">
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
                  className="mt-1 h-5 w-5 rounded border-slate-500 bg-slate-800 text-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                />
                <span>
                  <span className="block text-base font-semibold text-white">
                    Permitir pago con puntos
                  </span>
                  <span className="mt-1 block text-base text-slate-400">
                    Si está activo, el cliente puede canjear el producto con puntos de su wallet.
                  </span>
                </span>
              </label>
            </div>

            {isExternalKeyProduct ? (
              <div className={FORM_SECTION}>
                <h3 className={FORM_SECTION_TITLE}>Claves de canje</h3>
                <p className={FORM_HINT}>
                  Cada compra consume una clave del inventario y se envía por correo al usuario.
                  {editingProductId !== null && product.availableRedeemKeys > 0 && (
                    <>
                      {" "}
                      Disponibles ahora:{" "}
                      <strong className="text-emerald-300">{product.availableRedeemKeys}</strong>
                    </>
                  )}
                </p>
                <div className="mb-6">
                  <label className={FORM_LABEL} htmlFor="redeem-instructions">
                    Instrucciones de canje
                  </label>
                  <textarea
                    id="redeem-instructions"
                    name="redeemInstructions"
                    value={product.redeemInstructions}
                    onChange={handleChange}
                    rows={3}
                    className={`${FORM_INPUT} resize-none`}
                    placeholder="Ej: Abre Steam → Juegos → Activar producto en Steam e ingresa la clave."
                  />
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {product.redeemKeys.length === 0 ? (
                    <span className="text-base text-slate-500">Sin claves nuevas en este guardado</span>
                  ) : (
                    product.redeemKeys.map((key, idx) => (
                      <span
                        key={`${key}-${idx}`}
                        className="inline-flex max-w-full items-center gap-2 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 font-mono text-sm text-emerald-200"
                      >
                        <span className="truncate">{key}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setProduct((prev) => ({
                              ...prev,
                              redeemKeys: prev.redeemKeys.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-lg leading-none text-emerald-300 hover:text-red-400"
                          aria-label="Quitar clave"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <label className={FORM_LABEL} htmlFor="redeem-keys-draft">
                  Pegar claves (una por línea)
                </label>
                <textarea
                  id="redeem-keys-draft"
                  value={redeemKeysDraft}
                  onChange={(e) => setRedeemKeysDraft(e.target.value)}
                  rows={5}
                  className={`${FORM_INPUT} mb-4 resize-y font-mono text-sm`}
                  placeholder={"AAAA-BBBB-CCCC\nDDDD-EEEE-FFFF"}
                />
                <button
                  type="button"
                  onClick={appendRedeemKeysFromDraft}
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-base font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                >
                  Agregar claves al lote
                </button>
              </div>
            ) : (
              <div className={FORM_SECTION}>
                <h3 className={FORM_SECTION_TITLE}>Paquetes del juego</h3>
                <p className={FORM_HINT}>
                  IDs de paquete que se entregan al personaje. Escribe un ID y pulsa Enter.
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {product.packages.length === 0 ? (
                    <span className="text-base text-slate-500">Ningún paquete añadido</span>
                  ) : (
                    product.packages.map((pkg, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-base font-medium text-cyan-200"
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
                          className="text-lg leading-none hover:text-red-400"
                          aria-label="Quitar paquete"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <input
                  type="text"
                  placeholder="ID del paquete — Enter para añadir"
                  className={FORM_INPUT}
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
            )}
          </form>
        </DashboardModalShell>
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
                setRedeemKeysDraft("");
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/40 px-5 py-4 sm:px-8">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => handleStatusFilterChange(f.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    statusFilter === f.value
                      ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-100"
                      : "border-slate-600/50 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              {filteredProducts.length} de {productsDb.products.length} productos
            </p>
          </div>

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
          ) : filteredProducts.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-8">
              <p className={`text-lg font-medium ${DASHBOARD_PALETTE.text}`}>
                No hay productos con este filtro
              </p>
              <p className={`mt-2 max-w-md mx-auto text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                {statusFilter === "active"
                  ? "Todos los productos están inactivos. Cambia a «Inactivos» o «Todos» para verlos."
                  : "No hay productos inactivos. Cambia a «Activos» para ver la tienda publicada."}
              </p>
            </div>
          ) : (
            <>
              <div className="border-t border-slate-700/50 bg-slate-950/20">
                <div className="overflow-x-auto px-3 pb-4 pt-1 sm:px-5">
                  <table className="w-full min-w-[920px] border-separate border-spacing-y-3">
                    <thead>
                      <tr>
                        {["Producto", "Categoría", "Entrega", "Precio", "Descuento", "Estado", "Puntos", "Idioma", "Acciones"].map(
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
                        <tr key={p.id} className={`group ${!p.status ? "opacity-80" : ""}`}>
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
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                p.delivery_type === "EXTERNAL_KEY"
                                  ? "border-emerald-500/45 bg-emerald-500/12 text-emerald-300"
                                  : "border-violet-500/45 bg-violet-500/12 text-violet-300"
                              }`}
                            >
                              {deliveryTypeLabel(p.delivery_type)}
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
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(p)}
                                aria-label={
                                  p.status ? `Desactivar ${p.name}` : `Activar ${p.name}`
                                }
                              >
                                <ProductsTableIcon
                                  className={
                                    p.status
                                      ? "border-amber-500/45 bg-amber-500/10 text-amber-300 hover:bg-amber-500/18"
                                      : "border-emerald-500/45 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                  }
                                >
                                  {p.status ? (
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  ) : (
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
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

              {filteredProducts.length > PAGE_SIZE && (
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
                      {currentPage} / {Math.ceil(filteredProducts.length / PAGE_SIZE)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          Math.min(Math.ceil(filteredProducts.length / PAGE_SIZE), currentPage + 1)
                        )
                      }
                      disabled={currentPage >= Math.ceil(filteredProducts.length / PAGE_SIZE)}
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
