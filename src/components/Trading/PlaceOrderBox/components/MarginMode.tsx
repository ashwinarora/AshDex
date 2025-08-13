import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { IconArrowRight, IconArrowsShuffle } from '@tabler/icons-react'
import React from 'react'

interface MarginModeProps {
  isCross: boolean
  setIsCross: React.Dispatch<React.SetStateAction<boolean>>
  isRTL: boolean
}

const MarginMode = ({ setIsCross, isCross, isRTL }: MarginModeProps) => {
  return (
    <div
      className={cn('flex items-center justify-between rounded-md', isRTL && 'flex-row-reverse')}
    >
      <p className="text-xs font-medium text-white/50">Margin Mode</p>
      <ToggleGroup
        size={'sm'}
        type="single"
        className={cn('bg-white/5', isRTL ? '!flex-row-reverse' : '!flex-row')}
        value={isCross ? 'cross' : 'isolated'}
        onValueChange={(value) => value !== '' && setIsCross(value === 'cross')}
      >
        <ToggleGroupItem
          value="cross"
          className={cn(
            'px-4 py-1 cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
            isCross ? 'bg-primary text-white' : 'bg-transparent text-white/50',
            isRTL ? 'rounded-r-md' : 'rounded-l-md'
          )}
        >
          <IconArrowsShuffle className="size-4" />
          Cross
        </ToggleGroupItem>
        <ToggleGroupItem
          value="isolated"
          className={cn(
            'px-4 py-1 cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
            !isCross ? 'bg-primary text-white' : 'bg-transparent text-white/50',
            isRTL ? 'rounded-l-md' : 'rounded-r-md'
          )}
        >
          <IconArrowRight className="size-4" />
          Isolated
        </ToggleGroupItem>
      </ToggleGroup>
      {/* <div className="flex rounded-lg">
        <button
          className={`px-4 py-1 rounded-md cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none ${isCross ? 'bg-primary text-white' : 'bg-transparent text-[#8B8BA0]'}`}
          onClick={() => setIsCross(true)}
          type="button"
        >
          Cross
        </button>
        <button
          className={`px-4 py-1 cursor-pointer rounded-md text-xs font-semibold transition-colors duration-150 focus:outline-none ${!isCross ? 'bg-primary text-white' : 'bg-transparent text-[#8B8BA0]'}`}
          onClick={() => setIsCross(false)}
          type="button"
        >
          Isolated
        </button>
      </div> */}
    </div>
  )
}

export default MarginMode
