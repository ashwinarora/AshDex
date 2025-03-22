'use client'
import { CandlestickSeries, createChart, Time } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { CHART_INTERVALS } from '../../utils/constants'
import type { Candle } from '../../utils/hyperLiquidTypes'
import ChartTabs from '../common/ChartTabs'
import IntervalSelector from '../common/IntervalSelector'
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
import { CHART_DATA } from '@/utils/chartData'
interface IChartProps {
  selectedAsset: string
}
const tabs = ['Price', 'Depth', 'Info'] as string[]
const staticCandleData = {
  time: Math.floor(Date.now() / 1000),
  open: 15400.12,
  high: 15550.45,
  low: 15380.34,
  close: 15520.78
}
const Chart = ({ selectedAsset }: IChartProps) => {
  const [selectedInterval, setSelectedInterval] = useState<(typeof CHART_INTERVALS)[number]>('1m')
  const chartRef = useRef(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState(0)
  console.log('selectedAsset', selectedAsset)
  useEffect(() => {
    if (!chartRef.current) return

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
    candlestickSeries.setData(
      CHART_DATA.map((candle: Candle) => {
        return {
          time: Math.floor(candle.t / 1000) as Time,
          open: candle.o,
          high: candle.h,
          low: candle.l,
          close: candle.c
        }
      })
    )

    chart.timeScale().fitContent()
    // Handle Tooltip Position
    chart.subscribeCrosshairMove((param) => {
      if (!tooltipRef.current) return
      if (!param || !param.point) {
        tooltipRef.current.style.display = 'none'
        return
      }
      const isMobile = window.innerWidth <= 770
      tooltipRef.current.style.display = 'block'
      if (isMobile) {
        tooltipRef.current.style.left = '1rem'
        tooltipRef.current.style.top = '13rem'
      } else {
        tooltipRef.current.style.left = '4rem'
        tooltipRef.current.style.top = '7.4rem'
      }
      tooltipRef.current.innerHTML = `
      <div class="text-[#E8E0F1] font-normal text-xs flex max-[770px]:gap-[10px] gap-[16px] max-[770px]:flex-col">
        <strong>${new Date(staticCandleData.time * 1000).toLocaleDateString()}</strong>
       <span>Open: <span class="text-[#FFFFFF]">${staticCandleData.open.toFixed(2)}</span></span>
       <span>High: <span class="text-[#FFFFFF]"> ${staticCandleData.high.toFixed(2)}</span></span>
        <span>Low: <span class="text-[#FFFFFF]">${staticCandleData.low.toFixed(2)}</span></span>
        <span>Close: <span class="text-[#FFFFFF]">${staticCandleData.close.toFixed(2)}<span></span>
      </div>
    `
    })
    return () => chart.remove()
  }, [])

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
        {activeTab === 0 && (
          <div
            ref={chartRef}
            className="h-[90vh] w-full max-[770px]:h-[52vh] max-[1024px]:h-[100vh] mb-3 flex-1"
          />
        )}
      </div>
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute z-50 bg-[#33293B] max-[770px]:p-3 p-[14px] rounded-lg shadow-md hidden"
      />
    </div>
  )
}
export default Chart
