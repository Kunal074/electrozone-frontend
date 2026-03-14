"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, User, Menu, X } from "lucide-react";
import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuthStore();
  const totalItems = useCartStore((state) => state.getTotalItems());

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${searchQuery}`);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-blue-600">
              Electro<span className="text-orange-500">Zone</span>
            </span>
          </Link>

          {/* Categories - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Phones", value: "SMARTPHONE" },
              { label: "TVs", value: "TV" },
              { label: "ACs", value: "AC" },
              { label: "Used Phones", value: null },
            ].map((cat) => (
              <button
                key={cat.label}
                onClick={() =>
                  cat.value
                    ? router.push(`/products?category=${cat.value}`)
                    : router.push("/used-phones")
                }
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-xl hidden md:flex"
          >
            <div className="flex w-full border-2 border-blue-600 rounded-lg overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phones, TVs, ACs..."
                className="flex-1 px-4 py-2 outline-none text-sm"
              />
              <button
                type="submit"
                className="bg-blue-600 px-4 text-white hover:bg-blue-700"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link href="/cart" className="relative p-2">
              <ShoppingCart size={24} className="text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2">
                  <User size={24} className="text-gray-700" />
                  <span className="text-sm font-medium hidden md:block text-gray-700">
                    {user?.name || "Account"}
                  </span>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full bg-white shadow-lg rounded-lg w-48 py-2 hidden group-hover:block border">
                  {user?.role === "STORE_OWNER" && (
                    <Link
                      href="/owner/dashboard"
                      className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                    >
                      Store Dashboard
                    </Link>
                  )}
                  {user?.role === "SUPER_ADMIN" && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu */}
            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="flex border-2 border-blue-600 rounded-lg overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phones, TVs, ACs..."
              className="flex-1 px-4 py-2 outline-none text-sm"
            />
            <button type="submit" className="bg-blue-600 px-4 text-white">
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t py-3 space-y-2">
            <Link
              href="/products"
              className="block px-4 py-2 text-sm hover:bg-gray-50"
            >
              All Products
            </Link>
            <Link
              href="/products?category=SMARTPHONE"
              className="block px-4 py-2 text-sm hover:bg-gray-50"
            >
              📱 Smartphones
            </Link>
            <Link
              href="/products?category=TV"
              className="block px-4 py-2 text-sm hover:bg-gray-50"
            >
              📺 TVs
            </Link>
            <Link
              href="/products?category=AC"
              className="block px-4 py-2 text-sm hover:bg-gray-50"
            >
              ❄️ ACs
            </Link>
            <Link
              href="/used-phones"
              className="block px-4 py-2 text-sm hover:bg-gray-50"
            >
             ♻️ Used Phones
            </Link>
            <Link
              href="/orders"
              className="block px-4 py-2 text-sm hover:bg-gray-50"
            >
             📦 My Orders
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
