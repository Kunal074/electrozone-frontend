"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { createOfflineSale, getStoreSales, deleteOfflineSale } from "@/lib/queries";
import useAuthStore from "@/store/authStore";

const GST_RATES = [0, 5, 12, 18, 28];
const PAYMENT_MODES = ["CASH", "UPI", "CARD", "CHEQUE", "OTHER"];

const emptyItem = { name: "", qty: 1, price: "", gst: 0 };

export default function BillingPage() {
  const router      = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();
  const printRef    = useRef();

  const [tab,       setTab]       = useState("new");   // new | history
  const [search,    setSearch]    = useState("");
  const [showBill,  setShowBill]  = useState(false);
  const [savedBill, setSavedBill] = useState(null);

  const [customer, setCustomer] = useState({
    name: "", phone: "", email: ""
  });

  const [items, setItems] = useState([{ ...emptyItem }]);
  const [discount,    setDiscount]    = useState(0);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [notes,       setNotes]       = useState("");
  const [error,       setError]       = useState("");

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "STORE_OWNER") {
      router.push("/auth/store-login");
    }
  }, [isLoggedIn, user]);

  // ── Calculations ──
  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (Number(item.qty) || 0);
  }, 0);

  const gstAmount = items.reduce((sum, item) => {
    const itemTotal = (Number(item.price) || 0) * (Number(item.qty) || 0);
    return sum + (itemTotal * (Number(item.gst) || 0)) / 100;
  }, 0);

  const totalAmount = subtotal + gstAmount - Number(discount || 0);

  // ── Queries ──
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["store-sales", search],
    queryFn:  () => getStoreSales({ search }),
    enabled:  tab === "history",
  });

  const { mutate: saveBill, isLoading: saving } = useMutation({
    mutationFn: createOfflineSale,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["store-sales"]);
      setSavedBill(res.data);
      setShowBill(true);
    },
    onError: (err) => setError(err.response?.data?.message || "Bill save nahi hua"),
  });

  const { mutate: removeSale } = useMutation({
    mutationFn: deleteOfflineSale,
    onSuccess:  () => queryClient.invalidateQueries(["store-sales"]),
  });

  // ── Item Handlers ──
  const addItem    = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, key, val) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  };

  const handleSave = () => {
    if (!customer.name || !customer.phone) {
      setError("Customer naam aur phone zaroori hai");
      return;
    }
    if (items.some(item => !item.name || !item.price)) {
      setError("Saare items ka naam aur price daalo");
      return;
    }
    setError("");
    saveBill({
      customerName:  customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      items,
      subtotal,
      discountAmount: Number(discount || 0),
      gstAmount,
      totalAmount,
      paymentMode,
      notes,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setCustomer({ name: "", phone: "", email: "" });
    setItems([{ ...emptyItem }]);
    setDiscount(0);
    setPaymentMode("CASH");
    setNotes("");
    setError("");
    setShowBill(false);
    setSavedBill(null);
  };

  const formatPrice = (p) => "₹" + Number(p).toLocaleString("en-IN");
  const formatDate  = (d) => new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });

  const sales = salesData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🧾 Billing</h1>
            <p className="text-gray-400 text-sm mt-1">Offline bills banao aur manage karo</p>
          </div>
          <button
            onClick={() => router.push("/owner/dashboard")}
            className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50"
          >
            ← Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "new",     label: "📄 New Bill" },
            { key: "history", label: "📋 Bill History" },
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

        {/* ── NEW BILL TAB ── */}
        {tab === "new" && !showBill && (
          <div className="space-y-4">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Customer Details */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-gray-800 mb-4">👤 Customer Details</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name *</label>
                  <input
                    type="text"
                    placeholder="Customer naam"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone *</label>
                  <input
                    type="tel"
                    placeholder="10 digit number"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email (optional)</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">📦 Items</h2>
                <button
                  onClick={addItem}
                  className="bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-lg hover:bg-blue-100 font-medium"
                >
                  + Add Item
                </button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase font-bold mb-2 px-2">
                <div className="col-span-4">Item Name</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Price (₹)</div>
                <div className="col-span-2">GST %</div>
                <div className="col-span-1">Total</div>
                <div className="col-span-1"></div>
              </div>

              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Product naam"
                      value={item.name}
                      onChange={(e) => updateItem(i, "name", e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(i, "qty", e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="0"
                      value={item.price}
                      onChange={(e) => updateItem(i, "price", e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={item.gst}
                      onChange={(e) => updateItem(i, "gst", e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                    >
                      {GST_RATES.map((r) => (
                        <option key={r} value={r}>{r}%</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 text-sm font-semibold text-gray-700">
                    {formatPrice((Number(item.price) || 0) * (Number(item.qty) || 0))}
                  </div>
                  <div className="col-span-1">
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(i)}
                        className="text-red-400 hover:text-red-600 text-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary + Payment */}
            <div className="grid grid-cols-2 gap-4">

              {/* Payment */}
              <div className="bg-white rounded-xl border p-5">
                <h2 className="font-bold text-gray-800 mb-4">💳 Payment</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Payment Mode</label>
                    <div className="flex flex-wrap gap-2">
                      {PAYMENT_MODES.map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setPaymentMode(mode)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                            paymentMode === mode
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Discount (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
                    <textarea
                      placeholder="Koi note..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-xl border p-5">
                <h2 className="font-bold text-gray-800 mb-4">📊 Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">GST</span>
                    <span>{formatPrice(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-green-600">-{formatPrice(discount || 0)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-orange-500">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Save ho raha hai..." : "💾 Bill Save Karo"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── BILL PREVIEW (After Save) ── */}
        {showBill && savedBill && (
          <div className="bg-white rounded-xl border p-6">

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6 print:hidden">
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-700"
              >
                🖨️ Print Bill
              </button>
              <button
                onClick={resetForm}
                className="border border-gray-200 text-gray-600 px-6 py-2 rounded-xl text-sm hover:bg-gray-50"
              >
                + Naya Bill
              </button>
            </div>

            {/* Printable Bill */}
            <div ref={printRef} className="max-w-2xl mx-auto" id="print-bill">

              {/* Store Header */}
              <div className="text-center border-b pb-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{user?.store?.storeName}</h2>
                <p className="text-gray-500 text-sm mt-1">Tax Invoice</p>
              </div>

              {/* Bill Info */}
              <div className="flex justify-between mb-4 text-sm">
                <div>
                  <p className="text-gray-500">Bill No</p>
                  <p className="font-bold text-gray-800">{savedBill.billNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">Date</p>
                  <p className="font-bold text-gray-800">{formatDate(savedBill.createdAt)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <p className="font-bold text-gray-700 mb-1">Bill To:</p>
                <p className="text-gray-800 font-semibold">{savedBill.customerName}</p>
                <p className="text-gray-600">{savedBill.customerPhone}</p>
                {savedBill.customerEmail && <p className="text-gray-600">{savedBill.customerEmail}</p>}
              </div>

              {/* Items Table */}
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="px-3 py-2 text-left rounded-tl-lg">#</th>
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Price</th>
                    <th className="px-3 py-2 text-center">GST</th>
                    <th className="px-3 py-2 text-right rounded-tr-lg">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {savedBill.items.map((item, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{item.name}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{item.qty}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{formatPrice(item.price)}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{item.gst}%</td>
                      <td className="px-3 py-2 text-right font-semibold">{formatPrice(Number(item.price) * Number(item.qty))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatPrice(savedBill.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">GST</span>
                    <span>{formatPrice(savedBill.gstAmount)}</span>
                  </div>
                  {savedBill.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(savedBill.discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-orange-500">{formatPrice(savedBill.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs pt-1">
                    <span>Payment</span>
                    <span className="font-semibold">{savedBill.paymentMode}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {savedBill.notes && (
                <div className="mt-4 bg-yellow-50 rounded-lg p-3 text-sm text-gray-600">
                  <span className="font-semibold">Note: </span>{savedBill.notes}
                </div>
              )}

              {/* Footer */}
              <div className="text-center mt-6 pt-4 border-t text-xs text-gray-400">
                <p>Thank you for your purchase! 🙏</p>
                <p className="mt-1">Powered by ElectroZone</p>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "history" && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name, phone, bill number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {salesLoading ? (
              <div className="bg-gray-100 rounded-xl h-32 animate-pulse" />
            ) : sales.length === 0 ? (
              <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
                <div className="text-5xl mb-3">🧾</div>
                <p>Koi bill nahi mila</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sales.map((sale) => (
                  <div key={sale.id} className="bg-white rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-bold text-gray-800">{sale.billNumber}</p>
                          <p className="text-xs text-gray-400">{formatDate(sale.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{sale.customerName}</p>
                          <p className="text-xs text-gray-400">{sale.customerPhone}</p>
                        </div>
                        <div className="bg-blue-50 px-2 py-1 rounded-lg">
                          <p className="text-xs text-blue-600 font-semibold">{sale.paymentMode}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-orange-500 text-lg">
                          ₹{Number(sale.totalAmount).toLocaleString("en-IN")}
                        </p>
                        <button
                          onClick={() => removeSale(sale.id)}
                          className="bg-red-50 text-red-500 text-xs px-3 py-1 rounded-lg hover:bg-red-100"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {sale.items?.slice(0, 3).map((item, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg">
                          {item.name} ×{item.qty}
                        </span>
                      ))}
                      {sale.items?.length > 3 && (
                        <span className="text-xs text-gray-400">+{sale.items.length - 3} more</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}