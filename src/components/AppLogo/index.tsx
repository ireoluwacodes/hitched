import { cn } from "@/lib/utils"
import { APP_LOGO_PATH } from "@/lib/branding"
import type { IAppLogoProps } from "./@types"

export function AppLogo({ className, alt = "App logo" }: IAppLogoProps) {
  return (
    <img
      src={APP_LOGO_PATH}
      alt={alt}
      className={cn("object-contain", className)}
      decoding="async"
    />
  )
}
