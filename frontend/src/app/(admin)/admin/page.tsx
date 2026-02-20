"use client"

import { useState, useEffect } from "react"
import { salesApi, productsApi, categoriesApi } from "@/lib/api"
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react"

interface DashboardStats {
  totalRevenue: number
  totalSales: number
  totalProducts: number
  totalCategories: number
  cashSales: number
  qrisSales: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalSales: 0,
    totalProducts: 0,
    totalCategories: 0,
    cashSales: 0,
    qrisSales: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [report, products, categories] = await Promise.all([
          salesApi.getDailyReport(),
          productsApi.getAll(),
          categoriesApi.getAll(),
        ])

        setStats({
          totalRevenue: report.totalRevenue,
          totalSales: report.totalSales,
          totalProducts: products.length,
          totalCategories: categories.length,
          cashSales: report.cashSales,
          qrisSales: report.qrisSales,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const statCards = [
    {
      title: "Pendapatan Hari Ini",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
      color: "bg-green-500",
    },
    {
      title: "Transaksi Hari Ini",
      value: stats.totalSales.toString(),
      icon: ShoppingBag,
      trend: "+8.2%",
      trendUp: true,
      color: "bg-blue-500",
    },
    {
      title: "Total Produk",
      value: stats.totalProducts.toString(),
      icon: Package,
      trend: null,
      trendUp: true,
      color: "bg-purple-500",
    },
    {
      title: "Total Kategori",
      value: stats.totalCategories.toString(),
      icon: Users,
      trend: null,
      trendUp: true,
      color: "bg-amber-500",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Ringkasan aktivitas bisnis Anda hari ini
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                {stat.trend && (
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      stat.trendUp ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.trendUp ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.title}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Payment Methods */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Metode Pembayaran Hari Ini
          </h2>
          <p className="text-sm text-slate-500">
            Distribusi berdasarkan metode pembayaran
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm text-slate-700">Tunai</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {stats.cashSales} transaksi
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-purple-500" />
                <span className="text-sm text-slate-700">QRIS</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {stats.qrisSales} transaksi
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="bg-green-500 transition-all"
              style={{
                width: `${
                  stats.totalSales > 0
                    ? (stats.cashSales / stats.totalSales) * 100
                    : 0
                }%`,
              }}
            />
            <div
              className="bg-purple-500 transition-all"
              style={{
                width: `${
                  stats.totalSales > 0
                    ? (stats.qrisSales / stats.totalSales) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Aksi Cepat</h2>
          <p className="text-sm text-slate-500">Akses fitur utama dengan cepat</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <Package className="h-4 w-4" />
              Tambah Produk
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <Users className="h-4 w-4" />
              Tambah User
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <ShoppingBag className="h-4 w-4" />
              Lihat Transaksi
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <ArrowUpRight className="h-4 w-4" />
              Export Laporan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}