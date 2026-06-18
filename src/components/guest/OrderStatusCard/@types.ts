import type { Id } from "@convex-api/_generated/dataModel"
import type { TOrderStatus } from "@/lib/statusConfig"

export interface IOrderStatusCardProps {
  orderId: Id<"orders">
  qrToken: string
  guestName: string
  itemNamesSnapshot: string[]
  status: TOrderStatus
  createdAt: number
  onDeleted?: () => void
}
