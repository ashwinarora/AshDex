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
// import { type Chain } from 'viem'

// export const hyperliquidMainnet = {
//   id: 1,
//   name: 'Ethereum',
//   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
//   rpcUrls: {
//     default: { http: ['https://eth.merkle.io'] },
//   },
//   blockExplorers: {
//     default: { name: 'Etherscan', url: 'https://etherscan.io' },
//   },
//   contracts: {
//     ensRegistry: {
//       address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
//     },
//     ensUniversalResolver: {
//       address: '0xE4Acdd618deED4e6d2f03b9bf62dc6118FC9A4da',
//       blockCreated: 16773775,
//     },
//     multicall3: {
//       address: '0xca11bde05977b3631167028862be2a173976ca11',
//       blockCreated: 14353601,
//     },
//   } as const satisfies Chain

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
  chains: [arbitrumSepolia, arbitrum, mainnet, polygon, celo, avalanche, optimism, bsc, base],
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
    [base.id]: http()
  }
})
