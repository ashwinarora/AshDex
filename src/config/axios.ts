import {
  HYPERLIQUID_API_MAINNET,
  HYPERLIQUID_API_TESTNET,
  COINMARKET_BASE_URL,
  isTestnet
} from '@/utils/constants'
import axios from 'axios'

export const hyperliquidAxios = axios.create({
  baseURL: isTestnet ? HYPERLIQUID_API_TESTNET : HYPERLIQUID_API_MAINNET,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const coinmarketAxios = axios.create({
  baseURL: COINMARKET_BASE_URL,
  headers: {
    'X-CMC_PRO_API_KEY': process.env.COINMARKET_API_KEY,
    Accept: 'application/json'
  }
})
