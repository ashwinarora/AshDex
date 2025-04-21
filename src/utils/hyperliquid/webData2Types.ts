// Define types for all nested structures

import { IClearingHouseState } from './hyperLiquidTypes'

export interface IWebData2 {
  clearinghouseState: IClearingHouseState
  // leadingVaults: any[]
  totalVaultEquity: number
  // openOrders: any[]
  agentAddress: string
  agentValidUntil: number
  cumLedger: number
  meta: Meta
  assetCtxs: AssetCtx[]
  serverTime: number
  isVault: boolean
  user: string
  // twapStates: any[]
  spotState: SpotState
  spotAssetCtxs: SpotAssetCtx[]
  perpsAtOpenInterestCap: string[]
}

interface Meta {
  universe: UniverseAsset[]
}

interface UniverseAsset {
  szDecimals: number
  name: string
  maxLeverage: number
}

interface AssetCtx {
  funding: number
  openInterest: number
  prevDayPx: number
  dayNtlVlm: number
  premium: number
  oraclePx: number
  markPx: number
  midPx: number
  impactPxs: number[]
  dayBaseVlm: number
}

interface SpotState {
  balances: Balance[]
}

interface Balance {
  coin: string
  token: number
  total: number
  hold: number
  entryNtl: number
}

interface SpotAssetCtx {
  prevDayPx: number
  dayNtlVlm: number
  markPx: number
  midPx: number
  circulatingSupply: number
  coin: string
  totalSupply: number
  dayBaseVlm: number
}
