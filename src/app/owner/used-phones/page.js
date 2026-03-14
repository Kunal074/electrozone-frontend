"use client";
import ImageUpload from "@/components/ui/ImageUpload";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { getUsedPhones } from "@/lib/queries";
import useAuthStore from "@/store/authStore";
import { formatPrice, getConditionLabel } from "@/lib/utils";
import api from "@/lib/api";

const emptyForm = {
  brand: "",
  modelName: "",
  storage: "",
  ram: "",
  color: "",
  conditionGrade: "GOOD",
  conditionDescription: "",
  askingPrice: "",
  isNegotiable: true,
  warrantyLeft: "",
  batteryHealth: "",
  accessories: "",
  images: [],
};

export default function OwnerUsedPhonesPage() {
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
    queryKey: ["owner-used-phones"],
    queryFn: () => getUsedPhones({ storeId: user?.store?.id, limit: 50 }),
    enabled: !!user?.store?.id,
  });

  const { mutate: addPhone, isLoading: adding } = useMutation({
    mutationFn: (data) => api.post("/used-phones", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["owner-used-phones"]);
      setShowForm(false);
      setForm(emptyForm);
      setError("");
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Error aaya");
    },
  });

  const { mutate: markSold } = useMutation({
    mutationFn: (id) => api.patch(`/used-phones/${id}/sold`),
    onSuccess: () => queryClient.invalidateQueries(["owner-used-phones"]),
  });

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.brand || !form.modelName || !form.askingPrice) {
      setError("Brand, Model Name aur Price zaroori hain");
      return;
    }
    const images = form.images;
    
    const accessories = form.accessories
      ? form.accessories
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean)
      : [];

    addPhone({
      brand: form.brand,
      modelName: form.modelName,
      storage: form.storage,
      ram: form.ram,
      color: form.color,
      conditionGrade: form.conditionGrade,
      conditionDescription: form.conditionDescription,
      askingPrice: Number(form.askingPrice),
      isNegotiable: form.isNegotiable,
      warrantyLeft: form.warrantyLeft,
      batteryHealth: form.batteryHealth
        ? Number(form.batteryHealth)
        : undefined,
      accessories,
      images,
    });
  };

  const phones = data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">♻️ Used Phones</h1>
            <p className="text-gray-400 text-sm mt-1">
              {phones.length} listings
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
              className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700"
            >
              + Add Used Phone
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">
              New Used Phone Add Karo
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => updateForm("brand", e.target.value)}
                  placeholder="Samsung"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
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
                  placeholder="Galaxy S22 256GB"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Asking Price (₹) *
                </label>
                <input
                  type="number"
                  value={form.askingPrice}
                  onChange={(e) => updateForm("askingPrice", e.target.value)}
                  placeholder="32000"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Storage
                </label>
                <input
                  type="text"
                  value={form.storage}
                  onChange={(e) => updateForm("storage", e.target.value)}
                  placeholder="128GB"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  RAM
                </label>
                <input
                  type="text"
                  value={form.ram}
                  onChange={(e) => updateForm("ram", e.target.value)}
                  placeholder="8GB"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => updateForm("color", e.target.value)}
                  placeholder="Phantom Black"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Condition
                </label>
                <select
                  value={form.conditionGrade}
                  onChange={(e) => updateForm("conditionGrade", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                >
                  {["LIKE_NEW", "EXCELLENT", "GOOD", "FAIR", "DAMAGED"].map(
                    (g) => (
                      <option key={g} value={g}>
                        {getConditionLabel(g)}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Battery Health (%)
                </label>
                <input
                  type="number"
                  value={form.batteryHealth}
                  onChange={(e) => updateForm("batteryHealth", e.target.value)}
                  placeholder="87"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Warranty Left
                </label>
                <input
                  type="text"
                  value={form.warrantyLeft}
                  onChange={(e) => updateForm("warrantyLeft", e.target.value)}
                  placeholder="No warranty / 6 months"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div className="col-span-2 md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Accessories (comma separated)
                </label>
                <input
                  type="text"
                  value={form.accessories}
                  onChange={(e) => updateForm("accessories", e.target.value)}
                  placeholder="Charger, Box, Earphones"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div className="col-span-2 md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Phone Photos
                </label>
                <ImageUpload
                  images={form.images}
                  onChange={(urls) => updateForm("images", urls)}
                />
              </div>

              <div className="col-span-2 md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Condition Details
                </label>
                <textarea
                  value={form.conditionDescription}
                  onChange={(e) =>
                    updateForm("conditionDescription", e.target.value)
                  }
                  placeholder="Phone ki condition ke baare mein detail mein likho..."
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div className="col-span-2 md:col-span-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isNegotiable}
                    onChange={(e) =>
                      updateForm("isNegotiable", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600 font-medium">
                    Price Negotiable hai
                  </span>
                </label>
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
                className="flex-1 bg-purple-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {adding ? "Add ho raha hai..." : "Used Phone Add Karo ✓"}
              </button>
            </div>
          </div>
        )}

        {/* Listings Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : phones.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <div className="text-5xl mb-3">♻️</div>
              <p>Koi used phone listing nahi — pehli listing add karo!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Condition</th>
                    <th className="px-4 py-3 text-left">Battery</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {phones.map((phone) => (
                    <tr key={phone.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {phone.images?.[0] ? (
                              <img
                                src={phone.images[0]}
                                alt=""
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span>📱</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {phone.modelName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {phone.brand} • {phone.storage}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-orange-500">
                          {formatPrice(phone.askingPrice)}
                        </p>
                        {phone.isNegotiable && (
                          <p className="text-xs text-gray-400">Negotiable</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {getConditionLabel(phone.conditionGrade)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {phone.batteryHealth
                          ? `🔋 ${phone.batteryHealth}%`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            phone.isSold
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {phone.isSold ? "Sold" : "Available"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!phone.isSold && (
                          <button
                            onClick={() => markSold(phone.id)}
                            className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600"
                          >
                            Mark Sold
                          </button>
                        )}
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
