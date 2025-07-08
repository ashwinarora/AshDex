'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

export function PortfolioCalendar({
    calendarData
}: {
    calendarData: {
        time: number
        value: string
    }[]
}) {
    const formattedData = useMemo(() => {
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

        const startDate = new Date(filteredCalendarData[0].time)
        const endDate = new Date(filteredCalendarData[filteredCalendarData.length - 1].time)

        const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate()

        const fillWeeks = Array.from({ length: 6 - startDate.getDay() + daysInMonth }).map(
            (item, index) => ({
                time: new Date(calendarData[0].time + index * 1000 * 60 * 60 * 24).toDateString(),
                value: ''
            })
        )
        return fillWeeks.map((item) => {
            const filteredItem = filteredCalendarData.find(
                (_filteredItem) => _filteredItem.time === item.time
            )
            return { ...item, value: filteredItem ? filteredItem.value : '0.00' }
        }).slice(0, daysInMonth)
    }, [calendarData])

    if (calendarData.length === 0) {
        return null
    }

    return (
        <div className="w-full h-full grid place-content-stretch overflow-y-auto grid-cols-1 sm:grid-cols-7 gap-1">
            {formattedData.map((dayData, index) => (
                <div
                    key={index}
                    className={cn(
                        'flex flex-col rounded-md items-center p-1 justify-center h-full w-full',
                        dayData.value === '0.00'
                            ? 'bg-white/5'
                            : parseFloat(dayData.value) > 0
                                ? 'bg-green/10'
                                : 'bg-red/10'
                    )}
                >
                    <div className="flex flex-col w-full px-1 gap-1 text-xs items-start h-fit justify-start">
                        {new Date(dayData.time).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </div>
                    <div
                        className={cn(
                            'flex text-sm items-end justify-end px-1 w-full h-full',
                            dayData.value === '0.00' || dayData.value === '$0.00'
                                ? 'text-white'
                                : parseFloat(dayData.value) > 0
                                    ? 'text-green'
                                    : 'text-red'
                        )}
                    >
                        {parseFloat(dayData.value) > 0 ? '+' : parseFloat(dayData.value) < 0 ? '-' : ''}
                        {`$${Math.abs(parseFloat(dayData.value)).toFixed(2)}`}
                    </div>
                </div>
            ))}
        </div>
    )
}
