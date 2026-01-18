'use client'
import LimitOrder from './LimitOrder'
import MarketOrder from './MarketOrder'
// import Scale from './Scale'
import StopLimit from './StopLimit'
import StopMarket from './StopMarket'
// import useIsSpot from '@/hooks/useIsSpot'
// import ScaleSpot from './ScaleSpot'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger
// } from '@/components/ui/dropdown-menu'
// import { IconChevronDown } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useTranslate } from '@tolgee/react'
import { useTradeUIStore, type OrderTab } from '@/store/TradeUIStore'

/** OrderTab type now lives in store */

export interface IPlaceOrderProps {
  selectedAsset: string
  isRTL: boolean
}

const PlaceOrder = ({ selectedAsset, isRTL }: IPlaceOrderProps) => {
  const { activeOrderTab, setActiveOrderTab } = useTradeUIStore()
  // const isSpot = useIsSpot()
  const { t } = useTranslate()

  const renderTabContent = () => {
    switch (activeOrderTab) {
      case 'LIMIT':
        return <LimitOrder selectedAsset={selectedAsset} isRTL={isRTL} />
      case 'MARKET':
        return <MarketOrder selectedAsset={selectedAsset} isRTL={isRTL} />
      // case 'SCALE':
      //   return isSpot ? (
      //     <ScaleSpot selectedAsset={selectedAsset} isRTL={isRTL} />
      //   ) : (
      //     <Scale selectedAsset={selectedAsset} isRTL={isRTL} />
      //   )
      case 'STOP_LIMIT':
        return <StopLimit selectedAsset={selectedAsset} isRTL={isRTL} />
      case 'STOP_MARKET':
        return <StopMarket selectedAsset={selectedAsset} isRTL={isRTL} />
      default:
        return null
    }
  }

  // const availableOptions = isSpot
  //   ? // [{ value: 'SCALE', label: t('Scale') }]
  //     []
  //   : [
  //       // { value: 'SCALE', label: t('Scale') },
  //       { value: 'STOP_LIMIT', label: t('Stop Limit') },
  //       { value: 'STOP_MARKET', label: t('Stop Market') }
  //     ]

  return (
    <div className="flex flex-col bg-secondary rounded-md w-full h-[688px] md:h-full overflow-y-auto no-scrollbar items-center justify-start ">
      <div
        className={cn(
          'w-full h-fit px-2 pt-2 flex items-center justify-start',
          isRTL && 'flex-row-reverse'
        )}
      >
        <ToggleGroup
          type="single"
          className={cn(
            // isSpot ? 'w-full' : 'w-2/3',
            'w-full',
            isRTL
              ? 'rounded-l-none rounded-r-md flex-row-reverse'
              : 'rounded-l-md rounded-r-none flex-row'
          )}
          value={activeOrderTab}
          onValueChange={(value) => {
            if (value === '') {
              return
            }
            setActiveOrderTab(value as OrderTab)
          }}
        >
          <ToggleGroupItem
            className={cn(
              'w-full data-[state=on]:bg-transparent text-white data-[state=on]:text-primary',
              isRTL ? 'rounded-r-md' : 'rounded-l-md'
            )}
            value="LIMIT"
          >
            {t('Limit')}
          </ToggleGroupItem>
          <ToggleGroupItem
            className={cn(
              'w-full data-[state=on]:bg-transparent text-white data-[state=on]:text-primary'
            )}
            value="MARKET"
          >
            {t('Market')}
          </ToggleGroupItem>
        </ToggleGroup>
        {/* {!isSpot && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={cn(
                  'text-white transition-colors w-1/3 h-9 flex items-center gap-2 justify-center text-sm',
                  availableOptions.find((option) => option.value === activeOrderTab)
                    ? 'text-primary'
                    : 'text-white',
                  isRTL ? 'rounded-l-md' : 'rounded-r-md'
                )}
              >
                {availableOptions.find((option) => option.value === activeOrderTab)?.label ||
                  t('Advanced')}
                <IconChevronDown className="size-3" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
              {availableOptions.map((option) => (
                <DropdownMenuItem
                  className="text-white/70 w-28 flex items-center justify-end hover:text-popover-foreground"
                  key={option.value}
                  onClick={() => setActiveOrderTab(option.value as OrderTab)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )} */}
      </div>
      <div className="flex-1 w-full">{renderTabContent()}</div>
    </div>
  )
}
export default PlaceOrder
