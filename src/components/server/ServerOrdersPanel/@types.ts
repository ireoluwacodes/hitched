import type { Id } from "@convex-api/_generated/dataModel"
import type { TOrderStatus } from "@/lib/statusConfig"

export interface IServerOrderSummary {
  _id: Id<"orders">
  tableNumber: number
  guestName: string
  itemNamesSnapshot: string[]
  status: TOrderStatus
  isForKid?: boolean
  createdAt: number
}

export interface IServerOrdersPanelProps {
  orders: IServerOrderSummary[]
}
