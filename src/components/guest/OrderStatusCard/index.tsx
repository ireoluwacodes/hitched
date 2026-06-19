import { useState } from "react"
import { Link } from "react-router-dom"
import { useMutation } from "convex/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { api } from "@convex-api/_generated/api"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { statusConfig, GUEST_STATUS_HINTS } from "@/lib/statusConfig"
import { formatGuestOrder, formatOrderTime } from "@/lib/format"
import { OrderItemsDisplay } from "@/components/OrderItemsDisplay"
import { StatusBadge } from "@/components/StatusBadge"
import { cn } from "@/lib/utils"
import { getStoredOrderToken, removeStoredOrder } from "@/lib/guestStorage"
import { toast } from "sonner"
import type { IOrderStatusCardProps } from "./@types"

export function OrderStatusCard({
  orderId,
  qrToken,
  guestName,
  itemNamesSnapshot,
  childItemNamesSnapshot,
  status,
  createdAt,
  onDeleted,
}: IOrderStatusCardProps) {
  const removeByGuest = useMutation(api.orders.removeByGuest)
  const [isDeleting, setIsDeleting] = useState(false)
  const config = statusConfig[status]
  const canEdit = status === "pending"

  async function handleCancel() {
    const guestEditToken = getStoredOrderToken(qrToken, orderId)
    if (!guestEditToken) {
      toast.error("Cannot cancel this order from this device")
      return
    }
    setIsDeleting(true)
    try {
      await removeByGuest({ orderId, guestEditToken })
      removeStoredOrder(qrToken, orderId)
      toast.success("Order cancelled")
      onDeleted?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel order")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <article
      className={cn(
        "rounded-lg border border-l-4 p-4",
        config.surfaceClassName
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{guestName}</p>
          <p className="text-xs text-muted-foreground">{formatOrderTime(createdAt)}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mb-3">
        <OrderItemsDisplay
          itemNames={itemNamesSnapshot}
          childItemNames={childItemNamesSnapshot}
          adultLabel="You"
        />
      </div>
      {canEdit ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/t/${qrToken}/order/${orderId}`}>Edit order</Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive" disabled={isDeleting}>
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                <AlertDialogDescription className="whitespace-pre-line">
                  This will remove {formatGuestOrder(itemNamesSnapshot, childItemNamesSnapshot)} from
                  the kitchen queue.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep order</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>Cancel order</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <p className={cn("text-sm", config.hintClassName)}>{GUEST_STATUS_HINTS[status]}</p>
      )}
    </article>
  )
}
