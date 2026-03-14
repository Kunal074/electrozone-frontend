"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getUsedPhones } from "@/lib/queries";
import { formatPrice, getConditionLabel, getConditionColor } from "@/lib/utils";
import Link from "next/link";

const conditionColors = {
  green:  "bg-green-100 text-green-700",
  blue:   "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  orange: "bg-orange-100 text-orange-700",
  red:    "bg-red-100 text-red-700",
  gray:   "bg-gray-100 text-gray-700",
};

const brands = ["Apple", "Samsung", "Vivo", "Oppo", "Realme", "OnePlus", "Xiaomi"];

export default function UsedPhonesPage() {
  const [filters, setFilters] = useState({
    brand:    "",
    minPrice: "",
    maxPrice: "",
    grade:    "",
    page:     1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["used-phones", filters],
    queryFn:  () => getUsedPhones(filters),
  });

  const phones     = data?.data       || [];
  const pagination = data?.pagination || {};

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">♻️ Used Phones</h1>
          <p className="text-gray-400 text-sm mt-1">
            Store verified • Best prices • {pagination.total || 0} listings
          </p>
        </div>

        <div className="flex gap-6">

          {/* Filters */}
          <div className="hidden md:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border p-4 sticky top-20">

              {/* Brand */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                  Brand
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => updateFilter("brand", "")}
                    className={`block w-full text-left px-2 py-1 rounded text-sm ${
                      !filters.brand ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    All Brands
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => updateFilter("brand", b)}
                      className={`block w-full text-left px-2 py-1 rounded text-sm ${
                        filters.brand === b ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                  Condition
                </label>
                <div className="space-y-1">
                  {["", "LIKE_NEW", "EXCELLENT", "GOOD", "FAIR"].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => updateFilter("grade", grade)}
                      className={`block w-full text-left px-2 py-1 rounded text-sm ${
                        filters.grade === grade ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {grade === "" ? "All Conditions" : getConditionLabel(grade)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                    placeholder="Min"
                    className="w-full border rounded px-2 py-1 text-sm outline-none"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                    placeholder="Max"
                    className="w-full border rounded px-2 py-1 text-sm outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => setFilters({ brand: "", minPrice: "", maxPrice: "", grade: "", page: 1 })}
                className="w-full text-sm text-red-500 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : phones.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-lg">Koi used phone nahi mila</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {phones.map((phone) => (
                    <Link key={phone.id} href={`/used-phones/${phone.id}`}>
                      <div className="bg-white rounded-xl border hover:shadow-lg transition cursor-pointer h-full">
                        {/* Image */}
                        <div className="h-44 bg-gray-100 rounded-t-xl flex items-center justify-center overflow-hidden">
                          {phone.images?.[0] ? (
                            <img
                              src={phone.images[0]}
                              alt={phone.modelName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-5xl">📱</span>
                          )}
                        </div>

                        <div className="p-3">
                          <p className="text-xs text-gray-400 font-semibold uppercase">
                            {phone.brand}
                          </p>
                          <p className="text-sm font-semibold text-gray-800 mt-1 line-clamp-2">
                            {phone.modelName}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              conditionColors[getConditionColor(phone.conditionGrade)]
                            }`}>
                              {getConditionLabel(phone.conditionGrade)}
                            </span>
                            {phone.isNegotiable && (
                              <span className="text-xs text-gray-400">Negotiable</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-base font-bold text-orange-500">
                              {formatPrice(phone.askingPrice)}
                            </span>
                            {phone.batteryHealth && (
                              <span className="text-xs text-gray-400">
                                🔋 {phone.batteryHealth}%
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {phone.store?.storeName}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFilters((prev) => ({ ...prev, page: i + 1 }))}
                        className={`w-9 h-9 rounded-lg text-sm font-medium ${
                          filters.page === i + 1
                            ? "bg-blue-600 text-white"
                            : "bg-white border text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}