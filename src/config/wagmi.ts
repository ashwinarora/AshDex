import { createConfig, http } from 'wagmi'
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  base,
  bsc,
  celo,
  mainnet,
  optimism,
  polygon
} from 'wagmi/chains'
import { coinbaseWallet, injected, metaMask, safe, walletConnect } from 'wagmi/connectors'
import { type Chain } from 'viem'

export const hyperliquidMainnet = {
  id: 999,
  name: 'Hyperliquid Mainnet',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.hyperliquid.xyz/evm'] }
  },
  blockExplorers: {
    default: {
      name: 'Hyperliquid Explorer',
      url: 'https://hyperevmscan.io/'
    }
  }
} as const satisfies Chain

export const hyperliquidTestnet = {
  id: 998,
  name: 'Hyperliquid Testnet',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.hyperliquid-testnet.xyz/evm'] }
  },
  blockExplorers: {
    default: {
      name: 'Hyperliquid Explorer',
      url: 'https://testnet.purrsec.com/'
    }
  }
} as const satisfies Chain

const phantomWalletConnector = injected({
  target: 'phantom'
})

const rabbyWalletConnector = injected({
  target: 'rabby'
})

const coinbaseWalletConnector = coinbaseWallet({
  appName: 'Nexon'
})

// Utility to detect Safari browser
const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android')
}

// Get connectors based on browser
const getConnectors = () => {
  const connectors = [coinbaseWalletConnector, rabbyWalletConnector, phantomWalletConnector]

  const browserIsSafari = isSafari()
  console.log('isSafari', browserIsSafari)
  // Only add WalletConnect if not Safari
  if (!browserIsSafari) {
    console.log('This is not Safari')
    return [
      ...connectors,
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID ?? ''
      }),
      metaMask(),
      safe()
    ]
  }

  return [...connectors, metaMask(), safe()]
}

export const config = createConfig({
  chains: [
    arbitrumSepolia,
    arbitrum,
    mainnet,
    polygon,
    celo,
    avalanche,
    optimism,
    bsc,
    base,
    hyperliquidMainnet,
    hyperliquidTestnet
  ],
  connectors: getConnectors(),
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [celo.id]: http(),
    [avalanche.id]: http(),
    [optimism.id]: http(),
    [bsc.id]: http(),
    [base.id]: http(),
    [hyperliquidMainnet.id]: http(),
    [hyperliquidTestnet.id]: http()
  }
})
