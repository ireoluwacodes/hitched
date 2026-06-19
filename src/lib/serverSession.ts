const SESSION_KEY = "hitched_server_session"

export function getServerSession(): string | null {
  return sessionStorage.getItem(SESSION_KEY)
}

export function setServerSession(token: string): void {
  sessionStorage.setItem(SESSION_KEY, token)
}

export function clearServerSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
