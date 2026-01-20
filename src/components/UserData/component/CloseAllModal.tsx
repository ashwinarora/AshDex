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
import { useTranslate } from '@tolgee/react'
import { useAgentApproval } from '@/context/EstablishConnection'
import useUserStore from '@/store/userStore'
import { cn } from '@/lib/utils'
import { IconWallet } from '@tabler/icons-react'
import { useAccount } from 'wagmi'
import { useWalletModal } from '@/context/WalletModalContext'

interface CloseAllModalProps {
  isOpen: boolean
  onClose: () => void
}

const CloseAllModal: React.FC<CloseAllModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslate()
  const [selected, setSelected] = useState<'market' | 'limit'>('market')
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const { clearingHouseState, agentWallet, allMids, sdkL1ActionClient, perpsMeta } =
    useHyperliquidStore(
      useShallow((state) => ({
        clearingHouseState: state.clearingHouseState,
        agentWallet: state.agentWallet,
        allMids: state.allMids,
        sdkL1ActionClient: state.sdkL1ActionClient,
        perpsMeta: state.perpsMeta
      }))
    )
  const { getAdjustedBuilderFee } = useUserFee()
  const { isAgentApproved, openModal: openAgentModal, currentFeeApproval } = useAgentApproval()
  const { address } = useAccount()
  const { openConnectWalletModal } = useWalletModal()
  const handleCloseAll = async () => {
    if (!agentWallet || !clearingHouseState?.assetPositions || !perpsMeta || !sdkL1ActionClient)
      return
    const toastId = toast.loading(t('Closing all positions...'))
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
      const orderRes = await sdkL1ActionClient.order({
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
        console.error('Close all positions error:', status.error)
        toast.error(t('Something went wrong, check the console or contact support'), {
          id: toastId
        })
      } else if ('filled' in status) {
        onClose()
        toast.success(t('All positions closed successfully'), {
          id: toastId
        })
      }
    } catch (error) {
      console.error(t('Error closing all positions:'), error)
      onClose()
      toast.error(t('Something went wrong, check the console or contact support'), {
        id: toastId
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-4" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('Close All Positions')}</DialogTitle>
        </DialogHeader>
        <DialogDescription className={cn(isRTL && 'text-end')}>
          {t('This will close all your positions and cancel their associated TP/SL orders.')}
        </DialogDescription>
        <ToggleGroup
          className="w-full bg-white/10 rounded-md"
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
            {t('Market Close')}
          </ToggleGroupItem>
          <ToggleGroupItem value="limit" className="w-full rounded-r-md">
            {t('Limit Close at Mid Price')}
          </ToggleGroupItem>
        </ToggleGroup>
        {!address ? (
          <Button onClick={openConnectWalletModal} size={'sm'} className="flex items-center gap-2">
            <IconWallet className="size-4" />
            <span className="font-semibold">{t('Connect Wallet')}</span>
          </Button>
        ) : !isAgentApproved || currentFeeApproval === 0 ? (
          <Button
            onClick={async () => openAgentModal()}
            className="w-full font-semibold cursor-pointer"
          >
            {' '}
            {t('Enable Trading')}
          </Button>
        ) : (
          <Button onClick={handleCloseAll} disabled={!isAgentApproved || currentFeeApproval === 0}>
            {selected === 'market'
              ? t('Confirm Market Close')
              : t('Confirm Limit Close at Mid Price')}
          </Button>
        )}
        <DialogFooter>
          <span className="text-red text-xs text-center w-full">
            {t('This will close all your positions and cancel their associated TP/SL orders.')}{' '}
            <br /> {t('You cannot undo this action.')}
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CloseAllModal
