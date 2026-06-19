import {
  Clock01Icon,
  ChefHatIcon,
  LocationCheck01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

export type TOrderStatus = "pending" | "preparing" | "ready_for_pickup" | "served"

export type THugeicon = typeof Clock01Icon

export interface IStatusConfigEntry {
  label: string
  className: string
  surfaceClassName: string
  rowClassName: string
  hintClassName: string
  icon: THugeicon
}

export const statusConfig: Record<TOrderStatus, IStatusConfigEntry> = {
  pending: {
    label: "Pending",
    className:
      "border border-amber-200/80 bg-amber-100 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/70 dark:text-amber-100",
    surfaceClassName:
      "border-amber-200/70 border-l-amber-500 bg-amber-50/90 dark:border-amber-900/50 dark:bg-amber-950/25",
    rowClassName: "bg-amber-50/70 dark:bg-amber-950/20",
    hintClassName: "text-amber-900/80 dark:text-amber-100/90",
    icon: Clock01Icon,
  },
  preparing: {
    label: "Preparing",
    className:
      "border border-sky-200/80 bg-sky-100 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/70 dark:text-sky-100",
    surfaceClassName:
      "border-sky-200/70 border-l-sky-500 bg-sky-50/90 dark:border-sky-900/50 dark:bg-sky-950/25",
    rowClassName: "bg-sky-50/70 dark:bg-sky-950/20",
    hintClassName: "text-sky-900/80 dark:text-sky-100/90",
    icon: ChefHatIcon,
  },
  ready_for_pickup: {
    label: "Ready for pickup",
    className:
      "border border-emerald-200/80 bg-emerald-100 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/70 dark:text-emerald-100",
    surfaceClassName:
      "border-emerald-300/80 border-l-emerald-500 bg-emerald-50/95 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/30",
    rowClassName: "bg-emerald-50/80 dark:bg-emerald-950/25",
    hintClassName: "font-medium text-emerald-800 dark:text-emerald-200",
    icon: LocationCheck01Icon,
  },
  served: {
    label: "Served",
    className:
      "border border-slate-200/80 bg-slate-100 text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300",
    surfaceClassName:
      "border-slate-200/70 border-l-slate-400 bg-slate-50/80 dark:border-slate-700/50 dark:bg-slate-900/30",
    rowClassName: "bg-slate-50/60 dark:bg-slate-900/20",
    hintClassName: "text-slate-600 dark:text-slate-400",
    icon: Tick02Icon,
  },
}

export const PENDING_AGE_THRESHOLD_MS = 10 * 60 * 1000

export function isOrderAging(createdAt: number, status: TOrderStatus): boolean {
  return status === "pending" && Date.now() - createdAt > PENDING_AGE_THRESHOLD_MS
}

export const ORDER_STATUS_OPTIONS: TOrderStatus[] = [
  "pending",
  "preparing",
  "ready_for_pickup",
  "served",
]

export const GUEST_STATUS_HINTS: Record<TOrderStatus, string> = {
  pending: "Your order is in the queue.",
  preparing: "The kitchen is preparing your order.",
  ready_for_pickup: "Your food is ready — you can collect it now.",
  served: "Your order has been served. Enjoy!",
}

export const SERVER_STATUS_HINTS: Record<TOrderStatus, string> = {
  pending: "Waiting for the kitchen.",
  preparing: "Kitchen is preparing this order.",
  ready_for_pickup: "Food is ready — tell them to collect it.",
  served: "Marked as served.",
}
