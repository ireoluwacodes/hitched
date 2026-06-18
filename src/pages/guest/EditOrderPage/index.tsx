import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex-api/_generated/api"
import type { Id } from "@convex-api/_generated/dataModel"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderForm } from "@/components/guest/OrderForm"
import type { TSelectedItemsByCategory } from "@/components/guest/OrderForm/@types"
import { getStoredOrderToken } from "@/lib/guestStorage"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { statusConfig, type TOrderStatus } from "@/lib/statusConfig"
import { formatOrderItems } from "@/lib/format"

function buildSelectedIdsFromOrder(
  itemIds: Id<"menuItems">[],
  categories: { _id: Id<"menuCategories">; items: { _id: Id<"menuItems"> }[] }[]
): TSelectedItemsByCategory {
  const selected: TSelectedItemsByCategory = {}
  for (const itemId of itemIds) {
    for (const category of categories) {
      if (category.items.some((item) => item._id === itemId)) {
        selected[category._id] = itemId
        break
      }
    }
  }
  return selected
}

export function EditOrderPage() {
  const { qrToken = "", orderId = "" } = useParams()
  const guestEditToken = getStoredOrderToken(qrToken, orderId as Id<"orders">)
  const order = useQuery(
    api.orders.getByGuestToken,
    guestEditToken
      ? { orderId: orderId as Id<"orders">, guestEditToken }
      : "skip"
  )
  const menu = useQuery(api.menu.getActiveMenu)
  const editOrder = useMutation(api.orders.edit)

  const [guestName, setGuestName] = useState("")
  const [selectedIds, setSelectedIds] = useState<TSelectedItemsByCategory>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (order && menu && !initialized) {
      setGuestName(order.guestName)
      setSelectedIds(buildSelectedIdsFromOrder(order.itemIds, menu))
      setInitialized(true)
    }
  }, [order, menu, initialized])

  function handleSelectItem(categoryId: Id<"menuCategories">, itemId: Id<"menuItems">) {
    setSelectedIds((prev) => ({ ...prev, [categoryId]: itemId }))
  }

  const selectedItemIds = Object.values(selectedIds).filter(
    (id): id is Id<"menuItems"> => id !== undefined
  )

  async function handleSubmit() {
    if (!guestEditToken || selectedItemIds.length === 0) return
    setIsSubmitting(true)
    try {
      await editOrder({
        orderId: orderId as Id<"orders">,
        guestEditToken,
        guestName,
        itemIds: selectedItemIds,
      })
      toast.success("Order updated!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!guestEditToken) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to edit this order.</p>
      </div>
    )
  }

  if (order === undefined || menu === undefined) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">Order not found.</p>
      </div>
    )
  }

  if (order.status !== "pending") {
    const config = statusConfig[order.status as TOrderStatus]
    return (
      <div className="mx-auto max-w-lg p-6">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
          <Link to={`/t/${qrToken}`}>← Back</Link>
        </Button>
        <div className="flex flex-col gap-4">
          <Badge className={config.className}>
            <HugeiconsIcon icon={config.icon} strokeWidth={2} className="size-3" />
            {config.label}
          </Badge>
          <p className="text-sm text-muted-foreground">
            Your order is already being prepared and can no longer be edited.
          </p>
          <p className="text-sm">{formatOrderItems(order.itemNamesSnapshot)}</p>
        </div>
      </div>
    )
  }

  const canSubmit = guestName.trim().length > 0 && selectedItemIds.length > 0

  return (
    <div className="mx-auto max-w-lg p-6">
      <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
        <Link to={`/t/${qrToken}`}>← Back</Link>
      </Button>
      <h1 className="font-heading mb-6 text-2xl font-medium">Edit your order</h1>
      <OrderForm
        guestName={guestName}
        tableNumber={order.tableNumber}
        selectedIds={selectedIds}
        categories={menu}
        isSubmitting={isSubmitting}
        canSubmit={canSubmit}
        submitLabel="Update Order"
        onGuestNameChange={setGuestName}
        onSelectItem={handleSelectItem}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
