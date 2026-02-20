"use client"

import { useState, useMemo } from "react"
import { ProductSearch } from "@/components/pos/ProductSearch"
import { Cart } from "@/components/pos/Cart"
import { PaymentPanel } from "@/components/pos/PaymentPanel"
import { ProductCategories } from "@/components/pos/ProductCategories"
import { Product, Sale } from "@/lib/api"

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
  }

  const total = useMemo(
    () => cartItems.reduce((sum, it) => sum + it.price * it.qty, 0),
    [cartItems]
  )

  function refreshProducts() {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen">
      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-12 gap-6">
        {/* Left: Catalog */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-white">
              <h2 className="text-sm font-bold text-zinc-900">
                Katalog Produk
              </h2>
              <p className="text-xs text-zinc-500">
                Pilih kategori atau cari produk langsung.
              </p>

              <div className="mt-4">
                <ProductCategories
                  activeCategory={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </div>
            </div>

            <div className="p-4">
              <ProductSearch
                onSelect={addToCart}
                categoryId={selectedCategory}
                key={refreshKey}
              />
            </div>
          </div>
        </div>

        {/* Right: Cart + Payment */}
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Cart</h2>
                  <p className="text-xs text-zinc-500">Item dan qty.</p>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <label
                    htmlFor="customerName"
                    className="text-xs font-medium text-zinc-700"
                  >
                    Nama Customer (Opsional)
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Isi hanya untuk transaksi penting atau jumlah besar.
                  </p>
                </div>
                <Cart
                  items={cartItems}
                  total={total}
                  onSetQty={setQty}
                  onRemove={removeItem}
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-sm font-semibold">Payment</h2>
                <p className="text-xs text-zinc-500">Cash atau QRIS.</p>
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

            <div className="text-xs text-zinc-500">
              Tips: ketik minimal 2 huruf untuk search.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}