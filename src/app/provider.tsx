'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/config/wagmi'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export const Provider = ({
  children
}: Readonly<{
  children: React.ReactNode
}>) => {
  // Create QueryClient instance inside component to ensure it's stable
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000 // 1 minute
          }
        }
      })
  )

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
