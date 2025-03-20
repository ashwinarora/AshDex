import type { Hex } from 'viem'
import metamaskicon from '@/assets/images/metamask_icon.svg'
// import atomicwallet from "@/assets/images/atomicwallet_icon.svg";
import phantom from '@/assets/images/phantom_icon.svg'
import trustwallet from '@/assets/images/trustwallet_icon.svg'
import walletconnect from '@/assets/images/walletconnect_icon.svg'
import coinbase from '@/assets/images/coinbase_icon.webp'

export const WEBSOCKET_MAINNET_URL = 'wss://api.hyperliquid.xyz/ws'

export const WEBSOCKET_TESTNET_URL = 'wss://api.hyperliquid-testnet.xyz/ws'

export const HYPERLIQUID_API_MAINNET = 'https://api.hyperliquid.xyz'

export const HYPERLIQUID_API_TESTNET = 'https://api.hyperliquid-testnet.xyz'

export const USDC_ARBITRUM: Hex = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'

export const HYPERLIQUID_DEPOSIT: Hex = '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7'

export const AGENT_PRIVATE_KEY = 'agentPrivateKey'

export const BUILDER_ADDRESS = '0x1710022f671b4032d6c7262107ba231f41f84ce8' // Ashwin's address

export const HLP_VAULT_TESTNET = '0xa15099a30bbf2e68942d6f4c43d70d04faeab0a0' // https://app.hyperliquid-testnet.xyz/vaults/0xa15099a30bbf2e68942d6f4c43d70d04faeab0a0

export const MAX_DECIMALS_PERP = 6  // https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size
export const MAX_DECIMALS_SPOT = 8

export const CHART_INTERVALS = [
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1h',
  '2h',
  '4h',
  '8h',
  '12h',
  '1d',
  '3d',
  '1w',
  '1M'
] as const

export const AGENT_NAME = 'nexon_agent'

export const WALLETS = [
  {
    id: 'metaMaskSDK',
    name: 'Metamask',
    icon: metamaskicon
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: phantom
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    icon: coinbase
  },
  {
    id: 'walletConnect',
    name: 'WalletConnect',
    icon: walletconnect
  },
  {
    id: 'trustWallet',
    name: 'Trust Wallet',
    icon: trustwallet
  },
  { id: 'other', name: 'Other wallets', icon: '' }
] as const

export const WALLET_RULES = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer consequat elit sed augue porttitor, vel consequat diam bibendum. Nullam rhoncus eros nec ante aliquet, nec euismod libero molestie. Duis tortor tortor, viverra nec ante in, malesuada luctus massa. Donec rhoncus ex non consectetur congue. Duis lorem dui, tincidunt id mauris sit amet, venenatis laoreet eros. Praesent convallis metus sed leo condimentum pharetra. 

Donec ultricies enim sed magna efficitur posuere. Praesent rhoncus velit odio, a pellentesque massa porta ac. Donec porttitor ex sit amet urna porta ultrices. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer consequat elit sed augue porttitor, vel consequat diam bibendum. Nullam rhoncus eros nec ante aliquet, nec euismod libero molestie. Duis tortor tortor, viverra nec ante in, malesuada luctus massa. Donec rhoncus ex non consectetur congue. Duis lorem dui, tincidunt id mauris sit amet, venenatis laoreet eros. Praesent convallis metus sed leo condimentum pharetra. 

Praesent rhoncus velit odio, a pellentesque massa porta ac. Donec porttitor ex sit amet urna porta ultrices. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer consequat elit sed augue porttitor, vel consequat diam bibendum. Nullam rhoncus eros nec ante aliquet, nec euismod libero molestie. Duis tortor tortor, viverra nec ante in, malesuada luctus massa. Donec rhoncus ex non consectetur congue. Duis lorem dui, tincidunt id mauris sit amet, venenatis laoreet eros. Praesent convallis metus sed leo condimentum pharetra. Donec ultricies enim sed magna efficitur posuere. Praesent rhoncus velit odio, a pellentesque massa porta ac. Donec porttitor ex sit amet urna porta ultrices.
`
