"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import useAuthStore from "@/store/authStore";
import api from "@/lib/api";

export default function OwnerProfilePage() {
  const router      = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

  const [form,    setForm]    = useState(null);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "STORE_OWNER") {
      router.push("/auth/store-login");
    }
  }, [isLoggedIn, user]);

  const { data, isLoading } = useQuery({
    queryKey: ["owner-store"],
    queryFn:  async () => {
      const res = await api.get(`/stores/${user?.store?.id}`);
      return res.data;
    },
    enabled: !!user?.store?.id,
    onSuccess: (data) => {
      const store = data.data;
      setForm({
        storeName:     store.storeName     || "",
        phone:         store.phone         || "",
        whatsappNumber:store.whatsappNumber|| "",
        address:       store.address       || "",
        city:          store.city          || "",
        pincode:       store.pincode       || "",
        gstNumber:     store.gstNumber     || "",
        openTime:      store.openTime      || "10:00",
        closeTime:     store.closeTime     || "20:00",
        weeklyOff:     store.weeklyOff     || "",
        deliveryCharge:store.deliveryCharge|| 49,
        isCODAvailable:store.isCODAvailable|| true,
      });
    }
  });

  useEffect(() => {
    if (data?.data) {
      const store = data.data;
      setForm({
        storeName:      store.storeName      || "",
        phone:          store.phone          || "",
        whatsappNumber: store.whatsappNumber || "",
        address:        store.address        || "",
        city:           store.city           || "",
        pincode:        store.pincode        || "",
        gstNumber:      store.gstNumber      || "",
        openTime:       store.openTime       || "10:00",
        closeTime:      store.closeTime      || "20:00",
        weeklyOff:      store.weeklyOff      || "",
        deliveryCharge: store.deliveryCharge || 49,
        isCODAvailable: store.isCODAvailable || true,
      });
    }
  }, [data]);

  const { mutate: updateStore, isLoading: saving } = useMutation({
    mutationFn: async (data) => {
      const res = await api.put(`/stores/${user?.store?.id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["owner-store"]);
      setSuccess("Store profile update ho gaya! ✓");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => setError(err.response?.data?.message || "Update nahi hua"),
  });

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  if (isLoading || !form) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-gray-100 rounded-xl h-64 animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🏪 Store Profile</h1>
            <p className="text-gray-400 text-sm mt-1">Store ki details update karo</p>
          </div>
          <button
            onClick={() => router.push("/owner/dashboard")}
            className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50"
          >
            ← Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <div className="space-y-4">

          {/* Basic Info */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-bold text-gray-800 mb-4">📋 Basic Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Store Name *</label>
                <input
                  type="text"
                  value={form.storeName}
                  onChange={(e) => updateForm("storeName", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">WhatsApp Number *</label>
                <input
                  type="tel"
                  value={form.whatsappNumber}
                  onChange={(e) => updateForm("whatsappNumber", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* GST & Tax */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-bold text-gray-800 mb-4">🧾 GST & Tax Info</h2>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                GST Number (optional)
              </label>
              <input
                type="text"
                value={form.gstNumber}
                onChange={(e) => updateForm("gstNumber", e.target.value.toUpperCase())}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">
                15 character GST number — bills mein dikhega
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-bold text-gray-800 mb-4">📍 Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateForm("city", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Pincode *</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => updateForm("pincode", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Timings */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-bold text-gray-800 mb-4">🕐 Store Timings</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Open Time</label>
                <input
                  type="time"
                  value={form.openTime}
                  onChange={(e) => updateForm("openTime", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Close Time</label>
                <input
                  type="time"
                  value={form.closeTime}
                  onChange={(e) => updateForm("closeTime", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Weekly Off</label>
                <select
                  value={form.weeklyOff}
                  onChange={(e) => updateForm("weeklyOff", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">No Weekly Off</option>
                  {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Delivery Settings */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-bold text-gray-800 mb-4">🚚 Delivery Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Delivery Charge (₹)</label>
                <input
                  type="number"
                  value={form.deliveryCharge}
                  onChange={(e) => updateForm("deliveryCharge", e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center mt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isCODAvailable}
                    onChange={(e) => updateForm("isCODAvailable", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600 font-medium">COD Available</span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={() => updateStore(form)}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Save ho raha hai..." : "💾 Store Profile Save Karo"}
          </button>

        </div>
      </main>
    </div>
  );
}