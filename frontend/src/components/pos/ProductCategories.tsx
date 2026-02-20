"use client"

import { useState, useEffect } from "react"
import { categoriesApi, Category } from "@/lib/api"
import { Grid, Loader2, Sparkles } from "lucide-react"

interface ProductCategoriesProps {
  activeCategory: string | null
  onSelect: (categoryId: string | null) => void
}

export function ProductCategories({ activeCategory, onSelect }: ProductCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await categoriesApi.getAll()
        setCategories(data ?? [])
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
        <span className="text-sm text-slate-400">Memuat kategori...</span>
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${activeCategory === null
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200/50 scale-105"
            : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
          }`}
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          Semua
        </span>
      </button>
      {categories.map((category, index) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 animate-fade-in ${activeCategory === category.id
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200/50 scale-105"
              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 active:scale-95"
            }`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}