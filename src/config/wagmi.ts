import { createConfig, http } from 'wagmi'
import { arbitrum, arbitrumSepolia, avalanche, base, bsc, celo, mainnet, optimism, polygon } from 'wagmi/chains'
import { coinbaseWallet, injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

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
