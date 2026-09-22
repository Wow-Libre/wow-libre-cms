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
  physicalStock: string;
  sizeOptions: string;
  mainImageUploading: boolean;
}

const PAGE_SIZE = 5;

type ProductStatusFilter = "active" | "all" | "inactive";

const STATUS_FILTERS: {
  value: ProductStatusFilter;
  label: string;
  icon: React.ReactNode;
  accent: "emerald" | "sky" | "slate";
}[] = [
  {
    value: "active",
    label: "Activos",
    accent: "emerald",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    value: "all",
    label: "Todos",
    accent: "sky",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    value: "inactive",
    label: "Inactivos",
    accent: "slate",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
];

const FILTER_ACCENT: Record<"emerald" | "sky" | "slate", string> = {
  emerald: "border-emerald-600/40 bg-emerald-500/10 text-[#1f8a38] ring-1 ring-emerald-600/20",
  sky: "border-[#0071e3]/35 bg-[#0071e3]/10 text-[#0071e3] ring-1 ring-[#0071e3]/20",
  slate: "border-black/15 bg-[#f5f5f7] text-[#1d1d1f] ring-1 ring-black/10",
};

const FORM_LABEL = `block mb-2.5 text-lg font-semibold text-[#6e6e73]`;
const FORM_HINT = `mb-5 text-lg leading-relaxed text-[#6e6e73]`;
const FORM_SECTION = `rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-7`;
const FORM_SECTION_TITLE = `text-xl font-bold tracking-tight text-[#1d1d1f]`;
const FORM_INPUT = `w-full rounded-xl border border-black/10 bg-[#fbfbfd] px-4 py-4 text-lg text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/15`;

function deliveryTypeLabel(type?: string): string {
  if (type === "EXTERNAL_KEY") return "Clave externa";
  if (type === "PHYSICAL") return "Envío físico";
  return "En el juego";
}

function parseDeliveryType(type?: string): ProductDeliveryType {
  if (type === "EXTERNAL_KEY" || type === "PHYSICAL") return type;
  return "IN_GAME";
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
    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${className}`}>
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
    physicalStock: "0",
    sizeOptions: "",
    mainImageUploading: false,
  });

  const [categories, setCategories] = useState<ProductCategoriesResponse[]>([]);
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const [newCategoryDisclaimer, setNewCategoryDisclaimer] = useState("");
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
    physicalStock: "0",
    sizeOptions: "",
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
      deliveryType: parseDeliveryType(p.delivery_type),
      redeemInstructions: p.redeem_instructions ?? "",
      redeemKeys: [],
      availableRedeemKeys: p.available_redeem_keys ?? 0,
      physicalStock: String(p.physical_stock ?? 0),
      sizeOptions: p.size_options ?? "",
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
          deliveryType: parseDeliveryType(full.delivery_type ?? full.deliveryType),
          physicalStock: String(full.physical_stock ?? full.physicalStock ?? prev.physicalStock),
          sizeOptions: full.size_options ?? full.sizeOptions ?? prev.sizeOptions,
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
      color: "#1d1d1f",
      background: "#ffffff",
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
        background: "#ffffff",
        color: "#1d1d1f",
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
        background: "#ffffff",
        color: "#1d1d1f",
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
      alert(`Error al crear categoría: ${error.message}`);
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
        color: "#1d1d1f",
        background: "#ffffff",
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
        color: "#1d1d1f",
        background: "#ffffff",
      });
      return;
    }

    if (product.detailItems.some((item) => item.uploadingImage) || product.mainImageUploading) {
      Swal.fire({
        icon: "info",
        title: "Espera la subida",
        text: "Hay imágenes subiendo todavía. Intenta de nuevo en unos segundos.",
        color: "#1d1d1f",
        background: "#ffffff",
      });
      return;
    }

    const isExternalKey = product.deliveryType === "EXTERNAL_KEY";
    const isPhysical = product.deliveryType === "PHYSICAL";

    if (isExternalKey && editingProductId === null && product.redeemKeys.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Claves requeridas",
        text: "Agrega al menos una clave de canje para productos de tipo clave externa.",
        color: "#1d1d1f",
        background: "#ffffff",
      });
      return;
    }

    if (isPhysical) {
      const stock = parseInt(product.physicalStock, 10);
      if (Number.isNaN(stock) || stock < 0) {
        Swal.fire({
          icon: "error",
          title: "Stock inválido",
          text: "El stock físico no puede ser negativo.",
          color: "#1d1d1f",
          background: "#ffffff",
        });
        return;
      }
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
      credit_points_value: isPhysical ? 0 : parseInt(product.creditPointsValue, 10) || 0,
      credit_points_enabled: isPhysical ? false : product.creditPointsEnabled,
      packages: isExternalKey || isPhysical ? [] : product.packages,
      delivery_type: product.deliveryType,
      redeem_instructions: isExternalKey ? product.redeemInstructions : undefined,
      redeem_keys: isExternalKey && product.redeemKeys.length > 0 ? product.redeemKeys : undefined,
      details: buildDetailsPayload(product.detailItems),
      physical_stock: isPhysical ? parseInt(product.physicalStock, 10) || 0 : undefined,
      size_options: isPhysical ? product.sizeOptions.trim() : undefined,
    };

    setFormLoading(true);
    try {
      if (editingProductId !== null) {
        await updateProduct(token, editingProductId, payload);
        Swal.fire({
          icon: "success",
          title: "Producto actualizado",
          text: "Los cambios se guardaron correctamente",
          background: "#ffffff",
          color: "#1d1d1f",
        });
      } else {
        await createProduct(token, payload);
        Swal.fire({
          icon: "success",
          title: "Producto creado",
          text: "El producto se creó correctamente",
          background: "#ffffff",
          color: "#1d1d1f",
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
        color: "#1d1d1f",
        background: "#ffffff",
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
        background: "#ffffff",
        color: "#1d1d1f",
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
        background: "#ffffff",
        color: "#1d1d1f",
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
  const isPhysicalProduct = product.deliveryType === "PHYSICAL";

  return (
    <div className={`space-y-6 ${DASHBOARD_PALETTE.text}`}>
      {/* Modal Ver producto */}
      {selectedProduct && (
        <DashboardModalShell
          open
          onClose={() => setSelectedProduct(null)}
          title="Detalle del producto"
          subtitle={
            <span className="flex flex-wrap items-center gap-2 text-lg">
              <span className={`rounded-full bg-[#f5f5f7] px-3 py-1 font-mono text-base ${DASHBOARD_PALETTE.text}`}>
                #{selectedProduct.id}
              </span>
              <span className={DASHBOARD_PALETTE.textMuted}>·</span>
              <span className={DASHBOARD_PALETTE.text}>
                {selectedProduct.category_name || selectedProduct.category || "Sin categoría"}
              </span>
            </span>
          }
          maxWidthClass="max-w-2xl"
          accent="cyan"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={`text-base ${DASHBOARD_PALETTE.textMuted}`}>
                Vista de solo lectura · los cambios se hacen desde el formulario de edición
              </p>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className={DASHBOARD_PALETTE.btnPrimary}
              >
                Cerrar
              </button>
            </div>
          }
        >
          <div className={`space-y-8 ${DASHBOARD_PALETTE.text}`}>
            <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
              <div className="relative aspect-[21/9] min-h-[160px] w-full bg-[#f5f5f7] sm:aspect-[2/1]">
                <img
                  src={selectedProduct.img_url || "https://via.placeholder.com/800x400?text=Producto"}
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/800x400/f5f5f7/86868b?text=Sin+imagen";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute left-4 right-4 top-4 flex flex-wrap items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-base font-semibold ${
                      selectedProduct.status
                        ? "border border-[#34c759]/30 bg-white text-[#1f8a38]"
                        : "border border-black/10 bg-white text-[#6e6e73]"
                    }`}
                  >
                    {selectedProduct.status ? "Activo" : "Inactivo"}
                  </span>
                  {selectedProduct.discount > 0 && (
                    <span className="rounded-full border border-[#ff9f0a]/30 bg-white px-3.5 py-1.5 text-base font-bold text-[#c77b00]">
                      {selectedProduct.discount}% OFF
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <h3 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                    {selectedProduct.name}
                  </h3>
                </div>
              </div>

              <div className="grid gap-4 border-t border-black/[0.08] p-5 sm:grid-cols-2 sm:p-6">
                <div className="rounded-2xl border border-[#0071e3]/15 bg-[#0071e3]/8 p-5">
                  <p className={`text-base font-semibold ${DASHBOARD_PALETTE.textMuted}`}>
                    Precio
                  </p>
                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    {selectedProduct.discount > 0 &&
                    selectedProduct.discount_price > 0 &&
                    selectedProduct.discount_price < selectedProduct.price ? (
                      <>
                        <span className={`text-3xl font-bold tabular-nums sm:text-4xl ${DASHBOARD_PALETTE.accent}`}>
                          {formatMoney(selectedProduct.discount_price)}
                        </span>
                        <span className={`mb-1 text-lg tabular-nums line-through ${DASHBOARD_PALETTE.textMuted}`}>
                          {formatMoney(selectedProduct.price)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`text-3xl font-bold tabular-nums sm:text-4xl ${DASHBOARD_PALETTE.accent}`}>
                          {formatMoney(selectedProduct.price)}
                        </span>
                        {selectedProduct.discount > 0 && (
                          <span className={`mb-1 text-base ${DASHBOARD_PALETTE.textMuted}`}>
                            ({selectedProduct.discount}% sobre precio base)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:content-center">
                  <div className="rounded-2xl border border-black/[0.08] bg-[#fbfbfd] px-4 py-4">
                    <p className={`text-base font-semibold ${DASHBOARD_PALETTE.textMuted}`}>
                      Idioma
                    </p>
                    <p className={`mt-1 text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {selectedProduct.language?.toUpperCase() ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-black/[0.08] bg-[#fbfbfd] px-4 py-4">
                    <p className={`text-base font-semibold ${DASHBOARD_PALETTE.textMuted}`}>
                      Puntos
                    </p>
                    <p className={`mt-1 text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {selectedProduct.use_points ? (
                        <>
                          <span className="text-[#1f8a38]">Sí</span>
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

            <div>
              <h4 className={`mb-4 text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>
                Datos comerciales
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
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
                  ...(selectedProduct.delivery_type === "PHYSICAL"
                    ? [
                        {
                          label: "Stock físico",
                          value: String(selectedProduct.physical_stock ?? 0),
                        },
                        {
                          label: "Tallas",
                          value: selectedProduct.size_options?.trim() || "Sin talla",
                        },
                      ]
                    : []),
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-3 rounded-xl border border-black/[0.08] bg-[#fbfbfd] px-4 py-3.5"
                  >
                    <span className={`shrink-0 text-base ${DASHBOARD_PALETTE.textMuted}`}>{row.label}</span>
                    <span className={`min-w-0 text-right text-base font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedProduct.description?.trim() && (
              <div className="rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-5">
                <h4 className={`mb-2 text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>
                  Descripción
                </h4>
                <p className={`text-lg leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {selectedProduct.description}
                </p>
              </div>
            )}

            {selectedProduct.disclaimer?.trim() && (
              <div className="rounded-2xl border border-[#ff9f0a]/25 bg-[#ff9f0a]/8 p-5">
                <h4 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#c77b00]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#ff9f0a]" aria-hidden />
                  Disclaimer
                </h4>
                <p className="text-lg leading-relaxed text-[#1d1d1f]">{selectedProduct.disclaimer}</p>
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
                className="rounded-full border border-black/10 bg-white px-6 py-3.5 text-lg font-semibold text-[#1d1d1f] transition hover:bg-[#f5f5f7] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={formLoading}
                className={`px-8 py-3.5 text-lg disabled:opacity-50 ${DASHBOARD_PALETTE.btnPrimary}`}
              >
                {formLoading
                  ? "Guardando⬦"
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
              <div className="grid gap-4 sm:grid-cols-3">
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
                    {
                      value: "PHYSICAL" as ProductDeliveryType,
                      title: "Envío físico",
                      description: "Figuras o camisas. El comprador indica dirección (y talla si aplica).",
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
                          ? "border-[#34c759] bg-[#34c759]/10 ring-2 ring-[#34c759]/20"
                          : "border-black/10 bg-[#fbfbfd] hover:border-black/20"
                      }`}
                    >
                      <p className={`text-xl font-bold ${DASHBOARD_PALETTE.text}`}>{option.title}</p>
                      <p className={`mt-2 text-lg leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
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
                  <p className={`mb-3 ${FORM_HINT.replace("mb-5 ", "")}`}>
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
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#af52de]/25 bg-[#af52de]/10 px-5 py-3 text-lg font-semibold text-[#7d3caf] transition hover:bg-[#af52de]/15">
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
                        {product.mainImageUploading ? "Subiendo imagen⬦" : "Subir imagen"}
                      </label>
                    </div>
                    {product.imageUrl && (
                      <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-[#f5f5f7]">
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
                  className="shrink-0 rounded-full border border-[#af52de]/25 bg-[#af52de]/10 px-5 py-3 text-lg font-semibold text-[#7d3caf] transition hover:bg-[#af52de]/15"
                >
                  + Agregar detalle
                </button>
              </div>

              {product.detailItems.length === 0 ? (
                <p className={`rounded-xl border border-dashed border-black/15 bg-[#fbfbfd] px-4 py-8 text-center text-lg ${DASHBOARD_PALETTE.textMuted}`}>
                  Sin bloques de detalle. Usa &quot;Agregar detalle&quot; para añadir imágenes explicativas del producto.
                </p>
              ) : (
                <div className="space-y-5">
                  {product.detailItems.map((item, index) => (
                    <div
                      key={item.clientId}
                      className="rounded-xl border border-black/[0.08] bg-[#fbfbfd] p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className={`text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>Detalle #{index + 1}</p>
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
                            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#af52de]/25 bg-[#af52de]/10 px-4 py-2.5 text-base font-semibold text-[#7d3caf] transition hover:bg-[#af52de]/15">
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
                              {item.uploadingImage ? "Subiendo⬦" : "Subir imagen"}
                            </label>
                          </div>
                        </div>
                        <div className="flex items-start justify-center lg:justify-end">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title || `Detalle ${index + 1}`}
                              className="h-32 w-full max-w-[140px] rounded-xl border border-black/10 object-cover"
                            />
                          ) : (
                            <div className={`flex h-32 w-full max-w-[140px] items-center justify-center rounded-xl border border-dashed border-black/15 bg-white text-base ${DASHBOARD_PALETTE.textMuted}`}>
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
                          ? "border-black/15 bg-[#f5f5f7] text-[#6e6e73]"
                          : "border-[#0071e3]/25 bg-[#0071e3]/10 text-[#0071e3] hover:bg-[#0071e3]/15"
                      }`}
                    >
                      {showNewCategoryInput ? "Cancelar" : "+ Nueva categoría"}
                    </button>
                  </div>
                  {showNewCategoryInput && (
                    <div className="mt-4 space-y-4 rounded-xl border border-black/[0.08] bg-[#fbfbfd] p-5">
                      <p className={`text-lg ${DASHBOARD_PALETTE.textMuted}`}>
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
                      Nombre del reino <span className="text-[#ff3b30]">*</span>
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
              {!isPhysicalProduct && (
              <label className="mt-5 flex cursor-pointer items-start gap-4 rounded-xl border border-black/[0.08] bg-[#fbfbfd] p-4">
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
                  className="mt-1 h-5 w-5 rounded border-slate-500 bg-white text-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                />
                <span>
                  <span className={`block text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>
                    Permitir pago con puntos
                  </span>
                  <span className={`mt-1 block text-lg ${DASHBOARD_PALETTE.textMuted}`}>
                    Si está activo, el cliente puede canjear el producto con puntos de su wallet.
                  </span>
                </span>
              </label>
              )}
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
                      <strong className="text-[#1f8a38]">{product.availableRedeemKeys}</strong>
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
                    placeholder="Ej: Abre Steam → Juegos → Activar producto e ingresa la clave."
                  />
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {product.redeemKeys.length === 0 ? (
                    <span className={`text-lg ${DASHBOARD_PALETTE.textMuted}`}>Sin claves nuevas en este guardado</span>
                  ) : (
                    product.redeemKeys.map((key, idx) => (
                      <span
                        key={`${key}-${idx}`}
                        className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#34c759]/25 bg-[#34c759]/10 px-3.5 py-2 font-mono text-base text-[#1f8a38]"
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
                          className="text-xl leading-none text-[#1f8a38] hover:text-[#ff3b30]"
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
                  className={`${FORM_INPUT} mb-4 resize-y font-mono text-base`}
                  placeholder={"AAAA-BBBB-CCCC\nDDDD-EEEE-FFFF"}
                />
                <button
                  type="button"
                  onClick={appendRedeemKeysFromDraft}
                  className="rounded-full border border-[#34c759]/25 bg-[#34c759]/10 px-5 py-3 text-lg font-semibold text-[#1f8a38] transition hover:bg-[#34c759]/15"
                >
                  Agregar claves al lote
                </button>
              </div>
            ) : isPhysicalProduct ? (
              <div className={FORM_SECTION}>
                <h3 className={FORM_SECTION_TITLE}>Inventario físico</h3>
                <p className={FORM_HINT}>
                  Stock de piezas. Las tallas son opcionales: déjalas vacías para figuras; usa S,M,L,XL para camisas.
                  El comprador pagará en USD y podrá descontar puntos de donación (1 punto = 1 USD).
                </p>
                <div className="mb-6">
                  <label className={FORM_LABEL} htmlFor="physical-stock">
                    Stock
                  </label>
                  <input
                    id="physical-stock"
                    type="number"
                    min="0"
                    name="physicalStock"
                    value={product.physicalStock}
                    onChange={handleChange}
                    className={FORM_INPUT}
                    placeholder="0"
                  />
                </div>
                <label className={FORM_LABEL} htmlFor="size-options">
                  Opciones de talla
                </label>
                <input
                  id="size-options"
                  type="text"
                  name="sizeOptions"
                  value={product.sizeOptions}
                  onChange={handleChange}
                  className={FORM_INPUT}
                  placeholder="S,M,L,XL"
                />
              </div>
            ) : (
              <div className={FORM_SECTION}>
                <h3 className={FORM_SECTION_TITLE}>Paquetes del juego</h3>
                <p className={FORM_HINT}>
                  IDs de paquete que se entregan al personaje. Escribe un ID y pulsa Enter.
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {product.packages.length === 0 ? (
                    <span className={`text-lg ${DASHBOARD_PALETTE.textMuted}`}>Ningún paquete añadido</span>
                  ) : (
                    product.packages.map((pkg, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 rounded-full border border-[#0071e3]/20 bg-[#0071e3]/10 px-3.5 py-2 text-lg font-medium text-[#0071e3]"
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
                          className="text-xl leading-none hover:text-[#ff3b30]"
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
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-base font-semibold ${DASHBOARD_PALETTE.text}`}>
                  <span className={DASHBOARD_PALETTE.textMuted}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </span>
                  <span className="tabular-nums">{productsDb.products.length}</span>
                  <span className={DASHBOARD_PALETTE.textMuted}>totales</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#34c759]/25 bg-[#34c759]/10 px-3 py-1.5 text-base font-semibold text-[#1f8a38]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" aria-hidden />
                  <span className="tabular-nums">
                    {productsDb.products.filter((p) => p.status).length}
                  </span>
                  <span>activos</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setRedeemKeysDraft("");
                  setProduct(emptyForm);
                  setShowForm(true);
                }}
                className={`inline-flex items-center gap-2 ${DASHBOARD_PALETTE.btnPrimary}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear producto
              </button>
            </div>
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.08] bg-[#fbfbfd] px-5 py-4 sm:px-8">
            <div
              role="radiogroup"
              aria-label="Filtro de estado"
              className="flex flex-wrap gap-2"
            >
              {STATUS_FILTERS.map((f) => {
                const count =
                  f.value === "all"
                    ? productsDb.products.length
                    : f.value === "active"
                      ? productsDb.products.filter((p) => p.status).length
                      : productsDb.products.filter((p) => !p.status).length;
                const active = statusFilter === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => handleStatusFilterChange(f.value)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-base font-medium transition ${
                      active
                        ? FILTER_ACCENT[f.accent]
                        : `border-black/10 bg-white ${DASHBOARD_PALETTE.textMuted} hover:bg-white hover:text-[#1d1d1f]`
                    }`}
                  >
                    <span
                      className={`shrink-0 ${
                        active ? "text-current" : "text-[#86868b]"
                      }`}
                      aria-hidden
                    >
                      {f.icon}
                    </span>
                    <span>{f.label}</span>
                    <span
                      className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums ${
                        active
                          ? "bg-[#0071e3]/10 text-[#0071e3]"
                          : "bg-[#f5f5f7] text-[#6e6e73]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className={`flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-base ${DASHBOARD_PALETTE.textMuted}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" aria-hidden />
              <span className={`tabular-nums font-semibold ${DASHBOARD_PALETTE.text}`}>
                {filteredProducts.length}
              </span>
              <span>de {productsDb.products.length}</span>
            </div>
          </div>

          {productsDb.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-black/10 bg-[#f5f5f7] text-[#0071e3]">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <p className={`text-xl font-semibold ${DASHBOARD_PALETTE.text}`}>
                Aún no hay productos en la tienda
              </p>
              <p className={`mt-2 max-w-md text-base ${DASHBOARD_PALETTE.textMuted}`}>
                Crea tu primer artículo con el botón de abajo. Podrás asignar categoría, precio,
                idioma e imagen antes de publicarlo.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setRedeemKeysDraft("");
                  setProduct(emptyForm);
                  setShowForm(true);
                }}
                className={`mt-6 inline-flex items-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} px-5 py-3 text-base`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear producto
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-[#f5f5f7] text-[#86868b]">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <p className={`text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>
                No hay productos con este filtro
              </p>
              <p className={`mt-2 max-w-md text-base ${DASHBOARD_PALETTE.textMuted}`}>
                {statusFilter === "active"
                  ? "Todos los productos están inactivos. Cambia a «Inactivos» o «Todos» para verlos."
                  : statusFilter === "inactive"
                    ? "No hay productos inactivos. Cambia a «Activos» para ver la tienda publicada."
                    : "No hay coincidencias con el filtro seleccionado."}
              </p>
              <button
                type="button"
                onClick={() => handleStatusFilterChange("active")}
                className={`mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium ${DASHBOARD_PALETTE.text} transition hover:bg-[#f5f5f7]`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Limpiar filtro
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] border-collapse">
                    <thead>
                      <tr className="bg-[#f5f5f7]">
                        {["Producto", "Categoría", "Entrega", "Precio", "Descuento", "Estado", "Puntos", "Idioma", "Acciones"].map(
                          (label) => (
                            <th
                              key={label}
                              className={`border-b border-black/[0.08] px-4 py-3.5 text-left text-base font-semibold ${DASHBOARD_PALETTE.textMuted} ${
                                label === "Acciones" ? "text-right" : ""
                              }`}
                            >
                              {label}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((p) => (
                        <tr
                          key={p.id}
                          className={`group bg-white transition-colors hover:bg-[#fbfbfd] ${!p.status ? "opacity-70" : ""}`}
                        >
                          <td className="border-b border-black/[0.08] px-4 py-4 align-middle">
                            <div className="flex min-w-[200px] max-w-[280px] items-center gap-4">
                              <img
                                className="h-14 w-14 shrink-0 rounded-xl border border-black/10 object-cover"
                                src={p.img_url || "https://via.placeholder.com/64"}
                                alt={p.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://via.placeholder.com/64/f5f5f7/86868b?text=·";
                                }}
                              />
                              <div className="min-w-0">
                                <p className={`truncate text-base font-semibold leading-snug ${DASHBOARD_PALETTE.text}`}>{p.name}</p>
                                <p className={`mt-1 font-mono text-sm ${DASHBOARD_PALETTE.textMuted}`}>ID · {p.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="border-b border-black/[0.08] px-4 py-4 align-middle">
                            <span
                              className={`inline-flex max-w-[140px] truncate rounded-full border border-[#0071e3]/20 bg-[#0071e3]/8 px-2.5 py-1 text-sm font-medium ${DASHBOARD_PALETTE.accent}`}
                            >
                              {p.category_name || p.category}
                            </span>
                          </td>
                          <td className="border-b border-black/[0.08] px-4 py-4 align-middle">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-sm font-semibold ${
                                p.delivery_type === "EXTERNAL_KEY"
                                  ? "border-[#34c759]/25 bg-[#34c759]/10 text-[#1f8a38]"
                                  : p.delivery_type === "PHYSICAL"
                                    ? "border-[#ff9f0a]/25 bg-[#ff9f0a]/10 text-[#c77b00]"
                                    : "border-[#af52de]/20 bg-[#af52de]/8 text-[#7d3caf]"
                              }`}
                            >
                              {deliveryTypeLabel(p.delivery_type)}
                            </span>
                          </td>
                          <td className="border-b border-black/[0.08] px-4 py-4 align-middle">
                            <span className={`text-base font-semibold tabular-nums ${DASHBOARD_PALETTE.text}`}>
                              {formatMoney(Number(p.price))}
                            </span>
                          </td>
                          <td className="border-b border-black/[0.08] px-4 py-4 align-middle">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-sm font-semibold ${
                                p.discount > 0
                                  ? "border-[#ff9f0a]/25 bg-[#ff9f0a]/10 text-[#c77b00]"
                                  : "border-black/10 bg-[#f5f5f7] text-[#6e6e73]"
                              }`}
                            >
                              {p.discount}%
                            </span>
                          </td>
                          <td className="border-b border-black/[0.08] px-4 py-4 align-middle">
                            {p.status ? (
                              <span className="rounded-full border border-[#34c759]/25 bg-[#34c759]/10 px-2.5 py-1 text-sm font-semibold text-[#1f8a38]">
                                Activo
                              </span>
                            ) : (
                              <span className="rounded-full border border-[#ff3b30]/25 bg-[#ff3b30]/8 px-2.5 py-1 text-sm font-semibold text-[#ff3b30]">
                                Inactivo
                              </span>
                            )}
                          </td>
                          <td className="border-b border-black/[0.08] px-4 py-4 align-middle">
                            <span
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                                p.use_points
                                  ? "border-[#34c759]/30 bg-[#34c759]/10 text-[#1f8a38]"
                                  : "border-black/10 bg-[#f5f5f7] text-[#86868b]"
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
                          <td className="border-b border-black/[0.08] px-4 py-4 align-middle">
                            <span
                              className={`rounded-full border border-black/10 bg-[#f5f5f7] px-2.5 py-1 text-sm font-semibold ${DASHBOARD_PALETTE.text}`}
                            >
                              {p.language?.toUpperCase() || "—"}
                            </span>
                          </td>
                          <td className="border-b border-black/[0.08] px-4 py-4 align-middle">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedProduct(p)}
                                aria-label={`Ver ${p.name}`}
                              >
                                <ProductsTableIcon className="border-black/10 bg-[#f5f5f7] text-[#0071e3] hover:bg-[#0071e3]/10">
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
                                <ProductsTableIcon className="border-black/10 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/[0.06]">
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
                                      ? "border-[#ff9f0a]/25 bg-[#ff9f0a]/10 text-[#c77b00] hover:bg-[#ff9f0a]/15"
                                      : "border-[#34c759]/25 bg-[#34c759]/10 text-[#1f8a38] hover:bg-[#34c759]/15"
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

              {filteredProducts.length > PAGE_SIZE && (() => {
                const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
                const canGoPrev = currentPage > 1;
                const canGoNext = currentPage < totalPages;
                return (
                  <nav
                    aria-label="Paginación de productos"
                    className="flex flex-col items-center gap-3 border-t border-black/[0.08] bg-white px-4 py-4 sm:flex-row sm:justify-between sm:px-6"
                  >
                    <p className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                      Página{" "}
                      <span className={`font-semibold tabular-nums ${DASHBOARD_PALETTE.text}`}>
                        {currentPage}
                      </span>{" "}
                      de{" "}
                      <span className={`font-semibold tabular-nums ${DASHBOARD_PALETTE.text}`}>
                        {totalPages}
                      </span>
                    </p>
                    <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-[#f5f5f7] p-1">
                      <button
                        type="button"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={!canGoPrev}
                        aria-label="Página anterior"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1d1d1f] transition hover:text-[#0071e3] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span
                        aria-current="page"
                        className="mx-1 inline-flex h-9 min-w-[3rem] items-center justify-center rounded-full bg-[#0071e3] px-3 text-sm font-semibold tabular-nums text-white dashboard-on-accent"
                      >
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={!canGoNext}
                        aria-label="Página siguiente"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1d1d1f] transition hover:text-[#0071e3] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </nav>
                );
              })()}
            </>
          )}
        </DashboardSection>
    </div>
  );
};

export default ProductDashboard;
