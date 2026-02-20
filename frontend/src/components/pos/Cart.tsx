"use client"

import { useMemo } from "react"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"

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
        <ShoppingBag className="h-12 w-12 text-slate-300" />
        <p className="mt-2 text-sm text-slate-500">Keranjang kosong</p>
        <p className="text-xs text-slate-400">Pilih produk untuk menambahkan</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Items List */}
      <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2"
          >
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {item.name}
              </p>
              <p className="text-xs text-slate-500">{formatPrice(item.price)}</p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSetQty(item.productId, item.qty - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {item.qty}
              </span>
              <button
                onClick={() => onSetQty(item.productId, item.qty + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Subtotal & Remove */}
            <div className="flex items-center gap-2">
              <p className="min-w-[80px] text-right text-sm font-semibold text-slate-900">
                {formatPrice(item.price * item.qty)}
              </p>
              <button
                onClick={() => onRemove(item.productId)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-slate-200 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Total Item</span>
          <span className="font-medium text-slate-900">{totalItems} item</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Total</span>
          <span className="text-lg font-bold text-slate-900">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  )
}