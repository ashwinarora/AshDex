'use client'
import { useState } from 'react'
import LimitOrder from './LimitOrder'
import MarketOrder from './MarketOrder'
import TWAP from './TWAP'
import Scale from './Scale'
import StopLimit from './StopLimit'
import StopMarket from './StopMarket'
import useIsSpot from '@/hooks/useIsSpot'
import ScaleSpot from './ScaleSpot'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { IconChevronDown } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

/** Define the possible tab options */
type OrderTab = 'LIMIT' | 'MARKET' | 'TWAP' | 'SCALE' | 'STOP_LIMIT' | 'STOP_MARKET'

export interface IPlaceOrderProps {
  selectedAsset: string
}

const PlaceOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const [activeTab, setActiveTab] = useState<OrderTab>('MARKET')
  const isSpot = useIsSpot()

  const renderTabContent = () => {
    switch (activeTab) {
      case 'LIMIT':
        return <LimitOrder selectedAsset={selectedAsset} />
      case 'MARKET':
        return <MarketOrder selectedAsset={selectedAsset} />
      case 'TWAP':
        return <TWAP />
      case 'SCALE':
        return isSpot ? (
          <ScaleSpot selectedAsset={selectedAsset} />
        ) : (
          <Scale selectedAsset={selectedAsset} />
        )
      case 'STOP_LIMIT':
        return <StopLimit selectedAsset={selectedAsset} />
      case 'STOP_MARKET':
        return <StopMarket selectedAsset={selectedAsset} />
      default:
        return null
    }
  }

  const availableOptions = isSpot
    ? [{ value: 'SCALE', label: 'Scale' }]
    : [
        { value: 'SCALE', label: 'Scale' },
        { value: 'STOP_LIMIT', label: 'Stop Limit' },
        { value: 'STOP_MARKET', label: 'Stop Market' }
      ]

  return (
    <div className="flex flex-col bg-secondary rounded-md w-full h-[688px] md:h-full xl:h-[688px] overflow-y-auto no-scrollbar items-center justify-start">
      <div className="w-full h-fit px-2 pt-2 flex items-center justify-start">
        <ToggleGroup
          type="single"
          className="w-2/3 bg-white/5 rounded-l-md rounded-r-none"
          value={activeTab}
          onValueChange={(value) => {
            if (value === '') {
              return
            }
            setActiveTab(value as OrderTab)
          }}
        >
          <ToggleGroupItem className="w-full rounded-l-md" value="LIMIT">
            Limit
          </ToggleGroupItem>
          <ToggleGroupItem className="w-full" value="MARKET">
            Market
          </ToggleGroupItem>
        </ToggleGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                'text-white/50 transition-colors hover:text-accent-foreground w-1/3 h-9 rounded-r-md flex items-center gap-2 justify-center text-sm',
                availableOptions.find((option) => option.value === activeTab)
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-white/5 text-white/50'
              )}
            >
              {availableOptions.find((option) => option.value === activeTab)?.label || 'Advanced'}
              <IconChevronDown className="size-3" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* <DropdownMenuItem asChild>
              <button
                onClick={() => setActiveTab('TWAP')}
                className="text-white/50 w-28 flex items-center justify-end hover:text-popover-foreground"
              >
                TWAP
              </button>
            </DropdownMenuItem> */}
            {availableOptions.map((option) => (
              <DropdownMenuItem
                className="text-white/50 w-28 flex items-center justify-end hover:text-popover-foreground"
                key={option.value}
                onClick={() => setActiveTab(option.value as OrderTab)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 w-full">{renderTabContent()}</div>
    </div>
  )
}
export default PlaceOrder
