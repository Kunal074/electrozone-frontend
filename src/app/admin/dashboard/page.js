"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { getAllStores, approveStore } from "@/lib/queries";
import useAuthStore from "@/store/authStore";
import { formatDate } from "@/lib/utils";
import api from "@/lib/api";

export default function AdminDashboard() {
  const router      = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "SUPER_ADMIN") {
      router.push("/auth/login");
    }
  }, [isLoggedIn, user]);

  const { data: allStores,     isLoading: loadingAll     } = useQuery({
    queryKey: ["all-stores"],
    queryFn:  () => getAllStores({}),
  });

  const { data: pendingStores, isLoading: loadingPending } = useQuery({
    queryKey: ["pending-stores"],
    queryFn:  () => getAllStores({ isApproved: "false" }),
  });

  const { mutate: handleApprove } = useMutation({
    mutationFn: ({ id, isApproved }) => approveStore(id, isApproved),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-stores"]);
      queryClient.invalidateQueries(["pending-stores"]);
    },
  });

  const handleGenerateTallyKey = async (storeId, storeName) => {
    try {
      const res = await api.post(`/stores/${storeId}/tally-key`);
      const key = res.data.data.tallyApiKey;
      alert(`✅ ${storeName} ka Tally API Key:\n\n${key}\n\nYeh key store owner ko do!`);
      queryClient.invalidateQueries(["all-stores"]);
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const stores  = allStores?.data     || [];
  const pending = pendingStores?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">⚙️ Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Platform ka poora control</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Stores",     value: stores.length,                                              emoji: "🏪" },
            { label: "Pending Approval", value: pending.length,                                             emoji: "⏳" },
            { label: "Active Stores",    value: stores.filter((s) => s.isApproved).length,                  emoji: "✅" },
            { label: "Free Plan",        value: stores.filter((s) => s.subscriptionPlan === "FREE").length, emoji: "🆓" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border p-4">
              <div className="text-2xl mb-2">{stat.emoji}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Banner Management", link: "/admin/banners",   emoji: "🎯" },
            { label: "All Stores",        link: "/admin/dashboard", emoji: "🏪" },
            { label: "Back to Site",      link: "/",                emoji: "🏠" },
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

        {/* Pending Approvals */}
        {pending.length > 0 && (
          <div className="bg-white rounded-xl border overflow-hidden mb-6">
            <div className="p-4 border-b bg-yellow-50 flex items-center gap-2">
              <span className="text-yellow-500 font-bold">⏳</span>
              <h2 className="font-bold text-gray-800">Pending Approvals ({pending.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Store Name</th>
                    <th className="px-4 py-3 text-left">Owner</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">City</th>
                    <th className="px-4 py-3 text-left">Registered</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pending.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-sm">{store.storeName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{store.owner?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{store.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{store.city}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(store.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove({ id: store.id, isApproved: true })}
                            className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-600"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleApprove({ id: store.id, isApproved: false })}
                            className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Stores */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold text-gray-800">All Stores ({stores.length})</h2>
          </div>
          {loadingAll ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Store</th>
                    <th className="px-4 py-3 text-left">Owner</th>
                    <th className="px-4 py-3 text-left">City</th>
                    <th className="px-4 py-3 text-left">Plan</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Tally</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-sm">{store.storeName}</p>
                        <p className="text-xs text-gray-400">{store.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {store.owner?.name}
                        <p className="text-xs text-gray-400">{store.owner?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{store.city}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          store.subscriptionPlan === "PREMIUM" ? "bg-purple-100 text-purple-700" :
                          store.subscriptionPlan === "BASIC"   ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {store.subscriptionPlan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          store.isApproved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {store.isApproved ? "✓ Active" : "✗ Pending"}
                        </span>
                      </td>

                      {/* Tally Key */}
                      <td className="px-4 py-3">
                        {store.tallyApiKey ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                            ✅ Active
                          </span>
                        ) : (
                          <button
                            onClick={() => handleGenerateTallyKey(store.id, store.storeName)}
                            className="bg-purple-50 text-purple-600 text-xs px-3 py-1 rounded-lg hover:bg-purple-100 font-medium"
                          >
                            🔑 Generate
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {store.isApproved ? (
                            <button
                              onClick={() => handleApprove({ id: store.id, isApproved: false })}
                              className="text-red-500 text-xs hover:underline"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApprove({ id: store.id, isApproved: true })}
                              className="text-green-500 text-xs hover:underline"
                            >
                              Approve
                            </button>
                          )}
                          {store.tallyApiKey && (
                            <button
                              onClick={() => handleGenerateTallyKey(store.id, store.storeName)}
                              className="text-purple-500 text-xs hover:underline"
                            >
                              Regenerate
                            </button>
                          )}
                        </div>
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