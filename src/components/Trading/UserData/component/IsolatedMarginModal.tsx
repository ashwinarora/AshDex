import React, { useState } from 'react'
import { toast } from 'sonner'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { AssetPosition } from '@nktkas/hyperliquid'
import { getPerpsUniverseIndex } from '@/utils/utils'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { IconChevronDown } from '@tabler/icons-react'
import { useTranslate } from '@tolgee/react'
import { useAgentApproval } from '@/context/EstablishConnection'
interface IsolatedMarginModalProps {
  isOpen: boolean
  onClose: () => void
  asset: AssetPosition['position']
}

const IsolatedMarginModal: React.FC<IsolatedMarginModalProps> = ({ isOpen, onClose, asset }) => {
  const { t } = useTranslate()
  const { clearingHouseState, perpsMeta, sdkL1ActionClient } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      perpsMeta: state.perpsMeta,
      sdkL1ActionClient: state.sdkL1ActionClient
    }))
  )
  const [amount, setAmount] = useState('')
  const [action, setAction] = useState<'Add' | 'Remove'>('Add')
  const { isAgentApproved, openModal: openAgentModal, currentFeeApproval } = useAgentApproval()
  const marginAvailable = clearingHouseState?.withdrawable || 0

  const handleMarginChange = async () => {
    const isBuy = Number(asset.szi) > 0
    const toastId = toast.loading(t('Updating margin...'))
    const realAmount = Number(amount) * 10 ** 6
    try {
      if (!sdkL1ActionClient) return
      if (!perpsMeta) return
      const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, asset.coin)
      const res = await sdkL1ActionClient.updateIsolatedMargin({
        asset: assetIndex,
        isBuy: isBuy,
        ntli: action === 'Add' ? realAmount : -realAmount
      })
      console.log(res)
      onClose()
      toast.success(t('Margin updated successfully'), {
        id: toastId
      })
    } catch (error) {
      console.error(error)
      onClose()
      toast.error(`${t('Failed to update margin.')} ${error as string}`, {
        id: toastId
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>{t('Adjust Margin')}</DialogTitle>
          <DialogDescription>
            {t(
              'Decrease the chance of liquidation by adding more margin or remove excess margin to use for other positions.'
            )}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50">
              {t('Current margin for')} {asset.coin}-USD
            </span>
            <span className="font-medium text-white">
              {Number(asset.marginUsed).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}{' '}
              USD
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/50">{t('Margin available to add')}</span>
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
        <div className="flex flex-col text-xs text-white/50 w-full gap-2">
          <div className="flex items-center justify-between">
            <span>{t('Amount')}</span>
            <Button
              variant={'link'}
              className="p-0 h-fit"
              onClick={() => setAmount(marginAvailable.toString())}
            >
              {t('Max')}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={amount}
              className="h-10 text-start text-white"
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('Amount')}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={'outline'} className="w-24">
                  {action}
                  <IconChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-20">
                <DropdownMenuItem onClick={() => setAction('Add')}>{t('Add')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAction('Remove')}>
                  {t('Remove')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {!isAgentApproved || currentFeeApproval === 0 ? (
          <Button
            onClick={async () => openAgentModal()}
            className="w-full font-semibold cursor-pointer"
          >
            {' '}
            {t('Enable Trading')}
          </Button>
        ) : (
          <Button
            onClick={handleMarginChange}
            className="w-full"
            disabled={!isAgentApproved || currentFeeApproval === 0}
          >
            {t('Confirm')}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default IsolatedMarginModal
