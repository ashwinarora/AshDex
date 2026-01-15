'use client'
import { useWalletModal } from '@/context/WalletModalContext'
import { useAccount } from 'wagmi'
import { TPSLType } from './TPSL'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { IconWallet } from '@tabler/icons-react'
import { useMemo } from 'react'
import useIsSpot from '@/hooks/useIsSpot'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import { placePerpOrder } from './placePerpOrder'
import { placeSpotOrder } from './placeSpotOrder'
import { useUserFee } from '@/hooks/useUserFee'
import { useTranslate } from '@tolgee/react'
import { getMaxAllowedLeverageForNotional } from '@/utils/hyperliquid/marginTables'
import { getPerpsUniverseIndex } from '@/utils/utils'
import { toast } from 'sonner'

export type StopOrder = {
  isMarket: boolean
  triggerPx: number
  tpsl: 'sl' | 'tp'
}

type OrderButtonProps = {
  selectedAsset: string
  isBuy: boolean
  assetAmount: string
  limitPrice: string
  leverage: number
  isCross: boolean
  isPostOnly: boolean
  isReduceOnly: boolean
  tpsl?: TPSLType
  stopOrder?: StopOrder
  isMarket?: boolean
}

const OrderButton = ({
  selectedAsset,
  isBuy,
  assetAmount,
  limitPrice,
  leverage,
  isCross,
  isPostOnly,
  isReduceOnly,
  tpsl,
  stopOrder,
  isMarket
}: OrderButtonProps) => {
  const { t } = useTranslate()
  const { isConnected: isWalletConnected } = useAccount()
  const {
    agentWallet,
    sdkL1ActionClient,
    perpsMeta,
    pushNewOpenOrders,
    pushNewPosition,
    clearingHouseState
  } = useHyperliquidStore(
    useShallow((state) => ({
      agentWallet: state.agentWallet,
      sdkL1ActionClient: state.sdkL1ActionClient,
      perpsMeta: state.perpsMeta,
      pushNewOpenOrders: state.pushNewOpenOrders,
      pushNewPosition: state.pushNewPosition,
      clearingHouseState: state.clearingHouseState
    }))
  )
  const { data: spotMeta, spotKeyToName } = useSpotMeta()
  const { openConnectWalletModal } = useWalletModal()
  const { isAgentApproved, openModal: openAgentModal, currentFeeApproval } = useAgentApproval()
  const isSpot = useIsSpot()
  const { getAdjustedBuilderFee } = useUserFee()

  // Validation logic moved from parent components
  const isInvalid = useMemo(() => {
    if (isSpot) {
      const formattedLimitPrice = limitPrice.replace(/\.?0+$/, '')
      const formattedAssetAmount = assetAmount.replace(/\.?0+$/, '')

      return (
        formattedLimitPrice === '0' ||
        formattedLimitPrice === '' ||
        formattedAssetAmount === '0' ||
        formattedAssetAmount === ''
      )
    } else {
      const formattedLimitPrice = limitPrice.replace(/\.?0+$/, '')
      const formattedAssetAmount = assetAmount.replace(/\.?0+$/, '')

      // Check if TPSL is enabled and both values are empty/zero
      const isTpslInvalid =
        tpsl?.isTpsl && Number(tpsl.takeProfit) === 0 && Number(tpsl.stopLoss) === 0

      return (
        formattedLimitPrice === '0' ||
        formattedLimitPrice === '' ||
        formattedAssetAmount === '0' ||
        formattedAssetAmount === '' ||
        isTpslInvalid
      )
    }
  }, [limitPrice, assetAmount, tpsl, isSpot])

  if (!isWalletConnected) {
    return (
      <Button
        onClick={openConnectWalletModal}
        className="w-full font-semibold cursor-pointer"
      >
        <IconWallet className="w-4 h-4" /> {t('Connect Wallet')}
      </Button>
    )
  }
  if (!isAgentApproved || currentFeeApproval === 0) {
    return (
      <Button
        onClick={async () => openAgentModal()}
        className="w-full font-semibold cursor-pointer"
      >
        {' '}
        {t('Enable Trading')}
      </Button>
    )
  }

  const handlePlaceOrder = async () => {
    if (!agentWallet) return
    if (isInvalid) return
    const adjustedBuilderFee = getAdjustedBuilderFee(isMarket)
    if (isSpot) {
      if (!spotMeta) return
      await placeSpotOrder({
        sdkL1ActionClient,
        spotMeta,
        selectedAsset,
        isBuy,
        limitPrice,
        assetAmount,
        isPostOnly,
        tpsl,
        adjustedBuilderFee,
        spotKeyToName,
        pushNewOpenOrders
      })
    } else {
      if (!perpsMeta) return

      // Preflight: validate leverage against margin tiers using the *updated* notional
      // (existing position + this order) to avoid placing an order that would be rejected.
      const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, selectedAsset)
      const assetUniverse = perpsMeta.universe[assetIndex]

      if (assetUniverse) {
        const formattedLimitPrice = limitPrice.replace(/\.?0+$/, '')
        const formattedAssetAmount = assetAmount.replace(/\.?0+$/, '')
        const px = Number(formattedLimitPrice)
        const sz = Number(formattedAssetAmount)

        if (Number.isFinite(px) && px > 0 && Number.isFinite(sz) && sz > 0 && clearingHouseState) {
          const existingPosition = clearingHouseState.assetPositions?.find(
            (p) => p.position.coin === selectedAsset
          )?.position
          const existingSzi = Number(existingPosition?.szi ?? 0)
          const deltaSzi = sz * (isBuy ? 1 : -1)
          const updatedSzi = existingSzi + deltaSzi
          const updatedNotionalUsd = Math.abs(updatedSzi) * px

          const maxAllowedLeverage = getMaxAllowedLeverageForNotional({
            perpsMeta,
            assetUniverse,
            notional: updatedNotionalUsd
          })

          if (maxAllowedLeverage && leverage > maxAllowedLeverage) {
            toast.error('Leverage exceeds max allowed for your position size', {
              description: `Selected: ${leverage}x • Max: ${maxAllowedLeverage}x • Updated notional: $${updatedNotionalUsd.toLocaleString()}`
            })
            return
          }
        }
      }

      await placePerpOrder({
        sdkL1ActionClient,
        selectedAsset,
        isCross,
        leverage,
        perpsMeta,
        isPostOnly,
        stopOrder,
        isBuy,
        assetAmount,
        limitPrice,
        isReduceOnly,
        tpsl,
        adjustedBuilderFee,
        pushNewOpenOrders,
        pushNewPosition
      })
    }
  }

  return (
    <Button
      onClick={handlePlaceOrder}
      className={cn(
        'w-full font-semibold text-white cursor-pointer',
        isInvalid
          ? 'bg-white/10 hover:cursor-not-allowed '
          : isBuy
            ? 'bg-green hover:bg-green/80 '
            : 'bg-red hover:bg-red/80 '
      )}
      disabled={isInvalid}
      variant={isInvalid ? 'destructive' : 'default'}
    >
      {isSpot ? (isBuy ? t('Buy') : t('Sell')) : isBuy ? t('Long') : t('Short')}
    </Button>
  )
}
export default OrderButton
