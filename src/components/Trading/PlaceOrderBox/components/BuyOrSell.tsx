import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import React from 'react'
import { useTranslate } from '@tolgee/react'

interface BuyOrSellProps {
  isBuy: boolean
  setIsBuy: (isBuy: boolean) => void
  isRTL: boolean
}

const BuyOrSell: React.FC<BuyOrSellProps> = ({ isBuy, setIsBuy, isRTL }) => {
  const { t } = useTranslate()
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <ToggleGroup
        size={'sm'}
        className={cn('w-full bg-white/5 rounded-md', isRTL ? '!flex-row-reverse' : '!flex-row')}
        type="single"
        value={isBuy ? 'buy' : 'sell'}
        onValueChange={(value) => value !== '' && setIsBuy(value === 'buy')}
      >
        <ToggleGroupItem
          className={cn(
            'w-full transition-colors font-semibold hover:!text-green',
            isBuy && '!bg-green hover:!text-accent !text-accent',
            isRTL ? 'rounded-r-md' : 'rounded-l-md'
          )}
          value="buy"
        >
          {t('Buy')}
        </ToggleGroupItem>
        <ToggleGroupItem
          className={cn(
            'w-full transition-colors font-semibold hover:!text-red',
            !isBuy && '!bg-red hover:!text-accent !text-accent',
            isRTL ? 'rounded-l-md' : 'rounded-r-md'
          )}
          value="sell"
        >
          {t('Sell')}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
export default BuyOrSell
