import { createConfig, http } from 'wagmi'
import { arbitrum, arbitrumSepolia, mainnet } from 'wagmi/chains'
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
  chains: [arbitrumSepolia, arbitrum, mainnet],
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
    [mainnet.id]: http()
  }
})
