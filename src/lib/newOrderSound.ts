let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

export function playNewOrderDing(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const play = () => {
    const now = ctx.currentTime

    const playTone = (frequency: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + duration)
    }

    playTone(880, now, 0.18)
    playTone(1174.66, now + 0.12, 0.22)
  }

  if (ctx.state === "suspended") {
    void ctx.resume().then(play).catch(() => {})
    return
  }

  play()
}
