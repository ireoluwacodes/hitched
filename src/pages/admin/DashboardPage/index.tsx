import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@convex-api/_generated/api"
import { getAdminSession, getAdminRole } from "@/lib/adminSession"
import { canAccessDashboard, canListTablesForFilter } from "@/lib/adminAccess"
import { OrderTable } from "@/components/admin/OrderTable"
import type { TOrderStatus } from "@/lib/statusConfig"
import type { Id } from "@convex-api/_generated/dataModel"

export function DashboardPage() {
  const sessionToken = getAdminSession() ?? ""
  const role = getAdminRole()
  const orders = useQuery(
    api.orders.listLive,
    canAccessDashboard(role) && sessionToken ? { sessionToken } : "skip"
  )
  const tables = useQuery(
    api.tables.list,
    canListTablesForFilter(role) && sessionToken ? { sessionToken } : "skip"
  )
  const [tableFilter, setTableFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Live orders</h1>
        <p className="text-sm text-muted-foreground">
          Orders update in real time. Oldest first for kitchen priority.
        </p>
      </div>
      <OrderTable
        orders={orders ?? []}
        isLoading={orders === undefined}
        tableFilter={tableFilter}
        statusFilter={statusFilter}
        sessionToken={sessionToken}
        tables={tables ?? []}
        onTableFilterChange={setTableFilter}
        onStatusFilterChange={setStatusFilter}
        onStatusChange={() => {}}
        onBulkStatusChange={(_tableId: Id<"tables">, _status: TOrderStatus) => {}}
      />
    </div>
  )
}
