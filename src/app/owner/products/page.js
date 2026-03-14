"use client";
import ImageUpload from "@/components/ui/ImageUpload";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { getProducts, createProduct, updateStock } from "@/lib/queries";
import useAuthStore from "@/store/authStore";
import { formatPrice } from "@/lib/utils";

const categories = [
  "SMARTPHONE",
  "TABLET",
  "LAPTOP",
  "TV",
  "AC",
  "FRIDGE",
  "COOLER",
  "AUDIO",
  "HEADPHONES",
  "ACCESSORY",
  "OTHER",
];

const emptyForm = {
  category: "SMARTPHONE",
  brand: "",
  modelName: "",
  modelType: "OFFLINE",
  price: "",
  mrp: "",
  stock: "",
  description: "",
  specs: "{}",
  images: [],
};

export default function OwnerProductsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "STORE_OWNER") {
      router.push("/auth/store-login");
    }
  }, [isLoggedIn, user]);

  const { data, isLoading } = useQuery({
    queryKey: ["owner-products"],
    queryFn: () => getProducts({ storeId: user?.store?.id, limit: 50 }),
    enabled: !!user?.store?.id,
  });

  const { mutate: addProduct, isLoading: adding } = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["owner-products"]);
      setShowForm(false);
      setForm(emptyForm);
      setError("");
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Product add karne mein error");
    },
  });

  const { mutate: changeStock } = useMutation({
    mutationFn: ({ id, stock }) => updateStock(id, stock),
    onSuccess: () => queryClient.invalidateQueries(["owner-products"]),
  });

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.brand || !form.modelName || !form.price) {
      setError("Brand, Model Name aur Price zaroori hain");
      return;
    }

    let specs = {};
    try {
      specs = JSON.parse(form.specs);
    } catch {
      setError("Specs valid JSON format mein daalo");
      return;
    }

    const images = form.images;

    addProduct({
      category: form.category,
      brand: form.brand,
      modelName: form.modelName,
      modelType: form.modelType,
      price: Number(form.price),
      mrp: form.mrp ? Number(form.mrp) : undefined,
      stock: form.modelType === "OFFLINE" ? Number(form.stock) : 0,
      description: form.description,
      specs,
      images,
    });
  };

  const products = data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📦 My Products</h1>
            <p className="text-gray-400 text-sm mt-1">
              {products.length} products
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/owner/dashboard")}
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">
              New Product Add Karo
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => updateForm("brand", e.target.value)}
                  placeholder="Apple"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Model Name *
                </label>
                <input
                  type="text"
                  value={form.modelName}
                  onChange={(e) => updateForm("modelName", e.target.value)}
                  placeholder="iPhone 15 128GB Black"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Type
                </label>
                <select
                  value={form.modelType}
                  onChange={(e) => updateForm("modelType", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="OFFLINE">Offline (In Stock)</option>
                  <option value="ONLINE">Online (On Request)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  placeholder="67999"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  MRP (₹)
                </label>
                <input
                  type="number"
                  value={form.mrp}
                  onChange={(e) => updateForm("mrp", e.target.value)}
                  placeholder="79999"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {form.modelType === "OFFLINE" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => updateForm("stock", e.target.value)}
                    placeholder="10"
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="col-span-2 md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Product Photos
                </label>
                <ImageUpload
                  images={form.images}
                  onChange={(urls) => updateForm("images", urls)}
                />
              </div>

              <div className="col-span-2 md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Specs (JSON format)
                </label>
                <input
                  type="text"
                  value={form.specs}
                  onChange={(e) => updateForm("specs", e.target.value)}
                  placeholder='{"ram":"8GB","storage":"128GB"}'
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="col-span-2 md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Product ke baare mein likho..."
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowForm(false);
                  setError("");
                  setForm(emptyForm);
                }}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={adding}
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {adding ? "Add ho raha hai..." : "Product Add Karo ✓"}
              </button>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <div className="text-5xl mb-3">📦</div>
              <p>Koi product nahi hai — pehla product add karo!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Stock</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt=""
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span>📱</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {product.modelName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {product.brand} • {product.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-orange-500">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            product.modelType === "OFFLINE"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {product.modelType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {product.modelType === "OFFLINE" ? (
                          <div
                            className="flex items-center gap-2"
                            style={{ color: "black" }}
                          >
                            <button
                              onClick={() =>
                                changeStock({
                                  id: product.id,
                                  stock: Math.max(0, product.stock - 1),
                                })
                              }
                              className="w-6 h-6 border rounded flex items-center justify-center text-sm hover:bg-gray-50"
                            >
                              −
                            </button>
                            <span className="font-semibold text-sm w-8 text-center">
                              {product.stock}
                            </span>
                            <button
                              onClick={() =>
                                changeStock({
                                  id: product.id,
                                  stock: product.stock + 1,
                                })
                              }
                              className="w-6 h-6 border rounded flex items-center justify-center text-sm hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            On Request
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            product.stock > 0 || product.modelType === "ONLINE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.modelType === "ONLINE"
                            ? "Active"
                            : product.stock > 0
                              ? "In Stock"
                              : "Out of Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
