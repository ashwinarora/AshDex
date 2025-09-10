import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import React from 'react'
import { useTranslate } from '@tolgee/react'
import MarginMode from './MarginMode'

interface BuyOrSellProps {
  isBuy: boolean
  setIsBuy: (isBuy: boolean) => void
  isRTL: boolean
  isMarginEnabled?: boolean
  isCross?: boolean
  setIsCross?: React.Dispatch<React.SetStateAction<boolean>>
}

const BuyOrSell: React.FC<BuyOrSellProps> = ({
  isBuy,
  setIsBuy,
  isRTL,
  isCross,
  setIsCross,
  isMarginEnabled = true
}) => {
  const { t } = useTranslate()
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <ToggleGroup
        size={'sm'}
        className={cn(
          ' bg-white/5 rounded-md',
          isRTL ? '!flex-row-reverse' : '!flex-row',
          isMarginEnabled ? 'w-3/4' : 'w-full'
        )}
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
      {isMarginEnabled && isCross && setIsCross && (
        <div className="w-1/4">
          <MarginMode isCross={isCross} setIsCross={setIsCross} isRTL={isRTL} />
        </div>
      )}
    </div>
  )
}
export default BuyOrSell
