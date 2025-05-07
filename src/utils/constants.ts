import type { Hex } from 'viem'
import metamaskicon from '@/assets/images/metamask_icon.svg'
import phantom from '@/assets/images/phantom_icon.svg'
import trustwallet from '@/assets/images/trustwallet_icon.svg'
import rabbywallet from '@/assets/images/rabbywallet_icon.svg'
import walletconnect from '@/assets/images/walletconnect_icon.svg'
import coinbase from '@/assets/images/coinbase.svg'
import refreshicon from '@/assets/images/refresh_icon.svg'
import disableicon from '@/assets/images/disable_icon.svg'
import hourglassicon from '@/assets/images/hourglass_icon.svg'
import sendcopyicon from '@/assets/images/sendcopy_icon.svg'
import lockoutlineicon from '@/assets/images/lockoutline_icon.svg'
import invitefriends from '@/assets/images/invitefriends_icon.svg'
import theycommit from '@/assets/images/theycommit_icon.svg'
import earnrewards from '@/assets/images/earnrewards_icon.svg'

export const WEBSOCKET_MAINNET_URL = 'wss://api.hyperliquid.xyz/ws'

export const WEBSOCKET_TESTNET_URL = 'wss://api.hyperliquid-testnet.xyz/ws'

export const HYPERLIQUID_API_MAINNET = 'https://api.hyperliquid.xyz'

export const HYPERLIQUID_API_TESTNET = 'https://api.hyperliquid-testnet.xyz'

export const COINMARKET_BASE_URL = 'https://pro-api.coinmarketcap.com/v1'

export const USDC_ARBITRUM: Hex = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'

export const HYPERLIQUID_DEPOSIT: Hex = '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7'

export const AGENT_PRIVATE_KEY = 'agentPrivateKey'

export const BUILDER_ADDRESS =
  process.env.NEXT_PUBLIC_HYPERLIQUID_NETWORK === 'mainnet'
    ? '0x6a181ef519f21f933884038952aabef02876dbcc' // Ahmed's address
    : '0x1710022f671b4032d6c7262107ba231f41f84ce8' // Ashwin's address

export const BUILDER_FEE = '0.1%'

export const HLP_VAULT_TESTNET = '0xa15099a30bbf2e68942d6f4c43d70d04faeab0a0' // https://app.hyperliquid-testnet.xyz/vaults/0xa15099a30bbf2e68942d6f4c43d70d04faeab0a0

export const MAX_DECIMALS_PERP = 6 // https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size
export const MAX_DECIMALS_SPOT = 8
export const MAX_SIG_FIGS = 5

export const SPOT_DELTA = 10000 // https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids

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
export const VAULTS_DETAILS_TAB = ['My Vaults', 'All', 'Active', 'Long', 'Short'] as const
export const VAULT_TAB = ['Account Value', 'PNL'] as const

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

export const VAULTSDETAILS_LOADING_MESSAGES = {
  Deposit: {
    title: 'Processing your deposit…',
    subtitle: 'Your transaction has been sent to the blockchain. Please wait for confirmation.'
  },
  Withdraw: {
    title: 'Processing your withdrawal…',
    subtitle: 'Your transaction has been sent to the blockchain. Please wait for confirmation.'
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

export const OPEN_ORDERS_COLUMNS = [
  { key: 'coin', label: 'Coin' },
  { key: 'side', label: 'Side' },
  { key: 'limitPrice', label: 'Limit Price' },
  { key: 'size', label: 'Size' },
  { key: 'orderID', label: 'Order ID' },
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'originalsize', label: 'Original Size' }
] as const

export const OPEN_ORDERS_VAULTS_COLUMNS = [
  { key: 'time', label: 'Time' },
  { key: 'type', label: 'Type' },
  { key: 'coin', label: 'Coin' },
  { key: 'direction', label: 'Direction' },
  { key: 'size', label: 'Size' },
  { key: 'originalSize', label: 'Original Size' },
  { key: 'orderValue', label: 'Order Value' },
  { key: 'price', label: 'Price' },
  { key: 'reduceOnly', label: 'Reduce Only' },
  { key: 'triggerConditions', label: 'Trigger Conditions' },
  { key: 'tpsl', label: 'TP/SL' }
] as const

export const BALANCE_FUTURES_COLUMNS = [
  { key: 'totalBalance', label: 'Total Balance' },
  { key: 'withdrawableBalance', label: 'Withdrawable Balance' },
  { key: 'send', label: 'Send' },
  { key: 'transfer', label: 'Transfer' }
]
export const BALANCE_SPOT__COLUMNS = [
  { key: 'coin', label: 'Coin' },
  { key: 'token', label: 'Tokens' },
  { key: 'total', label: 'Total Balance' },
  { key: 'hold', label: 'Hold' },
  { key: 'entryNtl', label: 'Entry NTL' }
]

export const BALANCE_VAULTS_COLUMNS = [
  { key: 'coin', label: 'Coin' },
  { key: 'totalBalance', label: 'Total Balance' },
  { key: 'availableBalance', label: 'Available Balance' },
  { key: 'usdc', label: 'USDC Value' },
  { key: 'pnl', label: 'PNL (ROE %)' },
  { key: 'contract', label: 'Contract' }
]

export const REFERRALS_COLUMNS = [
  { key: 'address', label: 'Address' },
  { key: 'dateJoined', label: 'Date Joined' },
  { key: 'totalVolume', label: 'Total Volume' },
  { key: 'feesPaid', label: 'Fees Paid' },
  { key: 'yourRewards', label: 'Your Rewards' }
]

export const TWAP_VAULTS_COLUMNS = [
  { key: 'coin', label: 'Coin' },
  { key: 'size', label: 'Size' },
  { key: 'executedSize', label: 'Executed Size' },
  { key: 'averagePrice', label: 'Average Price' },
  { key: 'runningTime', label: 'Running Time / Total' },
  { key: 'reduceOnly', label: 'Reduce Only' },
  { key: 'actions', label: 'Actions' }
]

export const TRADEHISTORY_VAULTS_COLUMNS = [
  { key: 'time', label: 'Time' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'buysell', label: 'Buy/Sell' },
  { key: 'price', label: 'Price' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'fee', label: 'Fee' },
  { key: 'realizedProfit', label: 'Realized Profit' }
]

export const FUNDINGHISTORY_VAULTS_COLUMNS = [
  { key: 'time', label: 'Time' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'fundingRate', label: 'Funding Rate' },
  { key: 'amountPaid', label: 'Amount Paid/Received' }
]

export const DEPOSITORS_VAULTS_COLUMNS = [
  { key: 'depositor', label: 'Depositor' },
  { key: 'vaultAmount', label: 'Vault Amount' },
  { key: 'unrealizedPNL', label: 'Unrealized PNL' },
  { key: 'allTimePNL', label: 'All-time PNL' },
  { key: 'daysFollowing', label: 'Days Following' }
]

export const LEGACY_REWARD_COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'yourVolume', label: 'Your Volume' },
  { key: 'yourReferralVolume', label: 'Your Referral Volume' },
  { key: 'totalRewardsTool', label: 'Total Rewards Tool' }
]

export const DEPOSIT_WITHDRAWALS_VAULTS_COLUMNS = [
  { key: 'time', label: 'Time' },
  { key: 'status', label: 'Status' },
  { key: 'network', label: 'Network' },
  { key: 'action', label: 'Action' },
  { key: 'accountValueChangr', label: 'Account Value Changr' },
  { key: 'fee', label: 'Fee' }
]

export const ORDERHISTORY_VAULTS_COLUMNS = [
  { key: 'time', label: 'Time' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'buysell', label: 'Buy/Sell' },
  { key: 'type', label: 'Type' },
  { key: 'price', label: 'Price' },
  { key: 'amount', label: 'Amount' },
  { key: 'filled', label: 'Filled' },
  { key: 'avgPrice', label: 'Avg. Price' },
  { key: 'fee', label: 'Fee' },
  { key: 'status', label: 'Status' }
]

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
    id: 'coinbaseWalletSDK',
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

export const STAKE_TABS = [
  { id: 'view', name: 'View:' },
  { id: 'simple', name: 'Simple' },
  { id: 'advanced', name: 'Advanced' },
  { id: 'period', name: 'Period:' }
] as const

export const STAKE_INITIAL_COLUMNS = [
  { key: 'validator', label: 'Validator name' },
  { key: 'totalStaked', label: 'Total staked' },
  { key: 'apy', label: 'Est. APY' }
]

export const STAKE_MYSTAKINGS_COLUMN = [
  { key: 'validator', label: 'Validator name' },
  { key: 'upTime', label: 'Uptime' },
  { key: 'globalApr', label: 'Global APR' },
  { key: 'fee', label: 'Fee' },
  { key: 'apy', label: 'Est. APY' },
  { key: 'yourStaked', label: 'Your Staked' },
  { key: 'earnedAlltime', label: 'Earned, All time' }
] as const

export const STAKE_ALLVALIDATORS_COLUMN = [
  { key: 'validator', label: 'Validator name' },
  { key: 'totalStaked', label: 'Total staked' },
  { key: 'upTime', label: 'Uptime' },
  { key: 'globalApr', label: 'Global APR' },
  { key: 'fee', label: 'Fee' },
  { key: 'apy', label: 'Est. APY' },
  { key: 'yourStaked', label: 'Your Staked' },
  { key: 'earnedAlltime', label: 'Earned, All time' }
] as const

export const STAKE_VIEWHISTORY_COLUMN = [
  { key: 'time', label: 'Time' },
  { key: 'action', label: 'Action' },
  { key: 'validator', label: 'Validator' },
  { key: 'status', label: 'Status' },
  { key: 'amountChange', label: 'Amount Change' }
] as const

export const STAKE_SHOWINFOICON = ['upTime', 'globalApr', 'fee', 'apy'] as const

export const TOOLTIP_CONTENTS: { key: string; content: string }[] = [
  {
    key: 'allTime',
    content:
      'Estimated annual return with daily auto-compounding based on validator recent performance. Calculated over the selected period (All time), accounting for auto-compounding, validator uptime, fee changes, and fluctuations in global rewards.'
  },
  {
    key: 'avgApy',
    content:
      'The Average Annual Percentage Yield (APY)  across all your validators, adjusted for their uptime and fees. Reflects the actual yearly return including auto-compounded rewards.'
  },
  {
    key: 'apy',
    content:
      'Estimated annual return with daily auto-compounding, based on validator uptime, fee, and recent global APR'
  },
  {
    key: 'upTime',
    content:
      'Validator’s availability over the selected period. Higher uptime = more consistent rewards.'
  },
  {
    key: 'globalApr',
    content:
      'Network-wide APR (Annual Percentage Rate) assuming 0% commission and 100% uptime. Used as the base rate for calculating Est. APY.'
  },
  {
    key: 'fee',
    content:
      'Percentage of rewards retained by the validator. Lower fees = higher net rewards for you.'
  }
] as const

export const VAULTS_LIST_COLUMNS = [
  { label: 'Name & Ticker', key: 'name' },
  { label: 'Leader', key: 'leader' },
  { label: 'APR', key: 'apr' },
  { label: 'Total Funds', key: 'totalFunds' },
  { label: 'Your Deposit', key: 'yourDeposit' },
  { label: 'Age (days)', key: 'age' },
  { label: 'Snapshot', key: 'snapshot' },
  { label: 'Status', key: 'status' },
  { label: 'Actions', key: 'actions' }
] as const

export const MORE_OPTIONS = [
  { name: 'Leaderboards', path: '/leaderboards' },
  { name: 'Referrals', path: '/referrals' },
  { name: 'Points', path: '/points' },
  { name: 'Sub-accounts', path: '/sub-accounts' },
  { name: 'Stats', path: '/stats' },
  { name: 'Docs', path: '/docs' },
  { name: 'Vocabulary for novices', path: '/vocabulary' },
  { name: 'Settings', path: '/settings' }
]

export const REFERRALSINFO_TAB = ['Enter Code', 'Create Code', 'Claim'] as const

export const REFERRALSDATA = [
  {
    src: invitefriends,
    alt: 'InviteFriends',
    label: 'Invite your friends',
    opacityClass: 'opacity-60'
  },
  {
    src: theycommit,
    alt: 'TheyCommit',
    label: 'They Commit',
    opacityClass: ''
  },
  {
    src: earnrewards,
    alt: 'Earnrewards',
    label: 'Earn Rewards',
    opacityClass: 'opacity-60'
  }
] as const

export const REFERRALS_DESC = [
  `Unlock exclusive rewards by inviting others to join the Nexon community. For every successful referral, you'll earn a percentage of their fees, while your referrals get a special discount! It's a win-win situation that allows you to benefit from sharing Nexon with your network. Start earning today and expand your reach!`
] as const

export const REFERRALS_TABLES_TABS = ['Referrals', 'Legacy reward history'] as const

export const REFERRALS_CREATECODE_DESC = [
  `Create your own referral code that you can share with other users. Every time someone uses your code, you will earn additional rewards! Share it with friends and colleagues.`
]

export const REFERRALS_CLAIM_DESC = [
  `Claim your bonuses and rewards for your referral activity. If you’ve referred new users or they’ve completed the program’s requirements, click 'Claim' to receive your reward!`
]

export const VAULT_ACTION_OPTIONS = [
  {
    key: 'trade',
    label: 'Trade for Vault',
    icon: refreshicon
  },
  {
    key: 'disableDeposits',
    label: 'Disable Deposits',
    icon: disableicon
  },
  {
    key: 'enableAutoClose',
    label: 'Enable Auto-Close on Withdraw',
    icon: hourglassicon
  },
  {
    key: 'distribute',
    label: 'Distribute',
    icon: sendcopyicon
  },
  {
    key: 'closeVault',
    label: 'Close Vault',
    icon: lockoutlineicon,
    textColor: 'text-[#E2464A]'
  }
] as const
