import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { IconChevronDown } from '@tabler/icons-react'
import { Skeleton } from '../ui/skeleton'
import { UserFees } from '@nktkas/hyperliquid'
import { Dispatch, SetStateAction } from 'react'

const PortfolioFeeCard = ({
  userFeeData,
  selectedView,
  setSelectedView
}: {
  userFeeData: UserFees | undefined
  selectedView: { [key: string]: 'perps' | 'all' | 'day' | 'month' | 'week' | 'alltime' }
  setSelectedView: Dispatch<
    SetStateAction<{
      [key: string]: 'perps' | 'all' | 'day' | 'month' | 'week' | 'alltime'
    }>
  >
}) => {
  return (
    <div className="flex flex-col justify-between bg-secondary rounded-md flex-1 gap-4 p-4">
      <div className="flex items-center justify-between w-full">
        <h2>Fees (Taker/Maker)</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={'outline'} size={'sm'} className="w-fit">
              <p>{selectedView.fees.charAt(0).toUpperCase() + selectedView.fees.slice(1)}</p>
              <IconChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setSelectedView({ ...selectedView, fees: 'perps' })}>
              <p>Perps</p>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedView({ ...selectedView, fees: 'all' })}>
              <p>Spot</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h1 className="text-3xl font-semibold text-white">
        {userFeeData ? (
          selectedView.fees === 'perps' ? (
            `${(parseFloat(userFeeData.userCrossRate) * 100).toFixed(3)}% / ${(parseFloat(userFeeData.userAddRate) * 100).toFixed(3)}%`
          ) : (
            `${(parseFloat(userFeeData.userSpotCrossRate) * 100).toFixed(3)}% / ${(parseFloat(userFeeData.userSpotAddRate) * 100).toFixed(3)}%`
          )
        ) : (
          <Skeleton className="w-36 h-9" />
        )}
      </h1>
      <p className="text-xs">View Fee Schedule</p>
    </div>
  )
}

export default PortfolioFeeCard
