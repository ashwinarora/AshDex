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
  const [timeSinceUpdate, setTimeSinceUpdate] = useState({
    allMids: '',
    webData2: '',
    candles: ''
  })

  // Helper function to get color based on time string
  const getFreshnessColor = (timeStr: string): string => {
    if (timeStr === 'No candle data') return 'bg-gray-600'

    if (timeStr.includes('ms')) return 'bg-green-600'
    if (timeStr.includes('s')) {
      const seconds = parseInt(timeStr)
      if (seconds < 10) return 'bg-green-600'
      if (seconds < 30) return 'bg-yellow-600'
      return 'bg-red-600'
    }
    if (timeStr.includes('m')) {
      const minutes = parseInt(timeStr)
      if (minutes < 1) return 'bg-yellow-600'
      return 'bg-red-600'
    }
    return 'bg-red-600'
  }

  // Use useEffect to set mounted to true after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update time since last update every second
  useEffect(() => {
    if (!mounted) return

    const updateTime = () => {
      setTimeSinceUpdate({
        allMids: getTimeSinceLastUpdate('allMids'),
        webData2: getTimeSinceLastUpdate('webData2'),
        candles: getTimeSinceLastUpdate('candles')
      })
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
          <div className="group relative cursor-pointer">
            <div
              className={`flex gap-2 text-xs ${isWebSocketConnected ? 'text-green-600' : 'text-red-600'}`}
            >
              {isWebSocketConnected ? (
                <>
                  <IconCellSignal5 className="w-4 h-4" />
                  Online
                </>
              ) : (
                <>
                  <IconCellSignalOff className="w-4 h-4" />
                  Offline
                </>
              )}
            </div>
            <div className="bottom-full left-0 z-50 absolute opacity-0 group-hover:opacity-100 mb-2 transition-all duration-200 pointer-events-none">
              <div className="bg-secondary shadow-lg p-2 border border-white/10 rounded-lg">
                <div className="text-white/60 text-xs whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${getFreshnessColor(timeSinceUpdate.allMids)}`}
                    ></span>
                    <span>Order Book: {timeSinceUpdate.allMids}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${getFreshnessColor(timeSinceUpdate.candles)}`}
                    ></span>
                    <span>Chart Data: {timeSinceUpdate.candles}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${getFreshnessColor(timeSinceUpdate.webData2)}`}
                    ></span>
                    <span>User Data: {timeSinceUpdate.webData2}</span>
                  </div>
                </div>
              </div>
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
