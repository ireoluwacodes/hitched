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
import { Button } from "@/components/ui/button"
import { GUEST_STATUS_HINTS, statusConfig, type TOrderStatus } from "@/lib/statusConfig"
import { OrderItemsDisplay } from "@/components/OrderItemsDisplay"
import { StatusBadge } from "@/components/StatusBadge"
import { cn } from "@/lib/utils"
import {
  hasSelectedItems,
  selectedIdsToArray,
} from "@/lib/orderSelection"

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
  const [hasChild, setHasChild] = useState(false)
  const [selectedIds, setSelectedIds] = useState<TSelectedItemsByCategory>({})
  const [childSelectedIds, setChildSelectedIds] = useState<TSelectedItemsByCategory>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (order && menu && !initialized) {
      setGuestName(order.guestName)
      setSelectedIds(buildSelectedIdsFromOrder(order.itemIds, menu))
      const childIds = order.childItemIds ?? []
      setHasChild(childIds.length > 0)
      setChildSelectedIds(buildSelectedIdsFromOrder(childIds, menu))
      setInitialized(true)
    }
  }, [order, menu, initialized])

  function handleSelectItem(categoryId: Id<"menuCategories">, itemId: Id<"menuItems">) {
    setSelectedIds((prev) => ({ ...prev, [categoryId]: itemId }))
  }

  function handleSelectChildItem(categoryId: Id<"menuCategories">, itemId: Id<"menuItems">) {
    setChildSelectedIds((prev) => ({ ...prev, [categoryId]: itemId }))
  }

  const selectedItemIds = selectedIdsToArray(selectedIds)
  const childItemIds = selectedIdsToArray(childSelectedIds)

  async function handleSubmit() {
    if (!guestEditToken || !menu) return
    if (!hasSelectedItems(selectedIds)) {
      toast.error("Select at least one item")
      return
    }
    if (hasChild && !hasSelectedItems(childSelectedIds)) {
      toast.error("Select at least one item for your child's order")
      return
    }

    setIsSubmitting(true)
    try {
      await editOrder({
        orderId: orderId as Id<"orders">,
        guestEditToken,
        guestName,
        itemIds: selectedItemIds,
        childItemIds: hasChild ? childItemIds : [],
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
        <div
          className={cn(
            "flex flex-col gap-4 rounded-lg border border-l-4 p-4",
            config.surfaceClassName
          )}
        >
          <StatusBadge status={order.status as TOrderStatus} />
          <p className={cn("text-sm", config.hintClassName)}>
            {GUEST_STATUS_HINTS[order.status as TOrderStatus]}
          </p>
          <p className="text-sm text-muted-foreground">
            This order can no longer be edited.
          </p>
          <OrderItemsDisplay
            itemNames={order.itemNamesSnapshot}
            childItemNames={order.childItemNamesSnapshot}
            adultLabel="You"
          />
        </div>
      </div>
    )
  }

  const canSubmit =
    guestName.trim().length > 0 &&
    hasSelectedItems(selectedIds) &&
    (!hasChild || hasSelectedItems(childSelectedIds))

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
        childSelectedIds={childSelectedIds}
        categories={menu}
        isSubmitting={isSubmitting}
        canSubmit={canSubmit}
        submitLabel="Update Order"
        hasChild={hasChild}
        onGuestNameChange={setGuestName}
        onHasChildChange={(value) => {
          setHasChild(value)
          if (!value) setChildSelectedIds({})
        }}
        onSelectItem={handleSelectItem}
        onSelectChildItem={handleSelectChildItem}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
