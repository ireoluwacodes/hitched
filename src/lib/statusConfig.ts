import {
  Clock01Icon,
  ChefHatIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

export type TOrderStatus = "pending" | "preparing" | "served"

export type THugeicon = typeof Clock01Icon

export interface IStatusConfigEntry {
  label: string
  className: string
  icon: THugeicon
}

export const statusConfig: Record<TOrderStatus, IStatusConfigEntry> = {
  pending: {
    label: "Pending",
    className: "bg-muted text-muted-foreground",
    icon: Clock01Icon,
  },
  preparing: {
    label: "Preparing",
    className: "bg-accent text-accent-foreground",
    icon: ChefHatIcon,
  },
  served: {
    label: "Served",
    className: "bg-secondary text-secondary-foreground",
    icon: Tick02Icon,
  },
}

export const PENDING_AGE_THRESHOLD_MS = 10 * 60 * 1000

export function isOrderAging(createdAt: number, status: TOrderStatus): boolean {
  return status === "pending" && Date.now() - createdAt > PENDING_AGE_THRESHOLD_MS
}
