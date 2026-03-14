"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getUsedPhones } from "@/lib/queries";
import { formatPrice, getConditionLabel, getConditionColor } from "@/lib/utils";

const conditionColors = {
  green:  "bg-green-100 text-green-700",
  blue:   "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  orange: "bg-orange-100 text-orange-700",
  red:    "bg-red-100 text-red-700",
  gray:   "bg-gray-100 text-gray-700",
};

export default function UsedPhonesBanner() {
  const { data, isLoading } = useQuery({
    queryKey: ["used-phones-home"],
    queryFn:  () => getUsedPhones({ limit: 4 }),
  });

  const usedPhones = data?.data || [];

  return (
    <div className="bg-purple-50 py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">♻️ Used Phones</h2>
            <p className="text-sm text-gray-500 mt-1">
              Store verified • Best prices • Warranty available
            </p>
          </div>
          <Link
            href="/used-phones"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
          >
            Browse All →
          </Link>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : usedPhones.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-5xl mb-3">♻️</div>
            <p>Abhi koi used phones nahi hain</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {usedPhones.map((phone) => (
              <Link key={phone.id} href={`/used-phones/${phone.id}`}>
                <div className="bg-white rounded-xl border hover:shadow-lg transition cursor-pointer p-4">
                  {/* Image */}
                  <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    {phone.images?.[0] ? (
                      <img
                        src={phone.images[0]}
                        alt={phone.modelName}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-4xl">📱</span>
                    )}
                  </div>

                  {/* Info */}
                  <p className="text-xs text-gray-400 font-semibold uppercase">
                    {phone.brand}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-1 line-clamp-1">
                    {phone.modelName}
                  </p>

                  {/* Condition */}
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-2 inline-block ${
                    conditionColors[getConditionColor(phone.conditionGrade)]
                  }`}>
                    {getConditionLabel(phone.conditionGrade)}
                  </span>

                  {/* Price */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-bold text-orange-500">
                      {formatPrice(phone.askingPrice)}
                    </span>
                    {phone.isNegotiable && (
                      <span className="text-xs text-gray-400">Negotiable</span>
                    )}
                  </div>

                  {/* Store */}
                  <p className="text-xs text-gray-400 mt-1">
                    {phone.store?.storeName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}