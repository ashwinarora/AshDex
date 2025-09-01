import React, { useState } from 'react'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { formatPrice, getPerpsUniverseIndex } from '@/utils/utils'
import { toast } from 'sonner'
import { OrderData } from '@/utils/hyperliquid/PlaceOrder'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import { useUserFee } from '@/hooks/useUserFee'
import { BUILDER_ADDRESS } from '@/utils/constants'

interface CloseAllModalProps {
  isOpen: boolean
  onClose: () => void
}

const CloseAllModal: React.FC<CloseAllModalProps> = ({ isOpen, onClose }) => {
  const [selected, setSelected] = useState<'market' | 'limit'>('market')
  const { clearingHouseState, agentWallet, allMids, sdkExchangeClient, perpsMeta } =
    useHyperliquidStore(
      useShallow((state) => ({
        clearingHouseState: state.clearingHouseState,
        agentWallet: state.agentWallet,
        allMids: state.allMids,
        sdkExchangeClient: state.sdkExchangeClient,
        perpsMeta: state.perpsMeta
      }))
    )
  const { getAdjustedBuilderFee } = useUserFee()

  const handleCloseAll = async () => {
    if (!agentWallet || !clearingHouseState?.assetPositions || !perpsMeta || !sdkExchangeClient)
      return
    const toastId = toast.loading('Closing all positions...')
    try {
      const orders: OrderData[] = clearingHouseState.assetPositions.map((posObj) => {
        const pos = posObj.position
        const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, pos.coin)
        const szDecimals = perpsMeta.universe[assetIndex].szDecimals
        const isBuy = !(Number(pos.szi) > 0)
        const absSize = Math.abs(Number(pos.szi)).toFixed(szDecimals)
        const mid = allMids[pos.coin]
        let price: number
        if (selected === 'market') {
          price = isBuy ? Number(mid) * 1.1 : Number(mid) * 0.9
        } else {
          price = Number(mid)
        }
        return {
          assetIndex: assetIndex,
          isBuy: isBuy,
          reduceOnly: true,
          price: formatPrice(price, szDecimals).toString(),
          size: absSize.replace(/\.?0+$/, ''),
          orderType: {
            limit: {
              tif: 'Gtc'
            }
          }
        }
      })
      // const orderRes = await placeOrder(agentWallet, isTestnet, hyperliquidAxios, {
      //   grouping: 'na',
      //   orders: orders
      // })
      const adjustedBuilderFee = getAdjustedBuilderFee(true)
      const orderRes = await sdkExchangeClient.order({
        grouping: 'na',
        builder: {
          b: BUILDER_ADDRESS,
          f: adjustedBuilderFee
        },
        orders: orders.map((order) => ({
          a: order.assetIndex,
          b: order.isBuy,
          p: order.price,
          s: order.size,
          r: order.reduceOnly,
          t: order.orderType
        }))
      })
      const status = orderRes.response.data.statuses[0]
      if ('error' in status) {
        onClose()
        toast.error(status.error, {
          id: toastId
        })
      } else if ('filled' in status) {
        onClose()
        toast.success('All positions closed successfully', {
          id: toastId
        })
      }
    } catch (error) {
      console.error('Error closing all positions:', error)
      onClose()
      toast.error(error as string, {
        id: toastId
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Close All Positions</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This will close all your positions and cancel their associated TP/SL orders.
        </DialogDescription>
        <ToggleGroup
          className="w-full bg-white/5 rounded-md"
          type="single"
          value={selected}
          onValueChange={(value) => {
            if (value === '') {
              return
            }
            setSelected(value as 'market' | 'limit')
          }}
        >
          <ToggleGroupItem value="market" className="w-full rounded-l-md">
            Market Close
          </ToggleGroupItem>
          <ToggleGroupItem value="limit" className="w-full rounded-r-md">
            Limit Close at Mid Price
          </ToggleGroupItem>
        </ToggleGroup>
        <Button onClick={handleCloseAll}>
          {selected === 'market' ? 'Confirm Market Close' : 'Confirm Limit Close at Mid Price'}
        </Button>
        <DialogFooter>
          <span className="text-red text-xs text-center w-full">
            This will close all your positions and cancel their associated TP/SL orders. <br /> You
            cannot undo this action.
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CloseAllModal
