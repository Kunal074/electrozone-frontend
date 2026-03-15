"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getMyOrders, getMyPurchases } from "@/lib/queries";
import { formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import useAuthStore from "@/store/authStore";

const statusColors = {
  green:  "bg-green-100 text-green-700",
  blue:   "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  orange: "bg-orange-100 text-orange-700",
  red:    "bg-red-100 text-red-700",
};

export default function MyOrdersPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [tab, setTab] = useState("online");

  useEffect(() => {
    if (!isLoggedIn) router.push("/auth/login");
  }, [isLoggedIn]);

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn:  () => getMyOrders({ limit: 20 }),
    enabled:  isLoggedIn,
  });

  const { data: purchasesData, isLoading: purchasesLoading } = useQuery({
    queryKey: ["my-purchases"],
    queryFn:  getMyPurchases,
    enabled:  isLoggedIn && tab === "offline",
  });

  const orders    = ordersData?.data    || [];
  const purchases = purchasesData?.data || [];

  const formatPurchaseDate = (d) => new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">

        <h1 className="text-2xl font-bold text-gray-800 mb-6">📦 My Orders & Purchases</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "online",  label: "🛒 Online Orders" },
            { key: "offline", label: "🏪 Store Purchases" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
                tab === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ONLINE ORDERS ── */}
        {tab === "online" && (
          <>
            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-lg font-semibold text-gray-600">Koi online order nahi hai</p>
                <p className="text-sm mt-2">Kuch products order karo!</p>
                <button
                  onClick={() => router.push("/products")}
                  className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700"
                >
                  Products Dekho →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const colorKey   = getOrderStatusColor(order.status);
                  const colorClass = statusColors[colorKey] || "bg-gray-100 text-gray-700";
                  return (
                    <div
                      key={order.id}
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="bg-white rounded-xl border hover:shadow-md transition cursor-pointer p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-800">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(order.createdAt)} • {order.store?.storeName}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${colorClass}`}>
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>

                      {/* Items Preview */}
                      <div className="flex gap-2 mb-3">
                        {order.items?.slice(0, 3).map((item) => {
                          const product = item.product || item.usedPhone;
                          return (
                            <div key={item.id} className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {product?.images?.[0] ? (
                                <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <span className="text-xl">📱</span>
                              )}
                            </div>
                          );
                        })}
                        {order.items?.length > 3 && (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 font-bold">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>
                            {order.fulfillmentType === "HOME_DELIVERY" ? "🏠 Delivery" : "🏪 Pickup"}
                          </span>
                          <span>•</span>
                          <span>{order.paymentMethod}</span>
                        </div>
                        <span className="font-bold text-orange-500">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── OFFLINE PURCHASES ── */}
        {tab === "offline" && (
          <>
            {purchasesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
                ))}
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-6xl mb-4">🏪</div>
                <p className="text-lg font-semibold text-gray-600">Koi store purchase nahi mila</p>
                <p className="text-sm mt-2">
                  Jab store owner aapka bill save karega — yahan dikhega!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="bg-white rounded-xl border p-4">

                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-800">{purchase.billNumber}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatPurchaseDate(purchase.createdAt)} • {purchase.store?.storeName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                          ✓ Purchased
                        </span>
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-lg">
                          {purchase.paymentMode}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {purchase.items?.map((item, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg">
                          {item.name} ×{item.qty}
                        </span>
                      ))}
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between border-t pt-3">
                      <div className="text-xs text-gray-400">
                        🏪 {purchase.store?.storeName} • {purchase.store?.city}
                      </div>
                      <div className="text-right">
                        {purchase.discountAmount > 0 && (
                          <p className="text-xs text-green-600">
                            Discount: -₹{Number(purchase.discountAmount).toLocaleString("en-IN")}
                          </p>
                        )}
                        {purchase.gstAmount > 0 && (
                          <p className="text-xs text-gray-400">
                            GST: ₹{Number(purchase.gstAmount).toLocaleString("en-IN")}
                          </p>
                        )}
                        <p className="font-bold text-orange-500 text-lg">
                          ₹{Number(purchase.totalAmount).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </main>
      <Footer />
    </div>
  );
}