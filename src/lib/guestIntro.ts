const INTRO_KEY_PREFIX = "hitched_intro_"

export function hasSeenIntro(qrToken: string): boolean {
  return sessionStorage.getItem(`${INTRO_KEY_PREFIX}${qrToken}`) === "1"
}

export function markIntroSeen(qrToken: string): void {
  sessionStorage.setItem(`${INTRO_KEY_PREFIX}${qrToken}`, "1")
}
