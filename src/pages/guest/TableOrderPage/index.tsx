import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex-api/_generated/api"
import type { Id } from "@convex-api/_generated/dataModel"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderForm } from "@/components/guest/OrderForm"
import { OrderStatusCard } from "@/components/guest/OrderStatusCard"
import { GuestIntroSplash } from "@/components/guest/GuestIntroSplash"
import { addStoredOrder, getStoredOrders } from "@/lib/guestStorage"
import { hasSeenIntro, markIntroSeen } from "@/lib/guestIntro"
import { toast } from "sonner"

export function TableOrderPage() {
  const { qrToken = "" } = useParams()
  const tableData = useQuery(api.tables.getByToken, { qrToken })
  const menu = useQuery(api.menu.getActiveMenu)
  const submitOrder = useMutation(api.orders.submit)

  const [guestName, setGuestName] = useState("")
  const [selectedId, setSelectedId] = useState<Id<"menuItems"> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [storageVersion, setStorageVersion] = useState(0)
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro(qrToken))

  const storedTokens = useMemo(() => {
    void storageVersion
    return getStoredOrders(qrToken).map((o) => ({
      orderId: o.orderId,
      guestEditToken: o.guestEditToken,
    }))
  }, [qrToken, storageVersion])

  const myOrders = useQuery(
    api.orders.listByGuestTokens,
    storedTokens.length > 0 ? { tokens: storedTokens } : "skip"
  )

  function handleIntroComplete() {
    markIntroSeen(qrToken)
    setShowIntro(false)
  }

  async function handleSubmit() {
    if (!tableData?.table || !selectedId) return
    setIsSubmitting(true)
    try {
      const { orderId, guestEditToken } = await submitOrder({
        tableId: tableData.table._id,
        guestName,
        itemIds: [selectedId],
      })
      addStoredOrder(qrToken, { orderId, guestEditToken, createdAt: Date.now() })
      setStorageVersion((v) => v + 1)
      setSelectedId(null)
      toast.success("Order submitted!")
      document.getElementById("your-orders")?.scrollIntoView({ behavior: "smooth" })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit order")
    } finally {
      setIsSubmitting(false)
    }
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

  const canSubmit = guestName.trim().length > 0 && selectedId !== null

  return (
    <>
      {showIntro && (
        <GuestIntroSplash
          productName={tableData.productName}
          eventName={tableData.eventName}
          onComplete={handleIntroComplete}
        />
      )}

      <div className="mx-auto max-w-lg p-6">
        <header className="mb-6">
          {tableData.eventName && (
            <p className="mb-1 text-xs tracking-wide text-muted-foreground uppercase">
              {tableData.eventName}
            </p>
          )}
          <h1 className="font-heading text-2xl font-medium">Place your order</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick one item, submit, then order again anytime.
          </p>
        </header>

        <section id="your-orders" className="mb-8 flex flex-col gap-4">
          <h2 className="font-heading text-lg font-medium">Your orders</h2>
          {!myOrders || myOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Orders you place from this device will appear here.
            </p>
          ) : (
            myOrders.map((order) => (
              <OrderStatusCard
                key={order._id}
                orderId={order._id}
                qrToken={qrToken}
                guestName={order.guestName}
                itemNamesSnapshot={order.itemNamesSnapshot}
                status={order.status}
                createdAt={order.createdAt}
                onDeleted={() => setStorageVersion((v) => v + 1)}
              />
            ))
          )}
        </section>

        <OrderForm
          guestName={guestName}
          tableNumber={tableData.table.number}
          selectedId={selectedId}
          categories={menu}
          isSubmitting={isSubmitting}
          canSubmit={canSubmit}
          onGuestNameChange={setGuestName}
          onSelectItem={setSelectedId}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  )
}
