import type { Id } from "@convex-api/_generated/dataModel"

export interface IStoredGuestOrder {
  orderId: Id<"orders">
  guestEditToken: string
  createdAt: number
}

function storageKey(qrToken: string): string {
  return `hitched_orders_${qrToken}`
}

export function getStoredOrders(qrToken: string): IStoredGuestOrder[] {
  try {
    const raw = localStorage.getItem(storageKey(qrToken))
    if (!raw) return []
    const parsed = JSON.parse(raw) as IStoredGuestOrder[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addStoredOrder(
  qrToken: string,
  order: IStoredGuestOrder
): void {
  const existing = getStoredOrders(qrToken)
  const filtered = existing.filter((o) => o.orderId !== order.orderId)
  localStorage.setItem(
    storageKey(qrToken),
    JSON.stringify([order, ...filtered])
  )
}

export function getStoredOrderToken(
  qrToken: string,
  orderId: Id<"orders">
): string | null {
  const order = getStoredOrders(qrToken).find((o) => o.orderId === orderId)
  return order?.guestEditToken ?? null
}

export function removeStoredOrder(
  qrToken: string,
  orderId: Id<"orders">
): void {
  const filtered = getStoredOrders(qrToken).filter((o) => o.orderId !== orderId)
  localStorage.setItem(storageKey(qrToken), JSON.stringify(filtered))
}
