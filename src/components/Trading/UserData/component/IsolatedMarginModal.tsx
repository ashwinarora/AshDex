import React, { useState } from 'react'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { toast } from 'react-toastify'
import { AssetPosition } from '@nktkas/hyperliquid'
import { getPerpsUniverseIndex } from '@/utils/utils'
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { IconChevronDown } from '@tabler/icons-react'

interface IsolatedMarginModalProps {
  isOpen: boolean
  onClose: () => void
  asset: AssetPosition['position']
}

const IsolatedMarginModal: React.FC<IsolatedMarginModalProps> = ({ isOpen, onClose, asset }) => {
  const { clearingHouseState, perpsMeta } = useHyperliquid()
  const [amount, setAmount] = useState('')
  const [action, setAction] = useState<'Add' | 'Remove'>('Add')
  const { sdkExchangeClient } = useHyperliquid()

  const marginAvailable = clearingHouseState?.withdrawable || 0

  const handleMarginChange = async () => {
    const isBuy = Number(asset.szi) > 0
    const toastId = toast.loading('Updating margin...')
    const realAmount = Number(amount) * 10 ** 6
    try {
      if (!sdkExchangeClient) return
      if (!perpsMeta) return
      const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, asset.coin)
      const res = await sdkExchangeClient.updateIsolatedMargin({
        asset: assetIndex,
        isBuy: isBuy,
        ntli: action === 'Add' ? realAmount : -realAmount
      })
      // const res = await sdkExchangeClient.updateIsolatedMargin(
      //   asset.coin,
      //   isBuy,
      //   action === 'Add' ? realAmount : -realAmount
      // )
      console.log(res)
      toast.update(toastId, {
        render: '✅ Margin updated successfully',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      })
    } catch (error) {
      console.error(error)
      toast.update(toastId, {
        render: '❌' + error,
        type: 'error',
        isLoading: false,
        autoClose: 2000
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='flex flex-col gap-4'>
        <DialogHeader>
          <DialogTitle>Adjust Margin</DialogTitle>
          <DialogDescription>
            Decrease the chance of liquidation by adding more margin or remove excess margin to use
            for other positions.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className='flex flex-col gap-4'>
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50">Current margin for {asset.coin}-USD</span>
            <span className="font-medium text-white">
              {Number(asset.marginUsed).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}{' '}
              USD USD
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50">Margin available to add</span>
            <span className="font-medium text-white">
              {marginAvailable.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}{' '}
              USD
            </span>
          </div>
        </div>
        <Separator />
        <div className='flex flex-col text-xs text-white/50 w-full gap-2'>
          <div className='flex items-center justify-between'>
            <span>Amount</span>
            <Button
              variant={'link'}
              className='p-0 h-fit'
              onClick={() => setAmount(marginAvailable.toString())}
            >
              Max
            </Button>
          </div>
          <div className='flex items-center gap-2'>
            <Input
              type='number'
              value={amount}
              className='h-10 text-left text-white'
              onChange={(e) => setAmount(e.target.value)}
              placeholder='Amount'
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={'outline'} className='w-24'>
                  {action}
                  <IconChevronDown className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-20'>
                <DropdownMenuItem onClick={() => setAction('Add')}>Add</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAction('Remove')}>Remove</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Button onClick={handleMarginChange} className='w-full'>Confirm</Button>
      </DialogContent>
    </Dialog>
  )
}

export default IsolatedMarginModal
