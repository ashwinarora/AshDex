'use client'

import { useEffect, useRef } from 'react'
import { usePrivy, useWallets, type ConnectedWallet } from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import { useAccount } from 'wagmi'

/**
 * Keeps wagmi's active account in sync with Privy after an email login.
 *
 * Without this, a Privy-authenticated user can have an embedded wallet address
 * (via `useWallets()`), while wagmi's `useAccount()` remains empty because no
 * wagmi connection is active.
 */
export default function PrivyWagmiSync() {
  const { ready, authenticated } = usePrivy()
  const { wallets, ready: walletsReady } = useWallets()
  const { address, isConnected } = useAccount()
  const { setActiveWallet } = useSetActiveWallet()

  // Avoid spamming setActiveWallet on every re-render.
  const didSetRef = useRef(false)

  useEffect(() => {
    if (!ready || !authenticated || !walletsReady) {
      didSetRef.current = false
      return
    }

    // If the user connected an external wallet via wagmi, don't override it.
    if (isConnected && address) return

    const embedded = wallets?.find((w: ConnectedWallet) => w?.walletClientType === 'privy')
    if (!embedded?.address) return

    // If wagmi already matches the embedded wallet, we're done.
    if (address && address.toLowerCase() === embedded.address.toLowerCase()) return

    if (didSetRef.current) return
    didSetRef.current = true

    // This is what makes wagmi hooks (useAccount/useSignMessage/etc) reflect Privy's wallet.
    setActiveWallet(embedded)
  }, [ready, authenticated, walletsReady, wallets, isConnected, address, setActiveWallet])

  return null
}
