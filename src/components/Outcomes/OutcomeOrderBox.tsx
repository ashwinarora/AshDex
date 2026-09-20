'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useConnection } from 'wagmi'
import { useShallow } from 'zustand/react/shallow'
import { IconChevronDown, IconLoader2, IconWallet } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useTradeUIStore } from '@/store/TradeUIStore'
import { useWalletModal } from '@/context/WalletModalContext'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useUserFee } from '@/hooks/useUserFee'
import { useOutcomeSideStats } from '@/hooks/useOutcomeMarket'
import { quoteAvailable, sideAvailable } from '@/utils/outcomes/positions'
import {
  buildScaleOrders,
  feeMultiplierForScale,
  formatOutcomePrice,
  marketPriceWithSlippage,
  validateOutcomeOrder
} from '@/utils/outcomes/order'
import { placeOutcomeOrder } from '@/utils/outcomes/placeOutcomeOrder'
import type { ResolvedOutcomeMeta } from '@/utils/outcomes/template'
import type { ResolvedOutcome } from '@/utils/outcomes/types'
import { OUTCOME_MAX_PX, OUTCOME_MIN_PX } from '@/utils/constants'
import ConvertOutcomes from './ConvertOutcomes'
import { formatMultiple, formatOutcomePx, formatUsd, outcomeTradeHref } from './outcomeFormat'

type Tab = 'MARKET' | 'LIMIT' | 'SCALE' | 'CONVERT'
const TAB_LABEL: Record<Tab, string> = {
  MARKET: 'Market',
  LIMIT: 'Limit',
  SCALE: 'Scale',
  CONVERT: 'Convert'
}

type Props = {
  outcome: ResolvedOutcome
  side: 0 | 1
  resolved: ResolvedOutcomeMeta
}

const numericOnly = (v: string) => /^[0-9]*\.?[0-9]*$/.test(v)

const OutcomeOrderBox = ({ outcome, side, resolved }: Props) => {
  const router = useRouter()
  const { isConnected } = useConnection()
  const { openConnectWalletModal } = useWalletModal()
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const { getAdjustedBuilderFee, data: feeData } = useUserFee()
  const {
    requestedLimitPrice,
    requestedAssetAmount,
    clearRequestedLimitPrice,
    clearRequestedAssetAmount
  } = useTradeUIStore()
  const { sdkL1ActionClient, spotState, pushNewOpenOrders, agentWallet } = useHyperliquidStore(
    useShallow((s) => ({
      sdkL1ActionClient: s.sdkL1ActionClient,
      spotState: s.spotState,
      pushNewOpenOrders: s.pushNewOpenOrders,
      agentWallet: s.agentWallet
    }))
  )

  const [tab, setTab] = useState<Tab>('MARKET')
  const [isBuy, setIsBuy] = useState(true)
  const [price, setPrice] = useState('')
  const [size, setSize] = useState('')
  const [slippage, setSlippage] = useState(8)
  const [pending, setPending] = useState(false)
  // scale
  const [scaleStart, setScaleStart] = useState('')
  const [scaleEnd, setScaleEnd] = useState('')
  const [scaleCount, setScaleCount] = useState('5')
  const [scaleSkew, setScaleSkew] = useState('1')

  const sideSpec = outcome.sides[side]
  const other = outcome.sides[side === 0 ? 1 : 0]
  const stats = useOutcomeSideStats(sideSpec.coin)
  const otherStats = useOutcomeSideStats(other.coin)
  const mid = stats.mid

  // Order book clicks land here (shared TradeUIStore contract with OrderBook).
  useEffect(() => {
    if (requestedLimitPrice) {
      setPrice(requestedLimitPrice)
      setTab('LIMIT')
      clearRequestedLimitPrice()
    }
    if (requestedAssetAmount) {
      setSize(String(Math.floor(Number(requestedAssetAmount))))
      clearRequestedAssetAmount()
    }
  }, [
    requestedLimitPrice,
    requestedAssetAmount,
    clearRequestedLimitPrice,
    clearRequestedAssetAmount
  ])

  // Seed limit price from mid when the side changes.
  useEffect(() => {
    setSize('')
    if (mid !== null) setPrice(formatOutcomePrice(mid))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sideSpec.coin])
  useEffect(() => {
    if (!price && mid !== null) setPrice(formatOutcomePrice(mid))
  }, [mid, price])

  const effectivePrice = useMemo(() => {
    if (tab === 'MARKET') return mid === null ? NaN : marketPriceWithSlippage(mid, isBuy, slippage)
    return Number(price)
  }, [tab, mid, isBuy, slippage, price])

  const balances = spotState?.balances
  const available = isBuy
    ? quoteAvailable(balances, outcome.quoteToken)
    : sideAvailable(balances, sideSpec.balanceCoin)
  const priceForMax = tab === 'MARKET' ? (mid ?? NaN) : Number(price)
  const maxShares = isBuy
    ? Number.isFinite(priceForMax) && priceForMax > 0
      ? Math.floor(available / priceForMax)
      : 0
    : Math.floor(available)
  const sizeNum = Number(size)
  const pct =
    maxShares > 0 && Number.isFinite(sizeNum) ? Math.min(100, (sizeNum / maxShares) * 100) : 0

  const validation = useMemo(
    () =>
      validateOutcomeOrder({
        price: effectivePrice,
        size: sizeNum,
        available: isConnected ? available : undefined,
        isBuy
      }),
    [effectivePrice, sizeNum, available, isBuy, isConnected]
  )

  const scaleOrders = useMemo(
    () =>
      tab === 'SCALE'
        ? buildScaleOrders({
            totalShares: sizeNum,
            startPx: Number(scaleStart),
            endPx: Number(scaleEnd),
            count: Number(scaleCount),
            skew: Number(scaleSkew) || 1
          })
        : [],
    [tab, sizeNum, scaleStart, scaleEnd, scaleCount, scaleSkew]
  )
  const scaleValid =
    scaleOrders.length > 0 &&
    scaleOrders.every(
      (o) => Number(o.price) >= OUTCOME_MIN_PX && Number(o.price) <= OUTCOME_MAX_PX
    ) &&
    (!isConnected ||
      (isBuy
        ? scaleOrders.reduce((s, o) => s + Number(o.price) * Number(o.size), 0) <= available + 1e-9
        : sizeNum <= available + 1e-9))

  const orderValue = validation.ok
    ? validation.notional
    : Number.isFinite(effectivePrice) && sizeNum > 0
      ? effectivePrice * sizeNum
      : null
  const feeScale = feeMultiplierForScale(outcome.deployerFeeScale)
  const takerPct = feeData
    ? Number(feeData.userSpotCrossRate) *
      (1 - Number(feeData.activeReferralDiscount || 0)) *
      feeScale *
      100
    : 0
  const makerPct = feeData
    ? Number(feeData.userSpotAddRate) *
      (1 - Number(feeData.activeReferralDiscount || 0)) *
      feeScale *
      100
    : 0

  const submit = async () => {
    if (!agentWallet || pending) return
    setPending(true)
    try {
      const isMarket = tab === 'MARKET'
      const adjustedBuilderFee = getAdjustedBuilderFee(isMarket)
      let legs: { price: string; size: string; tif: 'Gtc' | 'Ioc' }[] = []
      if (tab === 'SCALE') {
        if (!scaleValid) return
        legs = scaleOrders.map((o) => ({ ...o, tif: 'Gtc' as const }))
      } else {
        if (!validation.ok) return
        legs = [{ price: validation.price, size: validation.size, tif: isMarket ? 'Ioc' : 'Gtc' }]
      }
      const ok = await placeOutcomeOrder({
        sdkL1ActionClient,
        assetId: sideSpec.assetId,
        coin: sideSpec.coin,
        sideLabel: sideSpec.name,
        isBuy,
        legs,
        adjustedBuilderFee,
        pushNewOpenOrders
      })
      if (ok) setSize('')
    } finally {
      setPending(false)
    }
  }

  const disabled = tab === 'SCALE' ? !scaleValid : !validation.ok
  const reason =
    tab === 'SCALE'
      ? scaleOrders.length === 0
        ? 'Enter size, start and end prices'
        : !scaleValid
          ? 'Check prices / balance'
          : null
      : !validation.ok
        ? validation.reason
        : null

  return (
    <div
      className="flex flex-col bg-secondary rounded-md w-full h-full overflow-y-auto no-scrollbar"
      data-testid="outcome-order-box"
    >
      <div className="w-full px-2 pt-2 flex items-center">
        <ToggleGroup
          type="single"
          className="w-2/3 rounded-l-md rounded-r-none"
          value={isBuy ? 'buy' : 'sell'}
          onValueChange={(v) => v && setIsBuy(v === 'buy')}
        >
          <ToggleGroupItem
            value="buy"
            data-testid="outcome-buy-tab"
            className={cn(
              'w-full rounded-l-md font-semibold',
              isBuy && '!bg-green !text-accent-foreground'
            )}
          >
            Buy
          </ToggleGroupItem>
          <ToggleGroupItem
            value="sell"
            data-testid="outcome-sell-tab"
            className={cn('w-full font-semibold', !isBuy && '!bg-red !text-accent-foreground')}
          >
            Sell
          </ToggleGroupItem>
        </ToggleGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              data-testid="outcome-order-type-trigger"
              className="text-primary w-1/3 h-9 flex items-center gap-1 justify-center text-sm cursor-pointer"
            >
              {TAB_LABEL[tab]}
              <IconChevronDown className="size-3" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
              <DropdownMenuItem
                key={t}
                data-testid={`outcome-order-type-${t}`}
                onClick={() => setTab(t)}
                className="text-white/70 w-28 justify-end"
              >
                {TAB_LABEL[t]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {tab === 'CONVERT' ? (
        <ConvertOutcomes outcome={outcome} resolved={resolved} />
      ) : (
        <div className="flex flex-col gap-3 p-2 text-xs">
          {/* Side toggle with payout multiples */}
          <div className="grid grid-cols-2 gap-1" data-testid="outcome-side-toggle">
            {outcome.sides.map((s) => {
              const st = s.side === side ? stats : otherStats
              const active = s.side === side
              return (
                <button
                  key={s.coin}
                  data-testid={`outcome-side-${s.side}`}
                  onClick={() => router.replace(outcomeTradeHref(outcome.outcomeId, s.side))}
                  className={cn(
                    'h-9 rounded-md text-sm font-semibold transition-colors cursor-pointer',
                    active
                      ? s.side === 0
                        ? 'bg-green text-accent-foreground'
                        : 'bg-red text-accent-foreground'
                      : 'bg-white/5 text-text-2 hover:bg-white/10'
                  )}
                >
                  {s.name} {formatMultiple(st.mid === null ? null : 1 / st.mid)}
                </button>
              )
            })}
          </div>

          <div className="flex justify-between">
            <span className="text-white/70">Available to Trade</span>
            <span className="text-white" data-testid="outcome-available">
              {isBuy
                ? formatUsd(available) + ' ' + outcome.quoteToken
                : `${Math.floor(available)} ${sideSpec.name}`}
            </span>
          </div>

          {tab === 'LIMIT' && (
            <div className="flex items-center gap-1">
              <Input
                data-testid="outcome-price-input"
                value={price}
                onChange={(e) => numericOnly(e.target.value) && setPrice(e.target.value)}
                placeholder="Price"
                className="h-9 bg-surface-1 border-surface-3"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs"
                onClick={() => mid !== null && setPrice(formatOutcomePrice(mid))}
              >
                Mid
              </Button>
            </div>
          )}

          {tab === 'SCALE' && (
            <div className="grid grid-cols-2 gap-1">
              <Input
                data-testid="scale-start"
                value={scaleStart}
                onChange={(e) => numericOnly(e.target.value) && setScaleStart(e.target.value)}
                placeholder="Start price"
                className="h-9 bg-surface-1 border-surface-3"
              />
              <Input
                data-testid="scale-end"
                value={scaleEnd}
                onChange={(e) => numericOnly(e.target.value) && setScaleEnd(e.target.value)}
                placeholder="End price"
                className="h-9 bg-surface-1 border-surface-3"
              />
              <Input
                data-testid="scale-count"
                value={scaleCount}
                onChange={(e) => /^[0-9]*$/.test(e.target.value) && setScaleCount(e.target.value)}
                placeholder="Orders"
                className="h-9 bg-surface-1 border-surface-3"
              />
              <Input
                data-testid="scale-skew"
                value={scaleSkew}
                onChange={(e) => numericOnly(e.target.value) && setScaleSkew(e.target.value)}
                placeholder="Skew"
                className="h-9 bg-surface-1 border-surface-3"
              />
            </div>
          )}

          <div className="relative">
            <Input
              data-testid="outcome-size-input"
              value={size}
              onChange={(e) => /^[0-9]*$/.test(e.target.value) && setSize(e.target.value)}
              placeholder={tab === 'SCALE' ? 'Total size' : 'Size'}
              className="h-9 pr-12 bg-surface-1 border-surface-3"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3">
              {sideSpec.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              value={[pct]}
              max={100}
              step={1}
              disabled={maxShares <= 0}
              onValueChange={([v]) => setSize(String(Math.floor((maxShares * v) / 100)))}
              className="flex-1"
            />
            <span className="w-10 text-right text-text-2">{Math.round(pct)}%</span>
          </div>

          {tab === 'MARKET' && (
            <div className="flex justify-between items-center">
              <span className="text-white/70">Max slippage</span>
              <div className="flex items-center gap-1">
                {[1, 3, 8].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlippage(s)}
                    className={cn(
                      'px-2 py-0.5 rounded cursor-pointer',
                      slippage === s ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-3'
                    )}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'SCALE' && scaleOrders.length > 0 && (
            <div
              className="rounded-md bg-surface-1 p-2 flex flex-col gap-0.5 max-h-32 overflow-y-auto"
              data-testid="scale-preview"
            >
              {scaleOrders.map((o, i) => (
                <div key={i} className="flex justify-between text-[11px] text-text-2">
                  <span>
                    {o.size} @ {o.price}
                  </span>
                  <span>{formatUsd(Number(o.size) * Number(o.price))}</span>
                </div>
              ))}
            </div>
          )}

          <Separator />
          {!isConnected ? (
            <Button
              onClick={openConnectWalletModal}
              className="w-full font-semibold cursor-pointer"
            >
              <IconWallet className="size-4" /> Connect Wallet
            </Button>
          ) : !isAgentApproved || currentFeeApproval === 0 ? (
            <Button
              onClick={() => openAgentModal()}
              className="w-full font-semibold cursor-pointer"
            >
              Enable Trading
            </Button>
          ) : (
            <Button
              data-testid="outcome-submit"
              onClick={submit}
              disabled={disabled || pending}
              className={cn(
                'w-full font-semibold text-white cursor-pointer',
                disabled
                  ? 'bg-white/10 hover:cursor-not-allowed'
                  : isBuy
                    ? 'bg-green hover:bg-green/80'
                    : 'bg-red hover:bg-red/80'
              )}
            >
              {pending && <IconLoader2 className="size-4 animate-spin" />}
              {isBuy ? 'Buy' : 'Sell'} {sideSpec.name}
            </Button>
          )}
          {reason && size && (
            <p className="text-[11px] text-red" data-testid="outcome-order-reason">
              {reason}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-white/70">Order Value</span>
              <span className="text-white">{formatUsd(orderValue)}</span>
            </div>
            {tab === 'MARKET' && (
              <div className="flex justify-between">
                <span className="text-white/70">Est. Price</span>
                <span className="text-white">
                  {formatOutcomePx(Number.isFinite(effectivePrice) ? effectivePrice : null)} (max)
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-white/70">
                {isBuy ? `Payout if ${sideSpec.name}` : 'Proceeds'}
              </span>
              <span className="text-white" data-testid="outcome-payout">
                {isBuy ? formatUsd(sizeNum > 0 ? sizeNum : null) : formatUsd(orderValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">
                Fees{feeScale > 1 ? ` (×${feeScale} deployer)` : ''}
              </span>
              <span className="text-white">
                Taker {takerPct.toFixed(3)}% · Maker {makerPct.toFixed(3)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OutcomeOrderBox
