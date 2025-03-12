"use client"

import { http, createConfig } from 'wagmi'
import { arbitrum, arbitrumSepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [ arbitrum, arbitrumSepolia],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "Nexon Demo",
        url: "",
        iconUrl: "",
      },
    }),
  ],
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
})