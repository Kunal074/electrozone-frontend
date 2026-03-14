"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getProductById } from "@/lib/queries";
import { formatPrice, getDiscount } from "@/lib/utils";
import useCartStore from "@/store/cartStore";
import useAuthStore from "@/store/authStore";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();

  const [selectedImage,      setSelectedImage]      = useState(0);
  const [fulfillmentType,    setFulfillmentType]    = useState("HOME_DELIVERY");
  const [addedToCart,        setAddedToCart]        = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn:  () => getProductById(id),
  });

  const product = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-100 rounded-xl h-96 animate-pulse" />
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">😕</div>
            <p>Product nahi mila</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = getDiscount(product.price, product.mrp);

  const handleAddToCart = () => {
    if (product.modelType === "ONLINE") {
      // WhatsApp pe redirect
      const msg = `Hi! I'm interested in ${product.modelName} priced at ${formatPrice(product.price)}`;
      window.open(`https://wa.me/91${product.store.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
      return;
    }
    if (fulfillmentType === "WHATSAPP") {
      const msg = `Hi! I want to order ${product.modelName} - ${formatPrice(product.price)}`;
      window.open(`https://wa.me/91${product.store.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
      return;
    }
    addItem({ ...product, fulfillmentType }, product.storeId);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-6">
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => router.push("/")}>Home</span>
          {" → "}
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => router.push("/products")}>Products</span>
          {" → "}
          <span className="text-gray-600">{product.modelName}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Images */}
          <div>
            <div className="bg-gray-100 rounded-xl h-80 flex items-center justify-center mb-3 overflow-hidden">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.modelName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-8xl">📱</span>
              )}
            </div>
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
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
            <p className="text-sm text-gray-400 font-semibold uppercase tracking-wide">
              {product.brand}
            </p>
            <h1 className="text-2xl font-bold text-gray-800 mt-1 mb-3">
              {product.modelName}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-orange-500">
                {formatPrice(product.price)}
              </span>
              {product.mrp && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.mrp)}
                </span>
              )}
              {discount && (
                <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-1 rounded">
                  {discount}% off
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              {product.modelType === "OFFLINE" ? (
                product.stock > 0 ? (
                  <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                    ✓ In Stock ({product.stock} left)
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">
                    ✗ Out of Stock
                  </span>
                )
              ) : (
                <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full">
                  📦 Order on Request
                </span>
              )}
            </div>

            {/* Fulfillment Options */}
            {product.modelType === "OFFLINE" && product.stock > 0 && (
              <div className="mb-5">
                <p className="text-sm font-bold text-gray-700 mb-2">
                  Kaise lena chahoge?
                </p>
                <div className="space-y-2">
                  {[
                    { value: "HOME_DELIVERY", label: "🏠 Home Delivery", sub: `Same day • ₹${product.store?.deliveryCharge} charge` },
                    { value: "STORE_PICKUP",  label: "🏪 Store Pickup",  sub: "Free • Today 10AM-8PM"   },
                    { value: "WHATSAPP",      label: "💬 WhatsApp First", sub: "Chat before ordering"   },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => setFulfillmentType(opt.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                        fulfillmentType === opt.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                        <p className="text-xs text-gray-400">{opt.sub}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        fulfillmentType === opt.value
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.modelType === "OFFLINE" && product.stock === 0}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg transition ${
                addedToCart
                  ? "bg-green-500"
                  : product.modelType === "ONLINE"
                  ? "bg-green-500 hover:bg-green-600"
                  : product.stock === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {addedToCart
                ? "✓ Added to Cart!"
                : product.modelType === "ONLINE"
                ? "💬 WhatsApp to Order"
                : product.stock === 0
                ? "Out of Stock"
                : fulfillmentType === "WHATSAPP"
                ? "💬 Chat on WhatsApp"
                : "Add to Cart →"}
            </button>

            {/* Store Info */}
            <div
              onClick={() => router.push(`/stores/${product.storeId}`)}
              className="mt-4 p-4 bg-gray-50 rounded-xl border cursor-pointer hover:border-blue-300 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    🏪 {product.store?.storeName}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ⭐ {product.store?.rating || "New"} • {product.store?.city}
                  </p>
                </div>
                <span className="text-blue-500 text-sm">View Store →</span>
              </div>
            </div>

            {/* Specs */}
            {product.specs && (
              <div className="mt-5">
                <h3 className="font-bold text-gray-800 mb-3">Specifications</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b last:border-0">
                      <span className="text-sm text-gray-500 capitalize">{key}</span>
                      <span className="text-sm font-medium text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}