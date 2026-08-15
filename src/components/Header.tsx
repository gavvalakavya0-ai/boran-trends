import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  MoreVertical,
  X,
  ShieldCheck,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { ProductCategory, CustomerUser } from '../types';

interface HeaderProps {
  categories: ProductCategory[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  customer: CustomerUser | null;
  onOpenCustomerAuth: () => void;
  onOpenCustomerProfile: () => void;
  onOpenAdminLogin: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminDashboard: () => void;
  onAdminLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  searchQuery,
  onSearchChange,
  customer,
  onOpenCustomerAuth,
  onOpenCustomerProfile,
  onOpenAdminLogin,
  isAdminLoggedIn,
  onOpenAdminDashboard,
  onAdminLogout,
}) => {
  const [threeDotOpen, setThreeDotOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950 text-zinc-100 border-b border-zinc-800 shadow-xl">
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectCategory('All')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/20 border border-blue-400">
              BT
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-sans">
                BORAN TRENDS
              </span>
              <span className="block text-[10px] tracking-[0.25em] text-blue-400 uppercase font-bold">
                PREMIUM MEN'S WEAR
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search shirts, baggy jeans, cargo pants, hoodies..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-500"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2.5 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Customer Login / Account */}
            {customer ? (
              <button
                onClick={onOpenCustomerProfile}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3.5 py-2 rounded-full text-sm font-medium text-zinc-200 transition-all"
              >
                <User className="w-4 h-4 text-blue-400" />
                <span className="max-w-[100px] truncate">{customer.name}</span>
              </button>
            ) : (
              <button
                onClick={onOpenCustomerAuth}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3.5 py-2 rounded-full text-sm font-medium text-zinc-200 transition-all"
              >
                <User className="w-4 h-4 text-zinc-400" />
                <span>Login</span>
              </button>
            )}

            {/* Admin Dashboard / Login Button */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAdminDashboard}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md shadow-blue-600/20 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  className="p-2 text-zinc-400 hover:text-rose-400 transition-colors"
                  title="Admin Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-blue-400 border border-zinc-800 hover:border-blue-500/50 px-3 py-1.5 rounded-full transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Search Icon */}
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="p-2 text-zinc-300 hover:text-white"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button onClick={onOpenWishlist} className="relative p-2 text-zinc-300 hover:text-white">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button onClick={onOpenCart} className="relative p-2 text-zinc-300 hover:text-white">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Three-Dot Menu Icon on Mobile */}
            <button
              onClick={() => setThreeDotOpen(!threeDotOpen)}
              className="p-2 text-blue-400 hover:bg-zinc-900 rounded-full transition-colors"
              aria-label="More Options"
            >
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {showSearchInput && (
          <div className="pb-4 lg:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shirts, baggy jeans, cargo pants..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-full py-2 pl-9 pr-8 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2.5 text-zinc-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Slide-over Three-Dot Menu */}
      {threeDotOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-4/5 max-w-sm bg-zinc-950 border-l border-zinc-800 h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Menu Header */}
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    BT
                  </div>
                  <span className="font-bold text-white text-base">BORAN MENU</span>
                </div>
                <button
                  onClick={() => setThreeDotOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Customer Account Section */}
              <div className="py-4 border-b border-zinc-800">
                {customer ? (
                  <div
                    onClick={() => {
                      onOpenCustomerProfile();
                      setThreeDotOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 cursor-pointer border border-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-semibold text-sm text-white">{customer.name}</div>
                        <div className="text-xs text-zinc-400">View Profile & Orders</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onOpenCustomerAuth();
                      setThreeDotOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 text-zinc-200 font-semibold text-sm hover:bg-zinc-800 border border-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-zinc-400" />
                      <span>Customer Login / Register</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </button>
                )}
              </div>

              {/* Categories Navigation */}
              <div className="py-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
                  Product Categories
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onSelectCategory('All');
                      setThreeDotOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === 'All'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-zinc-300 hover:bg-zinc-900'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        onSelectCategory(cat);
                        setThreeDotOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-zinc-300 hover:bg-zinc-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ADMIN LOGIN MANDATORY IN THREE-DOT MENU */}
            <div className="pt-6 border-t border-zinc-800">
              {isAdminLoggedIn ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onOpenAdminDashboard();
                      setThreeDotOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Open Admin Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      onAdminLogout();
                      setThreeDotOpen(false);
                    }}
                    className="w-full text-center text-xs text-rose-400 py-2 hover:underline"
                  >
                    Log Out Admin
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenAdminLogin();
                    setThreeDotOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-blue-600 hover:to-indigo-600 hover:text-white text-blue-400 border border-blue-500/30 py-3.5 rounded-xl font-bold text-sm transition-all"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Admin Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
