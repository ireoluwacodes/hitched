import { NavLink } from "react-router-dom"
import { useQuery } from "convex/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  SpoonAndForkIcon,
  QrCodeIcon,
  Settings01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons"
import { api } from "@convex-api/_generated/api"
import { cn } from "@/lib/utils"
import { clearAdminSession, getAdminRole } from "@/lib/adminSession"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { resolveProductName } from "@/lib/branding"
import { AppLogo } from "@/components/AppLogo"
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
    label: "Dashboard",
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
    label: "Tables & QR",
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

export function AdminSidebar() {
  const navigate = useNavigate()
  const role = getAdminRole()
  const settings = useQuery(api.eventSettings.getPublic)
  const productName = resolveProductName(settings?.productName)
  const navItems = allNavItems.filter((item) => role && item.roles.includes(role))

  function handleLogout() {
    clearAdminSession()
    navigate("/admin")
  }

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card/50 lg:flex">
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <AppLogo className="size-10 shrink-0" alt="" />
          <div className="min-w-0">
            <p className="font-heading truncate text-lg font-medium leading-tight">{productName}</p>
            <p className="text-xs text-muted-foreground">Back office</p>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={handleLogout}
        >
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
