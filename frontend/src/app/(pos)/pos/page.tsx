"use client"

import { useState, useMemo } from "react"
import { ProductSearch } from "@/components/pos/ProductSearch"
import { Cart } from "@/components/pos/Cart"
import { PaymentPanel } from "@/components/pos/PaymentPanel"
import { ProductCategories } from "@/components/pos/ProductCategories"
import { Product, Sale } from "@/lib/api"
import { ShoppingCart, X, CreditCard, Package2, User } from "lucide-react"

interface CartItem {
  productId: string
  name: string
  price: number
  qty: number
}

export default function PosPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [sale, setSale] = useState<Sale | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  function addToCart(product: Product) {
    setCartItems((prev) => {
      const existing = prev.find((it) => it.productId === product.id)
      if (existing) {
        return prev.map((it) =>
          it.productId === product.id ? { ...it, qty: it.qty + 1 } : it
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
        },
      ]
    })
  }

  function setQty(productId: string, qty: number) {
    setCartItems((prev) =>
      prev
        .map((it) =>
          it.productId === productId ? { ...it, qty: Math.max(1, qty) } : it
        )
        .filter((it) => it.qty > 0)
    )
  }

  function removeItem(productId: string) {
    setCartItems((prev) => prev.filter((it) => it.productId !== productId))
  }

  function clearCart() {
    setCartItems([])
    setSale(null)
    setCustomerName("")
    setMobileCartOpen(false)
  }

  const total = useMemo(
    () => cartItems.reduce((sum, it) => sum + it.price * it.qty, 0),
    [cartItems]
  )

  const totalItems = useMemo(
    () => cartItems.reduce((sum, it) => sum + it.qty, 0),
    [cartItems]
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  function refreshProducts() {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-5 grid grid-cols-12 gap-5">
        {/* Left: Catalog */}
        <div className="col-span-12 lg:col-span-8 space-y-4 animate-fade-in">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-100/50 overflow-hidden">
            {/* Catalog Header */}
            <div className="p-4 md:p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                  <Package2 className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-700">
                    Katalog Produk
                  </h2>
                  <p className="text-xs text-slate-400">
                    Pilih kategori atau cari produk langsung.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <ProductCategories
                  activeCategory={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className="p-4 md:p-5">
              <ProductSearch
                onSelect={addToCart}
                categoryId={selectedCategory}
                key={refreshKey}
              />
            </div>
          </div>
        </div>

        {/* Right: Cart + Payment (Desktop) */}
        <div className="hidden lg:block col-span-4">
          <div className="lg:sticky lg:top-20 space-y-4 animate-slide-in-right">
            {/* Cart Card */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-100/50 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-700">Keranjang</h2>
                    <p className="text-xs text-slate-400">{totalItems} item</p>
                  </div>
                </div>
                {totalItems > 0 && (
                  <div className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 shadow-sm shadow-amber-200/50">
                    <span className="text-xs font-bold text-white">{totalItems}</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                {/* Customer Name */}
                <div className="mb-4">
                  <label
                    htmlFor="customerName"
                    className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    Nama Customer (Opsional)
                  </label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                    <input
                      id="customerName"
                      type="text"
                      placeholder="Contoh: Budi Santoso"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-700 placeholder-slate-300 outline-none transition-all duration-200 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                </div>
                <Cart
                  items={cartItems}
                  total={total}
                  onSetQty={setQty}
                  onRemove={removeItem}
                />
              </div>
            </div>

            {/* Payment Card */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-100/50 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                    <CreditCard className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-700">Pembayaran</h2>
                    <p className="text-xs text-slate-400">Cash atau QRIS.</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <PaymentPanel
                  cartItems={cartItems}
                  total={total}
                  sale={sale}
                  setSale={setSale}
                  onClear={clearCart}
                  onPaidSuccess={refreshProducts}
                  customerName={customerName}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Mobile Floating Cart Button ===== */}
      {!mobileCartOpen && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className="fixed bottom-20 right-4 z-40 lg:hidden flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3.5 shadow-xl shadow-amber-200/50 transition-all duration-300 hover:shadow-amber-200/60 hover:scale-105 active:scale-95 animate-slide-up"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5 text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-orange-600 shadow-sm">
                {totalItems}
              </span>
            )}
          </div>
          <div className="text-left">
            <p className="text-[10px] font-semibold text-white/80 uppercase">Keranjang</p>
            <p className="text-sm font-bold text-white">{formatPrice(total)}</p>
          </div>
        </button>
      )}

      {/* ===== Mobile Cart Bottom Sheet ===== */}
      {mobileCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileCartOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl bg-white border-t border-slate-200 overflow-y-auto scrollbar-thin animate-slide-up shadow-2xl">
            {/* Handle */}
            <div className="sticky top-0 z-10 flex justify-center pt-3 pb-2 bg-gradient-to-b from-white to-transparent">
              <div className="h-1.5 w-12 rounded-full bg-slate-200" />
            </div>

            {/* Close Button & Header */}
            <div className="px-5 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-700">Keranjang</h2>
                  <p className="text-xs text-slate-400">{totalItems} item · {formatPrice(total)}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileCartOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 space-y-5 pb-8">
              {/* Customer Name */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Nama Customer (Opsional)
                </label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-700 placeholder-slate-300 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </div>

              {/* Cart Items */}
              <Cart
                items={cartItems}
                total={total}
                onSetQty={setQty}
                onRemove={removeItem}
              />

              {/* Separator */}
              <div className="border-t border-slate-100" />

              {/* Payment */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                    <CreditCard className="h-4 w-4 text-emerald-500" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-700">Pembayaran</h2>
                </div>
                <PaymentPanel
                  cartItems={cartItems}
                  total={total}
                  sale={sale}
                  setSale={setSale}
                  onClear={clearCart}
                  onPaidSuccess={refreshProducts}
                  customerName={customerName}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}