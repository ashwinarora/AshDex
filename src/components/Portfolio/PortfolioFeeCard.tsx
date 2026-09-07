import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { IconChevronDown } from '@tabler/icons-react'
import { Dispatch, SetStateAction } from 'react'
import { cn } from '@/lib/utils'
import { targetFee } from '@/hooks/useUserFee'

const PortfolioFeeCard = ({
  selectedView,
  setSelectedView,
  isRTL
}: {
  selectedView: { [key: string]: 'perps' | 'all' | 'day' | 'month' | 'week' | 'alltime' }
  setSelectedView: Dispatch<
    SetStateAction<{
      [key: string]: 'perps' | 'all' | 'day' | 'month' | 'week' | 'alltime'
    }>
  >
  isRTL: boolean
}) => {
  const takerFee = selectedView.fees === 'perps' ? targetFee.perpsTaker : targetFee.spotTaker
  const makerFee = selectedView.fees === 'perps' ? targetFee.perpsMaker : targetFee.spotMaker

  return (
    <div
      className={cn('flex flex-col bg-secondary rounded-md flex-1 gap-4 p-4', isRTL && 'items-end')}
    >
      <div className={cn('flex items-center justify-between w-full', isRTL && 'flex-row-reverse')}>
        <h2>{'Fees (Taker/Maker)'}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" size="sm" className="w-fit">
              <p>{selectedView.fees === 'all' ? 'Spot' : 'Perps'}</p>
              <IconChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? 'end' : 'start'}>
            <DropdownMenuItem onClick={() => setSelectedView({ ...selectedView, fees: 'perps' })}>
              <p className={cn('w-full', isRTL ? 'text-end' : 'text-start')}>{'Perps'}</p>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedView({ ...selectedView, fees: 'all' })}>
              <p className={cn('w-full', isRTL ? 'text-end' : 'text-start')}>{'Spot'}</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h1 className="text-3xl font-semibold text-white flex-1 flex items-center">
        {`${(parseFloat(takerFee) * 100).toFixed(3)}% / ${(parseFloat(makerFee) * 100).toFixed(3)}%`}
      </h1>
    </div>
  )
}

export default PortfolioFeeCard
