import { Navigate, Outlet } from "react-router-dom"
import { getServerSession } from "@/lib/serverSession"

export function ServerGuard() {
  const session = getServerSession()
  if (!session) {
    return <Navigate to="/server" replace />
  }
  return <Outlet />
}

export function ServerLayout() {
  return (
    <div className="min-h-svh bg-background">
      <Outlet />
    </div>
  )
}
