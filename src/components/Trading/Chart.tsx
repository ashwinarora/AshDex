"use client"
import { CandlestickSeries, createChart } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CHART_INTERVALS } from '../../utils/constants';
import type { Candle } from '../../utils/hyperLiquidTypes';
import { useHyperLiquid } from '@/context/HyperLiquid';

interface IChartProps {
  selectedAsset: string;
}

const Chart = ({ selectedAsset }: IChartProps) => {
  const { sdk, isSdkConnected } = useHyperLiquid()
  const [selectedInterval, setSelectedInterval] = useState<typeof CHART_INTERVALS[number]>("1m");
  const chartRef = useRef(null);
  const { data: candles, isLoading } = useQuery({
    queryKey: ["candles", selectedAsset, selectedInterval],
    queryFn: async () => {
      const response = await sdk.info.getCandleSnapshot(selectedAsset, selectedInterval, 0, Date.now())
      return response;
    },
    enabled: isSdkConnected && selectedAsset?.length > 0,
  })

  useEffect(() => {
    if (isLoading) return;
    if (!candles) return;
    if (!chartRef.current) return;

    const chartOptions = { layout: { textColor: 'white', background: { color: 'black' } } };
    const chart = createChart(chartRef.current, chartOptions);

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
      wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });

    candlestickSeries.setData(candles.map((candle: Candle) => {
      return {
        time: candle.T,
        open: candle.o,
        high: candle.h,
        low: candle.l,
        close: candle.c,
      }
    }));

    chart.timeScale().fitContent()

    return () => chart.remove();
  }, [chartRef, candles, isLoading]);

  return (<>
    <div className="interval-selector mb-4">
      <label htmlFor="interval" className="text-white mr-2">Select Interval: </label>
      <select
        id="interval"
        value={selectedInterval}
        onChange={(e) => setSelectedInterval(e.target.value as typeof CHART_INTERVALS[number])}
        className="bg-gray-800 text-white border border-gray-700 rounded p-2"
      >
        {CHART_INTERVALS.map((interval) => (
          <option key={interval} value={interval}>
            {interval}
          </option>
        ))}
      </select>
    </div>
    <div ref={chartRef} className='h-full ' />
  </>
  )
}

export default Chart