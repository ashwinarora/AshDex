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
import {
    IconCalendarWeek,
    IconChevronDown,
    IconTimeline
} from '@tabler/icons-react'
import { PortfolioCalendar } from './PortfolioCalendar'
import { UseQueryResult } from '@tanstack/react-query'
import { Skeleton } from '../ui/skeleton'

const chartConfig = {
    accountValue: {
        label: 'Account Value'
    }
} satisfies ChartConfig

const PortfolioChart = ({
    portfolioQuery
}: {
    portfolioQuery: UseQueryResult<PortfolioPeriods | undefined, Error>
}) => {
    const [selectedChart, setSelectedChart] = useState<{
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
    }>({ account: 'accountValue', range: 'day', type: 'area' })

    const {
        data: portfolioData,
    } = portfolioQuery

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

    // if (chartData?.length === 0) {
    //     if (!portfolioFetching) {
    //         return <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
    //             <IconFaceIdError className='size-10 text-white/50' />
    //             <p className="text-sm text-white/50">Data Unavailable</p>
    //             <Button disabled={portfolioRefetching} variant="outline" size="sm" className="bg-white/5 rounded-md" onClick={() => portfolioRefetch()}>
    //                 <IconRefresh className={cn('size-4', portfolioRefetching && 'animate-spin')} />
    //                 {portfolioRefetching ? 'Refreshing...' : 'Refresh'}
    //             </Button>
    //         </div>
    //     }
    // }

    return (
        <div className="w-full h-full flex flex-col gap-2 p-2">
            <div className="w-full h-fit shrink-0 flex gap-2 flex-col sm:flex-row items-center justify-between">
                <ToggleGroup
                    size="sm"
                    type="single"
                    className="bg-secondary rounded-md w-full sm:w-fit"
                    value={selectedChart.type}
                    onValueChange={(value) => {
                        if (value === '') {
                            return
                        }
                        setSelectedChart((prev) => ({ ...prev, type: value as 'area' | 'calendar' }))
                    }}
                >
                    <ToggleGroupItem className="w-32 rounded-l-md bg-white/5" value="area">
                        <IconTimeline className="size-4" />
                        Performance
                    </ToggleGroupItem>
                    <ToggleGroupItem className="w-32 rounded-r-md bg-white/5" value="calendar">
                        <IconCalendarWeek className="size-4" />
                        Calendar
                    </ToggleGroupItem>
                </ToggleGroup>
                <div className="flex items-center gap-2 w-full sm:w-fit justify-between md:justify-start">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="bg-white/5 rounded-md">
                                {selectedChart.account === 'accountValue' ? 'Total Equity' : 'Perps Equity'}
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
                                Total Equity
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    setSelectedChart((prev) => ({
                                        ...prev,
                                        account: 'perp'
                                    }))
                                }
                            >
                                Perps Equity
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                                Day
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    setSelectedChart((prev) => ({
                                        ...prev,
                                        range: prev.account === 'perp' ? 'perpWeek' : 'week'
                                    }))
                                }
                            >
                                Week
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    setSelectedChart((prev) => ({
                                        ...prev,
                                        range: prev.account === 'perp' ? 'perpMonth' : 'month'
                                    }))
                                }
                            >
                                Month
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    setSelectedChart((prev) => ({
                                        ...prev,
                                        range: prev.account === 'perp' ? 'perpAllTime' : 'allTime'
                                    }))
                                }
                            >
                                All Time
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
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
                )}
                {selectedChart.type === 'calendar' && (
                    <div className="w-full h-full overflow-y-auto">
                        <PortfolioCalendar calendarData={displayCalendarData} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default PortfolioChart
