"use client"

import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { LogOut, LayoutGrid, BarChart3, Shield, ChevronDown } from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/pos", label: "Kasir", icon: LayoutGrid, exact: true },
  { href: "/pos/report", label: "Laporan", icon: BarChart3, exact: true },
]

export function PosNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const isAdminUser = user?.role === "OWNER" || user?.role === "OPS"

  const handleLogout = () => {
    logout()
    router.replace("/login")
  }

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname?.startsWith(href)

  const initials = (name?: string) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <nav className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b border-slate-100 bg-white/95 backdrop-blur px-4 shadow-sm">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200/50">
          <LayoutGrid className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-slate-800 hidden sm:block">Simple POS</span>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-1 flex-1">
        {navLinks.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:block">{label}</span>
            </button>
          )
        })}

        {isAdminUser && (
          <button
            onClick={() => router.push("/admin")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200",
              pathname?.startsWith("/admin")
                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Admin</span>
          </button>
        )}
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(v => !v)}
          className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-sm transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm"
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[9px] font-bold">
              {initials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-700 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-400 leading-tight">{user?.role}</p>
          </div>
          <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", showUserMenu && "rotate-180")} />
        </button>

        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-slate-100 bg-white shadow-lg shadow-slate-100/60 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-xs font-semibold text-slate-700">{user?.name}</p>
              <p className="text-[10px] text-slate-400">{user?.role}</p>
            </div>
            <button
              onClick={() => { router.push("/admin"); setShowUserMenu(false) }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              <Shield className="h-3.5 w-3.5 text-indigo-400" />
              Admin Panel
            </button>
            <div className="mx-2 my-1 h-px bg-slate-100" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}