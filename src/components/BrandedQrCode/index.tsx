import { QRCodeSVG } from "qrcode.react"
import { APP_LOGO_PATH } from "@/lib/branding"
import { cn } from "@/lib/utils"
import type { IBrandedQrCodeProps } from "./@types"

const LOGO_RATIO = 0.22

export function BrandedQrCode({ value, size = 160, className }: IBrandedQrCodeProps) {
  const logoSize = Math.round(size * LOGO_RATIO)

  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="H"
      className={cn("rounded-sm", className)}
      imageSettings={{
        src: APP_LOGO_PATH,
        height: logoSize,
        width: logoSize,
        excavate: true,
      }}
    />
  )
}
