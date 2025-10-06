import { useState } from 'react'
import { IPlaceOrderProps } from '.'
import OrderButton from './components/OrderButton'
import LeverageMargin from './components/LeverageMargin'
import AmountInput from './components/AmountInput'
import BuyOrSell from './components/BuyOrSell'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { IconCheckbox, IconInfoCircle, IconSquare } from '@tabler/icons-react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'

const StopMarket = ({ selectedAsset, isRTL }: IPlaceOrderProps) => {
  const { t } = useTranslate()
  const { allMids } = useHyperliquidStore(
    useShallow((state) => ({
      allMids: state.allMids
    }))
  )
  const [stopPrice, setStopPrice] = useState(0)
  const [isReduceOnly, setIsReduceOnly] = useState(false)
  const [isBuy, setIsBuy] = useState(true)
  const [assetAmount, setAssetAmount] = useState<string>('')
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)
  return (
    <div className="flex flex-col w-full h-full justify-between flex-1">
      <div className="flex flex-col gap-2 px-2 h-full w-full flex-1">
        <Separator className="my-1" orientation="horizontal" />
        <BuyOrSell
          isCross={isCross}
          setIsCross={setIsCross}
          isBuy={isBuy}
          setIsBuy={setIsBuy}
          isRTL={isRTL}
          selectedAsset={selectedAsset}
        />
        <LeverageMargin
          selectedAsset={selectedAsset}
          leverage={leverage}
          setLeverage={setLeverage}
          isRTL={isRTL}
        />
        <Separator orientation="horizontal" />
        <label htmlFor="stopPrice" className={cn('text-xs text-white/50', isRTL && 'text-end')}>
          {t('Stop Price')}
        </label>
        <Input
          type="text"
          placeholder="0"
          value={stopPrice}
          onChange={(e) => setStopPrice(parseFloat(e.target.value) || 0)}
          className={cn(
            'w-full text-end shrink-0 text-white placeholder:text-white',
            isRTL && 'text-start'
          )}
        />
        <Separator orientation="horizontal" />
        <AmountInput
          selectedAsset={selectedAsset}
          assetAmount={assetAmount}
          setAssetAmount={setAssetAmount}
          usdAmount={usdAmount}
          setUsdAmount={setUsdAmount}
          limitPrice={allMids[selectedAsset].toString()}
          leverage={leverage}
          isReduceOnly={isReduceOnly}
          isBuy={isBuy}
          isRTL={isRTL}
        />
        <Separator orientation="horizontal" />
        <div
          className={cn(
            'flex items-start w-full justify-start h-full gap-2',
            isRTL && 'flex-row-reverse'
          )}
        >
          <Toggle
            size={'sm'}
            className={cn('bg-white/5 w-full', isRTL && 'flex-row-reverse')}
            pressed={isReduceOnly}
            onPressedChange={setIsReduceOnly}
          >
            {isReduceOnly ? <IconCheckbox className="size-3" /> : <IconSquare className="size-3" />}
            <p className="text-xs font-semibold">{t('Reduce Only')}</p>
            <IconInfoCircle className="size-3" />
          </Toggle>
        </div>
      </div>
      <div className="flex flex-col gap-2 h-fit w-full p-2">
        <Separator orientation="horizontal" />
        <OrderButton
          selectedAsset={selectedAsset}
          isBuy={isBuy}
          isCross={isCross}
          isPostOnly={false}
          isReduceOnly={isReduceOnly}
          leverage={leverage}
          assetAmount={assetAmount}
          limitPrice={allMids[selectedAsset].toString()}
          stopOrder={{
            isMarket: false,
            tpsl: 'sl',
            triggerPx: stopPrice
          }}
        />
      </div>
    </div>
  )
}
export default StopMarket
