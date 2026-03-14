"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

export default function StoreLoginPage() {
  const router = useRouter();
  const { storeLogin } = useAuthStore();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email aur password daalo");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await storeLogin(email, password);
      router.push("/owner/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            Electro<span className="text-orange-500">Zone</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Store Owner Login</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ram@electrozone.com"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Login ho raha hai..." : "Login Karo →"}
        </button>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-400">
            Customer ho?{" "}
            <button
              onClick={() => router.push("/auth/login")}
              className="text-blue-600 font-medium hover:underline"
            >
              Customer Login →
            </button>
          </p>
          <p className="text-sm text-gray-400">
            New store register karna hai?{" "}
            <button
              onClick={() => router.push("/auth/store-register")}
              className="text-blue-600 font-medium hover:underline"
            >
              Register →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}