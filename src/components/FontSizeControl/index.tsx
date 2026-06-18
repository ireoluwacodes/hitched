import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STEP,
  formatFontScaleLabel,
} from "@/lib/fontScale"
import type { IFontSizeControlProps } from "./@types"

export function FontSizeControl({ scale, onScaleChange }: IFontSizeControlProps) {
  return (
    <div className="border-b border-border bg-accent/30 px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <Label htmlFor="font-size" className="shrink-0 text-xs text-accent-foreground">
          Text size
        </Label>
        <span className="text-xs text-muted-foreground" aria-hidden>
          A
        </span>
        <Slider
          id="font-size"
          min={FONT_SCALE_MIN}
          max={FONT_SCALE_MAX}
          step={FONT_SCALE_STEP}
          value={[scale]}
          onValueChange={([value]) => onScaleChange(value)}
          className="flex-1"
          aria-label="Adjust text size"
        />
        <span className="text-lg font-medium text-foreground" aria-hidden>
          A
        </span>
        <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
          {formatFontScaleLabel(scale)}
        </span>
      </div>
    </div>
  )
}
