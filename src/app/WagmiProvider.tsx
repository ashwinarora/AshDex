'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/config/wagmi'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { WagmiProvider } from 'wagmi'
import { createConfig as wagmiCreateConfig } from 'wagmi'
// import { createConfig as privyCreateConfig } from '@privy-io/wagmi'
// import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi'
// import PrivyWagmiSync from './PrivyWagmiSync'
// import usePrivyWagmiStore from '@/store/PrivyWagmiStore'

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

// const privyConfig = privyCreateConfig(config)
// Uncomment this when want to use privy email signup. Metamask connections sometimes disconnect after refreshing by using the below
// const Provider = ({
//   children
// }: Readonly<{
//   children: React.ReactNode
// }>) => {
//   const { isUsingPrivy } = usePrivyWagmiStore()
//   return (
//     <QueryClientProvider client={queryClient}>
//       {isUsingPrivy ? (
//         <PrivyWagmiProvider config={privyConfig}>
//           <PrivyWagmiSync />
//           {children}
//         </PrivyWagmiProvider>
//       ) : (
//         <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
//       )}
//       <ReactQueryDevtools initialIsOpen={false} />
//     </QueryClientProvider>
//   )
// }

export default Provider
