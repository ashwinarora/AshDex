export interface BarData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export const INTERVALS = [
  '1',
  '3',
  '5',
  '15',
  '30',
  '60',
  '120',
  '240',
  '480',
  '720',
  '1D',
  '3D',
  '1W',
  '1M'
] as const

export type IntervalType = (typeof INTERVALS)[number]
