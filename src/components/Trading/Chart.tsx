'use client';
import { useEffect, useRef } from 'react';
import { useHyperliquid } from '@/store/HyperliquidStore';
import { Candle } from '@/utils/hyperliquid/hyperLiquidTypes';

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
}

interface CustomThemes {
  dark: ThemeColors
  light: ThemeColors
}

interface TradingViewWidgetConfig {
  debug: boolean
  symbol: string
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
  name: string
  full_name: string
  ticker: string
  description: string
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
  const intervalStr = selectedInterval.endsWith('D')
    ? '1d'
    : selectedInterval.endsWith('W')
      ? '1w'
      : selectedInterval.endsWith('M')
        ? '1mo'
        : Number(selectedInterval) >= 60
          ? `${Number(selectedInterval) / 60}h`
          : `${Number(selectedInterval)}m`
  const { sdk } = useHyperliquid()
  // const { data: initialCandles } = useQuery<Candle[]>({
  //   queryKey: ['candles', selectedAsset, selectedInterval],
  //   queryFn: async () => {
  //     const response = await sdk.info.getCandleSnapshot(
  //       selectedAsset,
  //       intervalStr,
  //       Date.now() - 7 * 24 * 60 * 60 * 1000,
  //       Date.now()
  //     )
  //     return response
  //   },
  //   enabled: !!sdk && selectedAsset?.length > 0
  // })

  useEffect(() => {
    if (!chartRef.current || widgetRef.current) return

    const scriptId = 'tv-widget-script'
    const existingScript = document.getElementById(scriptId)

    const initWidget = () => {
      if (!window.TradingView || typeof window.TradingView.widget !== 'function') {
        setTimeout(initWidget, 100)
        return
      }

      const datafeed: Datafeed = {
        onReady: (cb: DatafeedCallback) =>
          setTimeout(() => cb({ supported_resolutions: INTERVALS }), 0),

        resolveSymbol: (_: string, onResolve: (symbolInfo: SymbolInfo) => void) => {
          setTimeout(() => {
            onResolve({
              name: selectedAsset,
              full_name: selectedAsset,
              ticker: selectedAsset,
              description: `${selectedAsset} on Hyperliquid`,
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
            })
          }, 0)
        },

        getBars: (() => {
          let lastCall = 0
          return async (
            symbolInfo: SymbolInfo,
            resolution: IntervalType,
            periodParams: PeriodParams,
            onHistoryCallback: HistoryCallback,
            onErrorCallback: ErrorCallback
          ) => {
            if (!sdk || !selectedAsset || !selectedInterval) {
              onErrorCallback('SDK or asset not available')
              return
            }

            const nowTime = Date.now()
            if (nowTime - lastCall < 1000) return
            lastCall = nowTime

            try {
              const now = Math.floor(Date.now() / 1000)
              const intervalSeconds = getIntervalMinutes(resolution) * 60
              const fallbackFrom = now - 300 * intervalSeconds
              const rawFrom = periodParams.from
              const rawTo = periodParams.to

              const from = rawFrom < 1000000000 ? fallbackFrom : rawFrom
              const to = rawTo < 1000000000 || rawTo < from ? now : rawTo

              const _bars = await sdk.info.getCandleSnapshot(
                selectedAsset,
                intervalStr,
                from * 1000,
                to * 1000
              )

              const bars = _bars.map((bar: Candle) => ({
                time: Number(Math.floor(Number(bar.t) / 1000)),
                open: parseFloat(bar.o.toString()),
                high: parseFloat(bar.h.toString()),
                low: parseFloat(bar.l.toString()),
                close: parseFloat(bar.c.toString()),
                volume: parseFloat(bar.v.toString())
              }))
              console.log('[TV getBars - BARS]', bars)
              if (!barsCache.current[resolution]) {
                barsCache.current[resolution] = new Map()
              }

              const cache = barsCache.current[resolution]
              bars.forEach((bar: BarData) => cache.set(bar.time, bar)) // merge & deduplicate

              const mergedBars = Array.from(cache.values()).sort((a, b) => a.time - b.time)
              console.log('✅ Sample bar to send:', mergedBars[0])
              console.log('📦 All bars length:', mergedBars.length)
              onHistoryCallback(bars, {
                noData: mergedBars.length === 0
              })
            } catch (err) {
              console.error('Error fetching bars:', err)
              onErrorCallback('Data error')
            }
          }
        })(),

        subscribeBars: (
          symbolInfo: SymbolInfo,
          resolution: IntervalType,
          onRealtimeCallback: RealtimeCallback,
          subscriberUID: string
        ) => {
          console.warn('[TV subscribeBars] called — no real-time updates implemented', {
            symbolInfo,
            resolution,
            subscriberUID
          })
        },

        unsubscribeBars: (subscriberUID: string) => {
          console.warn('[TV unsubscribeBars] called', { subscriberUID })
        }
      }

      widgetRef.current = new window.TradingView.widget({
        debug: true,
        symbol: selectedAsset,
        interval: '5',
        timeframe: '1W',
        container: chartRef.current,
        datafeed,
        library_path: '/lib/',
        locale: 'en',
        theme: 'dark',
        autosize: true,
        disabled_features: ['use_localstorage_for_settings', 'timeframes_toolbar'],
        overrides: {
          'paneProperties.background': '#0F0816',
          'mainSeriesProperties.candleStyle.upColor': '#0ECB81',
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
              '#0f0816',
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
            ]
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
            ]
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
  }, [selectedAsset, selectedInterval, sdk])

  return (
    <div className="w-full h-[600px]">
      <div ref={chartRef} className="rounded-b-md w-full h-full" />
    </div>
  )
}

export default TradingViewChart
