'use client'
import { useEffect, useRef, useState } from 'react'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useChartHoverStore } from '@/store/ChartHoverStore'
import { useShallow } from 'zustand/react/shallow'
import * as hl from '@nktkas/hyperliquid'
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type IPriceLine,
  type LogicalRange,
  type UTCTimestamp
} from 'lightweight-charts'
import type { IntervalType } from './ChartTypes'
import { intervalToSeconds, toHyperliquidInterval, toLwcBar, type LwcCandle } from './toLwcBar'

// Aligned with the Ember palette in src/app/globals.css.
const BG_COLOR = '#0f1216' // --surface-1
const UP_COLOR = '#10b981' // --buy
const DOWN_COLOR = '#f43f5e' // --sell
const GRID_COLOR = 'rgba(255, 255, 255, 0.05)'
const TEXT_COLOR = '#8b929e' // --text-3
const BORDER_COLOR = '#232830' // --surface-3

const HISTORY_PAGE_BARS = 500

interface Props {
  selectedAsset: string
  selectedInterval: IntervalType
}

const Chart = ({ selectedAsset, selectedInterval }: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)

  const earliestBarTimeRef = useRef<number | null>(null)
  const loadingOlderRef = useRef(false)
  const wsCleanupRef = useRef<(() => void) | null>(null)
  const lastBarTimeRef = useRef<number | null>(null)
  const selectedAssetRef = useRef(selectedAsset)
  const selectedIntervalRef = useRef(selectedInterval)
  selectedAssetRef.current = selectedAsset
  selectedIntervalRef.current = selectedInterval

  const orderLinesRef = useRef<Map<string, IPriceLine>>(new Map())
  const positionLinesRef = useRef<Map<string, IPriceLine>>(new Map())
  const liquidationLinesRef = useRef<Map<string, IPriceLine>>(new Map())

  const isHoveringRef = useRef(false)
  const setFocusedBar = useChartHoverStore((s) => s.setFocusedBar)

  const [chartReady, setChartReady] = useState(false)

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

  // Create chart once on mount, destroy on unmount.
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      autoSize: true,
      layout: {
        background: { color: BG_COLOR },
        textColor: TEXT_COLOR
      },
      grid: {
        vertLines: { color: GRID_COLOR },
        horzLines: { color: GRID_COLOR }
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: BORDER_COLOR,
        rightOffset: 6
      },
      rightPriceScale: {
        borderColor: BORDER_COLOR,
        scaleMargins: { top: 0.1, bottom: 0.25 }
      },
      crosshair: {
        vertLine: { color: BORDER_COLOR, width: 1, style: LineStyle.Dashed },
        horzLine: { color: BORDER_COLOR, width: 1, style: LineStyle.Dashed }
      }
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP_COLOR,
      downColor: DOWN_COLOR,
      borderVisible: false,
      wickUpColor: UP_COLOR,
      wickDownColor: DOWN_COLOR
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: 'volume',
      priceFormat: { type: 'volume' }
    })
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 }
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    // Historical pagination — load older bars when user scrolls to the left edge.
    const timeScale = chart.timeScale()
    const onLogicalRange = (range: LogicalRange | null) => {
      if (!range || loadingOlderRef.current) return
      // Only paginate when the visible range extends past the earliest loaded bar.
      if (range.from < 0) void loadOlder()
    }
    timeScale.subscribeVisibleLogicalRangeChange(onLogicalRange)

    // Crosshair — push the hovered bar to the hover store so the OHLC readout
    // can show it. When the crosshair leaves, fall back to the last bar.
    const onCrosshairMove: Parameters<typeof chart.subscribeCrosshairMove>[0] = (param) => {
      const series = candleSeriesRef.current
      if (!series) return
      if (!param.time) {
        isHoveringRef.current = false
        const data = series.data() as unknown as LwcCandle[]
        if (data.length > 0) setFocusedBar(data[data.length - 1])
        return
      }
      isHoveringRef.current = true
      const bar = param.seriesData.get(series) as LwcCandle | undefined
      if (bar) setFocusedBar(bar)
    }
    chart.subscribeCrosshairMove(onCrosshairMove)

    setChartReady(true)

    return () => {
      timeScale.unsubscribeVisibleLogicalRangeChange(onLogicalRange)
      chart.unsubscribeCrosshairMove(onCrosshairMove)
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
      setChartReady(false)
      setFocusedBar(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load history + subscribe to WS on symbol/interval change.
  useEffect(() => {
    if (!chartReady || !selectedAsset || selectedAsset.trim() === '' || !sdkInfoClient) return
    const candleSeries = candleSeriesRef.current
    const volumeSeries = volumeSeriesRef.current
    if (!candleSeries || !volumeSeries) return

    let cancelled = false
    const hlInterval = toHyperliquidInterval(selectedInterval)
    const intervalSec = intervalToSeconds(selectedInterval)

    // Clear price lines from prior symbol/interval; the effects that own them will rebuild.
    orderLinesRef.current.forEach((line) => {
      try {
        candleSeries.removePriceLine(line)
      } catch {}
    })
    positionLinesRef.current.forEach((line) => {
      try {
        candleSeries.removePriceLine(line)
      } catch {}
    })
    liquidationLinesRef.current.forEach((line) => {
      try {
        candleSeries.removePriceLine(line)
      } catch {}
    })
    orderLinesRef.current.clear()
    positionLinesRef.current.clear()
    liquidationLinesRef.current.clear()

    const load = async () => {
      const now = Date.now()
      const startTime = now - HISTORY_PAGE_BARS * intervalSec * 1000
      try {
        const raw = await sdkInfoClient.candleSnapshot({
          coin: selectedAsset,
          interval: hlInterval,
          startTime,
          endTime: now
        })
        if (cancelled) return

        const mapped = raw.map(toLwcBar)
        const candles = mapped.map((m) => m.candle)
        const volumes = mapped.map((m) => m.volume)

        candleSeries.setData(candles)
        volumeSeries.setData(volumes)

        earliestBarTimeRef.current = candles.length > 0 ? (candles[0].time as number) : null
        lastBarTimeRef.current =
          candles.length > 0 ? (candles[candles.length - 1].time as number) : null

        // Expose for debugging + e2e assertions.
        if (chartContainerRef.current && candles.length > 0) {
          chartContainerRef.current.setAttribute(
            'data-last-bar',
            JSON.stringify(candles[candles.length - 1])
          )
          chartContainerRef.current.setAttribute('data-bar-count', String(candles.length))
        }

        // Seed the OHLC readout with the last bar (unless the user is hovering).
        if (candles.length > 0 && !isHoveringRef.current) {
          setFocusedBar(candles[candles.length - 1])
        }

        // Fit content on initial load.
        chartRef.current?.timeScale().fitContent()
      } catch (err) {
        console.error('Chart: history load failed', err)
      }
    }

    const candleHandler = (payload: hl.CandleWsEvent) => {
      if (cancelled) return
      const { candle, volume } = toLwcBar(payload)
      try {
        candleSeries.update(candle)
        volumeSeries.update(volume)
        lastBarTimeRef.current = candle.time as number
        if (chartContainerRef.current) {
          chartContainerRef.current.setAttribute('data-last-bar', JSON.stringify(candle))
        }
        // Update the OHLC readout only when the user isn't hovering — otherwise
        // their hovered bar would get overwritten by every WS tick.
        if (!isHoveringRef.current) {
          setFocusedBar(candle)
        }
      } catch (err) {
        console.error('Chart: realtime update failed', err)
      }
    }

    void load().then(() => {
      if (cancelled) return
      subscribeToCandle(selectedAsset, hlInterval, candleHandler)
      wsCleanupRef.current = () => {
        void unsubscribeFromCandle(selectedAsset, hlInterval).catch((e) =>
          console.error('Chart: unsubscribe failed', e)
        )
      }
    })

    return () => {
      cancelled = true
      wsCleanupRef.current?.()
      wsCleanupRef.current = null
    }
  }, [
    chartReady,
    selectedAsset,
    selectedInterval,
    sdkInfoClient,
    subscribeToCandle,
    unsubscribeFromCandle
  ])

  // Historical pagination: prepend older bars when scrolled to the left edge.
  const loadOlder = async () => {
    const candleSeries = candleSeriesRef.current
    const volumeSeries = volumeSeriesRef.current
    const store = useHyperliquidStore.getState()
    const client = store.sdkInfoClient
    const earliest = earliestBarTimeRef.current
    const asset = selectedAssetRef.current
    const interval = selectedIntervalRef.current
    if (!candleSeries || !volumeSeries || !client || !earliest || !asset) return

    loadingOlderRef.current = true
    try {
      const hlInterval = toHyperliquidInterval(interval)
      const intervalSec = intervalToSeconds(interval)
      const endTime = earliest * 1000 - 1
      const startTime = endTime - HISTORY_PAGE_BARS * intervalSec * 1000
      const raw = await client.candleSnapshot({
        coin: asset,
        interval: hlInterval,
        startTime,
        endTime
      })
      if (raw.length === 0) return

      const mapped = raw.map(toLwcBar)
      const newCandles = mapped.map((m) => m.candle).filter((c) => (c.time as number) < earliest)
      const newVolumes = mapped.map((m) => m.volume).filter((v) => (v.time as number) < earliest)
      if (newCandles.length === 0) return

      // setData with the merged range. Price lines survive setData.
      const currentCandles = candleSeries.data() as unknown as {
        time: UTCTimestamp
      }[] as LwcCandle[]
      const currentVolumes = volumeSeries.data() as unknown as {
        time: UTCTimestamp
        value: number
        color?: string
      }[]

      candleSeries.setData([...newCandles, ...currentCandles])
      volumeSeries.setData([
        ...newVolumes,
        ...currentVolumes.map((v) => ({ ...v, color: v.color ?? UP_COLOR }))
      ])

      earliestBarTimeRef.current = newCandles[0].time as number
      if (chartContainerRef.current) {
        chartContainerRef.current.setAttribute(
          'data-bar-count',
          String(newCandles.length + currentCandles.length)
        )
      }
    } catch (err) {
      console.error('Chart: loadOlder failed', err)
    } finally {
      loadingOlderRef.current = false
    }
  }

  // Order price lines.
  useEffect(() => {
    if (!chartReady) return
    const series = candleSeriesRef.current
    if (!series) return
    const store = useHyperliquidStore.getState()
    if (!store.sdkInfoClient) return

    const getOrderKey = (order: (typeof openOrders)[number]): string => {
      const type = (order.orderType || '').toString().toLowerCase()
      const isTrigger =
        order.isTrigger === true || type.includes('take profit') || type.includes('stop')
      if (isTrigger && order.triggerPx) {
        return `trigger-${order.coin}-${order.triggerPx}-${order.side}`
      }
      return `order-${order.oid}`
    }

    const filtered = openOrders.filter((o) => o.coin === selectedAsset)
    const triggerOrders = filtered.filter((order) => {
      const type = (order.orderType || '').toString().toLowerCase()
      return order.isTrigger === true || type.includes('take profit') || type.includes('stop')
    })

    const seen = new Set<string>()
    const uniqueTriggers = triggerOrders.filter((o) => {
      const key = `${o.triggerPx}-${o.side}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const source = uniqueTriggers.length > 0 ? uniqueTriggers : filtered
    const toShow: typeof filtered = []
    if (source.length === 1) toShow.push(source[0])
    else if (source.length > 1) toShow.push(source[0], source[source.length - 1])

    const keysToShow = new Set(toShow.map(getOrderKey))

    for (const [key, line] of orderLinesRef.current.entries()) {
      if (!keysToShow.has(key)) {
        try {
          series.removePriceLine(line)
        } catch {}
        orderLinesRef.current.delete(key)
      }
    }

    for (const order of toShow) {
      const key = getOrderKey(order)
      if (orderLinesRef.current.has(key)) continue

      const type = (order.orderType || '').toString().toLowerCase()
      const isTrigger =
        order.isTrigger === true || type.includes('take profit') || type.includes('stop')
      const price = isTrigger && order.triggerPx ? order.triggerPx : order.limitPx

      let label: string
      if (isTrigger) {
        const condition = (order.triggerCondition || '').toString().toLowerCase()
        if (type.includes('take profit') || condition.includes('above')) label = 'TP'
        else if (type.includes('stop') || condition.includes('below')) label = 'SL'
        else label = 'Trigger'
      } else {
        label = order.side === 'B' ? 'Buy' : 'Sell'
      }
      const isSell = label === 'SL' || (!isTrigger && order.side !== 'B')
      const color = isSell ? DOWN_COLOR : UP_COLOR

      try {
        const line = series.createPriceLine({
          price: Number(price),
          color,
          lineWidth: 1,
          lineStyle: isTrigger ? LineStyle.Dashed : LineStyle.Solid,
          axisLabelVisible: true,
          title: `${label} ${order.sz}`
        })
        orderLinesRef.current.set(key, line)
      } catch (err) {
        console.error('Chart: order price line failed', err)
      }
    }
  }, [openOrders, selectedAsset, chartReady])

  // Position + liquidation price lines.
  useEffect(() => {
    if (!chartReady) return
    const series = candleSeriesRef.current
    if (!series) return
    const store = useHyperliquidStore.getState()
    if (!store.sdkInfoClient) return

    const positions = clearingHouseState?.assetPositions ?? []
    const currentCoins = new Set(positions.map((p) => p.position.coin))

    for (const [coin, line] of positionLinesRef.current.entries()) {
      if (!currentCoins.has(coin) || coin !== selectedAsset) {
        try {
          series.removePriceLine(line)
        } catch {}
        positionLinesRef.current.delete(coin)
      }
    }

    for (const [coin, line] of liquidationLinesRef.current.entries()) {
      if (!currentCoins.has(coin) || coin !== selectedAsset) {
        try {
          series.removePriceLine(line)
        } catch {}
        liquidationLinesRef.current.delete(coin)
      }
    }

    for (const p of positions) {
      if (p.position.coin !== selectedAsset) continue
      const isLong = Number(p.position.szi) > 0
      const color = isLong ? UP_COLOR : DOWN_COLOR

      if (!positionLinesRef.current.has(p.position.coin)) {
        try {
          const line = series.createPriceLine({
            price: Number(p.position.entryPx),
            color,
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            axisLabelVisible: true,
            title: `${isLong ? 'Long' : 'Short'} ${p.position.szi}`
          })
          positionLinesRef.current.set(p.position.coin, line)
        } catch (err) {
          console.error('Chart: position price line failed', err)
        }
      }

      const liqPx = Number(p.position.liquidationPx)
      if (Number.isFinite(liqPx) && liqPx > 0) {
        const existing = liquidationLinesRef.current.get(p.position.coin)
        if (existing) {
          try {
            series.removePriceLine(existing)
          } catch {}
          liquidationLinesRef.current.delete(p.position.coin)
        }
        try {
          const line = series.createPriceLine({
            price: liqPx,
            color: '#ff9800',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `Liq ${p.position.szi}`
          })
          liquidationLinesRef.current.set(p.position.coin, line)
        } catch (err) {
          console.error('Chart: liquidation price line failed', err)
        }
      }
    }
  }, [clearingHouseState, chartReady, selectedAsset])

  return (
    <div className="rounded-md p-2 bg-secondary w-full h-full md:h-[576px] xl:h-full">
      <div ref={chartContainerRef} className="w-full h-full" data-testid="lwc-chart" />
    </div>
  )
}

export default Chart
