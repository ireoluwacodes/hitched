import { useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex-api/_generated/api"

export function useBootstrapEvent() {
  const settings = useQuery(api.eventSettings.getPublic)
  const seed = useMutation(api.seed.default)

  useEffect(() => {
    if (settings === null) {
      void seed({})
    }
  }, [settings, seed])
}
