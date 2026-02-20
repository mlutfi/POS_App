"use client"

import { useState, useEffect } from "react"
import { categoriesApi, Category } from "@/lib/api"
import { Grid, Loader2 } from "lucide-react"

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
        setCategories(data)
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
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        <span className="text-sm text-slate-500">Memuat kategori...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
          activeCategory === null
            ? "bg-slate-900 text-white"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Grid className="h-3 w-3" />
          Semua
        </span>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            activeCategory === category.id
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}