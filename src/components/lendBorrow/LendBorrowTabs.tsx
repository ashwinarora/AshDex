'use client'
import React, { useEffect, useRef } from 'react'
import { createChart, IChartApi, ISeriesApi, AreaData, AreaSeries } from 'lightweight-charts'
import { ORDER_INTERVALS } from '@/utils/constants'
import lendBorrowData from '@/utils/lendBorrow.json'

interface ILendBorrowTabsProps {
  tabs: string[]
  activeTab: number
  setActiveTab: (index: number) => void
  selectedInterval: (typeof ORDER_INTERVALS)[number]
  setSelectedInterval: (interval: (typeof ORDER_INTERVALS)[number]) => void
  intervals: (typeof ORDER_INTERVALS)[number][]
}

const LendBorrowTabs: React.FC<ILendBorrowTabsProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  selectedInterval,
  setSelectedInterval,
  intervals
}) => {
  const { supplyChartData, borrowChartData } = lendBorrowData?.lendBorrow
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartContainerRef2 = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const chartRef2 = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const seriesRef2 = useRef<ISeriesApi<'Area'> | null>(null)

  const chartData: AreaData[] = supplyChartData || []
  const chartData2: AreaData[] = borrowChartData || []

  useEffect(() => {
    if (activeTab !== 0 || !chartContainerRef.current) return
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      layout: {
        textColor: '#8B8BA0',
        fontSize: 12,
        background: { color: 'transparent' }
      },
      grid: {
        vertLines: { color: '#23262F' },
        horzLines: { color: 'rgba(75, 67, 84, 0.1)' }
      },
      leftPriceScale: {
        visible: true,
        borderColor: '#23262F'
      },
      rightPriceScale: {
        visible: false
      }
    })

    seriesRef.current = chartRef.current.addSeries(AreaSeries, {
      lineWidth: 2,
      priceLineColor: '#2FA766',
      topColor: 'rgba(47, 167, 102, 0.16)',
      bottomColor: 'rgba(47, 167, 102, 0)',
      priceScaleId: 'left'
    })

    seriesRef.current.setData(chartData)
    chartRef.current.timeScale().fitContent()
    return () => chartRef.current?.remove()
  }, [activeTab])

  // Chart for Tab Index 1
  useEffect(() => {
    if (activeTab !== 1 || !chartContainerRef2.current) return

    chartRef2.current = createChart(chartContainerRef2.current, {
      width: chartContainerRef2.current.clientWidth,
      layout: {
        textColor: '#8B8BA0',
        fontSize: 12,
        background: { color: 'transparent' }
      },
      grid: {
        vertLines: { color: '#23262F' },
        horzLines: { color: 'rgba(75, 67, 84, 0.1)' }
      },
      leftPriceScale: {
        visible: true,
        borderColor: '#23262F'
      },
      rightPriceScale: {
        visible: false
      }
    })

    seriesRef2.current = chartRef2.current.addSeries(AreaSeries, {
      lineWidth: 2,
      lineColor: '#e2960d',
      priceLineColor: '#e2960d',
      topColor: 'rgba(255, 169, 10, 0.17)',
      bottomColor: 'rgba(255, 169, 10, 0)',
      priceScaleId: 'left'
    })

    seriesRef2.current.setData(chartData2)
    chartRef2.current.timeScale().fitContent()

    return () => chartRef2.current?.remove()
  }, [activeTab])

  return (
    <div className="">
      <div className="flex mb-3 max-[770px]:border-b px-2 pt-1 max-[770px]:border-white/10  items-center justify-between">
        <nav className="flex flex-wrap gap-x-5 max-[770px]:gap-x-4">
          {tabs?.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`py-2 px-1 text-base border-b-3 cursor-pointer whitespace-nowrap 
          ${activeTab === index ? 'border-primary text-white font-bold rounded-xs' : 'border-transparent font-medium text-[#8B8BA0]'}
        `}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="flex items-center overflow-hidden gap-2 text-white text-sm">
          {intervals?.map((interval) => (
            <button
              key={interval}
              onClick={() => setSelectedInterval(interval)}
              className={`px-2 text-sm cursor-pointer py-1 rounded-full transition-all ${
                selectedInterval === interval
                  ? 'bg-white/10 font-bold text-white backdrop-blur-lg'
                  : 'text-[#8B8BA0] font-medium hover:text-gray-300'
              }`}
            >
              {interval}
            </button>
          ))}
        </div>
      </div>
      {activeTab === 0 && <div ref={chartContainerRef} className="w-full mt-4 px-2 h-[250px]" />}
      {activeTab === 1 && <div ref={chartContainerRef2} className="w-full mt-4 px-2 h-[250px]" />}
      {activeTab === 2 && <div className="w-full mt-4 px-2 h-[250px]" />}
    </div>
  )
}

export default LendBorrowTabs
