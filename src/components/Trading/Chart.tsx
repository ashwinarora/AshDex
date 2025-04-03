'use client'
import { CandlestickSeries, createChart, Time, CandlestickData } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { CHART_INTERVALS } from '../../utils/constants'
import type { Candle } from '../../utils/hyperliquid/hyperLiquidTypes'
import { useHyperLiquid } from '@/context/HyperLiquid'
import ChartTabs from '../common/ChartTabs'
import IntervalSelector from '../common/IntervalSelector'
import InfoTab from '../common/InfoTab'
import unionicon from '@/assets/images/union_icon.svg'
import union11icon from '@/assets/images/union11_icon.svg'
import union12icon from '@/assets/images/union12_icon.svg'
import union13icon from '@/assets/images/union13_icon.svg'
import union14icon from '@/assets/images/union14_icon.svg'
import union15icon from '@/assets/images/union15_icon.svg'
import union16icon from '@/assets/images/union16_icon.svg'
import union17icon from '@/assets/images/union17_icon.svg'
import union18icon from '@/assets/images/union18_icon.svg'
import union19icon from '@/assets/images/union19_icon.svg'
import union20icon from '@/assets/images/union20_icon.svg'
import union21icon from '@/assets/images/union21_icon.svg'

interface IChartProps {
  selectedAsset: string
}
const tabs = ['Price', 'Depth', 'Info'] as string[]

const Chart = ({ selectedAsset }: IChartProps) => {
  const { sdk, isSdkConnected } = useHyperLiquid()
  const [selectedInterval, setSelectedInterval] = useState<(typeof CHART_INTERVALS)[number]>('5m')
  const chartRef = useRef(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [candlestickData, setCandlestickData] = useState<Candle[]>([])
  const { data: initialCandles, isLoading } = useQuery<Candle[]>({
    queryKey: ['candles', selectedAsset, selectedInterval],
    queryFn: async () => {
      const response = await sdk.info.getCandleSnapshot(
        selectedAsset,
        selectedInterval,
        0,
        Date.now()
      )
      return response
    },
    enabled: isSdkConnected && selectedAsset?.length > 0
  })

  useEffect(() => {
    if (initialCandles) {
      setCandlestickData(initialCandles)
    }
  }, [initialCandles])

  useEffect(() => {
    if (!isSdkConnected || !selectedAsset || !selectedInterval) return
    let unsubscribe: (() => void) | null = null
    const subscribeToCandles = async () => {
      try {
        unsubscribe = await sdk?.subscriptions?.subscribeToCandle(
          selectedAsset,
          selectedInterval,
          (newCandles: Candle | Candle[]) => {
            setCandlestickData((prevData) => {
              const newData = Array.isArray(newCandles) ? newCandles : [newCandles]
              return [...prevData, ...newData].slice(-100)
            })
          }
        )
      } catch (error) {
        console.error('Error subscribing to candle updates:', error)
      }
    }
    subscribeToCandles()
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [isSdkConnected, selectedAsset, selectedInterval, sdk?.subscriptions])

  useEffect(() => {
    if (activeTab !== 0 || isLoading || !candlestickData.length || !chartRef.current) return

    const chartOptions = {
      layout: {
        textColor: '#8B8BA0',
        fontSize: 12,
        fontWeight: 400,
        background: { color: 'transparent' }
      },
      grid: {
        vertLines: { color: '#23262F' },
        horzLines: { color: 'rgba(75, 67, 84, 0.1)' }
      },
      crosshair: {
        mode: 0
      }
    }

    const chart = createChart(chartRef.current, chartOptions)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26A69A',
      downColor: '#EF5350',
      borderUpColor: '#26A69A',
      borderDownColor: '#EF5350',
      wickUpColor: '#26A69A',
      wickDownColor: '#EF5350'
    })

    const validCandlestickData = candlestickData || []

    const formattedData = validCandlestickData
      ?.map((candle: Candle) => ({
        time: Math.floor(candle?.T / 1000) as Time,
        open: candle?.o,
        high: candle?.h,
        low: candle?.l,
        close: candle?.c
      }))
      ?.sort((a, b) => (a?.time as number) - (b?.time as number))

    const uniqueData = formattedData?.filter(
      (candle, index, self) => index === 0 || candle?.time !== self[index - 1]?.time
    )

    candlestickSeries.setData(uniqueData)

    chart.timeScale().applyOptions({
      timeVisible: true,
      secondsVisible: false,
      borderColor: '#444'
    })
    // chart.timeScale().fitContent()

    chart.subscribeCrosshairMove((param) => {
      if (!tooltipRef.current) return
      const hoveredPoint = param?.point
      const seriesData = param?.seriesData?.get(candlestickSeries) as CandlestickData | undefined

      if (!hoveredPoint || !seriesData) {
        tooltipRef.current.style.display = 'none'
        return
      }
      tooltipRef.current.style.display = 'block'

      const isMobile = window.innerWidth <= 770
      tooltipRef.current.style.left = isMobile ? '1rem' : '3.5rem'
      tooltipRef.current.style.top = isMobile ? '14rem' : '8.3rem'

      tooltipRef.current.innerHTML = `
        <div class="text-[#E8E0F1] font-normal text-xs flex max-[770px]:gap-[10px] gap-[16px] max-[770px]:flex-col">
      <strong>${new Date((seriesData?.time as number) * 1000).toLocaleDateString()}</strong>
          <span>Open: <span class="text-[#FFFFFF]">${seriesData?.open?.toFixed(2)}</span></span>
          <span>High: <span class="text-[#FFFFFF]">${seriesData?.high?.toFixed(2)}</span></span>
          <span>Low: <span class="text-[#FFFFFF]">${seriesData?.low?.toFixed(2)}</span></span>
          <span>Close: <span class="text-[#FFFFFF]">${seriesData?.close?.toFixed(2)}<span></span>
        </div>
      `
    })
    return () => chart.remove()
  }, [candlestickData, activeTab, isLoading])

  const sidebarIcons = [
    unionicon,
    union11icon,
    union12icon,
    union13icon,
    union14icon,
    union15icon,
    union16icon,
    union17icon,
    union18icon,
    union19icon,
    union20icon,
    union21icon
  ]

  return (
    <div className="relative">
      <ChartTabs tabs={tabs as string[]} activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 0 ? (
        <>
          <IntervalSelector
            selectedInterval={selectedInterval}
            setSelectedInterval={setSelectedInterval}
            intervals={Array.from(CHART_INTERVALS)}
          />
          <div className="flex max-[770px]:block">
            <div className="w-auto max-[770px]:w-full max-[770px]:py-3 max-[770px]:px-4 px-3 py-6 flex flex-col max-[770px]:flex-row max-[770px]:gap-4 max-[1025px]:gap-7 gap-10 items-center max-[770px]:justify-between min-[770px]:border-r-2 max-[770px]:border-b border-white/10">
              {sidebarIcons?.map((icon, index) => (
                <button
                  key={index}
                  className="hover:opacity-100 opacity-70 transition-opacity cursor-pointer"
                >
                  <Image
                    src={icon}
                    alt={`icon-${index}`}
                    className="max-sm:w-[16px] max-sm:h-[16px] w-[19px] h-[19px]"
                  />
                </button>
              ))}
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center w-full h-[90vh] max-[770px]:h-[52vh]">
                <Loader2 className="animate-spin text-[#E8E0F1] text-8xl" />
              </div>
            ) : (
              <div
                ref={chartRef}
                className="h-[90vh] w-full max-[770px]:h-[52vh] max-[1024px]:h-[100vh] mb-3 flex-1"
              />
            )}
          </div>
          <div
            ref={tooltipRef}
            className="absolute z-50 bg-[#33293B] max-[770px]:p-3 p-[14px] rounded-lg shadow-md hidden"
          />
        </>
      ) : null}
      {activeTab === 2 && <InfoTab selectedAsset={selectedAsset} />}
    </div>
  )
}
export default Chart
