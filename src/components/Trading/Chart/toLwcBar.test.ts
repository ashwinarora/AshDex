import { describe, expect, it } from 'vitest'
import { toLwcBar, toHyperliquidInterval, intervalToSeconds } from './toLwcBar'
import type * as hl from '@nktkas/hyperliquid'

// A candle sample matching the exact shape Hyperliquid returns from
// `/info candleSnapshot`: `t` in milliseconds (13 digits), o/h/l/c/v as strings.
const sampleCandle: hl.CandleWsEvent = {
  t: 1789239300000,
  T: 1789239599999,
  s: 'BTC',
  i: '5m',
  o: '77032.0',
  c: '77042.0',
  h: '77045.0',
  l: '77024.0',
  v: '0.12345',
  n: 42
}

describe('toLwcBar', () => {
  it('converts millisecond `t` to unix seconds', () => {
    const { candle } = toLwcBar(sampleCandle)
    // ms -> s means dividing by 1000 and flooring
    expect(candle.time).toBe(1789239300)
    // Lightweight Charts requires 10-digit seconds; 13-digit ms silently render nothing.
    expect(String(candle.time).length).toBe(10)
  })

  it('parses OHLC strings to numbers', () => {
    const { candle } = toLwcBar(sampleCandle)
    expect(candle.open).toBe(77032)
    expect(candle.high).toBe(77045)
    expect(candle.low).toBe(77024)
    expect(candle.close).toBe(77042)
    expect(typeof candle.open).toBe('number')
  })

  it('emits a volume point with matching time and green color when close >= open', () => {
    const { volume } = toLwcBar(sampleCandle)
    expect(volume.time).toBe(1789239300)
    expect(volume.value).toBeCloseTo(0.12345)
    expect(volume.color).toContain('16, 185, 129') // --buy rgba
  })

  it('emits a red volume when close < open', () => {
    const down: hl.CandleWsEvent = { ...sampleCandle, o: '77042.0', c: '77032.0' }
    const { volume } = toLwcBar(down)
    expect(volume.color).toContain('244, 63, 94') // --sell rgba
  })
})

describe('toHyperliquidInterval', () => {
  it('maps every IntervalType to a real Hyperliquid interval literal', () => {
    expect(toHyperliquidInterval('1')).toBe('1m')
    expect(toHyperliquidInterval('3')).toBe('3m')
    expect(toHyperliquidInterval('5')).toBe('5m')
    expect(toHyperliquidInterval('15')).toBe('15m')
    expect(toHyperliquidInterval('30')).toBe('30m')
    expect(toHyperliquidInterval('60')).toBe('1h')
    expect(toHyperliquidInterval('120')).toBe('2h')
    expect(toHyperliquidInterval('240')).toBe('4h')
    expect(toHyperliquidInterval('480')).toBe('8h')
    expect(toHyperliquidInterval('720')).toBe('12h')
    expect(toHyperliquidInterval('1D')).toBe('1d')
    expect(toHyperliquidInterval('3D')).toBe('3d')
    expect(toHyperliquidInterval('1W')).toBe('1w')
    expect(toHyperliquidInterval('1M')).toBe('1M')
  })
})

describe('intervalToSeconds', () => {
  it('returns 60 seconds for the 1m interval', () => {
    expect(intervalToSeconds('1')).toBe(60)
  })
  it('returns 3600 seconds for the 1h interval', () => {
    expect(intervalToSeconds('60')).toBe(3600)
  })
  it('returns 86400 seconds for the 1d interval', () => {
    expect(intervalToSeconds('1D')).toBe(86400)
  })
})
