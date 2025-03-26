import {
  HYPERLIQUID_API_MAINNET,
  HYPERLIQUID_API_TESTNET,
  COINMARKET_API_KEY,
  COINMARKET_BASE_URL
} from '@/utils/constants'
import axios from 'axios'

export const testnetAxios = axios.create({
  baseURL: HYPERLIQUID_API_TESTNET,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const mainnetAxios = axios.create({
  baseURL: HYPERLIQUID_API_MAINNET,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const coinmarketAxios = axios.create({
  baseURL: COINMARKET_BASE_URL,
  headers: {
    'X-CMC_PRO_API_KEY': COINMARKET_API_KEY,
    Accept: 'application/json'
  }
})
