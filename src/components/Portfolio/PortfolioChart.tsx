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
import { IconCalendarWeek, IconChevronDown, IconTimeline } from '@tabler/icons-react'
import { PortfolioCalendar } from './PortfolioCalendar'
import { UseQueryResult } from '@tanstack/react-query'
import { Skeleton } from '../ui/skeleton'
import { formatWithKMB } from '@/utils/format'
import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'

const chartConfig = {
  accountValue: {
    label: 'Account Value'
  }
} satisfies ChartConfig

const PortfolioChart = ({
  portfolioQuery,
  isRTL
}: {
  portfolioQuery: UseQueryResult<PortfolioPeriods | undefined, Error>
  isRTL: boolean
}) => {
  const { t } = useTranslate()
  const [selectedChart, setSelectedChart] = useState<{
    pnlType: 'unrealized' | 'realized' | 'total'
    type: 'area' | 'calendar'
    account: 'accountValue' | 'perp'
    range:
      | 'day'
      | 'week'
      | 'month'
      | 'allTime'
      | 'perpDay'
      | 'perpWeek'
      | 'perpMonth'
      | 'perpAllTime'
  }>({ account: 'accountValue', range: 'day', type: 'area', pnlType: 'realized' })

  const { data: portfolioData } = portfolioQuery

  const chartData = useMemo(() => {
    return portfolioData?.map((item) => ({
      range: item[0],
      accountValue: item[1].accountValueHistory.map((item) => ({ time: item[0], value: item[1] })),
      pnlHistory: item[1].pnlHistory.map((item) => ({ time: item[0], value: item[1] })),
      volume: item[1].vlm
    }))
  }, [portfolioData])

  const [displayChartData, displayCalendarData] = useMemo(() => {
    return [
      chartData?.find((item) => item.range === selectedChart.range)?.accountValue || [],
      chartData?.find((item) =>
        selectedChart.account === 'perp' ? item.range === 'perpMonth' : item.range === 'month'
      )?.pnlHistory || []
    ]
  }, [chartData, selectedChart.account, selectedChart.range])

  useEffect(() => {
    if (selectedChart.account === 'perp') {
      setSelectedChart((prev) => ({ ...prev, range: prev.account === 'perp' ? 'perpDay' : 'day' }))
    }
    if (selectedChart.account === 'accountValue') {
      setSelectedChart((prev) => ({
        ...prev,
        range: prev.account === 'accountValue' ? 'day' : 'perpDay'
      }))
    }
  }, [selectedChart.account])

  if (displayChartData.length === 0) {
    return (
      <div className="w-full p-2 h-full flex flex-col gap-2 items-center justify-center">
        <div className="flex w-full h-9 items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-24 h-9" />
            <Skeleton className="w-24 h-9" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-24 h-9" />
          </div>
        </div>
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col gap-2 p-2">
      <div
        className={cn(
          'w-full h-fit shrink-0 flex gap-2 flex-col sm:flex-row items-center justify-between',
          isRTL && 'sm:flex-row-reverse'
        )}
      >
        <ToggleGroup
          size="sm"
          type="single"
          className={cn('bg-secondary rounded-md w-full sm:w-fit', isRTL ? 'flex-row-reverse' : '')}
          value={selectedChart.type}
          onValueChange={(value) => {
            if (value === '') {
              return
            }
            setSelectedChart((prev) => ({ ...prev, type: value as 'area' | 'calendar' }))
          }}
        >
          <ToggleGroupItem
            className={cn('w-32 bg-white/5', isRTL ? 'rounded-r-md' : 'rounded-l-md')}
            value="area"
          >
            <IconTimeline className="size-4" />
            {t('Performance')}
          </ToggleGroupItem>
          <ToggleGroupItem
            className={cn('w-32 bg-white/5', isRTL ? 'rounded-l-md' : 'rounded-r-md')}
            value="calendar"
          >
            <IconCalendarWeek className="size-4" />
            {t('Calendar')}
          </ToggleGroupItem>
        </ToggleGroup>
        {selectedChart.type === 'area' ? (
          <div
            className={cn(
              'flex items-center gap-2 w-full sm:w-fit justify-between md:justify-start',
              isRTL ? 'flex-row-reverse' : ''
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/5 rounded-md">
                  {selectedChart.account === 'perp'
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
                      range: prev.account === 'perp' ? 'perpDay' : 'day'
                    }))
                  }
                >
                  {t('Day')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setSelectedChart((prev) => ({
                      ...prev,
                      range: prev.account === 'perp' ? 'perpWeek' : 'week'
                    }))
                  }
                >
                  {t('Week')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setSelectedChart((prev) => ({
                      ...prev,
                      range: prev.account === 'perp' ? 'perpMonth' : 'month'
                    }))
                  }
                >
                  {t('Month')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setSelectedChart((prev) => ({
                      ...prev,
                      range: prev.account === 'perp' ? 'perpAllTime' : 'allTime'
                    }))
                  }
                >
                  {t('All Time')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/5 rounded-md">
                  {selectedChart.account === 'accountValue' ? t('Total Equity') : t('Perps Equity')}
                  <IconChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    setSelectedChart((prev) => ({
                      ...prev,
                      account: 'accountValue'
                    }))
                  }
                >
                  {t('Total Equity')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setSelectedChart((prev) => ({
                      ...prev,
                      account: 'perp'
                    }))
                  }
                >
                  {t('Perps Equity')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-fit justify-between md:justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/5 rounded-md">
                  {selectedChart.pnlType.charAt(0).toUpperCase() +
                    selectedChart.pnlType.slice(1) +
                    ' PnL'}
                  <IconChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    setSelectedChart((prev) => ({
                      ...prev,
                      pnlType: 'unrealized'
                    }))
                  }
                >
                  {t('Unrealized PnL')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setSelectedChart((prev) => ({
                      ...prev,
                      pnlType: 'realized'
                    }))
                  }
                >
                  {t('Realized PnL')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setSelectedChart((prev) => ({
                      ...prev,
                      pnlType: 'total'
                    }))
                  }
                >
                  {t('Total PnL')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      <div className="w-full h-60 flex-1">
        {selectedChart.type === 'area' && (
          <ChartContainer className="w-full h-full" config={chartConfig}>
            <AreaChart data={displayChartData}>
              <XAxis
                dataKey="time"
                tickCount={10}
                interval={
                  selectedChart.range === 'allTime' || selectedChart.range === 'perpAllTime'
                    ? 10
                    : 3
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
                stroke="#5f46f9"
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
                      <p className="text-sm font-bold text-white">
                        ${props.payload?.[0]?.value && formatWithKMB(props.payload?.[0]?.value)}
                      </p>
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
        )}
        {selectedChart.type === 'calendar' && (
          <div className="w-full h-full overflow-y-auto">
            <PortfolioCalendar
              calendarData={displayCalendarData}
              pnlType={selectedChart.pnlType}
              isRTL={isRTL}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PortfolioChart
