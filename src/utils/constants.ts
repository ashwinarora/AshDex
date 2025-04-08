import type { Hex } from 'viem'
import metamaskicon from '@/assets/images/metamask_icon.svg'
import phantom from '@/assets/images/phantom_icon.svg'
import trustwallet from '@/assets/images/trustwallet_icon.svg'
import rabbywallet from '@/assets/images/rabbywallet_icon.svg'
import walletconnect from '@/assets/images/walletconnect_icon.svg'
import coinbase from '@/assets/images/coinbase_icon.webp'

export const WEBSOCKET_MAINNET_URL = 'wss://api.hyperliquid.xyz/ws'

export const WEBSOCKET_TESTNET_URL = 'wss://api.hyperliquid-testnet.xyz/ws'

export const HYPERLIQUID_API_MAINNET = 'https://api.hyperliquid.xyz'

export const HYPERLIQUID_API_TESTNET = 'https://api.hyperliquid-testnet.xyz'

export const COINMARKET_BASE_URL = 'https://pro-api.coinmarketcap.com/v1'

export const USDC_ARBITRUM: Hex = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'

export const HYPERLIQUID_DEPOSIT: Hex = '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7'

export const AGENT_PRIVATE_KEY = 'agentPrivateKey'

export const BUILDER_ADDRESS = '0x1710022f671b4032d6c7262107ba231f41f84ce8' // Ashwin's address

export const HLP_VAULT_TESTNET = '0xa15099a30bbf2e68942d6f4c43d70d04faeab0a0' // https://app.hyperliquid-testnet.xyz/vaults/0xa15099a30bbf2e68942d6f4c43d70d04faeab0a0

export const MAX_DECIMALS_PERP = 6 // https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size
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

export const VAULTS_TAB = ['My Vaults', 'New', 'Popular', 'LP', 'Single', 'Stable'] as const

export const LENDBORROW_TAB = ['Supply APR', 'Borrow APR', 'Interest Rate'] as const

export const LENDBORROW_EDIT_OPTIONS = [
  { label: 'Assets', checked: false },
  { label: 'Supplies', checked: true },
  { label: 'Supply APY', checked: true },
  { label: 'Borrowed', checked: true },
  { label: 'Borrow APY', checked: true },
  { label: 'Available', checked: false }
]

export const LENDBORROW_LOADING_MESSAGES = {
  Supply: {
    title: 'Processing your deposit…',
    subtitle: 'The transaction has been sent to the blockchain. This may take some time.'
  },
  Borrow: {
    title: 'Loan request sent…',
    subtitle: 'Waiting for network confirmation. Please wait a few seconds.'
  },
  Withdraw: {
    title: 'Processing your withdrawal…',
    subtitle: 'We have sent the transaction to the blockchain. Please wait for confirmation.'
  },
  Repay: {
    title: 'Processing your repayment…',
    subtitle: 'The transaction has been sent. This may take some time.'
  }
} as const

export const ORDER_INTERVALS = ['1s', '1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W'] as const

export const OPEN_ORDERS_SPOT_COLUMNS = [
  { key: 'time', label: 'Time' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'type', label: 'Type' },
  { key: 'side', label: 'Side' },
  { key: 'price', label: 'Price' },
  { key: 'amount', label: 'Amount' },
  { key: 'filled', label: 'Filled' },
  { key: 'reduceOnly', label: 'Reduce Only' },
  { key: 'postOnly', label: 'Post Only' },
  { key: 'triggerConditions', label: 'Trigger Conditions' },
  { key: 'tp_sl', label: 'TP/SL' },
  { key: 'action', label: '' }
] as const

export const OPEN_ORDERS_FEATURE_COLUMNS = [
  { key: 'coin', label: 'Coin' },
  { key: 'side', label: 'Side' },
  { key: 'limitPrice', label: 'Limit Price' },
  { key: 'size', label: 'Size' },
  { key: 'orderID', label: 'Order ID' },
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'originalsize', label: 'Original Size' }
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
    id: 'coinbaseWallet',
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
  {
    id: 'rabby',
    name: 'Rabby Wallet',
    icon: rabbywallet
  },
  { id: 'other', name: 'Other wallets', icon: '' }
] as const

export const WALLET_RULES = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer consequat elit sed augue porttitor, vel consequat diam bibendum. Nullam rhoncus eros nec ante aliquet, nec euismod libero molestie. Duis tortor tortor, viverra nec ante in, malesuada luctus massa. Donec rhoncus ex non consectetur congue. Duis lorem dui, tincidunt id mauris sit amet, venenatis laoreet eros. Praesent convallis metus sed leo condimentum pharetra. 

Donec ultricies enim sed magna efficitur posuere. Praesent rhoncus velit odio, a pellentesque massa porta ac. Donec porttitor ex sit amet urna porta ultrices. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer consequat elit sed augue porttitor, vel consequat diam bibendum. Nullam rhoncus eros nec ante aliquet, nec euismod libero molestie. Duis tortor tortor, viverra nec ante in, malesuada luctus massa. Donec rhoncus ex non consectetur congue. Duis lorem dui, tincidunt id mauris sit amet, venenatis laoreet eros. Praesent convallis metus sed leo condimentum pharetra. 

Praesent rhoncus velit odio, a pellentesque massa porta ac. Donec porttitor ex sit amet urna porta ultrices. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer consequat elit sed augue porttitor, vel consequat diam bibendum. Nullam rhoncus eros nec ante aliquet, nec euismod libero molestie. Duis tortor tortor, viverra nec ante in, malesuada luctus massa. Donec rhoncus ex non consectetur congue. Duis lorem dui, tincidunt id mauris sit amet, venenatis laoreet eros. Praesent convallis metus sed leo condimentum pharetra. Donec ultricies enim sed magna efficitur posuere. Praesent rhoncus velit odio, a pellentesque massa porta ac. Donec porttitor ex sit amet urna porta ultrices.
`

export const INFOTAB_DESC = `
Bitcoin (BTC) is a peer-to-peer cryptocurrency that aims to function as a means of exchange that is independent of any central authority. BTC can be transferred electronically in a secure, verifiable, and immutable way.

Launched in 2009, BTC is the first virtual currency to solve the double-spending issue by timestamping transactions before broadcasting them to all of the nodes in the Bitcoin network. The Bitcoin Protocol offered a solution to the Byzantine Generals' Problem with a blockchain network structure, a notion first created by Stuart Haber and W. Scott Stornetta in 1991.

Bitcoin’s whitepaper was published pseudonymously in 2008 by an individual, or a group, with the pseudonym “Satoshi Nakamoto”, whose underlying identity has still not been verified.

The Bitcoin protocol uses an SHA-256d-based Proof-of-Work (PoW) algorithm to reach network consensus. Its network has a target block time of 10 minutes and a maximum supply of 21 million tokens, with a decaying token emission rate. To prevent fluctuation of the block time, the network's block difficulty is re-adjusted through an algorithm based on the past 2016 block times.

With a block size limit capped at 1 megabyte, the Bitcoin Protocol has supported both the Lightning Network, a second-layer infrastructure for payment channels, and Segregated Witness, a soft-fork to increase the number of transactions on a block, as solutions to network scalability.

With a block size limit capped at 1 megabyte, the Bitcoin Protocol has supported both the Lightning Network, a second-layer infrastructure for payment channels, and Segregated Witness, a soft-fork to increase the number of transactions on a block, as solutions to network scalability.
`
