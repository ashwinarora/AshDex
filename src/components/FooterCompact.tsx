'use client'

import { FC, useState, useEffect } from 'react'

import { IconCellSignal5, IconCellSignalOff } from '@tabler/icons-react'
import dynamic from 'next/dynamic'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { cn } from '@/lib/utils'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
import { useShallow } from 'zustand/react/shallow'

const FooterContent: FC = () => {
  const [mounted, setMounted] = useState(false)
  const { isWebSocketConnected, getTimeSinceLastUpdate } = useHyperliquidStore(
    useShallow((state) => ({
      isWebSocketConnected: state.isWebSocketConnected,
      getTimeSinceLastUpdate: state.getTimeSinceLastUpdate
    }))
  )
  const [timeSinceUpdate, setTimeSinceUpdate] = useState({
    allMids: '',
    userState: '',
    candles: ''
  })

  // Helper function to get color based on time string
  const getFreshnessColor = (timeStr: string): string => {
    if (timeStr === 'No candle data') return 'bg-white/100'

    if (timeStr.includes('ms')) return 'bg-green'
    if (timeStr.includes('s')) {
      const seconds = parseInt(timeStr)
      if (seconds < 10) return 'bg-green'
      if (seconds < 30) return 'bg-yellow-500'
      return 'bg-red'
    }
    if (timeStr.includes('m')) {
      const minutes = parseInt(timeStr)
      if (minutes < 1) return 'bg-yellow-500'
      return 'bg-red'
    }
    return 'bg-red'
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
        userState: getTimeSinceLastUpdate('userState'),
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
        className="p-5 md:p-8 pt-0 border border-border rounded-2xl card-elevated"
        style={{
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)'
        }}
      >
        <div className="h-40"></div>
      </footer>
    )
  }

  const collectiveFreshness = [
    getFreshnessColor(timeSinceUpdate.allMids),
    getFreshnessColor(timeSinceUpdate.candles),
    getFreshnessColor(timeSinceUpdate.userState)
  ]

  return (
    <footer className="bottom-0 left-0 z-40 fixed items-center bg-secondary p-2 text-white/70 text-xs border-white/5 border-t w-screen align-middle">
      <div className="flex w-full justify-between">
        <HoverCard>
          <HoverCardTrigger asChild>
            <div
              className={cn(
                'flex items-center cursor-help gap-2 w-fit h-full',
                isWebSocketConnected
                  ? collectiveFreshness.includes('bg-yellow-500')
                    ? 'text-yellow-500'
                    : 'text-green'
                  : 'text-red'
              )}
            >
              {isWebSocketConnected ? (
                <>
                  <IconCellSignal5 className="size-4" />
                  {'Online'}
                </>
              ) : (
                <>
                  <IconCellSignalOff className="size-4" />
                  {'Offline'}
                </>
              )}
            </div>
          </HoverCardTrigger>
          <HoverCardContent
            className="bg-secondary text-white/70 text-xs p-2 w-fit h-fit"
            side="top"
            align="start"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${getFreshnessColor(timeSinceUpdate.allMids)}`}
                ></span>
                <span>
                  {'Order Book'}: {timeSinceUpdate.allMids}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${getFreshnessColor(timeSinceUpdate.candles)}`}
                ></span>
                <span>
                  {'Chart Data'}: {timeSinceUpdate.candles}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${getFreshnessColor(timeSinceUpdate.userState)}`}
                ></span>
                <span>
                  {'User Data'}: {timeSinceUpdate.userState}
                </span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        <div className="flex items-center justify-center text-xs text-white/70">
          Built with <span className="text-red mx-1">♥</span> by Ashwin Arora
        </div>
      </div>
    </footer>
  )
}

// Export a dynamic version of the component with ssr disabled
export default dynamic(() => Promise.resolve(FooterContent), { ssr: false })
