import { NavLink } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  SpoonAndForkIcon,
  QrCodeIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { THugeicon } from "@/lib/statusConfig"

const navItems: Array<{ to: string; label: string; icon: THugeicon }> = [
  { to: "/admin/dashboard", label: "Orders", icon: DashboardSquare01Icon },
  { to: "/admin/menu", label: "Menu", icon: SpoonAndForkIcon },
  { to: "/admin/tables", label: "QR", icon: QrCodeIcon },
  { to: "/admin/settings", label: "Settings", icon: Settings01Icon },
]

export function AdminMobileNav() {
  return (
    <nav className="flex border-b border-border bg-card/80 lg:hidden">
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-[10px]",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
        >
          <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
