"use client"

import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import Link from "next/link"
import {
    LayoutDashboard,
    LogOut,
    ChevronRight,
    ShoppingCart,
    Layers,
    TrendingUp,
    Box,
    Users,
    Package,
    Sparkles,
    PanelLeftClose,
    PanelLeftOpen,
    LayoutGrid,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
    {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        iconBg: "bg-sky-50",
        iconColor: "text-sky-500",
        activeIconBg: "bg-sky-500",
        activeBg: "bg-sky-50",
        activeBorder: "bg-sky-500",
        activeText: "text-sky-700",
        badge: null,
    },
    {
        href: "/admin/products",
        label: "Produk",
        icon: Box,
        iconBg: "bg-violet-50",
        iconColor: "text-violet-500",
        activeIconBg: "bg-violet-500",
        activeBg: "bg-violet-50",
        activeBorder: "bg-violet-500",
        activeText: "text-violet-700",
        badge: null,
    },
    {
        href: "/admin/categories",
        label: "Kategori",
        icon: Layers,
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-500",
        activeIconBg: "bg-indigo-500",
        activeBg: "bg-indigo-50",
        activeBorder: "bg-indigo-500",
        activeText: "text-indigo-700",
        badge: null,
    },
    {
        href: "/admin/stock",
        label: "Stok",
        icon: Package,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-500",
        activeIconBg: "bg-emerald-500",
        activeBg: "bg-emerald-50",
        activeBorder: "bg-emerald-500",
        activeText: "text-emerald-700",
        badge: null,
    },
    {
        href: "/admin/users",
        label: "Pengguna",
        icon: Users,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
        activeIconBg: "bg-amber-500",
        activeBg: "bg-amber-50",
        activeBorder: "bg-amber-500",
        activeText: "text-amber-700",
        badge: null,
    },
    {
        href: "/admin/reports",
        label: "Laporan",
        icon: TrendingUp,
        iconBg: "bg-rose-50",
        iconColor: "text-rose-500",
        activeIconBg: "bg-rose-500",
        activeBg: "bg-rose-50",
        activeBorder: "bg-rose-500",
        activeText: "text-rose-700",
        badge: "Baru",
    },
]

export function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)
    const [collapsed, setCollapsed] = useState(false)

    const handleLogout = () => {
        logout()
        router.replace("/login")
    }

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin"
        return pathname.startsWith(href)
    }

    const initials = (name?: string) => {
        if (!name) return "U"
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    return (
        <aside
            className={cn(
                "flex h-screen flex-col bg-white border-r border-slate-100 shrink-0 shadow-[1px_0_12px_0_rgba(0,0,0,0.04)] transition-all duration-300 ease-in-out",
                collapsed ? "w-[68px]" : "w-64"
            )}
        >
            {/* ── Logo / Brand + Toggle ── */}
            <div className={cn(
                "flex h-16 items-center border-b border-slate-100 shrink-0",
                collapsed ? "justify-center px-0" : "justify-between px-4"
            )}>
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50">
                            <LayoutGrid className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-bold text-slate-800">POS Admin</span>
                            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Management Panel</p>
                        </div>
                    </div>
                )}

                {collapsed && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-indigo-200/60">
                        <LayoutGrid className="h-[18px] w-[18px] text-white" />
                    </div>
                )}

                {!collapsed && (
                    <button
                        onClick={() => setCollapsed(true)}
                        title="Collapse sidebar"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
                    >
                        <PanelLeftClose className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Expand button when collapsed */}
            {
                collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        title="Expand sidebar"
                        className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-indigo-500"
                    >
                        <PanelLeftOpen className="h-4 w-4" />
                    </button>
                )
            }

            {/* ── Navigation ── */}
            <nav className={cn("flex-1 overflow-y-auto py-4 space-y-1", collapsed ? "px-2" : "px-3")}>
                {!collapsed && (
                    <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Menu Utama
                    </p>
                )}

                {navItems.map((item) => {
                    const active = isActive(item.href)
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={cn(
                                "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200",
                                collapsed ? "justify-center p-2" : "px-3 py-2.5",
                                active
                                    ? `${item.activeBg} border border-slate-200/80 ${item.activeText}`
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            )}
                        >
                            {/* Active left border accent — only in expanded mode */}
                            {active && !collapsed && (
                                <span className={cn(
                                    "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full",
                                    item.activeBorder
                                )} />
                            )}

                            <span className={cn(
                                "flex items-center justify-center rounded-lg shrink-0 transition-all duration-200",
                                collapsed ? "h-9 w-9" : "h-7 w-7",
                                active ? item.activeIconBg : item.iconBg
                            )}>
                                <Icon className={cn(
                                    "h-4 w-4 transition-all",
                                    active ? "text-white" : item.iconColor
                                )} />
                            </span>

                            {!collapsed && (
                                <>
                                    <span className="flex-1 truncate">{item.label}</span>
                                    {item.badge && (
                                        <Badge className="bg-rose-100 text-rose-500 border-rose-200 text-[9px] px-1.5 py-0 h-4 font-semibold hover:bg-rose-100">
                                            {item.badge}
                                        </Badge>
                                    )}
                                    {active && (
                                        <ChevronRight className={cn("h-3.5 w-3.5 shrink-0", item.iconColor)} />
                                    )}
                                </>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* ── Divider ── */}
            <div className="mx-3 h-px bg-slate-100" />

            {/* ── Go to POS ── */}
            <div className={cn("py-3", collapsed ? "px-2" : "px-3")}>
                <button
                    onClick={() => router.push("/pos")}
                    title={collapsed ? "Buka POS" : undefined}
                    className={cn(
                        "flex w-full items-center rounded-xl bg-orange-50 text-orange-700 border border-orange-100 text-sm font-medium transition-all duration-200 hover:bg-orange-100 hover:border-orange-200",
                        collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
                    )}
                >
                    <ShoppingCart className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                        <>
                            <span className="flex-1 text-left">Buka POS</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </>
                    )}
                </button>
            </div>

            {/* ── User Footer ── */}
            <div className={cn(
                "border-t border-slate-100 py-4",
                collapsed ? "px-2" : "px-3"
            )}>
                {collapsed ? (
                    <div className="flex flex-col items-center gap-2">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs font-bold">
                                {initials(user?.name)}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            onClick={handleLogout}
                            title="Keluar"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs font-bold">
                                {initials(user?.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                                {user?.name || "User"}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight">
                                {user?.role || ""}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Keluar"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </aside >
    )
}
