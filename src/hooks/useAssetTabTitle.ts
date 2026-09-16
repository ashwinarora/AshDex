'use client'

import { useEffect } from 'react'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { DEFAULT_PAGE_TITLE } from '@/config/appMeta'
import { formatPrice } from '@/utils/utils'

interface Options {
  asset: string
  isSpot: boolean
}

const formatWithLocale = (n: number): string => {
  if (!Number.isFinite(n)) return ''
  // Preserve the exact decimal count formatPrice chose (which respects
  // szDecimals + Hyperliquid's sig-fig rule) and only add thousand separators.
  const s = n.toString()
  const [intPart, fracPart] = s.split('.')
  const withCommas = Number(intPart).toLocaleString('en-US')
  return fracPart ? `${withCommas}.${fracPart}` : withCommas
}

export const useAssetTabTitle = ({ asset, isSpot }: Options) => {
  const allMids = useHyperliquidStore((s) => s.allMids)
  const perpsMeta = useHyperliquidStore((s) => s.perpsMeta)
  const spotAssetContext = useHyperliquidStore((s) => s.spotAssetContext)
  const { data: spotMeta, spotKeyToName, spotKeyToBaseName } = useSpotMeta()

  useEffect(() => {
    if (!asset) {
      document.title = DEFAULT_PAGE_TITLE
      return
    }

    let symbol: string | null = null
    let priceStr: string | null = null

    if (isSpot) {
      if (!spotMeta) return
      const universe = spotMeta.universe.find(
        (u) =>
          u.name.toUpperCase() === asset ||
          (spotKeyToName.get(u.name) ?? '').toUpperCase() === asset
      )
      if (!universe) return
      const base = spotKeyToName.get(universe.name)
      const quote = spotKeyToBaseName.get(universe.name)
      if (!base || !quote) return
      symbol = `${base}/${quote}`

      // The store filters spotAssetContext by volume, which reorders indices —
      // don't use `universe.index` to look up. Each ctx carries its universe
      // `coin` name (e.g. "PURR/USDC"), which is the reliable key.
      const ctx = spotAssetContext.find((c) => c.coin === universe.name)
      const rawPrice = ctx?.midPx ?? ctx?.markPx
      if (rawPrice != null) {
        const priceNum = Number(rawPrice)
        if (Number.isFinite(priceNum) && priceNum > 0) {
          const baseTokenIdx = universe.tokens[0]
          const szDecimals = spotMeta.tokens[baseTokenIdx]?.szDecimals ?? 0
          priceStr = formatWithLocale(formatPrice(priceNum, szDecimals, true))
        }
      }
    } else {
      if (!perpsMeta) return
      const entry = perpsMeta.universe.find((u) => u.name === asset)
      if (!entry) return
      symbol = entry.name

      const rawPrice = allMids[asset]
      if (rawPrice != null) {
        const priceNum = Number(rawPrice)
        if (Number.isFinite(priceNum) && priceNum > 0) {
          priceStr = formatWithLocale(formatPrice(priceNum, entry.szDecimals, false))
        }
      }
    }

    if (symbol && priceStr) {
      document.title = `$${priceStr} · ${symbol} — AshDex`
    }
  }, [asset, isSpot, allMids, perpsMeta, spotAssetContext, spotMeta, spotKeyToName, spotKeyToBaseName])

  useEffect(() => {
    return () => {
      document.title = DEFAULT_PAGE_TITLE
    }
  }, [])
}
