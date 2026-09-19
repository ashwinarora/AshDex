'use client'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useConnection } from 'wagmi'
import { useShallow } from 'zustand/react/shallow'
import { toast } from 'sonner'
import {
  IconCheckbox,
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconSquare,
  IconWallet
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import BuyOrSell from './BuyOrSell'
import Fees from './Fees'
import LeverageMargin from './LeverageMargin'
import AmountInput from './AmountInput'
import AmountInputSpot from './AmountInputSpot'
import TwapConfirmModal, { TwapConfirmDetails } from './TwapConfirmModal'
import useIsSpot from '@/hooks/useIsSpot'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { useWalletModal } from '@/context/WalletModalContext'
import { useAgentApproval } from '@/context/EstablishConnection'
import {
  isValidDuration,
  meetsMinNotional,
  minutesFromDHM,
  suborderSize,
  triggerDirection,
  TWAP_MAX_MINUTES,
  TWAP_MIN_MINUTES,
  TWAP_MIN_NOTIONAL_USDC
} from '@/utils/twap'
import { resolveAssetIndex } from '@/utils/resolveAssetIndex'
import { placeTwapOrder } from './placeTwapOrder'
import { getPerpsUniverseIndex } from '@/utils/utils'
import { IPlaceOrderProps } from '..'
import { normalizeDecimalString } from '@/utils/decimalString'

const TWAP_CONFIRM_STORAGE_KEY = 'ashdex.twap.skipConfirm'

const readSkipConfirm = () => {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(TWAP_CONFIRM_STORAGE_KEY) === '1'
}
const writeSkipConfirm = (skip: boolean) => {
  if (typeof window === 'undefined') return
  if (skip) window.localStorage.setItem(TWAP_CONFIRM_STORAGE_KEY, '1')
  else window.localStorage.removeItem(TWAP_CONFIRM_STORAGE_KEY)
}

const numericInput = (raw: string) => {
  if (raw === '' || raw === '.') return raw
  if (!/^[0-9]*\.?[0-9]*$/.test(raw)) return null
  return raw
}
const integerInput = (raw: string) => {
  if (raw === '') return raw
  if (!/^[0-9]+$/.test(raw)) return null
  return raw
}

const Twap = ({ selectedAsset, isRTL }: IPlaceOrderProps) => {
  const isSpot = useIsSpot()
  const { isConnected } = useConnection()
  const { openConnectWalletModal } = useWalletModal()
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const { allMids, perpsMeta, sdkL1ActionClient, clearingHouseState } = useHyperliquidStore(
    useShallow((state) => ({
      allMids: state.allMids,
      perpsMeta: state.perpsMeta,
      sdkL1ActionClient: state.sdkL1ActionClient,
      clearingHouseState: state.clearingHouseState
    }))
  )
  const { data: spotMeta } = useSpotMeta()

  const [isBuy, setIsBuy] = useState(true)
  const [isCross, setIsCross] = useState(true)
  const [leverage, setLeverage] = useState(1)
  const [assetAmount, setAssetAmount] = useState('')
  const [usdAmount, setUsdAmount] = useState('')
  const [days, setDays] = useState('')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('30')
  const [randomize, setRandomize] = useState(false)
  const [reduceOnly, setReduceOnly] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [triggerPriceInput, setTriggerPriceInput] = useState('')
  const [stopPriceInput, setStopPriceInput] = useState('')
  const [isError, setIsError] = useState(false)
  // BUG-09 fix: React state is racy under rapid double-click because the
  // second click's closure may still read the pre-update value. Use a ref for
  // the atomic guard; keep the state for the spinner UI only.
  const pendingRef = useRef(false)
  const [isPending, setIsPending] = useState(false)
  const [confirmDetails, setConfirmDetails] = useState<TwapConfirmDetails | null>(null)

  const isTradingEnabled = isAgentApproved && currentFeeApproval > 0

  const totalMinutes = useMemo(
    () => minutesFromDHM(Number(days), Number(hours), Number(minutes)),
    [days, hours, minutes]
  )
  const durationValid = isValidDuration(totalMinutes)

  const mark = Number(allMids[selectedAsset] ?? 0)
  const sizeNum = Number(assetAmount)
  const notionalValid = meetsMinNotional(sizeNum, mark)

  const trigger = triggerPriceInput.trim()
  const stop = stopPriceInput.trim()
  const triggerAbove = useMemo(() => {
    if (!trigger) return false
    return triggerDirection(Number(trigger), mark)
  }, [trigger, mark])

  const suborderApprox = useMemo(() => suborderSize(sizeNum, totalMinutes), [sizeNum, totalMinutes])

  // Human-readable base symbol for the currently selected asset — used for the
  // confirm modal's Total Size + Size per Suborder rows and for the success
  // toast. For perps we strip the `-USD` suffix; for spot we resolve the base
  // token via spotMeta rather than parsing the universe handle (which is
  // `@1035` for non-canonical pairs — see BUG-20). Falls back to a naive split
  // when spotMeta isn't ready yet.
  const displayBaseSymbol = useMemo(() => {
    if (!isSpot) return selectedAsset.split('-')[0]
    const universeEntry = spotMeta?.universe.find((u) => u.name === selectedAsset)
    const base = universeEntry ? spotMeta?.tokens[universeEntry.tokens[0]]?.name : undefined
    if (base) return base
    // Fallback: canonical pairs already contain the base as the first slash-segment.
    return selectedAsset.includes('/') ? selectedAsset.split('/')[0] : selectedAsset
  }, [isSpot, selectedAsset, spotMeta])

  const currentPositionSzi = useMemo(() => {
    if (isSpot) return 0
    const pos = clearingHouseState?.assetPositions?.find((p) => p.position.coin === selectedAsset)
    return pos ? Number(pos.position.szi) : 0
  }, [clearingHouseState, selectedAsset, isSpot])

  const reduceOnlyTooLarge = useMemo(() => {
    if (!reduceOnly || isSpot) return false
    if (!Number.isFinite(sizeNum) || sizeNum <= 0) return false
    const absPos = Math.abs(currentPositionSzi)
    if (absPos === 0) return true
    return sizeNum > absPos
  }, [reduceOnly, isSpot, sizeNum, currentPositionSzi])

  const inputsBlank = !assetAmount || sizeNum <= 0 || !durationValid

  const buttonState = useMemo(() => {
    if (!isConnected) return 'connect'
    if (!isTradingEnabled) return 'enable'
    if (reduceOnlyTooLarge) return 'reduce-too-large'
    return 'place'
  }, [isConnected, isTradingEnabled, reduceOnlyTooLarge])

  const buttonLabel = useMemo(() => {
    switch (buttonState) {
      case 'connect':
        return 'Connect Wallet'
      case 'enable':
        return 'Enable Trading'
      case 'reduce-too-large':
        return 'Reduce Only Too Large'
      default:
        return isSpot ? (isBuy ? 'Buy' : 'Sell') : isBuy ? 'Buy / Long' : 'Sell / Short'
    }
  }, [buttonState, isSpot, isBuy])

  const runtimeLabel = useMemo(() => {
    if (!durationValid) {
      // BUG-03: match the input header's units ("5m – 24h"), not "5m – 1440m".
      const maxHours = TWAP_MAX_MINUTES / 60
      return `${TWAP_MIN_MINUTES}m – ${maxHours >= 24 && maxHours % 24 === 0 ? `${maxHours / 24}d` : `${maxHours}h`}`
    }
    // BUG-04: report exact days when the duration is a whole number of days.
    // Prevents "24 hours" for a 1-day TWAP; matches Hyperliquid's "1 day".
    const d = Math.floor(totalMinutes / 1440)
    const remAfterDays = totalMinutes - d * 1440
    const h = Math.floor(remAfterDays / 60)
    const m = remAfterDays % 60
    if (d > 0 && h === 0 && m === 0) return `${d} day${d === 1 ? '' : 's'}`
    if (d > 0 && h === 0) return `${d}d ${m}m`
    if (d > 0 && m === 0) return `${d}d ${h}h`
    if (d > 0) return `${d}d ${h}h ${m}m`
    if (h === 0) return `${m} minutes`
    if (m === 0) return `${h} hour${h === 1 ? '' : 's'}`
    return `${h}h ${m}m`
  }, [durationValid, totalMinutes])

  const setDurationField =
    (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = integerInput(e.target.value)
      if (next === null) return
      setter(next)
    }

  const setPriceField =
    (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = numericInput(e.target.value)
      if (next === null) return
      setter(next)
    }

  const submitTwap = useCallback(async () => {
    // BUG-09: atomic guard via useRef (state closures are racy on rapid clicks).
    if (pendingRef.current) return
    pendingRef.current = true
    setIsPending(true)
    try {
      let assetIndex: number | null = null
      if (isSpot) {
        // BUG-19 fix: `selectedAsset` IS the universe key that Hyperliquid's
        // spot universe is keyed by ("PURR/USDC" for canonical pairs, "@1035"
        // for non-canonical). Pass it straight to the resolver. Previous
        // implementation ran the key through `spotKeyToName` first, which
        // returns the base token name ("PURR", "HYPE") and never matches any
        // universe entry — every spot TWAP silently failed with
        // "Could not resolve asset index for TWAP".
        assetIndex = resolveAssetIndex(selectedAsset, {
          isSpot: true,
          spotUniverse: spotMeta?.universe
        })
      } else if (perpsMeta) {
        const idx = getPerpsUniverseIndex(perpsMeta.universe, selectedAsset)
        assetIndex = idx >= 0 ? idx : null
      }
      if (assetIndex === null) {
        toast.error('Could not resolve asset index for TWAP')
        return
      }

      const size = normalizeDecimalString(assetAmount)
      const details =
        trigger || stop
          ? {
              trigger: trigger ? { price: trigger, above: triggerAbove } : undefined,
              stopPrice: stop || undefined
            }
          : undefined

      await placeTwapOrder({
        sdkL1ActionClient,
        assetIndex,
        isBuy,
        size,
        reduceOnly: isSpot ? false : reduceOnly,
        minutes: totalMinutes,
        randomize,
        details,
        displayName: displayBaseSymbol
      })
    } finally {
      pendingRef.current = false
      setIsPending(false)
    }
  }, [
    isSpot,
    spotMeta,
    perpsMeta,
    selectedAsset,
    assetAmount,
    trigger,
    stop,
    triggerAbove,
    sdkL1ActionClient,
    isBuy,
    reduceOnly,
    totalMinutes,
    randomize,
    displayBaseSymbol
  ])

  const handlePlaceClick = useCallback(() => {
    // While the button reads "Connect Wallet" / "Enable Trading" it must act
    // as that button regardless of the form state — the same way the shared
    // OrderButton does. A disconnected user cannot even type a size (the amount
    // input waits for clearinghouse state), so gating these redirects behind
    // `inputsBlank` made both buttons dead (BUG-059).
    if (buttonState === 'connect') return openConnectWalletModal()
    if (buttonState === 'enable') return openAgentModal()
    if (inputsBlank) return
    if (isError) return
    // Match Hyperliquid: below-$100 notional is a toast, not a disabled button.
    if (!notionalValid) {
      toast.error(`TWAP order must have minimum value of ${TWAP_MIN_NOTIONAL_USDC} USDC.`)
      return
    }
    if (!durationValid) {
      toast.error(
        `Invalid TWAP duration: must be between ${TWAP_MIN_MINUTES} and ${TWAP_MAX_MINUTES} minutes.`
      )
      return
    }
    if (buttonState === 'reduce-too-large') return
    if (readSkipConfirm()) {
      submitTwap()
      return
    }
    const stopLabel = isSpot || isBuy ? 'Max Price' : 'Min Price'
    // BUG-08: emit the verb ("Buy"/"Sell") and, for perps, the position side
    // ("Long"/"Short") separately so the confirm modal can render the side
    // as a colored chip rather than a "Buy / Long" concatenation.
    const action: 'Buy' | 'Sell' = isBuy ? 'Buy' : 'Sell'
    const positionSide: 'Long' | 'Short' | undefined = isSpot ? undefined : isBuy ? 'Long' : 'Short'
    // BUG-20 fix: use displayBaseSymbol (derived from spotMeta.tokens) so
    // non-canonical spot pairs render as "4 HYPE", not "4 @1035".
    const displaySize = (() => {
      const s = Number(assetAmount)
      const decimals = isSpot
        ? Math.min(6, Math.max(0, (assetAmount.split('.')[1] || '').length))
        : 5
      return `${s.toFixed(decimals)} ${displayBaseSymbol}`
    })()
    setConfirmDetails({
      action,
      positionSide,
      displaySize,
      runtime: runtimeLabel,
      suborderSize: `~${suborderApprox.toFixed(5)} ${displayBaseSymbol}`,
      triggerPrice: trigger || undefined,
      stopLabel: (stop ? (isBuy ? 'Max Price' : 'Min Price') : stopLabel) as
        | 'Max Price'
        | 'Min Price',
      stopPrice: stop || undefined,
      randomize,
      reduceOnly: isSpot ? undefined : reduceOnly,
      isBuy
    })
  }, [
    buttonState,
    openConnectWalletModal,
    openAgentModal,
    inputsBlank,
    isError,
    notionalValid,
    durationValid,
    submitTwap,
    isSpot,
    isBuy,
    assetAmount,
    displayBaseSymbol,
    runtimeLabel,
    suborderApprox,
    trigger,
    stop,
    randomize,
    reduceOnly
  ])

  const primaryButton = (
    <Button
      onClick={handlePlaceClick}
      className={cn(
        'w-full font-semibold text-white cursor-pointer',
        buttonState === 'place'
          ? isBuy
            ? 'bg-green hover:bg-green/80'
            : 'bg-red hover:bg-red/80'
          : ''
      )}
      disabled={buttonState === 'place' && (inputsBlank || isError || isPending)}
      data-testid="twap-submit"
    >
      {buttonState === 'connect' && <IconWallet className="w-4 h-4" />}
      {isPending && <IconLoader2 className="size-4 animate-spin" />}
      {buttonLabel}
    </Button>
  )

  return (
    <div className="flex flex-col w-full h-full justify-between flex-1">
      <div className="flex flex-col gap-2 px-2 h-full w-full flex-1">
        <Separator className="my-1" orientation="horizontal" />
        <BuyOrSell
          isCross={isCross}
          setIsCross={setIsCross}
          isBuy={isBuy}
          setIsBuy={setIsBuy}
          isRTL={isRTL}
          selectedAsset={selectedAsset}
        />
        {!isSpot ? (
          <>
            <LeverageMargin
              selectedAsset={selectedAsset}
              leverage={leverage}
              setLeverage={setLeverage}
              isRTL={isRTL}
            />
            <Separator orientation="horizontal" />
          </>
        ) : (
          <Separator orientation="horizontal" className="bg-transparent" />
        )}
        {isSpot ? (
          <AmountInputSpot
            selectedAsset={selectedAsset}
            assetAmount={assetAmount}
            setAssetAmount={setAssetAmount}
            usdAmount={usdAmount}
            setUsdAmount={setUsdAmount}
            limitPrice={allMids[selectedAsset]?.toString() || '0'}
            isBuy={isBuy}
            isRTL={isRTL}
            setIsError={setIsError}
          />
        ) : (
          <AmountInput
            selectedAsset={selectedAsset}
            assetAmount={assetAmount}
            setAssetAmount={setAssetAmount}
            usdAmount={usdAmount}
            setUsdAmount={setUsdAmount}
            limitPrice={allMids[selectedAsset]?.toString() || '0'}
            leverage={leverage}
            isReduceOnly={reduceOnly}
            isBuy={isBuy}
            isRTL={isRTL}
            setIsError={setIsError}
          />
        )}
        <Separator orientation="horizontal" />

        <div className={cn('flex flex-col gap-2', isRTL && 'items-end')}>
          <div className="flex items-center justify-between">
            <label className="text-white/70 text-xs">
              {/* BUG-03/04: express the ceiling as days when it's a whole
                  number of days (e.g. "24h" → "1d", "7d"). */}
              Running Time ({TWAP_MIN_MINUTES}m –{' '}
              {TWAP_MAX_MINUTES % 1440 === 0
                ? `${TWAP_MAX_MINUTES / 1440}d`
                : `${TWAP_MAX_MINUTES / 60}h`}
              )
            </label>
          </div>
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <DurationField label="Day(s)" value={days} onChange={setDurationField(setDays)} />
            <DurationField label="Hour(s)" value={hours} onChange={setDurationField(setHours)} />
            <DurationField label="Min(s)" value={minutes} onChange={setDurationField(setMinutes)} />
          </div>
        </div>

        <div className={cn('flex items-center justify-start gap-2', isRTL && 'flex-row-reverse')}>
          <Toggle
            size={'sm'}
            className="bg-white/10"
            pressed={randomize}
            onPressedChange={setRandomize}
          >
            {randomize ? <IconCheckbox className="size-3" /> : <IconSquare className="size-3" />}
            <span className="text-xs font-semibold">Randomize</span>
          </Toggle>
          {!isSpot && (
            <Toggle
              size={'sm'}
              className="bg-white/10"
              pressed={reduceOnly}
              onPressedChange={setReduceOnly}
            >
              {reduceOnly ? <IconCheckbox className="size-3" /> : <IconSquare className="size-3" />}
              <span className="text-xs font-semibold">Reduce Only</span>
            </Toggle>
          )}
        </div>

        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className={cn(
            'flex items-center gap-1 text-xs text-white/70 hover:text-white cursor-pointer',
            isRTL && 'flex-row-reverse justify-end'
          )}
          data-testid="twap-advanced-toggle"
        >
          <span>Advanced Settings</span>
          {advancedOpen ? (
            <IconChevronUp className="size-3" />
          ) : (
            <IconChevronDown className="size-3" />
          )}
        </button>

        {advancedOpen && (
          <div className={cn('flex flex-col gap-2', isRTL && 'items-end')}>
            <div className="flex flex-col gap-1">
              <div className={cn('flex items-center gap-1', isRTL && 'flex-row-reverse')}>
                <label className="text-white/70 text-xs">Trigger Price</label>
                {trigger && mark > 0 && (
                  <span className="text-white/50 text-xs">
                    ({triggerAbove ? 'Above' : 'Below'})
                  </span>
                )}
              </div>
              <Input
                type="text"
                value={triggerPriceInput}
                onChange={setPriceField(setTriggerPriceInput)}
                placeholder="0"
                data-testid="twap-trigger-price"
                className={cn(isRTL ? 'text-start' : 'text-end')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-white/70 text-xs">{isBuy ? 'Max Price' : 'Min Price'}</label>
              <Input
                type="text"
                value={stopPriceInput}
                onChange={setPriceField(setStopPriceInput)}
                placeholder="0"
                data-testid="twap-stop-price"
                className={cn(isRTL ? 'text-start' : 'text-end')}
              />
            </div>
            {/* BUG-06: removed the "Trigger and stop prices are managed by
                Hyperliquid" caption — not present on Hyperliquid's own UI. */}
          </div>
        )}

        <Separator orientation="horizontal" />
        <div className="flex w-full flex-col gap-2 text-xs">
          <div className={cn('flex justify-between', isRTL && 'flex-row-reverse')}>
            <p className="text-white/70">Runtime</p>
            <p className="text-white">{runtimeLabel}</p>
          </div>
          <div className={cn('flex justify-between', isRTL && 'flex-row-reverse')}>
            <p className="text-white/70">Size per Suborder</p>
            <p className="text-white">
              {suborderApprox > 0
                ? `~${suborderApprox.toFixed(5)} ${selectedAsset.split('-')[0].split('/')[0]}`
                : '—'}
            </p>
          </div>
          <Fees isSpot={isSpot} isRTL={isRTL} />
        </div>
      </div>
      <div className="flex flex-col gap-2 h-fit w-full p-2">
        <Separator orientation="horizontal" />
        {primaryButton}
      </div>

      <TwapConfirmModal
        isOpen={confirmDetails !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDetails(null)
        }}
        details={confirmDetails}
        isSubmitting={isPending}
        onConfirm={(rememberSkip) => {
          if (rememberSkip) writeSkipConfirm(true)
          setConfirmDetails(null)
          submitTwap()
        }}
      />
    </div>
  )
}

const DurationField = ({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <div className="flex flex-col gap-1 flex-1">
    <label className="text-white/50 text-[10px]">{label}</label>
    <Input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="0"
      className="text-end text-white"
    />
  </div>
)

export default Twap
