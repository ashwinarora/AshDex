export interface WsTrade {
  coin: string
  side: string
  px: string
  sz: string
  hash: string
  time: number
  tid: number // ID unique across all assets
  users: [string, string]
}

// Snapshot feed, pushed on each block that is at least 0.5 since last push
export interface WsBook {
  coin: string
  levels: [Array<WsLevel>, Array<WsLevel>]
  time: number
}

export interface WsLevel {
  px: string // price
  sz: string // size
  n: number // number of orders
}

export interface Notification {
  notification: string
}

export interface AllMids {
  mids: Record<string, string>
}

export interface Candle {
  t: number // open millis
  T: number // close millis
  s: string // coin
  i: string // interval
  o: number // open price
  c: number // close price
  h: number // high price
  l: number // low price
  v: number // volume (base unit)
  n: number // number of trades
}

export type WsUserEvent =
  | { fills: WsFill[] }
  | { funding: WsUserFunding }
  | { liquidation: WsLiquidation }
  | { nonUserCancel: WsNonUserCancel[] }

export interface WsUserFills {
  isSnapshot?: boolean
  user: string
  fills: Array<WsFill>
}

export interface WsFill {
  coin: string
  px: string // price
  sz: string // size
  side: string
  time: number
  startPosition: string
  dir: string // used for frontend display
  closedPnl: string
  hash: string // L1 transaction hash
  oid: number // order id
  crossed: boolean // whether order crossed the spread (was taker)
  fee: string // negative means rebate
  tid: number // unique trade id
  liquidation?: FillLiquidation
  feeToken: string // the token the fee was paid in
  builderFee?: string // amount paid to builder, also included in fee
}

export interface FillLiquidation {
  liquidatedUser?: string
  markPx: number
  method: 'market' | 'backstop'
}

export interface WsUserFunding {
  time: number
  coin: string
  usdc: string
  szi: string
  fundingRate: string
}

export interface WsLiquidation {
  lid: number
  liquidator: string
  liquidated_user: string
  liquidated_ntl_pos: string
  liquidated_account_value: string
}

export interface WsNonUserCancel {
  coin: string
  oid: number
}

export interface WsOrder {
  order: WsBasicOrder
  status: 'open' | 'filled' | 'canceled' | 'triggered' | 'rejected' | 'marginCanceled'
  statusTimestamp: number
}

export interface WsBasicOrder {
  coin: string
  side: string
  limitPx: string
  sz: string
  oid: number
  timestamp: number
  origSz: string
  cloid: string | undefined
}

export interface WsActiveAssetCtx {
  coin: string
  ctx: PerpsAssetCtx
}

export interface WsActiveSpotAssetCtx {
  coin: string
  ctx: SpotAssetCtx
}

export type SharedAssetCtx = {
  dayNtlVlm: number
  prevDayPx: number
  markPx: number
  midPx?: number
}

export type PerpsAssetCtx = SharedAssetCtx & {
  funding: number
  openInterest: number
  oraclePx: number
}

export type SpotAssetCtx = SharedAssetCtx & {
  circulatingSupply: number
}

export interface WsActiveAssetData {
  user: string
  coin: string
  // leverage: Leverage;
  maxTradeSzs: [number, number]
  availableToTrade: [number, number]
}

export interface WsTwapSliceFill {
  fill: WsFill
  twapId: number
}

export interface WsUserTwapSliceFills {
  isSnapshot?: boolean
  user: string
  twapSliceFills: Array<WsTwapSliceFill>
}

export interface TwapState {
  coin: string
  user: string
  side: string
  sz: number
  executedSz: number
  executedNtl: number
  minutes: number
  reduceOnly: boolean
  randomize: boolean
  timestamp: number
}

export type TwapStatus = 'activated' | 'terminated' | 'finished' | 'error'
export interface WsTwapHistory {
  state: TwapState
  status: {
    status: TwapStatus
    description: string
  }
  time: number
}

export interface WsUserTwapHistory {
  isSnapshot?: boolean
  user: string
  history: Array<WsTwapHistory>
}

// manually typed because this endpoint is not documented
export interface IExtraAgent {
  address: string
  name: string
  validUntil: number
}

export type MetaData = {
  szDecimals: number
  name: string
  maxLeverage: number
  onlyIsolated?: boolean
  isDelisted?: boolean
}

export type PlaceOrderAction = {
  type: 'order'
  orders: Array<{
    a: number
    b: boolean
    p: string
    s: string
    r: boolean
    t:
      | { limit: { tif: 'Alo' | 'Ioc' | 'Gtc' } }
      | {
          trigger: {
            isMarket: boolean
            triggerPx: string
            tpsl: 'tp' | 'sl'
          }
        }
    c?: string
  }>
  grouping: 'na' | 'normalTpsl' | 'positionTpsl'
  builder?: {
    b: string
    f: number
  }
}

export interface MarginSummary {
  accountValue: number
  totalNtlPos: number
  totalRawUsd: number
  totalMarginUsed: number
}

export interface IClearingHouseState {
  marginSummary: MarginSummary
  crossMarginSummary: MarginSummary
  crossMaintenanceMarginUsed: number
  withdrawable: number
  assetPositions: Array<IPosition>
  time: number
}

export interface IPositionData {
  coin: string
  cumFunding: {
    allTime: number
    sinceChange: number
    sinceOpen: number
  }
  entryPx: number
  leverage: {
    rawUsd: number
    type: number
    value: number
  }
  liquidationPx: number
  marginUsed: number
  maxLeverage: number
  positionValue: number
  returnOnEquity: number
  szi: number
  unrealizedPnl: number
}

export interface IPosition {
  position: IPositionData
  type: string
}

export type Order = {
  coin: string
  side: 'buy' | 'sell'
  limitPx: number
  sz: number
  oid: number
  timestamp: number
  origSz: number
}

export type SpotOrder = {
  time: string
  symbol: string
  symbolText: string
  type: string
  side: string
  price: string
  amount: string
  filled: string
  reduceOnly: string
  postOnly: string
  triggerConditions: string
  tp_sl: string
  id: number
}

export type VaultsOrder = {
  time: string
  type: string
  coin: string
  symbol: string
  direction: string
  size: string
  originalSize: string
  orderValue: string
  price: string
  reduceOnly: string
  triggerConditions: string
  tpsl: string
  id: number
  vid: number
}
