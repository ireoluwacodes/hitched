import { Badge } from "@/components/ui/badge"
import { statusConfig, SERVER_STATUS_HINTS } from "@/lib/statusConfig"
import { OrderItemsDisplay } from "@/components/OrderItemsDisplay"
import { StatusBadge } from "@/components/StatusBadge"
import { formatOrderTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { IServerOrdersPanelProps } from "./@types"

export function ServerOrdersPanel({ orders }: IServerOrdersPanelProps) {
  if (orders.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
        <p className="font-heading text-sm font-medium">No orders yet on this device</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Orders you place here will show live status updates.
        </p>
      </section>
    )
  }

  const readyCount = orders.filter((order) => order.status === "ready_for_pickup").length

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-sm font-medium">Your orders</h2>
          <p className="text-xs text-muted-foreground">
            Only orders placed from this device appear here.
          </p>
        </div>
        {readyCount > 0 && (
          <Badge className="border border-emerald-200/80 bg-emerald-500 text-white dark:border-emerald-800">
            {readyCount} ready
          </Badge>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {orders.map((order) => {
          const config = statusConfig[order.status]

          return (
            <li
              key={order._id}
              className={cn("rounded-xl border border-l-4 px-4 py-3", config.surfaceClassName)}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    Table {order.tableNumber} · {order.guestName}
                    {order.isForKid && (
                      <Badge variant="outline" className="ml-2 align-middle text-[10px]">
                        Kid
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatOrderTime(order.createdAt)}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="text-sm">
                <OrderItemsDisplay itemNames={order.itemNamesSnapshot} />
              </div>

              <p className={cn("mt-2 text-sm", config.hintClassName)}>
                {SERVER_STATUS_HINTS[order.status]}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
