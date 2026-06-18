const APP_URL = import.meta.env.VITE_APP_URL as string | undefined

export function getAppOrigin(): string {
  return APP_URL ?? window.location.origin
}

export function buildTableUrl(qrToken: string): string {
  return `${getAppOrigin()}/t/${qrToken}`
}
