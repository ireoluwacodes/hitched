import { getOrCreateStoredId } from "@/lib/deviceId"

const DEVICE_KEY = "hitched_device_id"

export function getOrCreateDeviceId(): string {
  return getOrCreateStoredId(DEVICE_KEY)
}
