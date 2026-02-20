"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
    LayoutDashboard,
    Package,
    FolderTree,
    Users,
    BarChart3,
} from "lucide-react"

const breadcrumbMap: Record<string, { label: string; icon: React.ElementType }> = {
    "/admin": { label: "Dashboard", icon: LayoutDashboard },
    "/admin/products": { label: "Produk", icon: Package },
    "/admin/categories": { label: "Kategori", icon: FolderTree },
    "/admin/users": { label: "Pengguna", icon: Users },
    "/admin/reports": { label: "Laporan", icon: BarChart3 },
}

export function AdminHeader() {
    const pathname = usePathname()

    // Find the best matching breadcrumb
    const currentPage = Object.entries(breadcrumbMap).find(([path]) => {
        if (path === "/admin") return pathname === "/admin"
        return pathname.startsWith(path)
    })

    const Icon = currentPage?.[1].icon
    const label = currentPage?.[1].label || "Admin"

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium">{label}</span>
                </div>
            </div>
        </header>
    )
}
