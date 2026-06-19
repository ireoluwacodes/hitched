import { getOrCreateStoredId } from "@/lib/deviceId"

const DEVICE_KEY = "hitched_server_device_id"

export function getOrCreateServerDeviceId(): string {
  return getOrCreateStoredId(DEVICE_KEY)
}
