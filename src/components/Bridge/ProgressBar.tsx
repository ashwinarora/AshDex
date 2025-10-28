import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { IconCheck, IconLoader2 } from '@tabler/icons-react'

interface ProgressBarProps {
  sourceChain: string
  destinationChain: string
  status: 'pending' | 'source_complete' | 'complete'
  getLogoPath: (symbol: string) => string
  transferTime: number | null
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  sourceChain,
  destinationChain,
  status,
  transferTime,
  getLogoPath
}) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(transferTime)
  const [progress, setProgress] = useState(0)

  // Reset timer and progress when transferTime changes
  useEffect(() => {
    if (transferTime) {
      setRemainingTime(transferTime)
      setProgress(0)
    }
  }, [transferTime])

  // Handle countdown and progress updates
  useEffect(() => {
    // If status is complete, set progress to 100% and stop the timer
    if (status === 'complete') {
      setProgress(100)
      return
    }

    // If timer has run out but status isn't complete, hold at 90%
    if (remainingTime === null || remainingTime <= 0) {
      setProgress(90)
      return
    }

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev === null || prev <= 0) return 0
        return prev - 1
      })

      // Calculate progress based on remaining time
      if (transferTime !== null) {
        const newProgress = ((transferTime - (remainingTime || 0)) / transferTime) * 100
        setProgress(Math.min(newProgress, 90)) // Cap at 90% until complete
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [remainingTime, transferTime, status])

  return (
    <div className="flex justify-between items-center mt-3 px-2 w-full align-middle">
      {/* Source Chain Step */}
      <div className="flex flex-col items-center">
        <div
          className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300  bg-white/10`}
        >
          <Image
            src={getLogoPath(sourceChain)}
            alt={sourceChain}
            width={16}
            height={16}
            className="w-4 h-4"
          />
          <IconLoader2
            className={`w-10 h-10 absolute -top-1 -left-1    rounded-full p-0.5 animate-spin ${
              status === 'pending' ? 'text-white block' : 'hidden'
            }`}
          />
        </div>
        <span
          className={`text-xs mt-1 transition-colors duration-300 relative items-center gap-1 ${
            status === 'pending' ? 'text-white' : 'text-white/70'
          }`}
        >
          Source{' '}
          <IconCheck
            className={`w-4 h-4 transition-colors duration-300  absolute  -translate-y-[100%]  -right-4 rounded-full p-0.5 ${
              status === 'source_complete' || status === 'complete'
                ? 'text-green-500 block'
                : 'hidden'
            }`}
          />
        </span>
      </div>
      <div className="relative flex-1 mx-2 mb-4 h-1">
        <div className="top-0 left-0 absolute bg-white/10 rounded-full w-full h-full" />
        <div
          className={`absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Destination Chain Step */}
      <div className="flex flex-col items-center">
        <div
          className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300  bg-white/10`}
        >
          <Image
            src={getLogoPath(destinationChain)}
            alt={destinationChain}
            width={16}
            height={16}
            className="w-4 h-4"
          />
          <IconLoader2
            className={`w-10 h-10 absolute -top-1 -left-1    rounded-full p-0.5 animate-spin ${
              status === 'source_complete' ? 'text-white block' : 'hidden'
            }`}
          />
        </div>
        <span
          className={`text-xs mt-1 transition-colors duration-300 relative items-center gap-1 ${
            status === 'source_complete' ? 'text-white' : 'text-white/70'
          }`}
        >
          Destination{' '}
          <IconCheck
            className={`w-4 h-4 transition-colors duration-300  absolute  -translate-y-[100%]  -right-4 rounded-full p-0.5 ${
              status === 'complete' ? 'text-green-500 block' : 'hidden'
            }`}
          />
        </span>
      </div>
    </div>
  )
}

export default ProgressBar
