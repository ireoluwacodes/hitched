import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation } from "convex/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { api } from "@convex-api/_generated/api"
import type { Id } from "@convex-api/_generated/dataModel"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { statusConfig, isOrderAging, type TOrderStatus } from "@/lib/statusConfig"
import { formatOrderItems, formatOrderTime } from "@/lib/format"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { playNewOrderDing } from "@/lib/newOrderSound"
import type { IOrderTableProps } from "./@types"

export function OrderTable({
  orders,
  isLoading,
  tableFilter,
  statusFilter,
  sessionToken,
  onTableFilterChange,
  onStatusFilterChange,
  onStatusChange,
  onBulkStatusChange,
  tables,
}: IOrderTableProps) {
  const updateStatus = useMutation(api.orders.updateStatus)
  const bulkUpdate = useMutation(api.orders.bulkUpdateStatusByTable)
  const removeOrder = useMutation(api.orders.remove)
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set())
  const prevIdsRef = useRef<Set<string>>(new Set())
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    const currentIds = new Set(orders.map((o) => o._id))
    const fresh = new Set<string>()

    if (hasInitializedRef.current) {
      for (const id of currentIds) {
        if (!prevIdsRef.current.has(id)) {
          fresh.add(id)
        }
      }
    } else if (orders.length > 0 || !isLoading) {
      hasInitializedRef.current = true
    }

    prevIdsRef.current = currentIds

    if (fresh.size > 0) {
      playNewOrderDing()
      setNewOrderIds(fresh)
      const timer = setTimeout(() => setNewOrderIds(new Set()), 2000)
      return () => clearTimeout(timer)
    }
  }, [orders, isLoading])

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (tableFilter && String(order.tableNumber) !== tableFilter) return false
      if (statusFilter && statusFilter !== "all" && order.status !== statusFilter) return false
      return true
    })
  }, [orders, tableFilter, statusFilter])

  const activeTable = tableFilter
    ? tables.find((t) => String(t.number) === tableFilter)
    : undefined

  async function handleStatusChange(orderId: string, status: TOrderStatus) {
    await updateStatus({ sessionToken, orderId: orderId as never, status })
    onStatusChange(orderId as never, status)
  }

  async function handleBulk(status: TOrderStatus) {
    if (!activeTable) return
    await bulkUpdate({ sessionToken, tableId: activeTable._id, status })
    onBulkStatusChange(activeTable._id, status)
  }

  async function handleDelete(orderId: Id<"orders">) {
    try {
      await removeOrder({ sessionToken, orderId })
      toast.success("Order deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete order")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Filter by table</label>
          <Input
            type="number"
            placeholder="All tables"
            className="w-32"
            value={tableFilter}
            onChange={(e) => onTableFilterChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Filter by status</label>
          <Select value={statusFilter || "all"} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="served">Served</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {activeTable && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleBulk("preparing")}>
              Mark Table {activeTable.number} → Preparing
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulk("served")}>
              Mark Table {activeTable.number} → Served
            </Button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => {
                const config = statusConfig[order.status as TOrderStatus]
                const aging = isOrderAging(order.createdAt, order.status)
                const isNew = newOrderIds.has(order._id)

                return (
                  <TableRow
                    key={order._id}
                    className={cn(
                      aging && "bg-accent/50",
                      isNew && "animate-in fade-in duration-500"
                    )}
                  >
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatOrderTime(order.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium">{order.guestName}</TableCell>
                    <TableCell>{order.tableNumber}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {formatOrderItems(order.itemNamesSnapshot)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={config.className}>{config.label}</Badge>
                        <Select
                          value={order.status}
                          onValueChange={(v) => handleStatusChange(order._id, v as TOrderStatus)}
                        >
                          <SelectTrigger className="h-7 w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="served">Served</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            aria-label="Delete order"
                          >
                            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete order?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Remove {order.guestName}&apos;s order ({formatOrderItems(order.itemNamesSnapshot)})
                              from the queue. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(order._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
