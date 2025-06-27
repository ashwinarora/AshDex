import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import React from 'react'

interface BuyOrSellProps {
  isBuy: boolean
  setIsBuy: (isBuy: boolean) => void
}

const BuyOrSell: React.FC<BuyOrSellProps> = ({ isBuy, setIsBuy }) => {
  return (
    <div className="flex px-2 w-full items-center justify-between gap-2">
      <ToggleGroup
        size={'sm'}
        className="w-full bg-white/5 rounded-md"
        type="single"
        value={isBuy ? 'buy' : 'sell'}
        onValueChange={(value) => value !== '' && setIsBuy(value === 'buy')}
      >
        <ToggleGroupItem
          className={cn(
            'w-full rounded-l-md transition-colors font-semibold hover:!text-green',
            isBuy && '!bg-green hover:!text-accent !text-accent'
          )}
          value="buy"
        >
          Buy
        </ToggleGroupItem>
        <ToggleGroupItem
          className={cn(
            'w-full rounded-r-md transition-colors font-semibold hover:!text-red',
            !isBuy && '!bg-red hover:!text-accent !text-accent'
          )}
          value="sell"
        >
          Sell
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
export default BuyOrSell
