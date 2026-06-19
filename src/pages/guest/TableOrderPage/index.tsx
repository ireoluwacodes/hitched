import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex-api/_generated/api"
import type { Id } from "@convex-api/_generated/dataModel"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderForm } from "@/components/guest/OrderForm"
import type { TSelectedItemsByCategory } from "@/components/guest/OrderForm/@types"
import { OrderStatusCard } from "@/components/guest/OrderStatusCard"
import { GuestIntroSplash } from "@/components/guest/GuestIntroSplash"
import { addStoredOrder } from "@/lib/guestStorage"
import { getOrCreateDeviceId } from "@/lib/guestDevice"
import { hasSeenIntro, markIntroSeen } from "@/lib/guestIntro"
import { hasSelectedItems, selectedIdsToArray } from "@/lib/orderSelection"
import { resolveProductName } from "@/lib/branding"
import { toast } from "sonner"

export function TableOrderPage() {
  const { qrToken = "" } = useParams()
  const deviceId = useMemo(() => getOrCreateDeviceId(), [])
  const tableData = useQuery(api.tables.getByToken, { qrToken })
  const menu = useQuery(api.menu.getActiveMenu)
  const submitOrder = useMutation(api.orders.submit)

  const [guestName, setGuestName] = useState("")
  const [hasChild, setHasChild] = useState(false)
  const [selectedIds, setSelectedIds] = useState<TSelectedItemsByCategory>({})
  const [childSelectedIds, setChildSelectedIds] = useState<TSelectedItemsByCategory>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro(qrToken))

  const existingOrder = useQuery(
    api.orders.getByDevice,
    tableData?.table
      ? { tableId: tableData.table._id, deviceId }
      : "skip"
  )

  function handleIntroComplete() {
    markIntroSeen(qrToken)
    setShowIntro(false)
  }

  function handleSelectItem(categoryId: Id<"menuCategories">, itemId: Id<"menuItems">) {
    setSelectedIds((prev) => ({ ...prev, [categoryId]: itemId }))
  }

  function handleSelectChildItem(categoryId: Id<"menuCategories">, itemId: Id<"menuItems">) {
    setChildSelectedIds((prev) => ({ ...prev, [categoryId]: itemId }))
  }

  const selectedItemIds = selectedIdsToArray(selectedIds)
  const childItemIds = selectedIdsToArray(childSelectedIds)

  async function handleSubmit() {
    if (!tableData?.table || !menu) return
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
      const { orderId, guestEditToken } = await submitOrder({
        tableId: tableData.table._id,
        guestName,
        itemIds: selectedItemIds,
        childItemIds: hasChild ? childItemIds : [],
        guestDeviceId: deviceId,
      })
      addStoredOrder(qrToken, { orderId, guestEditToken, createdAt: Date.now() })
      toast.success("Order submitted!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showIntro) {
    return (
      <GuestIntroSplash
        productName={resolveProductName(tableData?.productName)}
        eventName={tableData?.eventName}
        onComplete={handleIntroComplete}
      />
    )
  }

  if (tableData === undefined || menu === undefined) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!tableData) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-heading mb-2 text-xl font-medium">QR not recognized</h1>
          <p className="text-sm text-muted-foreground">
            This QR code isn&apos;t recognized. Please ask a staff member for help.
          </p>
        </div>
      </div>
    )
  }

  if (!tableData.orderingOpen) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-heading mb-2 text-xl font-medium">
            {tableData.eventName ?? "Ordering closed"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Ordering is currently closed. Please check with staff if you need assistance.
          </p>
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
      <header className="mb-6">
        {tableData.eventName && (
          <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
            {tableData.eventName}
          </p>
        )}
        <h1 className="font-heading text-2xl font-medium">
          {existingOrder ? "Your order" : "Place your order"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {existingOrder
            ? "One order per device. You can edit while it's still pending."
            : "Choose what you'd like from the menu. Optionally add an order for your child."}
        </p>
      </header>

      {existingOrder ? (
        <OrderStatusCard
          orderId={existingOrder._id}
          qrToken={qrToken}
          guestName={existingOrder.guestName}
          itemNamesSnapshot={existingOrder.itemNamesSnapshot}
          childItemNamesSnapshot={existingOrder.childItemNamesSnapshot}
          status={existingOrder.status}
          createdAt={existingOrder.createdAt}
        />
      ) : (
        <OrderForm
          guestName={guestName}
          tableNumber={tableData.table.number}
          selectedIds={selectedIds}
          childSelectedIds={childSelectedIds}
          categories={menu}
          isSubmitting={isSubmitting}
          canSubmit={canSubmit}
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
      )}
    </div>
  )
}
