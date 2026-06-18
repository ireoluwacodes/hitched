import type { Doc, Id } from "@convex-api/_generated/dataModel"
import type { TOrderStatus } from "@/lib/statusConfig"

export type TLiveOrder = Doc<"orders">

export interface IOrderTableProps {
  orders: TLiveOrder[]
  isLoading: boolean
  tableFilter: string
  statusFilter: string
  sessionToken: string
  onTableFilterChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onStatusChange: (orderId: Id<"orders">, status: TOrderStatus) => void
  onBulkStatusChange: (tableId: Id<"tables">, status: TOrderStatus) => void
  tables: Array<{ _id: Id<"tables">; number: number }>
}
