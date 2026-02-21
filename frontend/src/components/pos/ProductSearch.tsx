"use client"

import { useState, useEffect, useCallback } from "react"
import { productsApi, Product } from "@/lib/api"
import { Search, Package, Plus, AlertCircle } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface ProductSearchProps {
  onSelect: (product: Product) => void
  categoryId?: string | null
}

// Helper to resolve image URL with backend base
const getImageUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;

  // Get base URL from env or fallback, removing /api suffix if present
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const baseUrl = apiBase.replace('/api', '');

  // Ensure url starts with /
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${path}`;
};

export function ProductSearch({ onSelect, categoryId }: ProductSearchProps) {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 300)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let data: Product[]
      if (debouncedQuery.length >= 2) {
        data = await productsApi.search(debouncedQuery)
      } else if (categoryId) {
        data = await productsApi.getByCategory(categoryId)
      } else {
        data = await productsApi.getAll()
      }
      setProducts((data ?? []).filter(p => p.isActive))
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat produk")
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, categoryId])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          placeholder="Cari produk (min. 2 karakter)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl bg-slate-50 border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-700 placeholder-slate-300 outline-none transition-all duration-200 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100 focus:shadow-sm"
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-3 animate-pulse">
              <div className="aspect-square rounded-xl bg-slate-100 animate-shimmer" />
              <div className="mt-3 h-4 rounded-lg bg-slate-100" />
              <div className="mt-2 h-3 w-2/3 rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center animate-fade-in">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-100 p-8 text-center animate-fade-in shadow-sm">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-slate-50 animate-float">
            <Package className="h-8 w-8 text-slate-300" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">Tidak ada produk ditemukan</p>
          <p className="mt-1 text-xs text-slate-400">Coba kata kunci lain atau ubah kategori</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <button
              key={product.id}
              onClick={() => onSelect(product)}
              className="group rounded-2xl bg-white border border-slate-100 p-3 text-left transition-all duration-300 hover:shadow-lg hover:shadow-amber-100/50 hover:scale-[1.02] hover:border-amber-200 active:scale-[0.98] animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-50">
                {product.imageUrl ? (
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                    <Package className="h-8 w-8 text-slate-300 transition-all group-hover:text-slate-400 group-hover:scale-110" />
                  </div>
                )}
                {/* Hover add overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-all duration-300 group-hover:opacity-100 rounded-xl">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-300/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                </div>
                {/* Low stock badge */}
                {product.qtyOnHand !== undefined && product.qtyOnHand <= 5 && (
                  <div className="absolute left-1.5 top-1.5 rounded-full bg-red-500 px-2 py-0.5 shadow-sm">
                    <span className="text-[10px] font-bold text-white">Stok: {product.qtyOnHand}</span>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <h3 className="truncate text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                  {product.name}
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-400 font-medium">
                  {product.category || "Tanpa Kategori"}
                </p>
                <div className="mt-2 inline-block rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 px-2.5 py-1">
                  <p className="text-xs font-bold text-amber-700">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}