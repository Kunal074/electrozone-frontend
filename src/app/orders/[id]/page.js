"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getOrderById } from "@/lib/queries";
import { formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";

const statusSteps = [
  { key: "PENDING",          label: "Order Placed",    emoji: "📋" },
  { key: "CONFIRMED",        label: "Order Confirmed", emoji: "✅" },
  { key: "PROCESSING",       label: "Packed & Ready",  emoji: "📦" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery",emoji: "🚴" },
  { key: "DELIVERED",        label: "Delivered",       emoji: "🎉" },
];

const statusColors = {
  green:  "bg-green-100 text-green-700",
  blue:   "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  orange: "bg-orange-100 text-orange-700",
  red:    "bg-red-100 text-red-700",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn:  () => getOrderById(id),
    refetchInterval: 30000,
  });

  const order = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">😕</div>
            <p>Order nahi mila</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const colorKey = getOrderStatusColor(order.status);
  const colorClass = statusColors[colorKey] || "bg-gray-100 text-gray-700";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
            ← Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${colorClass}`}>
            {getOrderStatusLabel(order.status)}
          </span>
        </div>

        <div className="bg-white rounded-xl border p-4 mb-4">
          <h2 className="font-bold text-gray-800 mb-3">Items</h2>
          {order.items?.map((item) => {
            const product = item.product || item.usedPhone;
            return (
              <div key={item.id} className="flex gap-3 py-3 border-b last:border-0">
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {product?.images?.[0] ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-2xl">📱</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase">{product?.brand}</p>
                  <p className="text-sm font-semibold text-gray-800">{product?.modelName}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-orange-500">
                  {formatPrice(item.priceAtTime * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>

        {order.status !== "CANCELLED" && (
          <div className="bg-white rounded-xl border p-4 mb-4">
            <h2 className="font-bold text-gray-800 mb-4">Order Tracking</h2>
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const isDone    = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;
                return (
                  <div key={step.key} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isDone    ? "bg-green-500 text-white"
                        : isCurrent ? "bg-blue-500 text-white ring-4 ring-blue-100"
                        : "bg-gray-100 text-gray-400"
                      }`}>
                        {isDone ? "✓" : step.emoji}
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${isDone ? "bg-green-500" : "bg-gray-200"}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className={`text-sm font-semibold ${
                        isCurrent ? "text-blue-600"
                        : isDone  ? "text-gray-800"
                        : "text-gray-400"
                      }`}>
                        {step.label}
                      </p>
                      {isCurrent && <p className="text-xs text-blue-400 mt-0.5">In progress...</p>}
                      {isPending && <p className="text-xs text-gray-300 mt-0.5">Pending</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border p-4 mb-4">
          <h2 className="font-bold text-gray-800 mb-3">Price Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span>{order.deliveryCharge > 0 ? formatPrice(order.deliveryCharge) : "FREE"}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span className="text-orange-500">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h2 className="font-bold text-gray-800 mb-3">🏪 Store Contact</h2>
          <p className="text-gray-600 font-medium">{order.store?.storeName}</p>
          <div className="flex gap-3 mt-3">
            <a
              href={`https://wa.me/91${order.store?.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-green-500 text-white text-center py-2 rounded-xl text-sm font-medium hover:bg-green-600"
            >
              💬 WhatsApp
            </a>
            <a
              href={`tel:${order.store?.phone}`}
              className="flex-1 bg-blue-500 text-white text-center py-2 rounded-xl text-sm font-medium hover:bg-blue-600"
            >
              📞 Call
            </a>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}