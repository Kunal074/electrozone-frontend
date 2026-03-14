"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import useCartStore from "@/store/cartStore";
import useAuthStore from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/lib/queries";

export default function CartPage() {
  const router = useRouter();
  const { items, storeId, fulfillmentType, removeItem, updateQuantity, setFulfillmentType, clearCart, getSubtotal } = useCartStore();
  const { isLoggedIn, user } = useAuthStore();

  const [address, setAddress] = useState({
    name:     user?.name || "",
    phone:    user?.phone || "",
    street:   "",
    city:     "",
    pincode:  "",
    landmark: "",
  });

  const [guestInfo, setGuestInfo] = useState({ name: "", phone: "" });
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const subtotal      = getSubtotal();
  const deliveryCharge = fulfillmentType === "HOME_DELIVERY" ? 49 : 0;
  const total         = subtotal + deliveryCharge;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    if (fulfillmentType === "HOME_DELIVERY") {
      if (!address.street || !address.city || !address.pincode) {
        setError("Delivery address fill karo");
        return;
      }
    }

    if (!isLoggedIn && (!guestInfo.name || !guestInfo.phone)) {
      setError("Naam aur phone number daalo");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderData = {
        storeId,
        items: items.map((item) => ({
          productId: item.id,
          quantity:  item.quantity,
        })),
        fulfillmentType,
        paymentMethod: "COD",
        ...(fulfillmentType === "HOME_DELIVERY" && { deliveryAddress: address }),
        ...(!isLoggedIn && { guestName: guestInfo.name, guestPhone: guestInfo.phone }),
      };

      const res = await createOrder(orderData);
      clearCart();
      router.push(`/orders/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Order place karne mein error aaya");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-7xl mb-4">🛒</div>
            <p className="text-xl font-semibold text-gray-600">Cart khali hai!</p>
            <p className="text-sm mt-2">Kuch products add karo</p>
            <button
              onClick={() => router.push("/products")}
              className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700"
            >
              Products Dekho →
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🛒 My Cart ({items.length} items)
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">

          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">

            {/* Fulfillment Toggle */}
            <div className="bg-white rounded-xl border p-4">
              <p className="font-semibold text-gray-800 mb-3">Delivery Option</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "HOME_DELIVERY", label: "🏠 Home Delivery", sub: "₹49 charge" },
                  { value: "STORE_PICKUP",  label: "🏪 Store Pickup",  sub: "Free"       },
                ].map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setFulfillmentType(opt.value)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                      fulfillmentType === opt.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border p-4 flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.modelName} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-3xl">📱</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase font-semibold">{item.brand}</p>
                  <p className="font-semibold text-gray-800">{item.modelName}</p>
                  <p className="text-orange-500 font-bold mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-gray-50 font-bold"
                    >
                      −
                    </button>
                    <span className="font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-gray-50 font-bold"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-red-400 text-sm hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Guest Info */}
            {!isLoggedIn && (
              <div className="bg-white rounded-xl border p-4">
                <p className="font-semibold text-gray-800 mb-3">Your Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Apna naam"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                    className="border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    className="border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Delivery Address */}
            {fulfillmentType === "HOME_DELIVERY" && (
              <div className="bg-white rounded-xl border p-4">
                <p className="font-semibold text-gray-800 mb-3">📍 Delivery Address</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Street address"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="col-span-2 border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Landmark (optional)"
                    value={address.landmark}
                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                    className="col-span-2 border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl border p-5 sticky top-20">
              <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className={deliveryCharge === 0 ? "text-green-500 font-medium" : ""}>
                    {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-500">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 text-lg"
              >
                {loading ? "Place ho raha hai..." : "Place Order →"}
              </button>

              {!isLoggedIn && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  <button onClick={() => router.push("/auth/login")} className="text-blue-500 hover:underline">
                    Login karo
                  </button>
                  {" "}order history save karne ke liye
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}