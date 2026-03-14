"use client";

import { useRouter } from "next/navigation";

const categories = [
  { label: "Smartphones", value: "SMARTPHONE", emoji: "📱" },
  { label: "TVs",         value: "TV",         emoji: "📺" },
  { label: "ACs",         value: "AC",         emoji: "❄️" },
  { label: "Audio",       value: "AUDIO",      emoji: "🔊" },
  { label: "Headphones",  value: "HEADPHONES", emoji: "🎧" },
  { label: "Fridges",     value: "FRIDGE",     emoji: "🧊" },
  { label: "Coolers",     value: "COOLER",     emoji: "💨" },
  { label: "Accessories", value: "ACCESSORY",  emoji: "🔌" },
];

export default function CategorySection() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Shop by Category</h2>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => router.push(`/products?category=${cat.value}`)}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
          >
            <div className="text-3xl group-hover:scale-110 transition-transform">
              {cat.emoji}
            </div>
            <span className="text-xs font-medium text-gray-600 text-center">
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}