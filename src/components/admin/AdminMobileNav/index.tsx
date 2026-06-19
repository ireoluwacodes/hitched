import { NavLink } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  SpoonAndForkIcon,
  QrCodeIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { getAdminRole } from "@/lib/adminSession"
import type { THugeicon } from "@/lib/statusConfig"
import type { TAdminRole } from "@/lib/adminRoles"

const allNavItems: Array<{
  to: string
  label: string
  icon: THugeicon
  roles: TAdminRole[]
}> = [
  {
    to: "/admin/dashboard",
    label: "Orders",
    icon: DashboardSquare01Icon,
    roles: ["super_admin", "staff"],
  },
  {
    to: "/admin/menu",
    label: "Menu",
    icon: SpoonAndForkIcon,
    roles: ["super_admin", "staff"],
  },
  {
    to: "/admin/tables",
    label: "QR",
    icon: QrCodeIcon,
    roles: ["super_admin"],
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: Settings01Icon,
    roles: ["super_admin"],
  },
]

export function AdminMobileNav() {
  const role = getAdminRole()
  const navItems = allNavItems.filter((item) => role && item.roles.includes(role))

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
