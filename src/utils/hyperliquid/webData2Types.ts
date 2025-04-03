// Define types for all nested structures

export interface IWebData2 {
  clearinghouseState: ClearinghouseState
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

interface ClearinghouseState {
  marginSummary: MarginSummary
  crossMarginSummary: MarginSummary
  crossMaintenanceMarginUsed: number
  withdrawable: number
  assetPositions: AssetPosition[]
  time: number
}

interface MarginSummary {
  accountValue: number
  totalNtlPos: number
  totalRawUsd: number
  totalMarginUsed: number
}

interface AssetPosition {
  type: string
  position: Position
}

interface Position {
  coin: string
  szi: number
  leverage: Leverage
  entryPx: number
  positionValue: number
  unrealizedPnl: number
  returnOnEquity: number
  liquidationPx: number | null
  marginUsed: number
  maxLeverage: number
  cumFunding: CumFunding
}

interface Leverage {
  type: string
  value: number
}

interface CumFunding {
  allTime: number
  sinceOpen: number
  sinceChange: number
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
