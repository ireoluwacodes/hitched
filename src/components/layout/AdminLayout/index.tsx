import { Navigate, Outlet } from "react-router-dom"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminMobileNav } from "@/components/admin/AdminMobileNav"
import { FontSizeControl } from "@/components/FontSizeControl"
import { getAdminSession } from "@/lib/adminSession"
import { useFontScale } from "@/hooks/useFontScale"

export function AdminGuard() {
  const session = getAdminSession()
  if (!session) {
    return <Navigate to="/admin" replace />
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
          <Outlet />
        </main>
      </div>
    </div>
  )
}
