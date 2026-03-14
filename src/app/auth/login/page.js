"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { isValidPhone } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { sendOTP, verifyOTP } = useAuthStore();

  const [step,    setStep]    = useState("phone"); // phone | otp
  const [phone,   setPhone]   = useState("");
  const [otp,     setOtp]     = useState("");
  const [name,    setName]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSendOTP = async () => {
    if (!isValidPhone(phone)) {
      setError("Valid 10 digit phone number daalo");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendOTP(phone);
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "OTP bhejne mein error aaya");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("6 digit OTP daalo");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyOTP(phone, otp, name);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Galat OTP hai");
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
          <p className="text-gray-400 mt-2 text-sm">
            {step === "phone" ? "Phone number se login karo" : `OTP bheja gaya: +91 ${phone}`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500">
                <span className="bg-gray-50 px-4 py-3 text-gray-500 font-medium border-r">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9999999999"
                  className="flex-1 px-4 py-3 outline-none text-gray-800"
                  maxLength={10}
                />
              </div>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Bhej raha hai..." : "OTP Bhejo →"}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">Store owner ho?</p>
              <button
                onClick={() => router.push("/auth/store-login")}
                className="text-blue-600 text-sm font-medium hover:underline mt-1"
              >
                Store Owner Login →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apna Naam (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ram Sharma"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6 Digit OTP
              </label>
              <input
                type="tel"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-center text-2xl tracking-widest font-bold"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Verify ho raha hai..." : "Login Karo →"}
            </button>

            <button
              onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
              className="w-full mt-3 text-gray-400 text-sm hover:text-gray-600"
            >
              ← Phone number change karo
            </button>
          </>
        )}
      </div>
    </div>
  );
}