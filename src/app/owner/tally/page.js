"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import useAuthStore from "@/store/authStore";
import api from "@/lib/api";

export default function TallySetupPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "STORE_OWNER") {
      router.push("/auth/store-login");
    }
  }, [isLoggedIn, user]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tally-key"],
    queryFn:  async () => {
      const res = await api.get("/stores/my/tally-key");
      return res.data;
    },
    enabled: !!user?.store?.id,
  });

  const tallyKey  = data?.data?.tallyApiKey;
  const storeName = data?.data?.storeName;
  const serverUrl = "https://electrozone-backend.onrender.com/api/offline-sales/tally-sync";

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🔗 Tally Integration</h1>
            <p className="text-gray-400 text-sm mt-1">Tally se bills automatically sync karo</p>
          </div>
          <button
            onClick={() => router.push("/owner/dashboard")}
            className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50"
          >
            ← Dashboard
          </button>
        </div>

        {/* Status */}
        <div className={`rounded-xl border p-4 mb-6 ${tallyKey ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${tallyKey ? "bg-green-500" : "bg-yellow-500"}`} />
            <p className={`font-semibold text-sm ${tallyKey ? "text-green-700" : "text-yellow-700"}`}>
              {tallyKey ? "✅ Tally Integration Ready!" : "⚠️ API Key nahi mili — Admin se contact karo"}
            </p>
          </div>
        </div>

        {tallyKey && (
          <>
            {/* API Key */}
            <div className="bg-white rounded-xl border p-5 mb-4">
              <h2 className="font-bold text-gray-800 mb-4">🔑 Your API Key</h2>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-gray-100 px-4 py-3 rounded-xl text-sm font-mono text-gray-800 break-all">
                  {tallyKey}
                </code>
                <button
                  onClick={() => copy(tallyKey, "key")}
                  className="bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 whitespace-nowrap"
                >
                  {copied === "key" ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>
              <p className="text-xs text-red-500 mt-2">⚠️ Yeh key secret hai — kisi ko mat batao!</p>
            </div>

            {/* Server URL */}
            <div className="bg-white rounded-xl border p-5 mb-4">
              <h2 className="font-bold text-gray-800 mb-4">🌐 Server URL</h2>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-gray-100 px-4 py-3 rounded-xl text-sm font-mono text-gray-800 break-all">
                  {serverUrl}
                </code>
                <button
                  onClick={() => copy(serverUrl, "url")}
                  className="bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 whitespace-nowrap"
                >
                  {copied === "url" ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>
            </div>

            {/* Download Connector */}
            <div className="bg-white rounded-xl border p-5 mb-4">
              <h2 className="font-bold text-gray-800 mb-2">📥 Connector App Download</h2>
              <p className="text-sm text-gray-500 mb-4">
                Yeh app apne computer pe install karo — Tally se bills automatically upload honge!
              </p>

              {/* Config Preview */}
              <div className="bg-gray-900 rounded-xl p-4 mb-4 text-xs font-mono">
                <p className="text-green-400">// config.js — Connector Configuration</p>
                <p className="text-white mt-2">{"const config = {"}</p>
                <p className="text-yellow-300 ml-4">apiKey: <span className="text-green-300">"{tallyKey}"</span>,</p>
                <p className="text-yellow-300 ml-4">serverUrl: <span className="text-green-300">"{serverUrl}"</span>,</p>
                <p className="text-yellow-300 ml-4">tallyUrl: <span className="text-green-300">"http://localhost:9000"</span>,</p>
                <p className="text-yellow-300 ml-4">syncInterval: <span className="text-blue-300">30000</span>, <span className="text-gray-500">// 30 seconds</span></p>
                <p className="text-white">{"}"}</p>
              </div>

              <button
                onClick={() => {
                  const config = `// ElectroZone Tally Connector — config.js
const config = {
  apiKey:       "${tallyKey}",
  serverUrl:    "${serverUrl}",
  tallyUrl:     "http://localhost:9000",
  syncInterval: 30000,
  storeName:    "${storeName}",
};
module.exports = config;`;

                  const blob = new Blob([config], { type: "text/javascript" });
                  const url  = URL.createObjectURL(blob);
                  const a    = document.createElement("a");
                  a.href     = url;
                  a.download = "config.js";
                  a.click();
                }}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700"
              >
                📥 config.js Download Karo
              </button>
            </div>

            {/* Setup Instructions */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
              <h2 className="font-bold text-blue-800 mb-3">📋 Setup Instructions</h2>
              <div className="space-y-3 text-sm text-blue-700">
                <div className="flex gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <p>Tally Prime open karo → <strong>Help → Settings → Connectivity → TallyPrime Server → Enable</strong></p>
                </div>
                <div className="flex gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <p><strong>Node.js</strong> install karo — <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="underline">nodejs.org</a> se download karo</p>
                </div>
                <div className="flex gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <p>Admin se <strong>Connector App ZIP</strong> lo ya neeche wala button dabao</p>
                </div>
                <div className="flex gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                  <p><strong>config.js</strong> download karo (upar se) — connector folder mein rakho</p>
                </div>
                <div className="flex gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                  <p>Terminal mein: <code className="bg-blue-100 px-2 py-0.5 rounded">node connector.js</code> chalao</p>
                </div>
                <div className="flex gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">6</span>
                  <p>Ab Tally mein bill banao — <strong>30 seconds mein automatically upload!</strong></p>
                </div>
              </div>
            </div>
          </>
        )}

        {!tallyKey && !isLoading && (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
            <div className="text-5xl mb-3">🔑</div>
            <p className="font-semibold text-gray-600">API Key nahi mili</p>
            <p className="text-sm mt-2">Admin se Tally API Key generate karwao</p>
          </div>
        )}

      </main>
    </div>
  );
}