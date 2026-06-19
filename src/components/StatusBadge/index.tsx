import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@/components/ui/badge"
import { statusConfig } from "@/lib/statusConfig"
import type { IStatusBadgeProps } from "./@types"

export function StatusBadge({ status }: IStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge className={config.className}>
      <HugeiconsIcon icon={config.icon} strokeWidth={2} className="size-3" />
      {config.label}
    </Badge>
  )
}
