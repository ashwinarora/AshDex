import { http, createConfig } from 'wagmi'
import { arbitrum, arbitrumSepolia } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const phantomWalletConnector = injected({
  target: 'phantom'
})

const trustWalletConnector = injected({
  target: 'trustWallet'
})

export const config = createConfig({
  chains: [arbitrumSepolia, arbitrum],
  connectors: [
    phantomWalletConnector,
    trustWalletConnector,
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID ?? ''
    }),
    metaMask(),
    safe()
  ],
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http()
  }
})
