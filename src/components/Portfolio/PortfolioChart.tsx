import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart'

import { Area, AreaChart, XAxis } from 'recharts'
import { PortfolioPeriods } from '@nktkas/hyperliquid'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { useEffect, useMemo, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { IconChevronDown } from '@tabler/icons-react'

const chartConfig = {
  accountValue: {
    label: 'Account Value'
  }
} satisfies ChartConfig

const PortfolioChart = ({ portfolioData }: { portfolioData: PortfolioPeriods }) => {
  const [selectedChart, setSelectedChart] = useState<{
    type: 'accountValue' | 'perp'
    range:
      | 'day'
      | 'week'
      | 'month'
      | 'allTime'
      | 'perpDay'
      | 'perpWeek'
      | 'perpMonth'
      | 'perpAllTime'
  }>({ type: 'accountValue', range: 'day' })

  const chartData = useMemo(() => {
    return portfolioData?.map((item) => ({
      range: item[0],
      accountValue: item[1].accountValueHistory.map((item) => ({ time: item[0], value: item[1] })),
      pnlHistory: item[1].pnlHistory.map((item) => ({ time: item[0], value: item[1] })),
      volume: item[1].vlm
    }))
  }, [portfolioData])

  const displayData = useMemo(() => {
    return chartData?.find((item) => item.range === selectedChart.range)?.accountValue || []
  }, [chartData, selectedChart])

  useEffect(() => {
    if (selectedChart.type === 'perp') {
      setSelectedChart((prev) => ({ ...prev, range: prev.type === 'perp' ? 'perpDay' : 'day' }))
    }
    if (selectedChart.type === 'accountValue') {
      setSelectedChart((prev) => ({
        ...prev,
        range: prev.type === 'accountValue' ? 'day' : 'perpDay'
      }))
    }
  }, [selectedChart.type])

  return (
    <div className="w-full h-full flex flex-col gap-2 p-2">
      <div className="w-full h-fit shrink-0 flex items-center justify-between">
        <ToggleGroup
          size="sm"
          type="single"
          className="bg-secondary rounded-md"
          value={selectedChart.type}
          onValueChange={(value) => {
            if (value === '') {
              return
            }
            setSelectedChart((prev) => ({ ...prev, type: value as 'accountValue' | 'perp' }))
          }}
        >
          <ToggleGroupItem className="w-28 rounded-l-md bg-white/5" value="accountValue">
            Account Value
          </ToggleGroupItem>
          <ToggleGroupItem className="w-28 rounded-r-md bg-white/5" value="perp">
            Perp
          </ToggleGroupItem>
        </ToggleGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-white/5 rounded-md">
              {selectedChart.type === 'perp'
                ? selectedChart.range
                    .split('perp')
                    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
                    .join(' ')
                : selectedChart.range.charAt(0).toUpperCase() + selectedChart.range.slice(1)}
              <IconChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() =>
                setSelectedChart((prev) => ({
                  ...prev,
                  range: prev.type === 'perp' ? 'perpDay' : 'day'
                }))
              }
            >
              Day
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setSelectedChart((prev) => ({
                  ...prev,
                  range: prev.type === 'perp' ? 'perpWeek' : 'week'
                }))
              }
            >
              Week
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setSelectedChart((prev) => ({
                  ...prev,
                  range: prev.type === 'perp' ? 'perpMonth' : 'month'
                }))
              }
            >
              Month
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setSelectedChart((prev) => ({
                  ...prev,
                  range: prev.type === 'perp' ? 'perpAllTime' : 'allTime'
                }))
              }
            >
              All Time
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-full h-60 flex-1">
        <ChartContainer className="w-full h-full" config={chartConfig}>
          <AreaChart data={displayData}>
            <XAxis
              dataKey="time"
              tickCount={10}
              interval={
                selectedChart.range === 'allTime' || selectedChart.range === 'perpAllTime' ? 10 : 3
              }
              tickLine={false}
              className="text-xs"
              height={16}
              axisLine={false}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })
              }}
            />
            <Area
              isAnimationActive={false}
              dataKey="value"
              fill="url(#gradient)"
              stroke="#5e46f9"
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1c1033" stopOpacity={1} />
                <stop offset="100%" stopColor="#1c1033" stopOpacity={0} />
              </linearGradient>
            </defs>
            <ChartTooltip
              content={(props) => {
                return (
                  <div className="bg-accent-foreground w-fit h-fit rounded-md p-2 flex flex-col gap-1">
                    <p className="text-sm font-bold text-white">${props.payload?.[0]?.value}</p>
                    <p className="text-xs">
                      {new Date(props.payload?.[0]?.payload?.time).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )
              }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  )
}

export default PortfolioChart
