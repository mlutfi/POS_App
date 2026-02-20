"use client"

import { useState, useEffect, useCallback } from "react"
import { productsApi, Product } from "@/lib/api"
import { Search, Package, Plus } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface ProductSearchProps {
  onSelect: (product: Product) => void
  categoryId?: string | null
}

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
      setProducts(data.filter(p => p.isActive))
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
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari produk (min. 2 karakter)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-3">
              <div className="aspect-square rounded-lg bg-slate-100" />
              <div className="mt-2 h-4 rounded bg-slate-100" />
              <div className="mt-1 h-3 w-2/3 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">Tidak ada produk ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => onSelect(product)}
              className="group rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-amber-300 hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <Package className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                <div className="absolute right-1 top-1 rounded-full bg-amber-500 p-1 opacity-0 transition group-hover:opacity-100">
                  <Plus className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="mt-2 truncate text-sm font-medium text-slate-900">
                {product.name}
              </h3>
              <p className="text-xs text-slate-500">{product.category || "Tanpa Kategori"}</p>
              <p className="mt-1 text-sm font-semibold text-amber-600">
                {formatPrice(product.price)}
              </p>
              {product.qtyOnHand !== undefined && product.qtyOnHand <= 5 && (
                <p className="mt-1 text-xs text-red-500">
                  Stok: {product.qtyOnHand}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}