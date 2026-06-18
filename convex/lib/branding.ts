export const DEFAULT_PRODUCT_NAME = "Hitched"

export function resolveProductName(productName?: string | null): string {
  const trimmed = productName?.trim()
  return trimmed || DEFAULT_PRODUCT_NAME
}
