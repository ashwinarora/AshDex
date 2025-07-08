import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { getLeverageTicks, getPerpsUniverseIndex } from '@/utils/utils'
import { AssetPosition } from '@nktkas/hyperliquid'
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
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'

interface LeverageModalProps {
  isOpen: boolean
  onClose: () => void
  asset: AssetPosition['position']
}

const LeverageModal = ({ isOpen, onClose, asset }: LeverageModalProps) => {
  const { perpsMeta, sdkExchangeClient } = useHyperliquidStore(
    useShallow((state) => ({
      perpsMeta: state.perpsMeta,
      sdkExchangeClient: state.sdkExchangeClient
    }))
  )

  const maxLeverage = useMemo(() => {
    if (!perpsMeta?.universe.length) return 1
    const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, asset.coin)
    return perpsMeta.universe[assetIndex]?.maxLeverage || 1
  }, [perpsMeta, asset])

  const [leverage, setLeverage] = useState<number>(asset.leverage.value)

  const marks = useMemo(() => [...getLeverageTicks(maxLeverage, 3)], [maxLeverage])

  const handleLeverageChange = async () => {
    if (!asset) return
    const toastId = toast.loading('⏳ Updating leverage...')
    try {
      if (!sdkExchangeClient) return
      if (!perpsMeta) return
      const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, asset.coin)
      const res = await sdkExchangeClient.updateLeverage({
        asset: assetIndex,
        isCross: asset.leverage.type === 'cross',
        leverage: leverage
      })
      console.log(res)
      onClose()
      toast.success('Leverage updated successfully', {
        id: toastId
      })
    } catch (error) {
      onClose()
      console.error('Error updating leverage:', error)
      toast.error(error as string, {
        id: toastId
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Adjust Leverage</DialogTitle>
          <DialogDescription>
            Control the leverage used for {asset.coin} positions. The maximum leverage is{' '}
            {maxLeverage}x. Max position size decreases the higher your leverage.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p
              className={cn('text-xs font-medium transition-colors duration-150', 'text-white/50')}
            >
              Leverage
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
              value={[leverage]}
              onValueChange={(value) => setLeverage(value[0])}
            />
            <ToggleGroup
              size={'sm'}
              className="flex mt-1 items-center bg-white/5 justify-between w-full"
              type="single"
              value={leverage.toString()}
              onValueChange={(value) => value !== '' && setLeverage(parseInt(value, 10))}
            >
              {marks.map((value, index) => (
                <ToggleGroupItem
                  key={`leverage-tick-${value}-${index}`}
                  value={value.toString()}
                  className={cn(
                    'first:rounded-l-md last:rounded-r-md cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
                    leverage === value ? 'bg-primary text-white' : 'bg-transparent text-white/50'
                  )}
                >
                  {value}x
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        <Separator />
        <Button onClick={handleLeverageChange} className="w-full">
          Confirm
        </Button>
        <DialogFooter className="text-xs text-white/50">
          <span className="text-center w-full">
            Note that setting a higher leverage increases the risk of liquidation.
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LeverageModal
