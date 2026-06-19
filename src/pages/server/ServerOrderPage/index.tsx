import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "convex/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons"
import { api } from "@convex-api/_generated/api"
import type { Id } from "@convex-api/_generated/dataModel"
import { OrderForm } from "@/components/guest/OrderForm"
import type { TSelectedItemsByCategory } from "@/components/guest/OrderForm/@types"
import { ServerOrdersPanel } from "@/components/server/ServerOrdersPanel"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getServerSession, clearServerSession } from "@/lib/serverSession"
import { getOrCreateServerDeviceId } from "@/lib/serverDevice"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ServerOrderPage() {
  const sessionToken = getServerSession() ?? ""
  const serverDeviceId = useMemo(() => getOrCreateServerDeviceId(), [])
  const navigate = useNavigate()
  const tables = useQuery(api.tables.list, { sessionToken })
  const menu = useQuery(api.menu.getActiveMenu)
  const myOrders = useQuery(api.orders.listByServerDevice, {
    sessionToken,
    serverDeviceId,
  })
  const submitByServer = useMutation(api.orders.submitByServer)
  const settings = useQuery(api.eventSettings.getPublic)

  const [selectedTableId, setSelectedTableId] = useState<Id<"tables"> | null>(null)
  const [guestName, setGuestName] = useState("")
  const [isForKid, setIsForKid] = useState(false)
  const [selectedIds, setSelectedIds] = useState<TSelectedItemsByCategory>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedTable = useMemo(
    () => tables?.find((t) => t._id === selectedTableId),
    [tables, selectedTableId]
  )

  function handleLogout() {
    clearServerSession()
    navigate("/server")
  }

  function handleSelectItem(categoryId: Id<"menuCategories">, itemId: Id<"menuItems">) {
    setSelectedIds((prev) => ({ ...prev, [categoryId]: itemId }))
  }

  const selectedItemIds = Object.values(selectedIds).filter(
    (id): id is Id<"menuItems"> => id !== undefined
  )

  async function handleSubmit() {
    if (!selectedTableId || selectedItemIds.length === 0) return
    setIsSubmitting(true)
    try {
      await submitByServer({
        sessionToken,
        tableId: selectedTableId,
        guestName,
        itemIds: selectedItemIds,
        isForKid,
        serverDeviceId,
      })

      setGuestName("")
      setIsForKid(false)
      setSelectedIds({})
      toast.success(`Order sent for table ${selectedTable?.number}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (tables === undefined || menu === undefined || myOrders === undefined) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!settings?.orderingOpen) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-heading text-xl font-medium">Ordering is closed</p>
        <Button variant="outline" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    )
  }

  const canSubmit = guestName.trim().length > 0 && selectedItemIds.length > 0

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Server station</p>
          <h1 className="font-heading text-lg font-medium">
            {selectedTable ? `Table ${selectedTable.number}` : "Pick a table"}
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-4" />
          Sign out
        </Button>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pb-28">
        <ServerOrdersPanel orders={myOrders} />

        <section>
          <p className="mb-3 text-sm text-muted-foreground">Select table</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {tables.map((table) => {
              const active = selectedTableId === table._id
              return (
                <button
                  key={table._id}
                  type="button"
                  onClick={() => setSelectedTableId(table._id)}
                  className={cn(
                    "flex h-14 items-center justify-center rounded-xl border text-lg font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-muted"
                  )}
                >
                  {table.number}
                </button>
              )
            })}
          </div>
        </section>

        {selectedTableId && (
          <OrderForm
            guestName={guestName}
            selectedIds={selectedIds}
            categories={menu}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            showTableField={false}
            childOrderMode="whole_order"
            guestNameLabel="Guest name"
            submitLabel="Send order"
            onGuestNameChange={setGuestName}
            hasChild={isForKid}
            onHasChildChange={setIsForKid}
            onSelectItem={handleSelectItem}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  )
}
