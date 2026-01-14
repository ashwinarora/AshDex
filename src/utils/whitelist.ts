import { isTestnet } from './constants'

export const MAINNET_SPOT_WHITELIST = [
  'HYPE/USDC',
  'UBTC/USDC',
  'UETH/USDC',
  'USOL/USDC',
  'UPUMP/USDC',
  'UFART/USDC',
  'XAUT/USDC',
  'PURR/USDC'
] as const

export const MAINNET_PERPS_WHITELIST = [
  'BTC-USDC',
  'ETH-USDC',
  'SOL-USDC',
  'HYPE-USDC',
  'XRP-USDC',
  'ZEC-USDC',
  'FARTCOIN-USDC',
  'PUMP-USDC',
  'LTC-USDC',
  'IP-USDC',
  'SUI-USDC'
] as const

export const TESTNET_PERPS_WHITELIST = [
  'BTC-USDC',
  'ETH-USDC',
  'SOL-USDC',
  'HYPE-USDC',
  'XRP-USDC',
  'ZEC-USDC',
  'FARTCOIN-USDC',
  'PUMP-USDC',
  'LTC-USDC',
  'IP-USDC',
  'SUI-USDC'
] as const

const TESTNET_SPOT_WHITELIST = [
  'HYPE/USDC',
  'UBTC/USDC',
  'UETH/USDC',
  'USOL/USDC',
  'UPUMP/USDC',
  'UFART/USDC',
  'XAUT/USDC',
  'PURR/USDC'
] as const

const SPOT_WHITELIST = isTestnet ? TESTNET_SPOT_WHITELIST : MAINNET_SPOT_WHITELIST
const PERPS_WHITELIST = isTestnet ? TESTNET_PERPS_WHITELIST : MAINNET_PERPS_WHITELIST

export const ALLOWED_PERPS_BASES = new Set(
  (PERPS_WHITELIST as readonly string[]).map((p) => p.split('-')[0])
)

export const isWhitelistedPerpPair = (base: string, quote: string = 'USDC'): boolean => {
  return (PERPS_WHITELIST as readonly string[]).includes(`${base}-${quote}`)
}

export const isWhitelistedPerpRouteAsset = (asset: string): boolean => {
  return ALLOWED_PERPS_BASES.has(asset)
}

export const DEFAULT_SPOT_ASSET = 'HYPE'

export const ALLOWED_SPOT_BASES = new Set(
  (SPOT_WHITELIST as readonly string[]).map((p) => p.split('/')[0])
)

export const isWhitelistedSpotPair = (base: string, quote: string): boolean => {
  return (SPOT_WHITELIST as readonly string[]).includes(`${base}/${quote}`)
}

export const isWhitelistedSpotRouteAsset = (asset: string): boolean => {
  return ALLOWED_SPOT_BASES.has(asset)
}
