"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { getStoreOrders, updateOrderStatus } from "@/lib/queries";
import useAuthStore from "@/store/authStore";
import { formatPrice, formatDate, getOrderStatusLabel } from "@/lib/utils";

export default function OwnerDashboard() {
  const router     = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "STORE_OWNER") {
      router.push("/auth/store-login");
    }
  }, [isLoggedIn, user]);

  const { data, isLoading } = useQuery({
    queryKey: ["store-orders"],
    queryFn:  () => getStoreOrders({ limit: 20 }),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries(["store-orders"]),
  });

  const orders  = data?.data || [];
  const pending = orders.filter((o) => o.status === "PENDING");
  const today   = orders.filter((o) =>
    new Date(o.createdAt).toDateString() === new Date().toDateString()
  );
  const todayRevenue = today.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            👋 Welcome, {user?.name}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{user?.store?.storeName}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Today's Orders",   value: today.length,          emoji: "📦", color: "blue"   },
            { label: "Pending",          value: pending.length,        emoji: "⏳", color: "yellow" },
            { label: "Today's Revenue",  value: formatPrice(todayRevenue), emoji: "💰", color: "green"  },
            { label: "Total Orders",     value: orders.length,         emoji: "📊", color: "purple" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border p-4">
              <div className="text-2xl mb-2">{stat.emoji}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Manage Products",   link: "/owner/products",    emoji: "📦", color: "blue"   },
            { label: "Used Phones",        link: "/owner/used-phones", emoji: "♻️", color: "purple" },
            { label: "Store Profile",      link: `/stores/${user?.store?.id}`, emoji: "🏪", color: "green"  },
            { label: "Back to Site",       link: "/",                  emoji: "🏠", color: "gray"   },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.link)}
              className="bg-white rounded-xl border p-4 hover:shadow-md transition text-left"
            >
              <div className="text-2xl mb-2">{item.emoji}</div>
              <div className="text-sm font-semibold text-gray-700">{item.label}</div>
            </button>
          ))}
        </div>

        {/* Pending Orders Alert */}
        {pending.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-green-700">
                🔔 {pending.length} New Order{pending.length > 1 ? "s" : ""}!
              </p>
              <p className="text-sm text-green-600">Confirm karo jaldi</p>
            </div>
            <button
              onClick={() => document.getElementById("orders-section").scrollIntoView({ behavior: "smooth" })}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              View →
            </button>
          </div>
        )}

        {/* Orders Table */}
        <div id="orders-section" className="bg-white rounded-xl border overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Recent Orders</h2>
            <span className="text-sm text-gray-400">{orders.length} total</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <div className="text-5xl mb-3">📦</div>
              <p>Abhi koi orders nahi hain</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Order</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-sm">
                          #{order.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(order.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">
                          {order.guestName || order.customer?.name || "Customer"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.guestPhone || order.customer?.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-bold text-orange-500">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          order.fulfillmentType === "HOME_DELIVERY"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {order.fulfillmentType === "HOME_DELIVERY" ? "🏠 Delivery" : "🏪 Pickup"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus({ id: order.id, status: "CONFIRMED" })}
                              className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-600"
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => updateStatus({ id: order.id, status: "CANCELLED" })}
                              className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        {order.status === "CONFIRMED" && (
                          <button
                            onClick={() => updateStatus({ id: order.id, status: "PROCESSING" })}
                            className="bg-blue-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-600"
                          >
                            Pack Karo
                          </button>
                        )}
                        {order.status === "PROCESSING" && (
                          <button
                            onClick={() => updateStatus({ id: order.id, status: "OUT_FOR_DELIVERY" })}
                            className="bg-orange-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-orange-600"
                          >
                            Out for Delivery
                          </button>
                        )}
                        {order.status === "OUT_FOR_DELIVERY" && (
                          <button
                            onClick={() => updateStatus({ id: order.id, status: "DELIVERED" })}
                            className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-600"
                          >
                            Delivered ✓
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}   