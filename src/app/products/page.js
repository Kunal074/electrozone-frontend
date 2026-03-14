"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/queries";

const brands = ["Apple", "Samsung", "Vivo", "Oppo", "Realme", "OnePlus", "Xiaomi"];
const sortOptions = [
  { label: "Newest First",   value: "createdAt"   },
  { label: "Price: Low-High", value: "price_asc"  },
  { label: "Price: High-Low", value: "price_desc" },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    search:    searchParams.get("search")   || "",
    category:  searchParams.get("category") || "",
    brand:     searchParams.get("brand")    || "",
    minPrice:  "",
    maxPrice:  "",
    inStock:   "",
    sort:      "createdAt",
    page:      1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", filters],
    queryFn:  () => getProducts(filters),
  });

  const products   = data?.data        || [];
  const pagination = data?.pagination  || {};

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            {filters.category || "All Products"}
            {pagination.total && (
              <span className="text-sm text-gray-400 font-normal ml-2">
                ({pagination.total} results)
              </span>
            )}
          </h1>
          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-6">

          {/* Filters Sidebar */}
          <div className="hidden md:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border p-4 sticky top-20">

              {/* Search */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  placeholder="Search products..."
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>

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

              {/* Price Range */}
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

              {/* In Stock */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock === "true"}
                    onChange={(e) => updateFilter("inStock", e.target.checked ? "true" : "")}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">In Stock Only</span>
                </label>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => setFilters({
                  search: "", category: "", brand: "",
                  minPrice: "", maxPrice: "", inStock: "",
                  sort: "createdAt", page: 1,
                })}
                className="w-full mt-4 text-sm text-red-500 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg">Koi product nahi mila</p>
                <p className="text-sm mt-1">Filters change karke try karo</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
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