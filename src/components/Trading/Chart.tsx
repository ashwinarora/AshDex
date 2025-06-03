'use client'
import { useEffect, useRef } from 'react'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { Candle } from '@/utils/hyperliquid/hyperLiquidTypes'

interface BarData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const INTERVALS = ['1', '5', '15', '30', '60', '240', 'D', 'W', 'M'] as const
type IntervalType = (typeof INTERVALS)[number]

const getIntervalMinutes = (res: IntervalType): number => {
  const map: Record<IntervalType, number> = {
    '1': 1,
    '5': 5,
    '15': 15,
    '30': 30,
    '60': 60,
    '240': 240,
    D: 1440,
    W: 10080,
    M: 43200
  }
  return map[res]
}

interface TradingViewWidget {
  new (config: TradingViewWidgetConfig): TradingViewWidgetInstance
}

interface TradingViewWidgetInstance {
  remove(): void
  onChartReady(callback: () => void): void
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

interface PeriodParams {
  from: number
  to: number
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
  const barsCache = useRef<Record<IntervalType, Map<number, BarData>>>({
    '1': new Map(),
    '5': new Map(),
    '15': new Map(),
    '30': new Map(),
    '60': new Map(),
    '240': new Map(),
    D: new Map(),
    W: new Map(),
    M: new Map()
  })

  const convertedResolutionToInterval = (resolution: IntervalType) => {
    return resolution.endsWith('D')
      ? '1d'
      : resolution.endsWith('W')
        ? '1w'
        : resolution.endsWith('M')
          ? '1m'
          : Number(resolution) >= 60
            ? `${Number(resolution) / 60}h`
            : `${Number(resolution)}m`
  }
  const intervalStr = convertedResolutionToInterval(selectedInterval)
  const { sdk } = useHyperliquid()

  useEffect(() => {
    if (!chartRef.current || widgetRef.current) return

    const scriptId = 'tv-widget-script'
    const existingScript = document.getElementById(scriptId)

    const initWidget = () => {
      if (!window.TradingView || typeof window.TradingView.widget !== 'function') {
        setTimeout(initWidget, 100)
        return
      }
      const tvSubscribers: Record<string, () => void> = {}

      const datafeed: Datafeed = {
        onReady: (cb: DatafeedCallback) =>
          setTimeout(() => cb({ supported_resolutions: INTERVALS }), 0),

        resolveSymbol: (_: string, onResolve: (symbolInfo: SymbolInfo) => void) => {
          setTimeout(
            () =>
              onResolve({
                symbol: selectedAsset,
                exchange: 'Hyperliquid',
                type: 'crypto',
                session: '24x7',
                timezone: 'Etc/UTC',
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

        getBars(
          symbolInfo: SymbolInfo,
          resolution: IntervalType,
          periodParams: PeriodParams,
          onHistoryCallback: HistoryCallback,
          onErrorCallback: ErrorCallback
        ) {
          setTimeout(async () => {
            if (!sdk || !selectedAsset || !selectedInterval) {
              onErrorCallback('SDK or asset not available')
              return
            }

            try {
              const intervalSeconds = getIntervalMinutes(resolution) * 60
              const now = Math.floor(Date.now() / 1000)

              const to = periodParams.to || now
              const countBack = periodParams?.countBack || 300
              const from = to - countBack * intervalSeconds
              const interval = convertedResolutionToInterval(resolution)

              const rawCandles = await sdk.info.getCandleSnapshot(
                selectedAsset,
                interval,
                from * 1000,
                to * 1000
              )

              const bars = rawCandles.map((bar: Candle) => ({
                time: Number(Math.floor(Number(bar.t))),
                open: parseFloat(bar.o.toString()),
                high: parseFloat(bar.h.toString()),
                low: parseFloat(bar.l.toString()),
                close: parseFloat(bar.c.toString()),
                volume: parseFloat(bar.v.toString())
              }))

              if (!barsCache.current[resolution]) {
                barsCache.current[resolution] = new Map()
              }

              const cache = barsCache.current[resolution]
              bars.forEach((bar: BarData) => cache.set(bar.time, bar))

              const mergedBars = Array.from(cache.values()).sort((a, b) => a.time - b.time)
              const responseBars = mergedBars.filter(
                (bar) => bar.time >= from * 1000 && bar.time < to * 1000
              )

              const finalBars =
                responseBars.length >= 2 ? responseBars : mergedBars.slice(-countBack)

              const outputBars = periodParams?.firstDataRequest
                ? finalBars
                : finalBars.slice(-countBack) // ✅ fixed reverse call

              onHistoryCallback(outputBars, {
                noData: outputBars.length === 0
              })
            } catch (err) {
              console.error('Error fetching bars:', err)
              onErrorCallback('Data error')
            }
          }, 50)
        },

        subscribeBars: (
          symbolInfo: SymbolInfo,
          resolution: IntervalType,
          onRealtimeCallback: RealtimeCallback,
          subscriberUID: string
        ) => {
          try {
            const coin = symbolInfo
            const interval = convertedResolutionToInterval(resolution) // e.g., "5m", "1h", etc.

            const ws = sdk?.ws
            if (!ws) {
              console.warn('Hyperliquid WebSocket not available')
              return
            }
            let lastBar: BarData | undefined

            const candleHandler = (payload: Candle[] | Candle) => {
              // The SDK sometimes sends an array (snapshot) and sometimes a single candle (update)
              const candles = Array.isArray(payload) ? payload : [payload]

              candles.forEach((c) => {
                const bar: BarData = {
                  time: Number(c.t), // milliseconds
                  open: +c.o,
                  high: +c.h,
                  low: +c.l,
                  close: +c.c,
                  volume: +c.v
                }

                // de-dupe / update logic
                if (lastBar && bar.time === lastBar.time) {
                  lastBar = {
                    ...bar,
                    open: lastBar.open, // opening price stays
                    high: Math.max(lastBar.high, bar.high),
                    low: Math.min(lastBar.low, bar.low),
                    volume: bar.volume
                  }
                  onRealtimeCallback(lastBar)
                } else {
                  lastBar = bar
                  onRealtimeCallback(bar)
                }
              })
            }

            // 👉  ***THE IMPORTANT BIT – pass the callback*** 👈
            sdk.subscriptions.subscribeToCandle(selectedAsset, interval, candleHandler)

            // Save a function that TradingView will call later
            tvSubscribers[subscriberUID] = () => {
              sdk.subscriptions.unsubscribeFromCandle(coin, interval)
            }
          } catch (e) {
            console.log(e)
          }
        },

        unsubscribeBars: (subscriberUID: string) => {
          console.warn('[TV unsubscribeBars] called', { subscriberUID })
          sdk.subscriptions.unsubscribeFromCandle(selectedAsset, selectedInterval)
        }
      }

      widgetRef.current = new window.TradingView.widget({
        symbol: selectedAsset,
        debug: false,
        interval: '60',
        timeframe: '1W',
        container: chartRef.current,
        datafeed,
        library_path: '/lib/',
        locale: 'en',
        theme: 'dark',
        autosize: true,
        disabled_features: [
          'use_localstorage_for_settings',
          'header_symbol_search',
          'compare_symbols'
        ],
        overrides: {
          'paneProperties.background': '#0F0816',
          'mainSeriesProperties.candleStyle.upColor': '#2fa766',
          'mainSeriesProperties.candleStyle.downColor': '#F6465D'
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
            // Color that overrides green
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
            // Color that overrides orange
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
            // Color that overrides purple
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
            // Color that overrides yellow
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

      widgetRef.current.onChartReady(() => {
        console.log('[TV] Chart is ready')
        // Additional logic to expand view if needed
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
  }, [selectedAsset, selectedInterval, sdk, intervalStr])

  return <div ref={chartRef} className="w-full h-full rounded-md" />
}

export default TradingViewChart
