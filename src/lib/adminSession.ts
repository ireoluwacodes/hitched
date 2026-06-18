const SESSION_KEY = "hitched_admin_session"

export function getAdminSession(): string | null {
  return sessionStorage.getItem(SESSION_KEY)
}

export function setAdminSession(token: string): void {
  sessionStorage.setItem(SESSION_KEY, token)
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
