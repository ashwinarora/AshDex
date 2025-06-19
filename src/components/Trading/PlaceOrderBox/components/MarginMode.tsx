import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { MoveRightIcon, ShuffleIcon } from 'lucide-react'
import React from 'react'

interface MarginModeProps {
  isCross: boolean
  setIsCross: React.Dispatch<React.SetStateAction<boolean>>
}

const MarginMode = ({ setIsCross, isCross }: MarginModeProps) => {
  return (
    <div className="flex items-center justify-between rounded-md ">
      <p className="text-xs font-medium text-white/50">Margin Mode</p>
      <ToggleGroup
        size={'sm'}
        className="bg-white/5"
        type="single"
        value={isCross ? 'cross' : 'isolated'}
        onValueChange={(value) => value !== '' && setIsCross(value === 'cross')}
      >
        <ToggleGroupItem
          value="cross"
          className={cn(
            'px-4 py-1 rounded-l-md cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
            isCross ? 'bg-primary text-white' : 'bg-transparent text-white/50'
          )}
        >
          <ShuffleIcon className="size-4" />
          Cross
        </ToggleGroupItem>
        <ToggleGroupItem
          value="isolated"
          className={cn(
            'px-4 py-1 rounded-r-md cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
            !isCross ? 'bg-primary text-white' : 'bg-transparent text-white/50'
          )}
        >
          <MoveRightIcon className="size-4" />
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
