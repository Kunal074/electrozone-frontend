import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-white mb-3">
              Electro<span className="text-orange-500">Zone</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Local electronics store — best prices on phones, TVs, ACs and more!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div className="text-white font-semibold mb-3">Quick Links</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/used-phones" className="hover:text-white">Used Phones</Link></li>
              <li><Link href="/stores" className="hover:text-white">Our Stores</Link></li>
              <li><Link href="/orders" className="hover:text-white">Track Order</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <div className="text-white font-semibold mb-3">Categories</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products?category=SMARTPHONE" className="hover:text-white">Smartphones</Link></li>
              <li><Link href="/products?category=TV" className="hover:text-white">TVs</Link></li>
              <li><Link href="/products?category=AC" className="hover:text-white">ACs</Link></li>
              <li><Link href="/products?category=AUDIO" className="hover:text-white">Audio</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="text-white font-semibold mb-3">Contact</div>
            <ul className="space-y-2 text-sm">
              <li>📞 +91 99999 99999</li>
              <li>💬 WhatsApp Us</li>
              <li>📍 Main Market, Indore</li>
              <li>🕐 10AM – 8PM</li>
            </ul>
          </div>

        </div>

        {/* Hidden Admin Link */}
<div className="text-center mt-4">
  <a
    href="/admin/login"
    className="text-gray-600 text-xs hover:text-gray-400"
  >
    Admin
  </a>
  {" · "}
  <a
    href="/auth/store-login"
    className="text-gray-600 text-xs hover:text-gray-400"
  >
    Store Login
  </a>
</div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          © 2024 ElectroZone. All rights reserved.
        </div>
      </div>
    </footer>
  );
}