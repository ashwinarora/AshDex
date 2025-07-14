'use client'
import { useEffect, useRef, useState } from 'react'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import * as hl from '@nktkas/hyperliquid'
import { useShallow } from 'zustand/react/shallow'

interface BarData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const INTERVALS = ['1', '5', '15', '30', '60', '240', '1d', '1w', '1M', '1h', '4h'] as const

type IntervalType = (typeof INTERVALS)[number]

const getIntervalMinutes = (res: IntervalType): number => {
  const map: Record<IntervalType, number> = {
    '1': 1,
    '5': 5,
    '15': 15,
    '30': 30,
    '60': 60,
    '1h': 60,
    '4h': 240,
    '240': 240,
    '1d': 1440,
    '1w': 10080,
    '1M': 43200
  }
  return map[res]
}

interface TradingViewWidget {
  new (config: TradingViewWidgetConfig): TradingViewWidgetInstance
}

interface TradingViewWidgetInstance {
  remove(): void
  onChartReady(callback: () => void): void
  activeChart(): {
    setSymbol: (symbol: string, interval: string) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createShape: (point: { price: number }, options: any) => Promise<string>
    removeAllShapes: () => void
    removeEntity: (shapeId: string) => void
  }
}

interface ThemeColors {
  color1: string[]
  color2: string[]
  color3: string[]
  color4: string[]
  color5: string[]
  color6: string[]
  color7: string[]
  white: string
  black: string
}

interface CustomThemes {
  dark: ThemeColors
  light: ThemeColors
}

interface TradingViewWidgetConfig {
  symbol: string
  debug: boolean
  interval: string
  timeframe: string
  container: HTMLElement | null
  datafeed: Datafeed
  library_path: string
  locale: string
  theme: string
  autosize: boolean
  disabled_features: string[]
  overrides: Record<string, string>
  custom_themes: CustomThemes
}

interface PeriodParams {
  countBack: number
  firstDataRequest: boolean
  from: number
  to: number
}

interface Datafeed {
  onReady: (callback: DatafeedCallback) => void
  resolveSymbol: (symbolName: string, onResolve: (symbolInfo: SymbolInfo) => void) => void
  getBars: (
    symbolInfo: SymbolInfo,
    resolution: IntervalType,
    periodParams: PeriodParams,
    onHistoryCallback: HistoryCallback,
    onErrorCallback: ErrorCallback
  ) => void
  subscribeBars: (
    symbolInfo: SymbolInfo,
    resolution: IntervalType,
    onRealtimeCallback: RealtimeCallback,
    subscriberUID: string
  ) => void
  unsubscribeBars: (subscriberUID: string) => void
}

declare global {
  interface Window {
    TradingView: {
      widget: TradingViewWidget
    }
  }
}

interface DatafeedCallback {
  (data: { supported_resolutions: readonly string[] }): void
}

interface SymbolInfo {
  symbol: string
  exchange: string
  type: string
  session: string
  timezone: string
  supported_resolutions: readonly string[]
  pricescale: number
  minmov: number
  has_intraday: boolean
  has_daily: boolean
  has_weekly_and_monthly: boolean
}

interface HistoryCallback {
  (bars: BarData[], meta: { noData: boolean }): void
}

interface ErrorCallback {
  (error: string): void
}

interface RealtimeCallback {
  (bar: BarData): void
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
  const orderToShape = useRef<Map<number, string>>(new Map())
  const positionToShape = useRef<Map<string, string>>(new Map())

  // Convert TradingView resolution to Hyperliquid interval
  const convertedResolutionToInterval = (resolution: IntervalType) => {
    return resolution.endsWith('D')
      ? '1d'
      : resolution.endsWith('W')
        ? '1w'
        : resolution.endsWith('M')
          ? '1M'
          : Number(resolution) >= 60
            ? `${Number(resolution) / 60}h`
            : `${Number(resolution)}m`
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

  // Update asset ref and initialize cache when asset changes
  useEffect(() => {
    selectedAssetRef.current = selectedAsset

    // Initialize cache for new asset if it doesn't exist
    if (!barsCache.current[selectedAsset]) {
      barsCache.current[selectedAsset] = {
        '1': new Map(),
        '5': new Map(),
        '15': new Map(),
        '30': new Map(),
        '1h': new Map(),
        '60': new Map(),
        '4h': new Map(),
        '240': new Map(),
        '1d': new Map(),
        '1w': new Map(),
        '1M': new Map()
      }
    }
  }, [selectedAsset])

  // Create datafeed once when SDK is available
  useEffect(() => {
    if (!sdkInfoClient) return

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
          if (!sdkInfoClient || !currentAsset) {
            onErrorCallback('SDK or asset not available')
            return
          }
          const intervalSeconds =
            getIntervalMinutes(convertedResolutionToInterval(resolution) as IntervalType) * 60
          const now = Math.floor(Date.now() / 1000)
          const to = periodParams.to || now
          const countBack = periodParams?.countBack || 300
          const from = to - countBack * intervalSeconds
          const interval = convertedResolutionToInterval(resolution)

          const rawCandles = await sdkInfoClient.candleSnapshot({
            coin: currentAsset,
            interval: interval as hl.EventCandleParameters['interval'],
            startTime: from * 1000, // Keep in seconds for Hyperliquid API
            endTime: to * 1000 // Keep in seconds for Hyperliquid API
          })

          // Process candles properly - TradingView expects timestamps in SECONDS
          const bars = rawCandles.map((bar: hl.Candle) => ({
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
              '5': new Map(),
              '15': new Map(),
              '30': new Map(),
              '60': new Map(),
              '1h': new Map(),
              '4h': new Map(),
              '240': new Map(),
              '1d': new Map(),
              '1w': new Map(),
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
          if (!sdkInfoClient || !currentAsset) return

          const interval = convertedResolutionToInterval(
            resolution
          ) as hl.EventCandleParameters['interval']
          let lastBar: BarData | undefined

          const candleHandler = (payload: hl.Candle[] | hl.Candle) => {
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
            unsubscribeFromCandle(currentAsset, interval)
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
  }, [sdkInfoClient])

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
          'widget_logo',
          'compare_symbols'
        ],
        overrides: {
          'paneProperties.background': '#0F0816',
          'mainSeriesProperties.candleStyle.upColor': '#2fa766',
          'mainSeriesProperties.candleStyle.downColor': '#F6465D',
          timezone: getEtcGMTTimezone()
        },
        custom_themes: {
          dark: {
            color1: [
              '#fbefea',
              '#f7dfd5',
              '#f3cfc0',
              '#efbfaa',
              '#ebaf95',
              '#e89f80',
              '#e48f6b',
              '#e07f56',
              '#dc6f41',
              '#5F46F9',
              '#d03f01',
              '#5F46F9',
              '#ad3501',
              '#9c2f01',
              '#8b2a01',
              '#792501',
              '#682001',
              '#571a00',
              '#451500',
              '#341000'
            ],
            color2: [
              '#e4e4e5',
              '#d7d6d8',
              '#cac8cb',
              '#bcbabe',
              '#afadb1',
              '#a29fa4',
              '#949197',
              '#87848a',
              '#7a767e',
              '#6c6871',
              '#5f5a64',
              '#524d57',
              '#443f4a',
              '#37313d',
              '#2a2330',
              '#140B1E',
              '#140B1E',
              '#140B1E',
              '#0a050f',
              '#050307'
            ],
            color3: [
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a',
              '#e2464a'
            ],
            color4: [
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766',
              '#2fa766'
            ],
            color5: [
              '#fffff0',
              '#ffffe0',
              '#feffd1',
              '#feffc2',
              '#feffb2',
              '#feffa3',
              '#fdff94',
              '#fdff84',
              '#fdff75',
              '#fdff66',
              '#fcff47',
              '#e7ea41',
              '#d2d53b',
              '#bdbf35',
              '#a8aa2f',
              '#939529',
              '#7e8024',
              '#696a1e',
              '#545518',
              '#3f4012'
            ],
            color6: [
              '#fff1ff',
              '#ffe2ff',
              '#ffd4ff',
              '#ffc5ff',
              '#ffb7ff',
              '#ffa9ff',
              '#ff9aff',
              '#ff8cff',
              '#ff7dff',
              '#ff6fff',
              '#ff52ff',
              '#ea4bea',
              '#d544d5',
              '#bf3ebf',
              '#aa37aa',
              '#953095',
              '#802980',
              '#6a226a',
              '#551b55',
              '#401540'
            ],
            color7: [
              '#eff8ff',
              '#dff1ff',
              '#cfeaff',
              '#bee3ff',
              '#aedcff',
              '#9ed5ff',
              '#8eceff',
              '#7ec7ff',
              '#6ec0ff',
              '#5db9ff',
              '#3dabff',
              '#389dea',
              '#338fd5',
              '#2e80bf',
              '#2972aa',
              '#246495',
              '#1f5680',
              '#19476a',
              '#143955',
              '#0f2b40'
            ],
            white: '#ffffff',
            black: '#000000'
          },
          light: {
            color1: [
              '#fbefea',
              '#f7dfd5',
              '#f3cfc0',
              '#efbfaa',
              '#ebaf95',
              '#e89f80',
              '#e48f6b',
              '#e07f56',
              '#dc6f41',
              '#d85f2b',
              '#d03f01',
              '#bf3a01',
              '#ad3501',
              '#9c2f01',
              '#8b2a01',
              '#792501',
              '#682001',
              '#571a00',
              '#451500',
              '#341000'
            ],
            color2: [
              '#e4e4e5',
              '#d7d6d8',
              '#cac8cb',
              '#bcbabe',
              '#afadb1',
              '#a29fa4',
              '#949197',
              '#87848a',
              '#7a767e',
              '#6c6871',
              '#5f5a64',
              '#524d57',
              '#443f4a',
              '#37313d',
              '#2a2330',
              '#1c1623',
              '#0f0816',
              '#0F0816',
              '#0a050f',
              '#050307'
            ],
            color3: [
              '#fff0f0',
              '#ffe1e1',
              '#ffd3d3',
              '#ffc4c4',
              '#ffb5b5',
              '#ffa6a6',
              '#ff9797',
              '#ff8888'
            ],
            color4: [
              '#f2fdf8',
              '#e5faf0',
              '#d7f8e9',
              '#caf5e1',
              '#bdf3da',
              '#b0f1d2',
              '#a2eecb',
              '#95ecc3',
              '#88e9bc',
              '#7be7b4',
              '#60e2a5',
              '#58cf97',
              '#50bc8a',
              '#48aa7c',
              '#40976e',
              '#388460',
              '#307153',
              '#285e45',
              '#204b37',
              '#183929'
            ],
            color5: [
              '#fef5ea',
              '#fdecd5',
              '#fbe2bf',
              '#fad9aa',
              '#f9cf95',
              '#f8c680',
              '#f6bc6a',
              '#f5b255',
              '#f4a940',
              '#f39f2b',
              '#f08c00',
              '#dc8000',
              '#c87500',
              '#b46900',
              '#a05d00',
              '#8c5200',
              '#784600',
              '#643a00',
              '#502f00',
              '#3c2300'
            ],
            color6: [
              '#feeafe',
              '#fcd5fc',
              '#fbbffb',
              '#f9aaf9',
              '#f895f8',
              '#f780f7',
              '#f56af5',
              '#f455f4',
              '#f240f2',
              '#f12bf1',
              '#ee00ee',
              '#da00da',
              '#c600c6',
              '#b300b3',
              '#9f009f',
              '#8b008b',
              '#770077',
              '#630063',
              '#4f004f',
              '#3c003c'
            ],
            color7: [
              '#fefeea',
              '#fcfcd5',
              '#fbfbbf',
              '#f9f9aa',
              '#f8f895',
              '#f7f780',
              '#f5f56a',
              '#f4f455',
              '#f2f240',
              '#f1f12b',
              '#eeee00',
              '#dada00',
              '#c6c600',
              '#b3b300',
              '#9f9f00',
              '#8b8b00',
              '#777700',
              '#636300',
              '#4f4f00',
              '#3c3c00'
            ],
            white: '#f2e6ff',
            black: '#421b50'
          }
        }
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

  const showOrderLineShape = async (isBuy: boolean, price: string, qty: string) => {
    const chart = widgetRef.current?.activeChart()
    if (!chart) return

    // Draw a horizontal line + label
    const shape = await chart.createShape(
      { price: Number(price) },
      {
        shape: 'horizontal_line',
        text: `${isBuy ? 'Buy' : 'Sell'} · ${qty} @ ${price}`,
        // style it however you like:
        overrides: {
          showLabel: true,
          labelBackgroundColor: 'rgba(47,167,102,0.1)',
          textColor: '#2fa766',
          fontSize: 13,
          borderColor: '#2fa766',
          borderWidth: 2,
          OverrideLineStyle: 2
        },
        disableSelection: true,
        disableSave: true,
        lock: true
      }
    )
    return shape
  }

  const showPositionLine = async (isLong: boolean, price: string, qty: string) => {
    const chart = widgetRef.current?.activeChart()
    if (!chart) return

    const color = isLong ? '#2ae800' : '#ff0000' // green or red
    const bg = isLong ? 'rgba(42,232,0,0.1)' : 'rgba(255,0,0,0.1)'

    const shapeId = await chart.createShape(
      { price: Number(price) },
      {
        shape: 'horizontal_line',
        text: `${isLong ? 'Long' : 'Short'} · ${qty} @ ${price}`,
        overrides: {
          showLabel: true,
          labelBackgroundColor: bg,
          textColor: color,
          fontColor: color,
          fontSize: 13,
          borderColor: color,
          borderWidth: 2,
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

  // Update chart when asset or interval changes
  useEffect(() => {
    if (widgetRef.current) {
      try {
        widgetRef.current.activeChart().setSymbol(selectedAsset, selectedInterval)
        widgetRef.current.activeChart().removeAllShapes()
        orderToShape.current.clear()
        positionToShape.current.clear()
      } catch (e) {
        console.error('Chart update error:', e)
      }
    }
  }, [selectedAsset, selectedInterval])

  useEffect(() => {
    if (!widgetRef.current) return
    openOrders.forEach(async (order) => {
      if (order.coin !== selectedAsset) return
      const shapeExists = orderToShape.current.get(order.oid)
      if (shapeExists) return
      const shapeId = await showOrderLineShape(order.side === 'B', order.limitPx, order.sz)
      if (!shapeId) return
      orderToShape.current.set(order.oid, shapeId)
    })
    if (openOrders.length !== orderToShape.current.size) {
      // Find orders in orderToShape that are no longer in openOrders
      const openOrderIds = new Set(openOrders.map((order) => order.oid))
      for (const [orderId, shapeId] of orderToShape.current.entries()) {
        if (!openOrderIds.has(orderId)) {
          // Remove the shape from the chart
          widgetRef.current.activeChart().removeEntity(shapeId)
          orderToShape.current.delete(orderId)
        }
      }
    }
  }, [openOrders])

  useEffect(() => {
    if (!widgetRef.current) return
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
  }, [clearingHouseState])

  return (
    <div className="rounded-md p-2 bg-secondary w-full h-full md:h-[576px] xl:h-full">
      <div ref={chartRef} className="w-full h-full" />
    </div>
  )
}

export default TradingViewChart
