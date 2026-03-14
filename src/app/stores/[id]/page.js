"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getStoreById, getProducts } from "@/lib/queries";
import ProductCard from "@/components/product/ProductCard";
import { formatPrice } from "@/lib/utils";

export default function StoreDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: storeData, isLoading: storeLoading } = useQuery({
    queryKey: ["store", id],
    queryFn:  () => getStoreById(id),
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["store-products", id],
    queryFn:  () => getProducts({ storeId: id, limit: 12 }),
  });

  const store    = storeData?.data    || null;
  const products = productsData?.data || [];

  if (storeLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
          <div className="bg-gray-100 rounded-xl h-48 animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">😕</div>
            <p>Store nahi mila</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">

        {/* Store Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{store.storeName}</h1>
              <p className="text-blue-100 mt-1">📍 {store.address}, {store.city}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  ⭐ {store.rating || "New Store"}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  📦 {products.length} Products
                </span>
                {store.isApproved && (
                  <span className="bg-green-400/30 px-3 py-1 rounded-full text-sm">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">🕐 10AM - 8PM</p>
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="flex gap-3 mt-5">
            <a
              href={`https://wa.me/91${store.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center py-2 rounded-xl text-sm font-bold transition"
            >
              💬 WhatsApp
            </a>
            <a
              href={`tel:${store.phone}`}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white text-center py-2 rounded-xl text-sm font-bold transition"
            >
              📞 Call
            </a>
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Products ({products.length})
          </h2>

          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">📦</div>
              <p>Is store mein abhi koi product nahi hai</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
}