import { http } from 'wagmi'
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
import { createConfig } from '@privy-io/wagmi';

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
  connectors: [
    coinbaseWalletConnector,
    rabbyWalletConnector,
    phantomWalletConnector,
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID ?? ''
    }),
    metaMask(),
    safe()
  ],
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
