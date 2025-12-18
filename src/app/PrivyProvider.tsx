'use client'

import { PrivyProvider } from '@privy-io/react-auth'

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cmfe4cn3a00x6l10d4l91sehh"
      config={{
        loginMethods: ['email'],
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        }
      }}
    >
      {children}
    </PrivyProvider>
  )
}
