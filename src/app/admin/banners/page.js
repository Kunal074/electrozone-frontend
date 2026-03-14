"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { getBanners, createBanner, updateBanner, deleteBanner } from "@/lib/queries";
import useAuthStore from "@/store/authStore";
import ImageUpload from "@/components/ui/ImageUpload";

const emptyForm = {
  tag:      "",
  title:    "",
  subtitle: "",
  btnText:  "Shop Now",
  link:     "/products",
  image:    "",
  bgFrom:   "#1e3a8a",
  bgTo:     "#1d4ed8",
  order:    0,
  isActive: true,
};

const bgOptions = [
  { label: "Blue",   from: "#1e3a8a", to: "#1d4ed8" },
  { label: "Dark",   from: "#111827", to: "#374151" },
  { label: "Purple", from: "#4c1d95", to: "#6d28d9" },
  { label: "Green",  from: "#064e3b", to: "#065f46" },
  { label: "Red",    from: "#7f1d1d", to: "#b91c1c" },
  { label: "Orange", from: "#7c2d12", to: "#c2410c" },
  { label: "Pink",   from: "#831843", to: "#be185d" },
  { label: "Teal",   from: "#134e4a", to: "#0f766e" },
];

export default function BannersPage() {
  const router      = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

  const [showForm,   setShowForm]   = useState(false);
  const [editId,     setEditId]     = useState(null);
  const [form,       setForm]       = useState(emptyForm);
  const [error,      setError]      = useState("");
  const [imageArray, setImageArray] = useState([]);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "SUPER_ADMIN") {
      router.push("/admin/login");
    }
  }, [isLoggedIn, user]);

  const { data, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn:  getBanners,
  });

  const { mutate: addBanner, isLoading: adding } = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries(["banners"]);
      resetForm();
    },
    onError: (err) => setError(err.response?.data?.message || "Error aaya"),
  });

  const { mutate: editBanner, isLoading: editing } = useMutation({
    mutationFn: ({ id, data }) => updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["banners"]);
      resetForm();
    },
    onError: (err) => setError(err.response?.data?.message || "Error aaya"),
  });

  const { mutate: removeBanner } = useMutation({
    mutationFn: deleteBanner,
    onSuccess:  () => queryClient.invalidateQueries(["banners"]),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    setImageArray([]);
    setError("");
  };

  const handleEdit = (banner) => {
    setEditId(banner.id);
    setForm({
      tag:      banner.tag,
      title:    banner.title,
      subtitle: banner.subtitle,
      btnText:  banner.btnText,
      link:     banner.link,
      image:    banner.image || "",
      bgFrom:   banner.bgFrom,
      bgTo:     banner.bgTo,
      order:    banner.order,
      isActive: banner.isActive,
    });
    setImageArray(banner.image ? [banner.image] : []);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.tag || !form.title || !form.subtitle) {
      setError("Tag, Title aur Subtitle zaroori hain");
      return;
    }
    const payload = { ...form, image: imageArray[0] || "" };
    if (editId) {
      editBanner({ id: editId, data: payload });
    } else {
      addBanner(payload);
    }
  };

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const banners = data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🎯 Banner Management</h1>
            <p className="text-gray-400 text-sm mt-1">Homepage slider banners manage karo</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(!showForm); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700"
            >
              + Add Banner
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">
              {editId ? "Banner Edit Karo" : "Naya Banner Add Karo"}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Tag (e.g. "⚡ Today's Deal")
                </label>
                <input
                  type="text"
                  value={form.tag}
                  onChange={(e) => updateForm("tag", e.target.value)}
                  placeholder="⚡ Today's Deal"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={form.btnText}
                  onChange={(e) => updateForm("btnText", e.target.value)}
                  placeholder="Shop Now"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Title (new line ke liye \n use karo)
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="iPhone 16\n₹20,000 Off"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => updateForm("subtitle", e.target.value)}
                  placeholder="Limited stock • Only 5 left"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Link (kahan jaaye button click pe)
                </label>
                <input
                  type="text"
                  value={form.link}
                  onChange={(e) => updateForm("link", e.target.value)}
                  placeholder="/products?category=SMARTPHONE&brand=Apple"
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Background Color */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Background Color
                </label>
                <div className="flex gap-3 flex-wrap">
                  {bgOptions.map((bg) => (
                    <button
                      key={bg.label}
                      onClick={() => { updateForm("bgFrom", bg.from); updateForm("bgTo", bg.to); }}
                      style={{ background: `linear-gradient(to right, ${bg.from}, ${bg.to})` }}
                      className={`flex-1 py-3 rounded-xl text-white text-xs font-bold transition min-w-16 ${
                        form.bgFrom === bg.from ? "ring-2 ring-offset-2 ring-blue-500" : ""
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="flex gap-3 mt-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 mb-1">Custom From Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={form.bgFrom}
                        onChange={(e) => updateForm("bgFrom", e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border"
                      />
                      <input
                        type="text"
                        value={form.bgFrom}
                        onChange={(e) => updateForm("bgFrom", e.target.value)}
                        placeholder="#1e3a8a"
                        className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 mb-1">Custom To Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={form.bgTo}
                        onChange={(e) => updateForm("bgTo", e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border"
                      />
                      <input
                        type="text"
                        value={form.bgTo}
                        onChange={(e) => updateForm("bgTo", e.target.value)}
                        placeholder="#1d4ed8"
                        className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Order (0 = pehle)
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => updateForm("order", Number(e.target.value))}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer mt-4">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => updateForm("isActive", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600 font-medium">Active hai</span>
                </label>
              </div>

              {/* Image Upload */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Banner Image (optional)
                </label>
                <ImageUpload
                  images={imageArray}
                  onChange={(urls) => setImageArray(urls.slice(0, 1))}
                />
              </div>
            </div>

            {/* Preview */}
            {(form.title || form.tag) && (
              <div
                className="mt-4 rounded-xl p-6 text-white"
                style={{ background: `linear-gradient(to right, ${form.bgFrom}, ${form.bgTo})` }}
              >
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {form.tag || "Tag"}
                </span>
                <h3 className="text-2xl font-bold mt-3 whitespace-pre-line">
                  {form.title || "Title"}
                </h3>
                <p className="text-sm mt-2 opacity-80">{form.subtitle || "Subtitle"}</p>
                <button className="mt-4 bg-orange-500 px-6 py-2 rounded-lg text-sm font-bold">
                  {form.btnText || "Shop Now"} →
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={resetForm}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-2 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={adding || editing}
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {adding || editing ? "Save ho raha hai..." : editId ? "Update Karo ✓" : "Banner Add Karo ✓"}
              </button>
            </div>
          </div>
        )}

        {/* Banners List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-gray-100 rounded-xl h-32 animate-pulse" />
          ) : banners.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
              <div className="text-5xl mb-3">🎯</div>
              <p>Koi banner nahi — pehla banner add karo!</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="bg-white rounded-xl border overflow-hidden">
                <div
                  className="p-4 text-white flex items-center justify-between"
                  style={{ background: `linear-gradient(to right, ${banner.bgFrom}, ${banner.bgTo})` }}
                >
                  <div>
                    <span className="bg-orange-500 text-xs font-bold px-2 py-0.5 rounded-full">
                      {banner.tag}
                    </span>
                    <p className="font-bold mt-1 whitespace-pre-line">{banner.title}</p>
                    <p className="text-xs opacity-80">{banner.subtitle}</p>
                  </div>
                  {banner.image && (
                    <img src={banner.image} alt="" className="w-16 h-16 object-contain" />
                  )}
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>Order: {banner.order}</span>
                    <span className={`font-semibold ${banner.isActive ? "text-green-500" : "text-red-500"}`}>
                      {banner.isActive ? "✓ Active" : "✗ Inactive"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-lg hover:bg-blue-100"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => removeBanner(banner.id)}
                      className="bg-red-50 text-red-600 text-xs px-3 py-1 rounded-lg hover:bg-red-100"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}