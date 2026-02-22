"use client"

import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import Link from "next/link"
import {
    LayoutDashboard,
    Package,
    FolderTree,
    Users,
    BarChart3,
    LogOut,
    ChevronRight,
    ShoppingCart,
    Layers,
    TrendingUp,
    Box,
    Sparkles,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const navItems = [
    {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        color: "text-sky-400",
        activeGradient: "from-sky-500/20 to-blue-500/10",
        activeBorder: "border-sky-400",
        badge: null,
    },
    {
        href: "/admin/products",
        label: "Produk",
        icon: Box,
        color: "text-violet-400",
        activeGradient: "from-violet-500/20 to-purple-500/10",
        activeBorder: "border-violet-400",
        badge: null,
    },
    {
        href: "/admin/categories",
        label: "Kategori",
        icon: Layers,
        color: "text-indigo-400",
        activeGradient: "from-indigo-500/20 to-blue-500/10",
        activeBorder: "border-indigo-400",
        badge: null,
    },
    {
        href: "/admin/stock",
        label: "Stok",
        icon: Package,
        color: "text-emerald-400",
        activeGradient: "from-emerald-500/20 to-green-500/10",
        activeBorder: "border-emerald-400",
        badge: null,
    },
    {
        href: "/admin/users",
        label: "Pengguna",
        icon: Users,
        color: "text-amber-400",
        activeGradient: "from-amber-500/20 to-orange-500/10",
        activeBorder: "border-amber-400",
        badge: null,
    },
    {
        href: "/admin/reports",
        label: "Laporan",
        icon: TrendingUp,
        color: "text-rose-400",
        activeGradient: "from-rose-500/20 to-pink-500/10",
        activeBorder: "border-rose-400",
        badge: "Baru",
    },
]

export function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)

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
        <aside className="flex h-screen w-64 flex-col bg-[#0f1117] border-r border-white/[0.06] shrink-0">

            {/* ── Logo / Brand ── */}
            <div className="flex h-16 items-center gap-3 px-5 border-b border-white/[0.06]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 shrink-0">
                    <Sparkles className="h-4.5 w-4.5 text-white h-[18px] w-[18px]" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white leading-tight">POS Admin</p>
                    <p className="text-[10px] text-white/40 leading-tight mt-0.5">Management Panel</p>
                </div>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                    Menu Utama
                </p>

                {navItems.map((item) => {
                    const active = isActive(item.href)
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                active
                                    ? `bg-gradient-to-r ${item.activeGradient} border border-white/10 text-white`
                                    : "text-white/50 hover:bg-white/[0.05] hover:text-white/80"
                            )}
                        >
                            {/* Active left border accent */}
                            {active && (
                                <span className={cn(
                                    "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full",
                                    item.activeBorder.replace("border-", "bg-")
                                )} />
                            )}

                            <span className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-all duration-200",
                                active
                                    ? "bg-white/10"
                                    : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                            )}>
                                <Icon className={cn(
                                    "h-4 w-4 transition-all",
                                    active ? item.color : "text-white/40 group-hover:text-white/60"
                                )} />
                            </span>

                            <span className="flex-1 truncate">{item.label}</span>

                            {item.badge && (
                                <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[9px] px-1.5 py-0 h-4 font-semibold">
                                    {item.badge}
                                </Badge>
                            )}

                            {active && (
                                <ChevronRight className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* ── Divider ── */}
            <div className="mx-4 h-px bg-white/[0.06]" />

            {/* ── Go to POS ── */}
            <div className="px-3 py-3">
                <button
                    onClick={() => router.push("/pos")}
                    className="flex w-full items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2.5 text-sm font-medium text-indigo-400 transition-all duration-200 hover:bg-indigo-500/20 hover:border-indigo-500/40"
                >
                    <ShoppingCart className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">Buka POS</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* ── User Footer ── */}
            <div className="border-t border-white/[0.06] px-3 py-4">
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
                    <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold">
                            {initials(user?.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate leading-tight">
                            {user?.name || "User"}
                        </p>
                        <p className="text-[10px] text-white/40 truncate mt-0.5 leading-tight">
                            {user?.role || ""}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Keluar"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/30 transition-all hover:bg-red-500/20 hover:text-red-400"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </aside>
    )
}
