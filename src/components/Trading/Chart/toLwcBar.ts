import type * as hl from '@nktkas/hyperliquid'
import type { IntervalType } from './ChartTypes'
import type { UTCTimestamp } from 'lightweight-charts'

const INTERVAL_MAP: Record<IntervalType, hl.CandleWsParameters['interval']> = {
  '1': '1m',
  '3': '3m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '120': '2h',
  '240': '4h',
  '480': '8h',
  '720': '12h',
  '1D': '1d',
  '3D': '3d',
  '1W': '1w',
  '1M': '1M'
}

const INTERVAL_SECONDS: Record<IntervalType, number> = {
  '1': 60,
  '3': 180,
  '5': 300,
  '15': 900,
  '30': 1800,
  '60': 3600,
  '120': 7200,
  '240': 14400,
  '480': 28800,
  '720': 43200,
  '1D': 86400,
  '3D': 259200,
  '1W': 604800,
  '1M': 2592000
}

export const toHyperliquidInterval = (
  resolution: IntervalType
): hl.CandleWsParameters['interval'] => INTERVAL_MAP[resolution]

export const intervalToSeconds = (resolution: IntervalType): number => INTERVAL_SECONDS[resolution]

export interface LwcCandle {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
}

export interface LwcVolume {
  time: UTCTimestamp
  value: number
  color: string
}

// Aligned with the Ember palette (--buy / --sell) in src/app/globals.css.
const UP_COLOR = 'rgba(16, 185, 129, 0.5)'
const DOWN_COLOR = 'rgba(244, 63, 94, 0.5)'

// Hyperliquid returns candle `t` in milliseconds; Lightweight Charts requires seconds.
export const toLwcBar = (bar: hl.CandleWsEvent): { candle: LwcCandle; volume: LwcVolume } => {
  const time = Math.floor(Number(bar.t) / 1000) as UTCTimestamp
  const open = parseFloat(bar.o.toString())
  const close = parseFloat(bar.c.toString())
  return {
    candle: {
      time,
      open,
      high: parseFloat(bar.h.toString()),
      low: parseFloat(bar.l.toString()),
      close
    },
    volume: {
      time,
      value: parseFloat(bar.v.toString()),
      color: close >= open ? UP_COLOR : DOWN_COLOR
    }
  }
}
