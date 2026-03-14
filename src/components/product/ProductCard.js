"use client";

import Link from "next/link";
import { formatPrice, getDiscount } from "@/lib/utils";

export default function ProductCard({ product }) {
  const discount = getDiscount(product.price, product.mrp);

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-xl border hover:shadow-lg transition cursor-pointer group h-full">
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
          {product.modelType === "ONLINE" && (
            <span className="absolute top-2 right-2 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded">
              On Request
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
            {product.brand}
          </p>
          <p className="text-sm font-semibold text-gray-800 mt-1 line-clamp-2 leading-tight">
            {product.modelName}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base font-bold text-orange-500">
              {formatPrice(product.price)}
            </span>
            {product.mrp && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1 truncate">
            {product.store?.storeName}
          </p>
        </div>
      </div>
    </Link>
  );
}