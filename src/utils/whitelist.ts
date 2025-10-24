import { isTestnet } from "./constants"

export const MAINNET_SPOT_WHITELIST = [
  'HYPE/USDC',
  'UBTC/USDC',
  'UETH/USDC',
  'USOL/USDC',
  'USDT0/USDC',
  'UXPL/USDC',
  'UPUMP/USDC',
  'UFART/USDC',
  'XAUT/USDC',
  'PURR/USDC'
] as const

const TESTNET_SPOT_WHITELIST = [
  'HYPE/USDC',
  'UBTC/USDC',
  'UETH/USDC',
  'USOL/USDC',
  'USDT0/USDC',
  'UXPL/USDC',
  'UPUMP/USDC',
  'UFART/USDC',
  'XAUT/USDC',
  'PURR/USDC'
] as const

const SPOT_WHITELIST = isTestnet ? TESTNET_SPOT_WHITELIST : MAINNET_SPOT_WHITELIST

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