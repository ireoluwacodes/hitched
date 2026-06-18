export function formatOrderTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatOrderItems(items: string[]): string {
  return items.join(" + ")
}
