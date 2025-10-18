import { allCategories, createCategory } from "@/api/productCategory";
import { createProduct, getAllProducts } from "@/api/products";
import { ProductCategoriesResponse } from "@/dto/response/ProductCategoriesResponse";
import { ProductsDetailsDto } from "@/model/ProductsDetails";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";

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
    language: "",
    tax: "",
    returnTax: "",
    creditPointsValue: "",
    creditPointsEnabled: false,
    packages: [],
    details: "",
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

  const handleDelete = (id: number) => {
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
      const payload = {
        name: product.name,
        product_category_id: product.category,
        disclaimer: product.disclaimer,
        price: parseFloat(product.price),
        discount: parseInt(product.discount),
        description: product.description,
        image_url: product.imageUrl,
        realm_id: realmId,
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
        language: "",
        tax: "",
        returnTax: "",
        creditPointsValue: "",
        creditPointsEnabled: false,
        packages: [],
        details: "",
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
      console.error("Error al crear producto:", error);
      alert(`❌ Error al crear producto: ${error.message}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen overflow-y-auto">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border-b border-slate-600/30 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Gestión de Productos
            </h1>
            <p className="text-slate-300">
              Administra los productos disponibles en la tienda
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold px-6 py-3 rounded-lg border border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
          >
            {showForm ? "Cerrar Formulario" : "Crear Producto"}
          </button>
        </div>
      </div>

      <div className="p-8">
        {showForm && (
          <div className="max-w-8xl mx-auto mb-12">
            <section
              aria-label="Formulario para crear productos"
              className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-10 shadow-xl hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Crear Nuevo Producto
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block mb-3 font-semibold text-slate-200 text-lg">
                      Nombre del producto
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      required
                      className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                      placeholder="Ingresa el nombre del producto"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-3 font-semibold text-slate-200 text-lg">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={product.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300 resize-none"
                      placeholder="Describe el producto detalladamente"
                    />
                  </div>

                  <div>
                    <label className="block mb-3 font-semibold text-slate-200 text-lg">
                      Precio
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={product.price}
                      onChange={handleChange}
                      required
                      step="0.01"
                      className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block mb-3 font-semibold text-slate-200 text-lg">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={product.discount}
                      onChange={handleChange}
                      className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block mb-3 font-semibold text-slate-200 text-lg">
                      Categoría
                    </label>
                    <div className="flex space-x-3">
                      <select
                        name="category"
                        value={product.category}
                        onChange={handleChange}
                        required
                        className="flex-1 p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
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
                        onClick={() =>
                          setShowNewCategoryInput(!showNewCategoryInput)
                        }
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold px-6 py-4 rounded-lg border border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
                      >
                        {showNewCategoryInput ? "Cancelar" : "Nueva"}
                      </button>
                    </div>
                    {showNewCategoryInput && (
                      <div className="mt-4 space-y-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none text-white text-lg transition-all duration-300"
                          placeholder="Nombre de categoría"
                        />
                        <input
                          type="text"
                          value={newCategoryDescription}
                          onChange={(e) =>
                            setNewCategoryDescription(e.target.value)
                          }
                          className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none text-white text-lg transition-all duration-300"
                          placeholder="Descripción"
                        />
                        <input
                          type="text"
                          value={newCategoryDisclaimer}
                          onChange={(e) =>
                            setNewCategoryDisclaimer(e.target.value)
                          }
                          className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none text-white text-lg transition-all duration-300"
                          placeholder="Disclaimer"
                        />
                        <button
                          type="button"
                          onClick={addCategory}
                          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold px-6 py-4 rounded-lg border border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
                        >
                          Crear Categoría
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-3 font-semibold text-slate-200 text-lg">
                      URL de imagen
                    </label>
                    <input
                      type="text"
                      name="imageUrl"
                      value={product.imageUrl}
                      onChange={handleChange}
                      className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div>
                    <label className="block mb-3 font-semibold text-slate-200 text-lg">
                      Idioma
                    </label>
                    <select
                      name="language"
                      value={product.language}
                      onChange={handleChange}
                      className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                    >
                      <option value="es">Español</option>
                      <option value="en">Inglés</option>
                      <option value="fr">Francés</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-3 font-semibold text-slate-200 text-lg">
                      Impuesto
                    </label>
                    <input
                      type="text"
                      name="tax"
                      value={product.tax}
                      onChange={handleChange}
                      className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block mb-3 font-semibold text-slate-200 text-lg">
                      Impuesto devolución
                    </label>
                    <input
                      type="text"
                      name="returnTax"
                      value={product.returnTax}
                      onChange={handleChange}
                      className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block mb-3 font-semibold text-slate-200 text-lg">
                      Valor puntos crédito
                    </label>
                    <input
                      type="number"
                      name="creditPointsValue"
                      value={product.creditPointsValue}
                      onChange={handleChange}
                      className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                      placeholder="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
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
                        className="w-5 h-5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label className="text-lg font-semibold text-slate-200">
                        Habilitar puntos crédito
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-3 font-semibold text-slate-200 text-lg">
                      Paquetes (IDs)
                    </label>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {product.packages.map((pkg, idx) => (
                        <div
                          key={idx}
                          className="flex items-center bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 px-4 py-2 rounded-full"
                        >
                          <span className="text-white font-medium">{pkg}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setProduct((prev) => ({
                                ...prev,
                                packages: prev.packages.filter(
                                  (_, i) => i !== idx
                                ),
                              }))
                            }
                            className="ml-3 text-red-400 hover:text-red-300 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Añade un ID y pulsa Enter"
                      className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const value = e.currentTarget.value.trim();
                          if (value !== "") {
                            setProduct((prev) => ({
                              ...prev,
                              packages: [...prev.packages, value],
                            }));
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold px-8 py-4 rounded-lg border border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 text-lg"
                >
                  Guardar Producto
                </button>
              </form>
            </section>
          </div>
        )}

        {/* Lista de productos */}
        <section className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-10 shadow-xl hover:shadow-2xl hover:border-green-400/50 transition-all duration-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Productos Registrados
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
          </div>

          {productsDb.products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-slate-400 text-xl">
                No hay productos registrados
              </p>
              <p className="text-slate-500 mt-2">
                Crea tu primer producto usando el formulario de arriba
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-slate-300 border-separate border-spacing-y-4">
                  <thead className="bg-slate-700/50 text-slate-400">
                    <tr>
                      <th className="p-6 text-left min-w-[200px] text-lg font-semibold">
                        Producto
                      </th>
                      <th className="p-6 text-left min-w-[120px] text-lg font-semibold">
                        Categoría
                      </th>
                      <th className="p-6 text-left min-w-[100px] text-lg font-semibold">
                        Precio
                      </th>
                      <th className="p-6 text-left text-lg font-semibold">
                        Descuento
                      </th>
                      <th className="p-6 text-left text-lg font-semibold">
                        Estado
                      </th>
                      <th className="p-6 text-left text-lg font-semibold">
                        Puntos
                      </th>
                      <th className="p-6 text-left text-lg font-semibold">
                        Idioma
                      </th>
                      <th className="p-6 text-left text-lg font-semibold">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((p) => (
                      <tr
                        key={p.id}
                        className="bg-slate-700/30 rounded-lg hover:bg-slate-600/40 hover:shadow-lg transition-all duration-300 border border-slate-600/20"
                      >
                        <td className="p-6 rounded-l-lg">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <img
                                className="rounded-lg h-16 w-16 object-cover border-2 border-slate-600/50"
                                src={
                                  p.img_url || "https://via.placeholder.com/64"
                                }
                                alt={p.name}
                              />
                              <div className="absolute -top-1 -right-1 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full border border-slate-600/50">
                                #{p.id}
                              </div>
                            </div>
                            <div>
                              <div className="text-xl font-semibold text-white">
                                {p.name}
                              </div>
                              <div className="text-slate-400 text-sm">
                                ID: {p.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-400/30">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="text-xl font-bold text-emerald-400">
                            ${p.price}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-medium border border-orange-400/30">
                            {p.discount}%
                          </span>
                        </td>
                        <td className="p-6">
                          {p.status ? (
                            <span className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-400/30">
                              Activo
                            </span>
                          ) : (
                            <span className="bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-medium border border-red-400/30">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="p-6">
                          {p.use_points ? (
                            <span className="text-green-400 text-xl">✓</span>
                          ) : (
                            <span className="text-red-400 text-xl">✗</span>
                          )}
                        </td>
                        <td className="p-6">
                          <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-400/30">
                            {p.language?.toUpperCase() || "N/A"}
                          </span>
                        </td>
                        <td className="p-6 rounded-r-lg">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => alert(`Ver producto ${p.id}`)}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 rounded-lg transition-all duration-300 border border-blue-400/30"
                              aria-label="Ver"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => alert(`Editar producto ${p.id}`)}
                              className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 rounded-lg transition-all duration-300 border border-emerald-400/30"
                              aria-label="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-300 border border-red-400/30"
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
                <div className="mt-8 flex justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 border border-slate-600/50"
                    >
                      Anterior
                    </button>
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 rounded-lg border border-blue-400/30">
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
                      className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 border border-slate-600/50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductDashboard;
