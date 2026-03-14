"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getUsedPhoneById } from "@/lib/queries";
import { formatPrice, getConditionLabel, getConditionColor } from "@/lib/utils";
import { useState } from "react";

const conditionColors = {
  green:  "bg-green-100 text-green-700",
  blue:   "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  orange: "bg-orange-100 text-orange-700",
  red:    "bg-red-100 text-red-700",
  gray:   "bg-gray-100 text-gray-700",
};

export default function UsedPhoneDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["used-phone", id],
    queryFn:  () => getUsedPhoneById(id),
  });

  const phone = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-100 rounded-xl h-80 animate-pulse" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded h-8 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!phone) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">😕</div>
            <p>Phone nahi mila</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const colorKey   = getConditionColor(phone.conditionGrade);
  const colorClass = conditionColors[colorKey] || "bg-gray-100 text-gray-700";

  const handleWhatsApp = () => {
    const msg = `Hi! I'm interested in your ${phone.brand} ${phone.modelName} listed for ${formatPrice(phone.askingPrice)}`;
    window.open(`https://wa.me/91${phone.store?.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-6">
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => router.push("/")}>Home</span>
          {" → "}
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => router.push("/used-phones")}>Used Phones</span>
          {" → "}
          <span className="text-gray-600">{phone.modelName}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Images */}
          <div>
            <div className="bg-gray-100 rounded-xl h-80 flex items-center justify-center overflow-hidden mb-3">
              {phone.images?.[selectedImage] ? (
                <img
                  src={phone.images[selectedImage]}
                  alt={phone.modelName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-8xl">📱</span>
              )}
            </div>
            {phone.images?.length > 1 && (
              <div className="flex gap-2">
                {phone.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      selectedImage === i ? "border-blue-500" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-gray-400 font-semibold uppercase">{phone.brand}</p>
            <h1 className="text-2xl font-bold text-gray-800 mt-1 mb-3">{phone.modelName}</h1>

            {/* Condition */}
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${colorClass}`}>
              {getConditionLabel(phone.conditionGrade)}
            </span>

            {/* Price */}
            <div className="flex items-center gap-3 mt-4 mb-2">
              <span className="text-3xl font-bold text-orange-500">
                {formatPrice(phone.askingPrice)}
              </span>
              {phone.isNegotiable && (
                <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-2 py-1 rounded-full">
                  Negotiable
                </span>
              )}
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-3 my-4">
              {phone.storage && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Storage</p>
                  <p className="font-bold text-gray-800">{phone.storage}</p>
                </div>
              )}
              {phone.ram && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">RAM</p>
                  <p className="font-bold text-gray-800">{phone.ram}</p>
                </div>
              )}
              {phone.batteryHealth && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Battery</p>
                  <p className="font-bold text-gray-800">🔋 {phone.batteryHealth}%</p>
                </div>
              )}
              {phone.warrantyLeft && (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Warranty</p>
                  <p className="font-bold text-gray-800">{phone.warrantyLeft}</p>
                </div>
              )}
            </div>

            {/* Condition Description */}
            {phone.conditionDescription && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                <p className="text-xs font-bold text-yellow-700 mb-1">Condition Details</p>
                <p className="text-sm text-gray-600">{phone.conditionDescription}</p>
              </div>
            )}

            {/* Accessories */}
            {phone.accessories?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-700 mb-2">Box Items</p>
                <div className="flex flex-wrap gap-2">
                  {phone.accessories.map((acc) => (
                    <span key={acc} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      ✓ {acc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition text-lg"
            >
              💬 WhatsApp Karo
            </button>

            {/* Store Info */}
            <div
              onClick={() => router.push(`/stores/${phone.storeId}`)}
              className="mt-4 p-4 bg-gray-50 rounded-xl border cursor-pointer hover:border-blue-300 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">🏪 {phone.store?.storeName}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    ⭐ {phone.store?.rating || "New"} • {phone.store?.city}
                  </p>
                </div>
                <span className="text-blue-500 text-sm">View Store →</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}