import { http, createConfig } from 'wagmi'
import { arbitrum, arbitrumSepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [ arbitrum, arbitrumSepolia],
  ssr: true,
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
})