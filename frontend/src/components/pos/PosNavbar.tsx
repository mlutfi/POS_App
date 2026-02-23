"use client"

import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { LogOut, User, LayoutGrid, BarChart3, Menu, X, Shield } from "lucide-react"
import { useState } from "react"

export function PosNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAdminUser = user?.role === "OWNER" || user?.role === "OPS"

  const handleLogout = () => {
    logout()
    router.replace("/login")
  }

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* ===== Top Navbar ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm shadow-slate-100/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50">
                <LayoutGrid className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-800">Simple POS</span>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Point of Sale</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => router.push("/pos")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive("/pos")
                  ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 shadow-sm border border-amber-200/60"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Kasir
              </button>
              <button
                onClick={() => router.push("/pos/report")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive("/pos/report")
                  ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 shadow-sm border border-amber-200/60"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <BarChart3 className="h-4 w-4" />
                Laporan
              </button>
              {isAdminUser && (
                <button
                  onClick={() => router.push("/admin")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${pathname?.startsWith("/admin")
                    ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 shadow-sm border border-amber-200/60"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </button>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                  <p className="text-[11px] text-slate-400">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex md:hidden items-center justify-center h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 transition hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              <div className="flex sm:hidden items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 mb-2 border border-slate-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                  <p className="text-[11px] text-slate-400">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={() => { router.push("/pos"); setMobileMenuOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive("/pos")
                  ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/60"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Kasir
              </button>
              <button
                onClick={() => { router.push("/pos/report"); setMobileMenuOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive("/pos/report")
                  ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/60"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <BarChart3 className="h-4 w-4" />
                Laporan
              </button>
              {isAdminUser && (
                <button
                  onClick={() => { router.push("/admin"); setMobileMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${pathname?.startsWith("/admin")
                    ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/60"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ===== Mobile Bottom Navigation ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-around px-2 py-2">
            <button
              onClick={() => router.push("/pos")}
              className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 ${isActive("/pos")
                ? "text-amber-600"
                : "text-slate-400 hover:text-slate-600"
                }`}
            >
              <LayoutGrid className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Kasir</span>
              {isActive("/pos") && (
                <div className="absolute -top-0 h-0.5 w-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
              )}
            </button>
            <button
              onClick={() => router.push("/pos/report")}
              className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 ${isActive("/pos/report")
                ? "text-amber-600"
                : "text-slate-400 hover:text-slate-600"
                }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Laporan</span>
            </button>
            {isAdminUser && (
              <button
                onClick={() => router.push("/admin")}
                className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 ${pathname?.startsWith("/admin")
                  ? "text-amber-600"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                <Shield className="h-5 w-5" />
                <span className="text-[10px] font-semibold">Admin</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-slate-400 transition-all duration-200 hover:text-red-500"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}