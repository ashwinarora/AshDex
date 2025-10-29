'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import { IconTilde, IconTrendingDown3, IconTrendingUp3 } from '@tabler/icons-react'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { useQuery } from '@tanstack/react-query'
import { Fill } from '@nktkas/hyperliquid'
import { useAccount } from 'wagmi'
import { formatWithKMB } from '@/utils/format'

const fillDays = (
  filteredCalendarData: { time: string; value: string }[],
  calendarData: { time: number; value: string }[]
) => {
  const startDate = new Date(filteredCalendarData[0].time)
  const endDate = new Date(filteredCalendarData[filteredCalendarData.length - 1].time)

  const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate()

  const fillWeeks = Array.from({ length: 6 - startDate.getDay() + daysInMonth }).map(
    (item, index) => ({
      time: new Date(calendarData[0].time + index * 1000 * 60 * 60 * 24).toDateString(),
      value: ''
    })
  )
  return fillWeeks
    .map((item) => {
      const filteredItem = filteredCalendarData.find(
        (_filteredItem) => _filteredItem.time === item.time
      )
      return { ...item, value: filteredItem ? filteredItem.value : '0.00' }
    })
    .slice(0, daysInMonth)
}

export function PortfolioCalendar({
  calendarData,
  pnlType,
  isRTL
}: {
  calendarData: {
    time: number
    value: string
  }[]
  pnlType: 'unrealized' | 'realized' | 'total'
  isRTL: boolean
}) {
  const { address } = useAccount()
  const { sdkInfoClient } = useHyperliquidStore(
    useShallow((state) => ({
      sdkInfoClient: state.sdkInfoClient
    }))
  )

  const { data: tradeHistory } = useQuery<Fill[]>({
    queryKey: ['tradeHistory', address],
    queryFn: async () => {
      if (!address) return []
      if (!sdkInfoClient) return []
      const response = await sdkInfoClient?.userFills({
        user: address
      })
      return response
    },
    enabled: !!address && !!sdkInfoClient,
    initialData: []
  })

  const formattedDataUnrealizedPnl = useMemo(() => {
    const filteredCalendarData = calendarData
      .sort((a, b) => a.time - b.time)
      .map((item) => ({ ...item, time: new Date(item.time).toDateString() }))
      .reduce(
        (acc: { time: string; value: string }[], curr) => {
          if (acc.length === 0) {
            acc.push(curr)
          } else {
            const lastItem = acc[acc.length - 1]
            if (lastItem.time === curr.time) {
              acc[acc.length - 1] = curr
            } else {
              acc.push(curr)
            }
          }
          return acc
        },
        [] as { time: string; value: string }[]
      )

    return fillDays(filteredCalendarData, calendarData)
  }, [calendarData])

  const formattedDataRealizedPnl = useMemo(() => {
    if (tradeHistory.length === 0 || calendarData.length === 0) {
      return []
    } else {
      const filteredTradeHistory = tradeHistory
        .filter((fill) => parseFloat(fill.closedPnl) !== 0)
        .map((item) => ({ time: new Date(item.time).toDateString(), value: item.closedPnl }))
        .reduce(
          (acc: { time: string; value: string }[], curr) => {
            if (acc.length === 0) {
              acc.push(curr)
            } else {
              const lastItem = acc[acc.length - 1]
              if (lastItem.time === curr.time) {
                acc[acc.length - 1] = curr
              } else {
                acc.push(curr)
              }
            }
            return acc
          },
          [] as { time: string; value: string }[]
        )
      return fillDays(filteredTradeHistory, calendarData)
    }
  }, [tradeHistory, calendarData])

  const formattedDataTotalPnl = useMemo(() => {
    if (formattedDataUnrealizedPnl.length === 0 || formattedDataRealizedPnl.length === 0) {
      return []
    } else {
      return formattedDataUnrealizedPnl.map((item, index) => {
        const unrealizedPnl = parseFloat(item.value)
        const realizedPnl = parseFloat(formattedDataRealizedPnl[index]?.value)
          ? parseFloat(formattedDataRealizedPnl[index].value)
          : 0
        const totalPnl = unrealizedPnl + realizedPnl
        return {
          time: item.time,
          value: totalPnl.toFixed(2)
        }
      })
    }
  }, [formattedDataUnrealizedPnl, formattedDataRealizedPnl])

  if (calendarData.length === 0) {
    return null
  }

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full h-full grid place-content-stretch overflow-y-auto grid-cols-1 sm:grid-cols-7 gap-1"
    >
      {(pnlType === 'unrealized'
        ? formattedDataUnrealizedPnl
        : pnlType === 'realized'
          ? formattedDataRealizedPnl
          : formattedDataTotalPnl
      ).map((dayData, index) => (
        <div
          key={index}
          className={cn(
            'flex flex-col rounded-md relative items-center p-1 justify-center h-full w-full',
            dayData.value === '0.00'
              ? 'bg-white/10'
              : parseFloat(dayData.value) > 0
                ? 'bg-green/10'
                : parseFloat(dayData.value) < 0
                  ? 'bg-red/10'
                  : 'bg-white/10'
          )}
        >
          <div className="flex flex-col w-full px-1 gap-1 text-xs items-start h-fit justify-start">
            {new Date(dayData.time).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          </div>
          <div
            className={cn(
              'flex text-base items-end justify-end px-1 w-full h-full',
              dayData.value === '0.00' || dayData.value === '$0.00'
                ? 'text-white'
                : parseFloat(dayData.value) > 0
                  ? 'text-green'
                  : parseFloat(dayData.value) < 0
                    ? 'text-red'
                    : 'text-white'
            )}
          >
            {parseFloat(dayData.value) > 0 ? '+' : parseFloat(dayData.value) < 0 ? '-' : ''}
            {`$${formatWithKMB(Math.abs(parseFloat(dayData.value)))}`}
          </div>
          <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2">
            {dayData.value === '0.00' ? (
              <IconTilde className="size-10 opacity-5 text-white" />
            ) : parseFloat(dayData.value) > 0 ? (
              <IconTrendingUp3 className="size-10 opacity-5 text-green" />
            ) : parseFloat(dayData.value) < 0 ? (
              <IconTrendingDown3 className="size-10 opacity-5 text-red" />
            ) : (
              <IconTilde className="size-10 opacity-5 text-white" />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
