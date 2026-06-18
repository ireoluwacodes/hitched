import { Routes, Route, Navigate } from "react-router-dom"
import { useBootstrapEvent } from "@/hooks/useBootstrapEvent"
import { AppMeta } from "@/components/AppMeta"
import { GuestLayout } from "@/components/layout/GuestLayout"
import { AdminLayout, AdminGuard } from "@/components/layout/AdminLayout"
import { LandingPage } from "@/pages/LandingPage"
import { TableOrderPage } from "@/pages/guest/TableOrderPage"
import { EditOrderPage } from "@/pages/guest/EditOrderPage"
import { PinGatePage } from "@/pages/admin/PinGatePage"
import { DashboardPage } from "@/pages/admin/DashboardPage"
import { MenuPage } from "@/pages/admin/MenuPage"
import { TablesPage } from "@/pages/admin/TablesPage"
import { SettingsPage } from "@/pages/admin/SettingsPage"

export function App() {
  useBootstrapEvent()

  return (
    <>
      <AppMeta />
      <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<GuestLayout />}>
        <Route path="/t/:qrToken" element={<TableOrderPage />} />
        <Route path="/t/:qrToken/order/:orderId" element={<EditOrderPage />} />
      </Route>

      <Route path="/admin" element={<PinGatePage />} />

      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/menu" element={<MenuPage />} />
          <Route path="/admin/tables" element={<TablesPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default App
