"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import useAuthStore from "@/store/authStore";
import api from "@/lib/api";

const QUICK_TEMPLATES = [
  { title: "⚡ Flash Sale!", body: "Aaj sirf {X}% off — Limited time only! Abhi order karo." },
  { title: "📱 Naya Stock Aaya!", body: "{Product} aa gaya store mein — Limited stock hai!" },
  { title: "🎉 Special Offer!", body: "{Product} par {X}% discount — Sirf aaj ke liye!" },
  { title: "🔔 Reminder", body: "Aapka pasandida product abhi bhi available hai — Order karo!" },
  { title: "🏪 Store Update", body: "Aaj hum {time} tak open hain — Aao aur best deals lo!" },
];

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

  const [title,    setTitle]    = useState("");
  const [body,     setBody]     = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [preview,  setPreview]  = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "STORE_OWNER") {
      router.push("/auth/store-login");
    }
  }, [isLoggedIn, user]);

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["notification-history"],
    queryFn:  async () => {
      const res = await api.get("/notifications/history");
      return res.data;
    },
    enabled: !!user?.store?.id,
  });

  const { mutate: sendNotif, isLoading: sending } = useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/notifications/send", data);
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["notification-history"]);
      setSuccess(`✅ Notification ${res.data.totalSent} devices pe bhej di!`);
      setTitle(""); setBody(""); setImageUrl(""); setPreview(false);
      setTimeout(() => setSuccess(""), 4000);
    },
    onError: (err) => setError(err.response?.data?.message || "Notification nahi gayi"),
  });

  const handleSend = () => {
    if (!title || !body) { setError("Title aur message zaroori hai"); return; }
    setError("");
    sendNotif({ title, body, imageUrl: imageUrl || undefined });
  };

  const history = historyData?.data || [];

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🔔 Push Notifications</h1>
            <p className="text-gray-400 text-sm mt-1">Customers ke phone pe directly notification bhejo</p>
          </div>
          <button
            onClick={() => router.push("/owner/dashboard")}
            className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50"
          >
            ← Dashboard
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 font-medium">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          {/* Compose */}
          <div className="space-y-4">

            {/* Quick Templates */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-gray-800 mb-3">⚡ Quick Templates</h2>
              <div className="space-y-2">
                {QUICK_TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => { setTitle(t.title); setBody(t.body); }}
                    className="w-full text-left px-3 py-2 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition text-sm"
                  >
                    <p className="font-semibold text-gray-800">{t.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5 truncate">{t.body}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Compose Form */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-gray-800 mb-4">✏️ Notification Likho</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Title *</label>
                  <input
                    type="text"
                    placeholder="⚡ Flash Sale!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={50}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/50</p>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Message *</label>
                  <textarea
                    placeholder="Customers ko kya batana chahte ho?"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={150}
                    rows={3}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/150</p>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Image URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://... (product image)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPreview(!preview)}
                    className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50"
                  >
                    {preview ? "✕ Preview Band" : "👁️ Preview"}
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending || !title || !body}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {sending ? "Bhej raha hai..." : "📤 Send Karo"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-4">

            {/* Preview */}
            {preview && (title || body) && (
              <div className="bg-white rounded-xl border p-5">
                <h2 className="font-bold text-gray-800 mb-3">👁️ Preview</h2>
                <div className="bg-gray-900 rounded-2xl p-4">
                  {/* Phone notification style */}
                  <div className="bg-white rounded-xl p-3 shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0">
                        ⚡
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-gray-800 text-sm">ElectroZone</p>
                          <p className="text-xs text-gray-400">now</p>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{title || "Title"}</p>
                        <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">{body || "Message"}</p>
                      </div>
                    </div>
                    {imageUrl && (
                      <img src={imageUrl} alt="" className="w-full h-32 object-cover rounded-lg mt-3" />
                    )}
                  </div>
                  <p className="text-gray-500 text-xs text-center mt-3">📱 Aisa dikhega phone pe</p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-gray-800 mb-3">📊 Stats</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{history.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Sent</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {history.reduce((sum, n) => sum + (n.totalSent || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total Devices</p>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-gray-800 mb-3">📋 History</h2>
              {historyLoading ? (
                <div className="bg-gray-100 rounded-xl h-20 animate-pulse" />
              ) : history.length === 0 ? (
                <div className="text-center text-gray-400 py-6">
                  <p className="text-3xl mb-2">🔔</p>
                  <p className="text-sm">Abhi tak koi notification nahi bheji</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((notif, i) => (
                    <div key={i} className="border rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-800 text-sm">{notif.title}</p>
                        <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                          {notif.totalSent} devices
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{notif.body}</p>
                      <p className="text-gray-400 text-xs mt-2">{formatDate(notif.sentAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}