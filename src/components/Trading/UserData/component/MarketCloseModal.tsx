import React, { useState, useEffect, useMemo } from 'react'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { formatPrice, getPerpsUniverseIndex } from '@/utils/utils'
import { toast } from 'react-toastify'
import { AssetPosition } from '@nktkas/hyperliquid'
import { Button } from '@/components/ui/button'
import { IconChevronDown } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface MarketCloseModalProps {
  isOpen: boolean
  onClose: () => void
  closingAsset: string
}

const MarketCloseModal: React.FC<MarketCloseModalProps> = ({ isOpen, onClose, closingAsset }) => {
  const { clearingHouseState, agentWallet, allMids, sdkExchangeClient, perpsMeta } =
    useHyperliquid()
  const [size, setSize] = useState<string>('')
  const [sizeType, setSizeType] = useState<'asset' | 'usd'>('asset')
  const [position, setPosition] = useState<AssetPosition['position'] | null>(null)
  const [percent, setPercent] = useState<number>(100)
  const [lastChanged, setLastChanged] = useState<'percent' | 'size' | null>(null)

  useEffect(() => {
    if (clearingHouseState?.assetPositions && closingAsset && perpsMeta) {
      const pos = clearingHouseState.assetPositions.find((p) => p.position.coin === closingAsset)
      if (pos) {
        setPosition(pos.position)
        setSize(Math.abs(Number(pos.position.szi)).toString())
      }
    }
  }, [clearingHouseState, closingAsset])

  function trimDecimals(value: string, decimals: number) {
    if (!value) return value
    const [int, dec] = value.split('.')
    if (!decimals || !dec) return value
    return `${int}.${dec.slice(0, decimals)}`
  }

  useEffect(() => {
    if (lastChanged === 'percent' && position) {
      if (!perpsMeta) return
      const absSzi = Math.abs(Number(position.szi))
      const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, position.coin)
      const szDecimals = perpsMeta.universe[assetIndex].szDecimals
      if (sizeType === 'asset') {
        const newSize = (percent / 100) * absSzi
        setSize(trimDecimals(newSize.toString(), szDecimals))
      } else if (sizeType === 'usd' && allMids[position.coin]) {
        const px = allMids[position.coin]
        const usdValue = (percent / 100) * absSzi * Number(px)
        setSize(trimDecimals(usdValue.toString(), szDecimals))
      }
    }
  }, [percent, position, sizeType, allMids, lastChanged, perpsMeta])

  useEffect(() => {
    if (lastChanged === 'size' && position) {
      if (!perpsMeta) return
      const absSzi = Math.abs(Number(position.szi))
      if (sizeType === 'asset') {
        const sizeNum = parseFloat(size)
        const newPercent = absSzi > 0 ? Math.min(100, Math.max(0, (sizeNum / absSzi) * 100)) : 0
        setPercent(Number.isNaN(newPercent) ? 0 : newPercent)
      } else if (sizeType === 'usd' && allMids[position.coin]) {
        const px = allMids[position.coin]
        const usdNum = parseFloat(size)
        const newPercent =
          absSzi > 0 && Number(px) > 0
            ? Math.min(100, Math.max(0, (usdNum / (absSzi * Number(px))) * 100))
            : 0
        setPercent(Number.isNaN(newPercent) ? 0 : newPercent)
      }
    }
  }, [size, position, sizeType, allMids, lastChanged])

  // Calculate estimated closed PnL with useMemo
  const estPnl = useMemo(() => {
    if (position && size && allMids[position.coin]) {
      const closeSize = parseFloat(size)
      const entryPx = position.entryPx
      const closePx = allMids[position.coin]
      const isLong = Number(position.szi) > 0
      const pnlPerUnit = isLong
        ? Number(closePx) - Number(entryPx)
        : Number(entryPx) - Number(closePx)
      return closeSize * pnlPerUnit
    }
    return null
  }, [position, size, allMids])

  const handleClosePosition = async () => {
    if (!agentWallet || !position || !perpsMeta) return

    const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, position.coin)
    const szDecimals = perpsMeta.universe[assetIndex].szDecimals
    const isBuy = !(Number(position.szi) > 0)
    const mid = allMids[position.coin]
    const price = isBuy ? Number(mid) * 1.1 : Number(mid) * 0.9
    const tif = 'Gtc'
    let finalSize = size
    if (sizeType === 'usd') {
      const priceNum = parseFloat(price.toString())
      const sizeNum = parseFloat(size)
      finalSize = (sizeNum / priceNum).toFixed(szDecimals)
    } else {
      finalSize = parseFloat(size).toFixed(szDecimals)
    }

    const toastId = toast.loading('Closing position...')
    try {
      if (!sdkExchangeClient) return
      const order = await sdkExchangeClient.order({
        grouping: 'na',
        orders: [
          {
            a: assetIndex,
            b: isBuy,
            p: formatPrice(price, szDecimals).toString(),
            s: finalSize.replace(/\.?0+$/, ''),
            r: true,
            t: {
              limit: {
                tif: tif
              }
            }
          }
        ]
      })
      console.log(order)
      const status = order.response.data.statuses[0]
      if ('error' in status) {
        onClose()
        toast.update(toastId, {
          render: '❌' + status.error,
          type: 'error',
          isLoading: false,
          autoClose: 3000
        })
      } else if ('filled' in status) {
        onClose()
        toast.update(toastId, {
          render: `✅ Position Closed Successfully`,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        })
      } else if ('resting' in status) {
        const resting = status.resting
        if (resting) {
          onClose()
          toast.update(toastId, {
            render: `✅ Order Placed Successfully`,
            type: 'success',
            isLoading: false,
            autoClose: 3000
          })
        }
      }
    } catch (error) {
      onClose()
      console.error('Error closing position:', error)
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
      <DialogContent className="flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Market Close</DialogTitle>
          <DialogDescription>Close your position at the current market price.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xs text-white/50">Size</h1>
            <div className="flex w-full items-center gap-2">
              <Input
                type="number"
                value={size}
                className="text-white flex-1 text-left h-9"
                onChange={(e) => {
                  if (!perpsMeta) return
                  const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, closingAsset)
                  const szDecimals = perpsMeta.universe[assetIndex].szDecimals
                  setSize(trimDecimals(e.target.value, szDecimals))
                  setLastChanged('size')
                }}
                placeholder="Enter Size"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-20">
                    <span>{sizeType === 'asset' ? closingAsset : 'USD'}</span>
                    <IconChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-20">
                  <DropdownMenuItem onClick={() => setSizeType('asset')}>
                    <span>{closingAsset}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSizeType('usd')}>
                    <span>USD</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex w-full items-center gap-2 mt-1">
              <Slider
                min={0}
                max={100}
                step={0.01}
                value={[percent]}
                onValueChange={(value) => {
                  setPercent(Math.round(value[0]))
                  setLastChanged('percent')
                }}
                className="flex-1"
              />
              <div className="flex bg-white/5 p-2 rounded-md w-16 items-center justify-center gap-2">
                <span className="text-xs text-white/50">{percent.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">Estimated closed PnL (without fees):</span>
          <span
            className={cn(
              'text-xs text-white/50',
              estPnl
                ? estPnl > 0
                  ? 'text-green'
                  : estPnl < 0
                    ? 'text-red'
                    : 'text-white'
                : 'text-white/50'
            )}
          >
            {estPnl ? (estPnl > 0 ? '+' : '') : ''}$
            {estPnl
              ? estPnl.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
              : '0.00'}
          </span>
        </div>
        <Separator />
        <Button onClick={handleClosePosition} className="w-full">
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default MarketCloseModal
