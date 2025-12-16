'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/config/wagmi'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { WagmiProvider } from '@privy-io/wagmi'

const queryClient = new QueryClient()

const Provider = ({
  children
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>{children}</WagmiProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default Provider
