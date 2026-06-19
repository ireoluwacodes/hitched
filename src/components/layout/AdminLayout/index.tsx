import { Navigate, Outlet, useLocation } from "react-router-dom"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminMobileNav } from "@/components/admin/AdminMobileNav"
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary"
import { FontSizeControl } from "@/components/FontSizeControl"
import { getAdminRole, getAdminSession } from "@/lib/adminSession"
import { useFontScale } from "@/hooks/useFontScale"

const STAFF_ALLOWED_PATHS = ["/admin/dashboard", "/admin/menu"]

export function AdminGuard() {
  const session = getAdminSession()
  const role = getAdminRole()
  const location = useLocation()

  if (!session || !role || role === "server") {
    return <Navigate to="/admin" replace />
  }

  if (role === "staff" && !STAFF_ALLOWED_PATHS.some((path) => location.pathname.startsWith(path))) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Outlet />
}

export function AdminLayout() {
  const { scale, setScale } = useFontScale()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <FontSizeControl scale={scale} onScaleChange={setScale} />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <AdminMobileNav />
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-auto p-4 lg:p-8">
          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  )
}
