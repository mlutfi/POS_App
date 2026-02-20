"use client"

import { useMemo } from "react"
import { Minus, Plus, Trash2, ShoppingBag, ShoppingCart } from "lucide-react"

interface CartItem {
  productId: string
  name: string
  price: number
  qty: number
}

interface CartProps {
  items: CartItem[]
  total: number
  onSetQty: (productId: string, qty: number) => void
  onRemove: (productId: string) => void
}

export function Cart({ items, total, onSetQty, onRemove }: CartProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.qty, 0)
  }, [items])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 animate-float">
          <ShoppingBag className="h-8 w-8 text-slate-300" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400">Keranjang kosong</p>
        <p className="mt-1 text-xs text-slate-300">Pilih produk untuk menambahkan</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Items List */}
      <div className="max-h-[300px] space-y-2 overflow-y-auto scrollbar-thin pr-1">
        {items.map((item, index) => (
          <div
            key={item.productId}
            className="group flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3 transition-all duration-200 hover:bg-white hover:border-slate-200 hover:shadow-sm animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Product icon */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <ShoppingCart className="h-4 w-4 text-amber-500" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-slate-700">
                {item.name}
              </p>
              <p className="text-xs text-slate-400 font-medium">{formatPrice(item.price)} / item</p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSetQty(item.productId, item.qty - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700 active:scale-90"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-slate-700">
                {item.qty}
              </span>
              <button
                onClick={() => onSetQty(item.productId, item.qty + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-200/50 transition-all hover:shadow-md hover:shadow-amber-200/60 active:scale-90"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Subtotal & Remove */}
            <div className="flex items-center gap-2">
              <p className="min-w-[75px] text-right text-sm font-bold text-slate-800">
                {formatPrice(item.price * item.qty)}
              </p>
              <button
                onClick={() => onRemove(item.productId)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-all hover:bg-red-50 hover:text-red-500 active:scale-90"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 font-medium">Total Item</span>
          <span className="font-semibold text-slate-600">
            {totalItems} item
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500">Total</span>
          <span className="text-xl font-extrabold text-gradient">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  )
}