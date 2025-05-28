'use client'

import { FC, useState, useEffect } from 'react'
// import { useAccount } from 'wagmi'
// import { useWalletModal } from '@/context/WalletModalContext'

import { IconCellSignal5 } from '@tabler/icons-react'
import dynamic from 'next/dynamic'

const FooterContent: FC = () => {
  // const { toggleConnectWalletModal } = useWalletModal()
  // const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)

  // Use useEffect to set mounted to true after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // During server-side rendering and initial client render, show a placeholder
  if (!mounted) {
    return (
      <footer
        className="nexon-card border border-[#251A3C] rounded-2xl pt-0 p-5 md:p-8"
        style={{
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)'
        }}
      >
        <div className="h-40"></div>
      </footer>
    )
  }

  return (
    <footer
      className="fixed bottom-0 left-0 items-center w-screen p-1 align-middle border-t bg-secondary border-white/5"
      style={{
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)'
      }}
    >
      <div className="flex justify-between px-4">
        <div className="flex gap-2 text-xs text-green-600">
          <IconCellSignal5 className="w-4 h-4 " />
          Stable Connection
        </div>

        <div className="flex gap-4 text-xs text-white/60">
          <a href="/docs" className="hover:text-white">
            Docs
          </a>
          <a href="/support" className="hover:text-white">
            Support
          </a>
          <a href="/terms" className="hover:text-white">
            Terms
          </a>
          <a href="/privacy" className="hover:text-white">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  )
}

// Export a dynamic version of the component with ssr disabled
export default dynamic(() => Promise.resolve(FooterContent), { ssr: false })
