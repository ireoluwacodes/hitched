export const APP_LOGO_PATH = "/logo.png"

export const DEFAULT_PRODUCT_NAME = "Hitched"

export const DEFAULT_META_DESCRIPTION =
  "Scan your table QR code to browse the menu and place orders. No app download required."

export function resolveProductName(productName?: string | null): string {
  const trimmed = productName?.trim()
  return trimmed || DEFAULT_PRODUCT_NAME
}

export function getAppLogoUrl(): string {
  const base = import.meta.env.VITE_APP_URL as string | undefined
  if (base) return `${base.replace(/\/$/, "")}${APP_LOGO_PATH}`
  if (typeof window !== "undefined") {
    return `${window.location.origin}${APP_LOGO_PATH}`
  }
  return APP_LOGO_PATH
}
