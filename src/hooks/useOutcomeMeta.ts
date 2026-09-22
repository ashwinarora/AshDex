import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { resolveOutcomeMeta, type ResolvedOutcomeMeta } from '@/utils/outcomes/template'
import type { OutcomeTemplate, RawOutcomeMeta } from '@/utils/outcomes/types'

/**
 * HIP-4 outcome catalog: `outcomeMeta` (live outcomes + questions) and
 * `outcomeTemplates` (display text for template-deployed markets), resolved
 * into display-ready maps. Mirrors `useSpotMeta`'s React Query pattern.
 *
 * The catalog is refetched whenever the store's `outcomeMetaVersion` ticks,
 * which the `outcomeMetaUpdates` WS subscription bumps on create/settle events.
 */
export const useOutcomeMeta = () => {
  const { sdkInfoClient, outcomeMetaVersion } = useHyperliquidStore(
    useShallow((state) => ({
      sdkInfoClient: state.sdkInfoClient,
      outcomeMetaVersion: state.outcomeMetaVersion
    }))
  )

  const metaQuery = useQuery<RawOutcomeMeta | undefined>({
    queryKey: ['outcomeMeta'],
    queryFn: async () => {
      if (!sdkInfoClient) return
      return (await sdkInfoClient.outcomeMeta()) as RawOutcomeMeta
    },
    enabled: !!sdkInfoClient,
    // Markets are created/settled on a cadence of minutes; the WS bumps us sooner.
    staleTime: 60_000,
    refetchInterval: 5 * 60_000
  })

  const templatesQuery = useQuery<OutcomeTemplate[] | undefined>({
    queryKey: ['outcomeTemplates'],
    queryFn: async () => {
      if (!sdkInfoClient) return
      return (await sdkInfoClient.outcomeTemplates()) as unknown as OutcomeTemplate[]
    },
    enabled: !!sdkInfoClient,
    staleTime: Infinity,
    gcTime: Infinity
  })

  const refetchMeta = metaQuery.refetch
  useEffect(() => {
    if (outcomeMetaVersion === 0) return
    refetchMeta()
  }, [outcomeMetaVersion, refetchMeta])

  const resolved: ResolvedOutcomeMeta = useMemo(
    () => resolveOutcomeMeta(metaQuery.data, templatesQuery.data),
    [metaQuery.data, templatesQuery.data]
  )

  return {
    meta: metaQuery.data,
    templates: templatesQuery.data,
    resolved,
    isLoading: metaQuery.isLoading || templatesQuery.isLoading,
    isReady: !!metaQuery.data && !!templatesQuery.data,
    error: metaQuery.error ?? templatesQuery.error,
    refetch: refetchMeta
  }
}
