'use client'

import { FC, useState, useEffect } from 'react'
// import { useAccount } from 'wagmi'
// import { useWalletModal } from '@/context/WalletModalContext'

import { IconCellSignal5, IconCellSignalOff } from '@tabler/icons-react'
import dynamic from 'next/dynamic'
import { useHyperliquid } from '@/store/HyperliquidStore'

const FooterContent: FC = () => {
  // const { toggleConnectWalletModal } = useWalletModal()
  // const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const { isWebSocketConnected, getTimeSinceLastUpdate } = useHyperliquid()
  const [timeSinceUpdate, setTimeSinceUpdate] = useState('')

  // Use useEffect to set mounted to true after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update time since last update every second
  useEffect(() => {
    if (!mounted) return

    const updateTime = () => {
      setTimeSinceUpdate(getTimeSinceLastUpdate())
    }

    // Update immediately
    updateTime()

    // Then update every second
    const intervalId = setInterval(updateTime, 1000)
    return () => clearInterval(intervalId)
  }, [mounted, getTimeSinceLastUpdate])

  // During server-side rendering and initial client render, show a placeholder
  if (!mounted) {
    return (
      <footer
        className="p-5 md:p-8 pt-0 border border-[#251A3C] rounded-2xl nexon-card"
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
      className="bottom-0 left-0 fixed items-center bg-secondary p-1 border-white/5 border-t w-screen align-middle"
      style={{
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)'
      }}
    >
      <div className="flex justify-between px-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex gap-2 text-xs group ${isWebSocketConnected ? 'text-green-600' : 'text-red-600'}`}
          >
            {isWebSocketConnected ? (
              <>
                <IconCellSignal5 className="w-4 h-4" />
                Stable Connection
              </>
            ) : (
              <>
                <IconCellSignalOff className="w-4 h-4" />
                Connection Lost
              </>
            )}
            <div className="hidden group-hover:block text-white/60 group-hover:text-white text-xs">
              Last update: {timeSinceUpdate}
            </div>
          </div>
        </div>

        <div className="flex gap-4 text-white/60 text-xs">
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
