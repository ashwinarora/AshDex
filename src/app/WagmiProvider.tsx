'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/config/wagmi'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { WagmiProvider } from 'wagmi'
import { createConfig as wagmiCreateConfig } from 'wagmi'

const queryClient = new QueryClient()

export const wagmiConfig = wagmiCreateConfig(config)

const Provider = ({
  children
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default Provider
