import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { getLeverageTicks, getPerpsUniverseIndex } from '@/utils/utils'
import type { ClearinghouseStateResponse } from '@nktkas/hyperliquid/api/info'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ToggleGroupItem } from '@/components/ui/toggle-group'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { ToggleGroup } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { IconMinus, IconPlus, IconWallet } from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useConnection } from 'wagmi'
import { useWalletModal } from '@/context/WalletModalContext'
interface LeverageModalProps {
  isOpen: boolean
  onClose: () => void
  asset?: ClearinghouseStateResponse['assetPositions'][number]['position']
}

const LeverageModal = ({ isOpen, onClose, asset }: LeverageModalProps) => {
  const isRTL = false
  const { perpsMeta, sdkL1ActionClient } = useHyperliquidStore(
    useShallow((state) => ({
      perpsMeta: state.perpsMeta,
      sdkL1ActionClient: state.sdkL1ActionClient
    }))
  )
  const { isAgentApproved, openModal: openAgentModal, currentFeeApproval } = useAgentApproval()
  const { address } = useConnection()
  const { openConnectWalletModal } = useWalletModal()
  const maxLeverage = useMemo(() => {
    if (!perpsMeta?.universe.length || !asset) return 1
    const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, asset.coin)
    return perpsMeta.universe[assetIndex]?.maxLeverage || 1
  }, [perpsMeta, asset])

  const [leverage, setLeverage] = useState<number>(asset?.leverage.value ?? 1)

  const marks = useMemo(() => [...getLeverageTicks(maxLeverage, 3)], [maxLeverage])

  const handleLeverageChange = async () => {
    if (!asset) return
    const toastId = toast.loading('Updating leverage...')
    try {
      if (!sdkL1ActionClient) return
      if (!perpsMeta) return
      const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, asset.coin)
      await sdkL1ActionClient.updateLeverage({
        asset: assetIndex,
        isCross: asset.leverage.type === 'cross',
        leverage: leverage
      })
      onClose()
      toast.success('Leverage updated successfully', {
        id: toastId
      })
    } catch (error) {
      onClose()
      console.error('Error updating leverage:', error)
      toast.error('Something went wrong, check the console or contact support', {
        id: toastId
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-4" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{'Adjust Leverage'}</DialogTitle>
          <DialogDescription className={cn(isRTL && 'text-end')}>
            {'Control the leverage used for'} {asset?.coin} {'positions. The maximum leverage is'}{' '}
            {maxLeverage}x. {'Max position size decreases the higher your leverage.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
            <p
              className={cn('text-xs font-medium transition-colors duration-150', 'text-white/70')}
            >
              {'Leverage'}
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setLeverage((prev) => Math.max(prev - 1, 1))}
                variant="outline"
                size="icon"
              >
                <IconMinus className="size-4" />
              </Button>
              <Input
                className={cn('w-16 text-white')}
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
              />
              <Button
                onClick={() => setLeverage((prev) => Math.min(prev + 1, maxLeverage))}
                variant="outline"
                size="icon"
              >
                <IconPlus className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2 w-full items-center justify-center">
            <Slider
              min={1}
              max={maxLeverage}
              dir={isRTL ? 'rtl' : 'ltr'}
              value={[leverage]}
              onValueChange={(value) => setLeverage(value[0])}
            />
            <ToggleGroup
              size={'sm'}
              className={cn(
                'flex mt-1 items-center bg-white/10 justify-between w-full',
                isRTL && 'flex-row-reverse'
              )}
              type="single"
              value={leverage.toString()}
              onValueChange={(value) => value !== '' && setLeverage(parseInt(value, 10))}
            >
              {marks.map((value, index) => (
                <ToggleGroupItem
                  key={`leverage-tick-${value}-${index}`}
                  value={value.toString()}
                  className={cn(
                    'cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
                    leverage === value ? 'bg-primary text-white' : 'bg-transparent text-white/70',
                    isRTL
                      ? 'first:rounded-r-md last:rounded-l-md'
                      : 'first:rounded-l-md last:rounded-r-md'
                  )}
                >
                  {value}x
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        <Separator />
        {!address ? (
          <Button onClick={openConnectWalletModal} size={'sm'} className="flex items-center gap-2">
            <IconWallet className="size-4" />
            <span className="font-semibold">{'Connect Wallet'}</span>
          </Button>
        ) : !isAgentApproved || currentFeeApproval === 0 ? (
          <Button
            onClick={async () => openAgentModal()}
            className="w-full font-semibold cursor-pointer"
          >
            {' '}
            {'Enable Trading'}
          </Button>
        ) : (
          <Button
            onClick={handleLeverageChange}
            className="w-full"
            disabled={!isAgentApproved || currentFeeApproval === 0}
          >
            {'Confirm'}
          </Button>
        )}
        <DialogFooter className="text-xs text-white/70">
          <span className="text-center w-full">
            {'Note that setting a higher leverage increases the risk of liquidation.'}
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LeverageModal
