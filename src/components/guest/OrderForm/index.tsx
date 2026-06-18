import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import type { Id } from "@convex-api/_generated/dataModel"
import type { IOrderFormProps } from "./@types"

export function OrderForm({
  guestName,
  tableNumber,
  selectedIds,
  categories,
  isSubmitting,
  canSubmit,
  submitLabel = "Submit Order",
  onGuestNameChange,
  onSelectItem,
  onSubmit,
}: IOrderFormProps) {
  return (
    <div className="flex flex-col gap-6 pb-28">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="guest-name">Your name</Label>
          <Input
            id="guest-name"
            placeholder="e.g. John"
            value={guestName}
            onChange={(e) => onGuestNameChange(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="table-number">Table</Label>
          <Input
            id="table-number"
            value={String(tableNumber)}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {categories.map((category, index) => {
          const categorySelectedId = selectedIds[category._id]

          return (
            <section key={category._id}>
              {index > 0 && <Separator className="mb-6" />}
              <h2 className="font-heading mb-4 text-lg font-medium">{category.name}</h2>
              <RadioGroup
                value={categorySelectedId ?? ""}
                onValueChange={(value) =>
                  onSelectItem(category._id, value as Id<"menuItems">)
                }
                className="gap-2"
              >
                <ul className="flex flex-col gap-2">
                  {category.items.map((item) => {
                    const soldOut = !item.isAvailable
                    const selected = categorySelectedId === item._id
                    return (
                      <li key={item._id}>
                        <label
                          className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-border px-4 py-3 transition-colors ${
                            soldOut
                              ? "cursor-not-allowed opacity-50"
                              : selected
                                ? "border-accent bg-accent text-accent-foreground"
                                : "hover:bg-accent/40"
                          }`}
                        >
                          <RadioGroupItem
                            value={item._id}
                            disabled={soldOut}
                            className="mt-1"
                          />
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className={`text-sm font-medium ${soldOut ? "line-through" : ""}`}>
                              {item.name}
                              {soldOut && (
                                <Badge variant="outline" className="ml-2 align-middle text-[10px]">
                                  Sold out
                                </Badge>
                              )}
                            </span>
                            {item.description && (
                              <span
                                className={`text-xs ${selected ? "text-accent-foreground/75" : "text-muted-foreground"}`}
                              >
                                {item.description}
                              </span>
                            )}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </RadioGroup>
            </section>
          )
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 p-4 backdrop-blur-sm pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          className="h-12 w-full text-base"
          disabled={!canSubmit || isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? (
            <>
              <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="animate-spin" />
              Submitting…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  )
}
