'use client'
import { useEffect, useRef, useState } from 'react'
import { createChart, LineSeries, type IChartApi, type UTCTimestamp } from 'lightweight-charts'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { cn } from '@/lib/utils'

const COLORS = ['#38bdf8', '#fb923c', '#f472b6', '#34d399', '#a78bfa', '#facc15']

type Props = { series: { coin: string; label: string }[] }

/** Probability-over-time lines (candle closes) for every side of a market. */
const OutcomeProbabilityChart = ({ series }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const sdkInfoClient = useHyperliquidStore((s) => s.sdkInfoClient)
  const [range, setRange] = useState<'1h' | 'all'>('1h')
  const [empty, setEmpty] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      layout: { background: { color: '#0f1216' }, textColor: '#8b929e' },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.05)' },
        horzLines: { color: 'rgba(255,255,255,0.05)' }
      },
      rightPriceScale: { borderColor: '#232830', scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { borderColor: '#232830', timeVisible: true },
      autoSize: true
    })
    chartRef.current = chart
    return () => {
      chart.remove()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !sdkInfoClient || series.length === 0) return
    let cancelled = false
    const added: ReturnType<IChartApi['addSeries']>[] = []
    const load = async () => {
      const endTime = Date.now()
      const interval = range === '1h' ? '1h' : '1d'
      const startTime = range === '1h' ? endTime - 7 * 86_400_000 : endTime - 365 * 86_400_000
      const results = await Promise.all(
        series.map((s) =>
          sdkInfoClient
            .candleSnapshot({ coin: s.coin, interval, startTime, endTime })
            .catch(() => [])
        )
      )
      if (cancelled) return
      let any = false
      results.forEach((candles, i) => {
        const line = chart.addSeries(LineSeries, {
          color: COLORS[i % COLORS.length],
          lineWidth: 2,
          title: series[i].label,
          // Values are already 0–100; a custom formatter avoids LWC's percent
          // mode, which renders NaN% when it cannot find a base bar.
          priceFormat: {
            type: 'custom',
            minMove: 1,
            formatter: (p: number) => `${Math.round(p)}%`
          }
        })
        const data = candles
          .map((c) => ({ time: (c.t / 1000) as UTCTimestamp, value: Number(c.c) * 100 }))
          .filter((d) => Number.isFinite(d.value))
        if (data.length > 0) any = true
        line.setData(data)
        added.push(line)
      })
      setEmpty(!any)
      chart.timeScale().fitContent()
    }
    load()
    return () => {
      cancelled = true
      added.forEach((s) => {
        try {
          chart.removeSeries(s)
        } catch {
          /* chart already disposed */
        }
      })
    }
  }, [sdkInfoClient, series, range])

  return (
    <div
      className="relative w-full h-full min-h-[300px] flex flex-col gap-1"
      data-testid="outcome-probability-chart"
    >
      <div className="flex items-center gap-2 px-1">
        {(['1h', 'all'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              'text-xs px-2 py-0.5 rounded cursor-pointer',
              range === r ? 'bg-surface-3 text-text-1' : 'text-text-3 hover:text-text-1'
            )}
          >
            {r === '1h' ? '1h' : 'All'}
          </button>
        ))}
        <div className="flex items-center gap-3 ml-auto">
          {series.map((s, i) => (
            <span key={s.coin} className="text-[11px] text-text-2 flex items-center gap-1">
              <span
                className="size-2 rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              {s.label}
            </span>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="w-full flex-1 min-h-[260px]" />
      {empty && (
        <p className="absolute inset-0 flex items-center justify-center text-xs text-text-3 pointer-events-none">
          No trades yet
        </p>
      )}
    </div>
  )
}

export default OutcomeProbabilityChart
