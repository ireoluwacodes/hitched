import type { IOrderItemsDisplayProps } from "./@types"

function ItemGroup({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-foreground/80">{label}</p>
      <ul className="flex flex-col gap-0.5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="leading-snug">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function OrderItemsDisplay({
  itemNames,
  childItemNames,
  adultLabel = "Guest",
  childLabel = "Child",
}: IOrderItemsDisplayProps) {
  const hasChild = (childItemNames?.length ?? 0) > 0

  if (!hasChild) {
    if (itemNames.length === 1) {
      return <p className="text-sm text-muted-foreground">{itemNames[0]}</p>
    }

    return (
      <ul className="flex flex-col gap-0.5 text-sm text-muted-foreground">
        {itemNames.map((item) => (
          <li key={item} className="leading-snug">
            {item}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <ItemGroup label={adultLabel} items={itemNames} />
      <ItemGroup label={childLabel} items={childItemNames ?? []} />
    </div>
  )
}
