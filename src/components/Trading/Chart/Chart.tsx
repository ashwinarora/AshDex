'use client'
import { useEffect, useRef, useState } from 'react'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import * as hl from '@nktkas/hyperliquid'
import { useShallow } from 'zustand/react/shallow'
import {
  BarData,
  customThemes,
  Datafeed,
  DatafeedCallback,
  ErrorCallback,
  HistoryCallback,
  INTERVALS,
  IntervalType,
  PeriodParams,
  RealtimeCallback,
  SymbolInfo,
  TradingViewWidget,
  TradingViewWidgetInstance
} from './ChartTypes'

const getIntervalMinutes = (res: IntervalType): number => {
  const map: Record<IntervalType, number> = {
    '1': 1,
    '3': 3,
    '5': 5,
    '15': 15,
    '30': 30,
    '60': 60,
    '120': 120,
    '240': 240,
    '480': 480,
    '720': 720,
    '1D': 1440,
    '3D': 4320,
    '1W': 10080,
    '1M': 43200
  }
  return map[res]
}

// Convert TradingView resolution to Hyperliquid interval
// const convertedResolutionToInterval = (resolution: IntervalType) => {
//   if (resolution.endsWith('D')) {
//     return '1d'
//   } else if (resolution.endsWith('W')) {
//     return '1w'
//   } else if (resolution.endsWith('M')) {
//     return '1M'
//   } else if (Number(resolution) >= 60) {
//     return `${Number(resolution) / 60}h`
//   } else {
//     return `${Number(resolution)}`
//   }
// }

const convertToHyperliquidInterval = (
  resolution: IntervalType
): hl.WsCandleParameters['interval'] => {
  const intervalMap: Record<IntervalType, hl.WsCandleParameters['interval']> = {
    '1': '1m',
    '3': '3m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1h',
    '120': '2h',
    '240': '4h',
    '480': '8h',
    '720': '12h',
    '1D': '1d',
    '3D': '3d',
    '1W': '1w',
    '1M': '1M'
  }

  return intervalMap[resolution]
}

// Get current timezone offset
const getEtcGMTTimezone = () => {
  const offsetMinutes = new Date().getTimezoneOffset()
  const totalMinutes = -offsetMinutes

  const sign = totalMinutes >= 0 ? '-' : '+'
  const absMinutes = Math.abs(totalMinutes)
  const hours = String(Math.floor(absMinutes / 60)).padStart(2, '0')
  const minutes = String(absMinutes % 60).padStart(2, '0')

  return `Etc/GMT${sign}${hours}:${minutes}`
}

declare global {
  interface Window {
    TradingView: {
      widget: TradingViewWidget
    }
  }
}

const TradingViewChart = ({
  selectedAsset,
  selectedInterval = '30'
}: {
  selectedAsset: string
  selectedInterval: IntervalType
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<TradingViewWidgetInstance | null>(null)
  const tvSubscribersRef = useRef<Record<string, () => void>>({})
  const barsCache = useRef<Record<string, Record<IntervalType, Map<number, BarData>>>>({})
  const selectedAssetRef = useRef(selectedAsset)
  const {
    sdkInfoClient,
    subscribeToCandle,
    unsubscribeFromCandle,
    clearingHouseState,
    openOrders
  } = useHyperliquidStore(
    useShallow((state) => ({
      sdkInfoClient: state.sdkInfoClient,
      subscribeToCandle: state.subscribeToCandle,
      unsubscribeFromCandle: state.unsubscribeFromCandle,
      clearingHouseState: state.clearingHouseState,
      openOrders: state.openOrders
    }))
  )
  const [datafeed, setDatafeed] = useState<Datafeed | null>(null)
  const orderToShape = useRef<Map<string, string>>(new Map())
  const positionToShape = useRef<Map<string, string>>(new Map())
  const liquidationToShape = useRef<Map<string, string>>(new Map())

  // Update asset ref and initialize cache when asset changes
  useEffect(() => {
    selectedAssetRef.current = selectedAsset

    // Initialize cache for new asset if it doesn't exist
    if (!barsCache.current[selectedAsset]) {
      barsCache.current[selectedAsset] = {
        '1': new Map(),
        '3': new Map(),
        '5': new Map(),
        '15': new Map(),
        '30': new Map(),
        '60': new Map(),
        '120': new Map(),
        '240': new Map(),
        '480': new Map(),
        '720': new Map(),
        '1D': new Map(),
        '3D': new Map(),
        '1W': new Map(),
        '1M': new Map()
      }
    }
  }, [selectedAsset])

  // Create datafeed once - don't recreate when SDK changes
  useEffect(() => {
    const datafeed: Datafeed = {
      onReady: (cb: DatafeedCallback) =>
        setTimeout(() => cb({ supported_resolutions: INTERVALS }), 0),

      resolveSymbol: (_, onResolve) => {
        setTimeout(
          () =>
            onResolve({
              symbol: selectedAssetRef.current,
              exchange: 'Hyperliquid',
              type: 'crypto',
              session: '24x7',
              timezone: 'Etc/GMT+4',
              supported_resolutions: INTERVALS,
              pricescale: 100,
              minmov: 1,
              has_intraday: true,
              has_daily: true,
              has_weekly_and_monthly: true
            }),
          0
        )
      },

      getBars: async (
        symbolInfo: SymbolInfo,
        resolution: IntervalType,
        periodParams: PeriodParams,
        onHistoryCallback: HistoryCallback,
        onErrorCallback: ErrorCallback
      ) => {
        try {
          const currentAsset = selectedAssetRef.current
          // Get sdkInfoClient from store dynamically instead of depending on it
          const store = useHyperliquidStore.getState()
          const sdkInfoClient = store.sdkInfoClient

          if (!sdkInfoClient || !currentAsset) {
            onErrorCallback('SDK or asset not available')
            return
          }
          const intervalSeconds = getIntervalMinutes(resolution) * 60
          const now = Math.floor(Date.now() / 1000)
          const to = periodParams.to || now
          const countBack = periodParams?.countBack || 300
          const from = to - countBack * intervalSeconds
          const interval = convertToHyperliquidInterval(resolution)

          const rawCandles = await sdkInfoClient.candleSnapshot({
            coin: currentAsset,
            interval: interval as hl.WsCandleParameters['interval'],
            startTime: from * 1000, // Keep in seconds for Hyperliquid API
            endTime: to * 1000 // Keep in seconds for Hyperliquid API
          })

          // Process candles properly - TradingView expects timestamps in SECONDS
          const bars = rawCandles.map((bar: hl.WsCandleEvent) => ({
            time: Number(Math.floor(Number(bar.t))),
            open: parseFloat(bar.o.toString()),
            high: parseFloat(bar.h.toString()),
            low: parseFloat(bar.l.toString()),
            close: parseFloat(bar.c.toString()),
            volume: parseFloat(bar.v.toString())
          }))

          // Initialize cache for asset if not exists
          if (!barsCache.current[currentAsset]) {
            barsCache.current[currentAsset] = {
              '1': new Map(),
              '3': new Map(),
              '5': new Map(),
              '15': new Map(),
              '30': new Map(),
              '60': new Map(),
              '120': new Map(),
              '240': new Map(),
              '480': new Map(),
              '720': new Map(),
              '1D': new Map(),
              '3D': new Map(),
              '1W': new Map(),
              '1M': new Map()
            }
          }

          // Update cache with timestamp as key (in seconds)
          const cache = barsCache.current[currentAsset][resolution]
          bars.forEach((bar: BarData) => cache.set(bar.time, bar))

          // For first data request, return all available bars
          // For subsequent requests, limit to countBack
          const outputBars = periodParams?.firstDataRequest ? bars : bars.slice(-countBack)

          onHistoryCallback(outputBars, {
            noData: outputBars.length === 0
          })
        } catch (err) {
          console.error('Error fetching bars:', err)
          onErrorCallback('Data error: ' + String(err))
        }
      },

      subscribeBars: (
        symbolInfo: SymbolInfo,
        resolution: IntervalType,
        onRealtimeCallback: RealtimeCallback,
        subscriberUID: string
      ) => {
        try {
          const currentAsset = selectedAssetRef.current
          // Get fresh store functions and state
          const store = useHyperliquidStore.getState()
          const sdkInfoClient = store.sdkInfoClient
          const subscribeToCandle = store.subscribeToCandle
          const unsubscribeFromCandle = store.unsubscribeFromCandle

          if (!sdkInfoClient || !currentAsset) return

          const interval = convertToHyperliquidInterval(
            resolution
          ) as hl.WsCandleParameters['interval']
          let lastBar: BarData | undefined

          const candleHandler = (payload: hl.WsCandleEvent[] | hl.WsCandleEvent) => {
            const candles = Array.isArray(payload) ? payload : [payload]

            candles.forEach((c) => {
              const bar: BarData = {
                time: Number(c.t),
                open: +c.o,
                high: +c.h,
                low: +c.l,
                close: +c.c,
                volume: +c.v
              }

              if (lastBar && bar.time === lastBar.time) {
                lastBar = {
                  ...bar,
                  open: lastBar.open,
                  high: Math.max(lastBar.high, bar.high),
                  low: Math.min(lastBar.low, bar.low),
                  volume: bar.volume
                }
                onRealtimeCallback(lastBar)
              } else {
                lastBar = bar
                onRealtimeCallback(bar)
              }

              // Update cache
              if (barsCache.current[currentAsset]?.[resolution]) {
                barsCache.current[currentAsset][resolution].set(bar.time, bar)
              }
            })
          }

          subscribeToCandle(currentAsset, interval, candleHandler)

          // Store cleanup callback
          tvSubscribersRef.current[subscriberUID] = () => {
            unsubscribeFromCandle(currentAsset, interval).catch(console.error)
          }
        } catch (e) {
          console.error('Subscription error:', e)
        }
      },

      unsubscribeBars: (subscriberUID: string) => {
        const cleanup = tvSubscribersRef.current[subscriberUID]
        if (cleanup) {
          cleanup()
          delete tvSubscribersRef.current[subscriberUID]
        }
      }
    }

    setDatafeed(datafeed)
    return () => {
      // Cleanup any active subscriptions
      Object.values(tvSubscribersRef.current).forEach((cleanup) => cleanup())
      tvSubscribersRef.current = {}
    }
  }, [subscribeToCandle, unsubscribeFromCandle]) // Include subscription functions as dependencies

  // Initialize TradingView widget
  useEffect(() => {
    if (!chartRef.current || !datafeed || widgetRef.current) return

    const scriptId = 'tv-widget-script'
    const existingScript = document.getElementById(scriptId)

    const initWidget = () => {
      if (!window.TradingView || typeof window.TradingView.widget !== 'function') {
        setTimeout(initWidget, 100)
        return
      }

      widgetRef.current = new window.TradingView.widget({
        symbol: selectedAssetRef.current,
        debug: false,
        interval: '60',
        timeframe: '12M',
        container: chartRef.current,
        datafeed,
        library_path: '/lib/',
        locale: 'en',
        theme: 'dark',
        autosize: true,
        // @ts-expect-error - enabled_features is not in the type
        enabled_features: [
          'hide_left_toolbar_by_default',
          'hide_unresolved_symbols_in_legend',
          'hide_image_invalid_symbol'
        ],
        disabled_features: [
          'use_localstorage_for_settings',
          'header_symbol_search',
          'compare_symbols'
        ],
        overrides: {
          'paneProperties.background': '#0F0816',
          'mainSeriesProperties.candleStyle.upColor': '#2fa766',
          'mainSeriesProperties.candleStyle.downColor': '#F6465D',
          timezone: getEtcGMTTimezone()
        },
        custom_themes: customThemes
      })

      widgetRef.current.onChartReady(async () => {
        console.log('TradingView chart ready')
        // addStyledHorizontalLine(100000, 'Support LevelBoo', {
        //   color: '#2fa766',
        //   textColor: '#2fa766',
        //   fontSize: 14,
        //   backgroundColor: 'rgba(47, 167, 102, 0.1)'
        // })
      })
    }

    if (!existingScript) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = '/lib/charting_library.standalone.js'
      script.async = true
      script.onload = initWidget
      document.head.appendChild(script)
    } else {
      initWidget()
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove()
        widgetRef.current = null
      }
    }
  }, [datafeed])

  const showOrderLineShape = async (isBuy: boolean, price: string, qty: string, label?: string) => {
    if (!widgetRef.current) return
    const chart = widgetRef.current?.activeChart()
    if (!chart) return

    // Decide colors based on label (TP green, SL red, default green)
    const isSl = label === 'SL'
    const color = isSl ? '#F6465D' : '#2fa766'
    const bg = isSl ? 'rgba(246,70,93,0.85)' : 'rgba(47,167,102,0.85)'

    // Draw a horizontal line + label
    const shape = await chart.createShape(
      { price: Number(price) },
      {
        shape: 'horizontal_line',
        text: `${label ?? (isBuy ? 'Buy' : 'Sell')}  ${qty} @ ${price}`,
        overrides: {
          showLabel: true,
          horzLabelsAlign: 'right',
          labelBackgroundColor: bg,
          textColor: '#ffffff',
          fontColor: '#ffffff',
          fontSize: 12,
          bold: true,
          borderColor: color,
          borderWidth: 1,
          linecolor: color,
          linewidth: 2,
          linestyle: 1
        },
        disableSelection: true,
        disableSave: true,
        lock: true
      }
    )
    return shape
  }

  const showPositionLine = async (isLong: boolean, price: string, qty: string) => {
    if (!widgetRef.current) return
    const chart = widgetRef.current?.activeChart()
    if (!chart) return

    const color = isLong ? '#2fa766' : '#F6465D'
    const bg = isLong ? 'rgba(47,167,102,0.85)' : 'rgba(246,70,93,0.85)'

    const shapeId = await chart.createShape(
      { price: Number(price) },
      {
        shape: 'horizontal_line',
        text: `${isLong ? 'Long' : 'Short'}  ${qty} @ ${price}`,
        overrides: {
          showLabel: true,
          horzLabelsAlign: 'right',
          labelBackgroundColor: bg,
          textColor: '#ffffff',
          fontColor: '#ffffff',
          fontSize: 12,
          bold: true,
          borderColor: color,
          borderWidth: 1,
          linecolor: color,
          linewidth: 2,
          linestyle: 0
        },
        disableSelection: true,
        disableSave: true,
        lock: true
      }
    )

    return shapeId
  }

  const showLiquidationLine = async (price: string, qty: string) => {
    if (!widgetRef.current) return
    const chart = widgetRef.current?.activeChart()
    if (!chart) return

    const color = '#ff9800'
    const bg = 'rgba(255,152,0,0.85)'
    const numericDisplayPrice = Number(price)
    const priceText = Number.isFinite(numericDisplayPrice)
      ? numericDisplayPrice.toFixed(2)
      : String(price)

    const shapeId = await chart.createShape(
      { price: Number(price) },
      {
        shape: 'horizontal_line',
        text: `Liq  ${qty} @ ${priceText}`,
        overrides: {
          showLabel: true,
          horzLabelsAlign: 'right',
          labelBackgroundColor: bg,
          textColor: '#ffffff',
          fontColor: '#ffffff',
          fontSize: 12,
          bold: true,
          borderColor: color,
          borderWidth: 1,
          linecolor: color,
          linewidth: 2,
          linestyle: 1
        },
        disableSelection: true,
        disableSave: true,
        lock: true
      }
    )

    return shapeId
  }

  // Update chart when asset or interval changes
  useEffect(() => {
    if (widgetRef.current) {
      try {
        widgetRef.current.activeChart().setSymbol(selectedAsset, selectedInterval)
        widgetRef.current.activeChart().removeAllShapes()
        orderToShape.current.clear()
        positionToShape.current.clear()
        liquidationToShape.current.clear()
      } catch (e) {
        console.error('Chart update error:', e)
      }
    }
  }, [selectedAsset, selectedInterval])

  // Handle asset changes by updating subscriptions
  useEffect(() => {
    // Clean up existing subscriptions when asset changes
    Object.values(tvSubscribersRef.current).forEach((cleanup) => cleanup())
    tvSubscribersRef.current = {}

    // The TradingView widget will automatically call subscribeBars again
    // with the new asset when setSymbol is called above
  }, [selectedAsset])

  // Clear wallet-specific shapes when wallet disconnects
  useEffect(() => {
    if (!widgetRef.current) return

    const store = useHyperliquidStore.getState()
    if (!store.sdkInfoClient) {
      // Wallet disconnected, clear all wallet-specific shapes
      try {
        widgetRef.current.activeChart().removeAllShapes()
        orderToShape.current.clear()
        positionToShape.current.clear()
        liquidationToShape.current.clear()
      } catch (e) {
        console.error('Error clearing shapes:', e)
      }
    }
  }, [sdkInfoClient])

  useEffect(() => {
    if (!widgetRef.current) return

    // Only show order lines if we have a wallet connection
    const store = useHyperliquidStore.getState()
    if (!store.sdkInfoClient) return

    const chart = widgetRef.current.activeChart()
    if (!chart) return

    // Helper to generate a unique key for an order shape
    // For trigger orders (TP/SL), use triggerPx as key to avoid duplicates from optimistic updates
    const getOrderShapeKey = (order: (typeof openOrders)[number]): string => {
      const isTrigger =
        order.isTrigger === true ||
        (order.orderType || '').toString().toLowerCase().includes('take profit') ||
        (order.orderType || '').toString().toLowerCase().includes('stop')

      if (isTrigger && order.triggerPx) {
        // For trigger orders, use triggerPx as a stable key (optimistic + real orders have same triggerPx)
        return `trigger-${order.coin}-${order.triggerPx}-${order.side}`
      }
      // For regular orders, use oid
      return `order-${order.oid}`
    }

    // Prefer showing TP/SL trigger orders if present; otherwise show normal orders (first and last)
    const filteredOrders = openOrders.filter((order) => order.coin === selectedAsset)
    const triggerOrders = filteredOrders.filter((order) => {
      const type = (order.orderType || '').toString().toLowerCase()
      return order.isTrigger === true || type.includes('take profit') || type.includes('stop')
    })

    // Deduplicate trigger orders by triggerPx (optimistic + real orders may both exist)
    const seenTriggerPrices = new Set<string>()
    const uniqueTriggerOrders = triggerOrders.filter((order) => {
      const key = `${order.triggerPx}-${order.side}`
      if (seenTriggerPrices.has(key)) return false
      seenTriggerPrices.add(key)
      return true
    })

    const ordersToShow: typeof filteredOrders = []
    const source = uniqueTriggerOrders.length > 0 ? uniqueTriggerOrders : filteredOrders
    if (source.length === 1) {
      ordersToShow.push(source[0])
    } else if (source.length > 1) {
      ordersToShow.push(source[0], source[source.length - 1])
    }

    // Build set of keys that should have shapes
    const keysToShow = new Set(ordersToShow.map(getOrderShapeKey))

    // Cleanup FIRST: remove shapes that shouldn't exist anymore
    // This runs synchronously before any async shape creation
    for (const [shapeKey, shapeId] of orderToShape.current.entries()) {
      if (!keysToShow.has(shapeKey)) {
        try {
          chart.removeEntity(shapeId)
        } catch (e) {
          console.error('Error removing shape:', e)
        }
        orderToShape.current.delete(shapeKey)
      }
    }

    // Draw shapes for orders that don't have one yet (async, but cleanup already ran)
    const drawShapes = async () => {
      for (const order of ordersToShow) {
        const shapeKey = getOrderShapeKey(order)
        if (orderToShape.current.has(shapeKey)) continue

        const hasTrigger =
          order.isTrigger === true ||
          (order.orderType || '').toString().toLowerCase().includes('take profit') ||
          (order.orderType || '').toString().toLowerCase().includes('stop')

        const displayPrice = hasTrigger && order.triggerPx ? order.triggerPx : order.limitPx

        let label: string | undefined
        if (hasTrigger) {
          const type = (order.orderType || '').toString().toLowerCase()
          const condition = (order.triggerCondition || '').toString().toLowerCase()
          if (type.includes('take profit') || condition.includes('above')) {
            label = 'TP'
          } else if (type.includes('stop') || condition.includes('below')) {
            label = 'SL'
          } else {
            label = 'Trigger'
          }
        }

        try {
          const shapeId = await showOrderLineShape(order.side === 'B', displayPrice, order.sz, label)
          if (shapeId) {
            orderToShape.current.set(shapeKey, shapeId)
          }
        } catch (e) {
          console.error('Error creating shape:', e)
        }
      }
    }

    drawShapes()
  }, [openOrders, selectedAsset])

  useEffect(() => {
    if (!widgetRef.current) return

    // Only show position lines if we have a wallet connection
    const store = useHyperliquidStore.getState()
    if (!store.sdkInfoClient) return

    clearingHouseState?.assetPositions.forEach(async (p) => {
      if (p.position.coin !== selectedAsset) return
      const shapeExists = positionToShape.current.get(p.position.coin)
      if (shapeExists) return
      const shapeId = await showPositionLine(
        Number(p.position.szi) > 0,
        p.position.entryPx,
        p.position.szi
      )
      if (!shapeId) return
      positionToShape.current.set(p.position.coin, shapeId)
    })
    if (clearingHouseState?.assetPositions.length !== positionToShape.current.size) {
      const positionIds = new Set(
        clearingHouseState?.assetPositions.map((p) => p.position.coin) || []
      )
      for (const [positionId, shapeId] of positionToShape.current.entries()) {
        if (!positionIds.has(positionId)) {
          widgetRef.current.activeChart().removeEntity(shapeId)
          positionToShape.current.delete(positionId)
        }
      }
    }

    // Draw or update liquidation lines for current positions
    clearingHouseState?.assetPositions.forEach(async (p) => {
      if (p.position.coin !== selectedAsset) return
      const liqPx = String(p.position.liquidationPx)
      const existingId = liquidationToShape.current.get(p.position.coin)

      const numericLiqPx = Number(liqPx)
      const isValid = Number.isFinite(numericLiqPx) && numericLiqPx > 0

      if (!isValid) {
        if (existingId) {
          widgetRef.current?.activeChart().removeEntity(existingId)
          liquidationToShape.current.delete(p.position.coin)
        }
        return
      }

      // If already exists, remove to refresh at new price
      if (existingId) {
        widgetRef.current?.activeChart().removeEntity(existingId)
        liquidationToShape.current.delete(p.position.coin)
      }

      const liqShapeId = await showLiquidationLine(liqPx, p.position.szi)
      if (!liqShapeId) return
      liquidationToShape.current.set(p.position.coin, liqShapeId)
    })

    // Cleanup liquidation lines for coins no longer in positions
    const currentCoins = new Set(
      clearingHouseState?.assetPositions.map((p) => p.position.coin) || []
    )
    for (const [coin, shapeId] of liquidationToShape.current.entries()) {
      if (!currentCoins.has(coin)) {
        widgetRef.current.activeChart().removeEntity(shapeId)
        liquidationToShape.current.delete(coin)
      }
    }
  }, [clearingHouseState])

  return (
    <div className="rounded-md p-2 bg-secondary w-full h-full md:h-[576px] xl:h-full">
      <div ref={chartRef} className="w-full h-full" />
    </div>
  )
}

export default TradingViewChart
