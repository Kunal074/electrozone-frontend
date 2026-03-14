"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getProducts } from "@/lib/queries";
import { formatPrice, getDiscount } from "@/lib/utils";

function ProductCard({ product }) {
  const discount = getDiscount(product.price, product.mrp);

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-xl border hover:shadow-lg transition cursor-pointer group">
        {/* Image */}
        <div className="h-48 bg-gray-100 rounded-t-xl flex items-center justify-center relative overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.modelName}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <span className="text-6xl">📱</span>
          )}
          {discount && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {product.modelType === "OFFLINE" && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              In Stock
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-gray-400 font-semibold uppercase">
            {product.brand}
          </p>
          <p className="text-sm font-semibold text-gray-800 mt-1 line-clamp-2">
            {product.modelName}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-orange-500">
              {formatPrice(product.price)}
            </span>
            {product.mrp && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {product.store?.storeName}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn:  () => getProducts({ isFeatured: "true", limit: 8 }),
  });

  const { data: newProducts, isLoading: newLoading } = useQuery({
    queryKey: ["new-products"],
    queryFn:  () => getProducts({ limit: 8, sort: "createdAt" }),
  });

  if (isLoading && newLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const featured = data?.data || [];
  const newest   = newProducts?.data || [];
  const products = featured.length > 0 ? featured : newest;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {featured.length > 0 ? "🔥 Hot Deals" : "🆕 Latest Products"}
        </h2>
        <Link href="/products" className="text-blue-600 text-sm font-medium hover:underline">
          See all →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">📦</div>
          <p>Abhi koi products nahi hain</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}