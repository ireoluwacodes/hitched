export function formatOrderTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatOrderItems(items: string[]): string {
  return items.join(", ")
}

export function formatGuestOrder(
  itemNames: string[],
  childItemNames?: string[]
): string {
  if (!childItemNames || childItemNames.length === 0) {
    return formatOrderItems(itemNames)
  }

  return `Guest: ${formatOrderItems(itemNames)}\nChild: ${formatOrderItems(childItemNames)}`
}
