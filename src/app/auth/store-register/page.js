"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function StoreRegisterPage() {
  const router = useRouter();

  const [step,    setStep]    = useState(1); // 1 = owner info, 2 = store info
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name:            "",
    email:           "",
    password:        "",
    confirmPassword: "",
    phone:           "",
    storeName:       "",
    storePhone:      "",
    whatsappNumber:  "",
    address:         "",
    city:            "",
    pincode:         "",
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (!form.name || !form.email || !form.password || !form.phone) {
      setError("Saari fields fill karo");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password match nahi kar raha");
      return;
    }
    if (form.password.length < 8) {
      setError("Password kam se kam 8 characters ka hona chahiye");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.storeName || !form.address || !form.city || !form.pincode) {
      setError("Saari store details fill karo");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/store/register", {
        name:           form.name,
        email:          form.email,
        password:       form.password,
        phone:          form.phone,
        storeName:      form.storeName,
        storePhone:     form.storePhone || form.phone,
        whatsappNumber: form.whatsappNumber || form.phone,
        address:        form.address,
        city:           form.city,
        pincode:        form.pincode,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Registration Ho Gaya!
          </h2>
          <p className="text-gray-400 mb-6">
            Super Admin aapki store approve karega — 24 ghante mein notification milega!
          </p>
          <button
            onClick={() => router.push("/auth/store-login")}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700"
          >
            Login Karo →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">
            Electro<span className="text-orange-500">Zone</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Store Register Karo</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? "bg-blue-500" : "bg-gray-200"}`} />
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? "bg-blue-500" : "bg-gray-200"}`} />
        </div>
        <p className="text-xs text-gray-400 text-center mb-6">
          Step {step} of 2 — {step === 1 ? "Owner Details" : "Store Details"}
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {step === 1 ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Ram Sharma"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  placeholder="ram@example.com"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9999999999"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => updateForm("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700"
            >
              Next → Store Details
            </button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={form.storeName}
                  onChange={(e) => updateForm("storeName", e.target.value)}
                  placeholder="Ram Electronics"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={form.whatsappNumber}
                  onChange={(e) => updateForm("whatsappNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9999999999 (default: owner phone)"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  placeholder="Shop No 12, Main Market"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    placeholder="Indore"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => updateForm("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="452001"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setStep(1); setError(""); }}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Register ho raha hai..." : "Register Karo 🎉"}
              </button>
            </div>
          </>
        )}

        <p className="text-center text-sm text-gray-400 mt-4">
          Already registered?{" "}
          <button
            onClick={() => router.push("/auth/store-login")}
            className="text-blue-600 font-medium hover:underline"
          >
            Login →
          </button>
        </p>
      </div>
    </div>
  );
}