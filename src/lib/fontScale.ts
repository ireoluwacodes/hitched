const STORAGE_KEY = "hitched_font_scale"
const LEGACY_STORAGE_KEY = "hitched_guest_font_scale"

export const FONT_SCALE_MIN = 1
export const FONT_SCALE_MAX = 2
export const FONT_SCALE_DEFAULT = 1
export const FONT_SCALE_STEP = 0.1

export function getFontScale(): number {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return FONT_SCALE_DEFAULT
    const value = Number.parseFloat(raw)
    if (Number.isNaN(value)) return FONT_SCALE_DEFAULT
    return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, value))
  } catch {
    return FONT_SCALE_DEFAULT
  }
}

export function setFontScale(scale: number): void {
  const clamped = Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, scale))
  localStorage.setItem(STORAGE_KEY, String(clamped))
}

export function formatFontScaleLabel(scale: number): string {
  return `${Math.round(scale * 100)}%`
}
