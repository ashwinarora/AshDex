import { describe, expect, it } from 'vitest'
import { computeUnifiedUsdcAccount } from './unifiedAccount'
import type {
  ClearinghouseStateResponse,
  SpotClearinghouseStateResponse
} from '@nktkas/hyperliquid'

const spot = (usdcTotal: string): SpotClearinghouseStateResponse => ({
  balances: [
    {
      coin: 'USDC',
      token: 0,
      total: usdcTotal,
      hold: '0',
      entryNtl: '0'
    }
  ]
})

const emptyMarginSummary = {
  accountValue: '0',
  totalNtlPos: '0',
  totalRawUsd: '0',
  totalMarginUsed: '0'
}

const perp = (overrides: Partial<ClearinghouseStateResponse>): ClearinghouseStateResponse => ({
  marginSummary: emptyMarginSummary,
  crossMarginSummary: emptyMarginSummary,
  crossMaintenanceMarginUsed: '0',
  withdrawable: '0',
  assetPositions: [],
  time: 0,
  ...overrides
})

describe('computeUnifiedUsdcAccount', () => {
  it('handles unified user with only spot USDC (no positions)', () => {
    const result = computeUnifiedUsdcAccount(spot('1000'), perp({}))
    expect(result.usdcSpotTotal).toBe(1000)
    expect(result.accountValue).toBe(1000)
    expect(result.withdrawable).toBe(1000)
    expect(result.spotEquity).toBe(1000)
    expect(result.perpEquity).toBe(0)
    expect(result.maintenanceMarginUsed).toBe(0)
    expect(result.isolatedMarginUsed).toBe(0)
    expect(result.crossUnrealizedPnl).toBe(0)
    expect(result.crossMarginRatio).toBe(0)
  })

  it('applies cross maintenance margin to withdrawable', () => {
    const result = computeUnifiedUsdcAccount(
      spot('1000'),
      perp({
        crossMaintenanceMarginUsed: '100',
        assetPositions: [
          {
            type: 'oneWay',
            position: {
              coin: 'BTC',
              szi: '0.1',
              leverage: { type: 'cross', value: 5 },
              entryPx: '60000',
              positionValue: '6000',
              unrealizedPnl: '50',
              returnOnEquity: '0.05',
              liquidationPx: null,
              marginUsed: '1200',
              maxLeverage: 50,
              cumFunding: { allTime: '0', sinceOpen: '0', sinceChange: '0' }
            }
          }
        ]
      })
    )
    expect(result.crossUnrealizedPnl).toBe(50)
    expect(result.accountValue).toBe(1050)
    // spot 1000 - isolated 0 - maintenance 100 = 900
    expect(result.withdrawable).toBe(900)
    expect(result.spotEquity).toBe(900)
    // isolated 0 + maintenance 100 + crossUpnl 50 = 150
    expect(result.perpEquity).toBe(150)
    expect(result.maintenanceMarginUsed).toBe(100)
    // 100 / 1050
    expect(result.crossMarginRatio).toBeCloseTo(100 / 1050, 6)
  })

  it('reserves isolated margin from spot before withdrawable is available', () => {
    const result = computeUnifiedUsdcAccount(
      spot('1000'),
      perp({
        crossMaintenanceMarginUsed: '50',
        assetPositions: [
          {
            type: 'oneWay',
            position: {
              coin: 'ETH',
              szi: '1',
              leverage: { type: 'isolated', value: 5, rawUsd: '200' },
              entryPx: '3000',
              positionValue: '3100',
              unrealizedPnl: '100',
              returnOnEquity: '0.5',
              liquidationPx: null,
              marginUsed: '200',
              maxLeverage: 50,
              cumFunding: { allTime: '0', sinceOpen: '0', sinceChange: '0' }
            }
          }
        ]
      })
    )
    expect(result.isolatedMarginUsed).toBe(200)
    // Isolated PnL is not part of cross unrealized total.
    expect(result.crossUnrealizedPnl).toBe(0)
    expect(result.accountValue).toBe(1000)
    // 1000 - 200 - 50 = 750
    expect(result.withdrawable).toBe(750)
    expect(result.perpEquity).toBe(250)
  })

  it('clamps withdrawable at zero when margin exceeds spot balance', () => {
    const result = computeUnifiedUsdcAccount(
      spot('100'),
      perp({
        crossMaintenanceMarginUsed: '200',
        assetPositions: []
      })
    )
    expect(result.withdrawable).toBe(0)
    expect(result.spotEquity).toBe(0)
  })

  it('returns zeros when spot and perp state are missing', () => {
    const result = computeUnifiedUsdcAccount(null, null)
    expect(result.accountValue).toBe(0)
    expect(result.withdrawable).toBe(0)
    expect(result.crossMarginRatio).toBe(0)
  })

  it('regression: matches testnet wallet with $205.94 spot USDC and empty perp state', () => {
    // Real numbers pulled from the QA testnet wallet under unified mode.
    // Before Pass 2, AmountInput and Scale read `chs.withdrawable` directly
    // and computed max = 0, disabling all order forms. The helper must
    // recover the true withdrawable (= spot USDC) from unified state.
    const result = computeUnifiedUsdcAccount(
      {
        balances: [
          {
            coin: 'USDC',
            token: 0,
            total: '205.939162',
            hold: '0.0',
            entryNtl: '0.0'
          }
        ]
      },
      perp({
        crossMaintenanceMarginUsed: '0.0',
        withdrawable: '0.0',
        marginSummary: {
          accountValue: '0.0',
          totalNtlPos: '0.0',
          totalRawUsd: '0.0',
          totalMarginUsed: '0.0'
        }
      })
    )
    expect(result.usdcSpotTotal).toBeCloseTo(205.939162, 6)
    expect(result.withdrawable).toBeCloseTo(205.939162, 6)
    expect(result.accountValue).toBeCloseTo(205.939162, 6)
    expect(result.maintenanceMarginUsed).toBe(0)
  })

  it('ignores non-USDC spot balances', () => {
    const spotWithHype: SpotClearinghouseStateResponse = {
      balances: [
        { coin: 'HYPE', token: 150, total: '10', hold: '0', entryNtl: '400' },
        { coin: 'USDC', token: 0, total: '500', hold: '0', entryNtl: '0' }
      ]
    }
    const result = computeUnifiedUsdcAccount(spotWithHype, perp({}))
    expect(result.usdcSpotTotal).toBe(500)
    expect(result.accountValue).toBe(500)
  })
})
