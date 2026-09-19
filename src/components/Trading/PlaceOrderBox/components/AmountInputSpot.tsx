'use client'
import { useEffect, useMemo, useState } from 'react'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconChevronDown, IconPercentage } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { useShallow } from 'zustand/react/shallow'
import { normalizeDecimalString } from '@/utils/decimalString'
interface AmountInputSpotProps {
  selectedAsset: string
  assetAmount: string
  setAssetAmount: React.Dispatch<React.SetStateAction<string>>
  usdAmount: string
  setUsdAmount: React.Dispatch<React.SetStateAction<string>>
  limitPrice: string
  isBuy: boolean
  isRTL: boolean
  setIsError: React.Dispatch<React.SetStateAction<boolean>>
}

const isMatch = (a: string, b: string): boolean => a.split('/')[0] === b.split('/')[0]

const AmountInputSpot = ({
  selectedAsset,
  assetAmount,
  setAssetAmount,
  usdAmount,
  setUsdAmount,
  limitPrice,
  isBuy,
  isRTL,
  setIsError
}: AmountInputSpotProps) => {
  const { spotState } = useHyperliquidStore(
    useShallow((state) => ({
      spotState: state.spotState
    }))
  )

  const { data: spotMeta, spotKeyToName } = useSpotMeta()
  const [usdPercent, setUsdPercent] = useState(0)
  const [isInputUsd, setIsInputUsd] = useState(false)
  const [percentInputStr, setPercentInputStr] = useState('')
  const [isPercentFocused, setIsPercentFocused] = useState(false)

  // Debounce percent input - update after 1 second of no typing
  useEffect(() => {
    if (!isPercentFocused) return
    const timer = setTimeout(() => {
      const parsed = parseFloat(percentInputStr)
      if (!Number.isNaN(parsed)) {
        updateFromPercent(parsed)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [percentInputStr, isPercentFocused])

  const selectedAssetName = useMemo(() => {
    return spotKeyToName.get(selectedAsset)
  }, [selectedAsset, spotKeyToName])

  const szDecimals = useMemo(() => {
    const tokenData = spotMeta?.tokens.find((token) => token.name.includes(selectedAssetName))
    return tokenData?.szDecimals || 0
  }, [selectedAssetName, spotMeta])

  const maxAllowed = useMemo(() => {
    if (!spotState) return 0
    if (isBuy) {
      return (
        Number(spotState?.balances.find((b) => b.coin === 'USDC')?.total ?? 0) -
        Number(spotState?.balances.find((b) => b.coin === 'USDC')?.hold ?? 0)
      )
    } else {
      return (
        Number(spotState?.balances.find((b) => isMatch(b.coin, selectedAssetName))?.total ?? 0) -
        Number(spotState?.balances.find((b) => isMatch(b.coin, selectedAssetName))?.hold ?? 0)
      )
    }
  }, [spotState, selectedAssetName, isBuy])

  const updateFromAssetAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Allow empty input or just a decimal point
    if (input === '' || input === '.') {
      setAssetAmount(input)
      setUsdAmount('')
      setUsdPercent(0)
      setIsError(false) // Empty is not an error, just incomplete
      return
    }

    // Only allow numeric input with at most one decimal point
    if (!/^[0-9]*\.?[0-9]*$/.test(input)) {
      // Don't update state for invalid input, just reject it
      return
    }

    const numValue = parseFloat(input)

    if (!isNaN(numValue)) {
      const newTotal = numValue * parseFloat(limitPrice)
      const formattedAmount = normalizeDecimalString(newTotal.toFixed(szDecimals))
      setAssetAmount(input)
      setUsdAmount(formattedAmount.toString())
      const newPercent = ((isBuy ? newTotal : numValue) / maxAllowed) * 100
      setUsdPercent(newPercent)
      setIsError(newPercent > 100) // Error if exceeds 100%
    }
  }

  const updateFromUsdAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Allow empty input or just a decimal point
    if (input === '' || input === '.') {
      setUsdAmount(input)
      setAssetAmount('')
      setUsdPercent(0)
      setIsError(false) // Empty is not an error, just incomplete
      return
    }

    // Only allow numeric input with at most one decimal point
    if (!/^[0-9]*\.?[0-9]*$/.test(input)) {
      // Don't update state for invalid input, just reject it
      return
    }

    setUsdAmount(input)
    if (parseFloat(limitPrice) > 0) {
      const newAmount = parseFloat(input) / parseFloat(limitPrice)
      const formattedAmount = normalizeDecimalString(newAmount.toFixed(szDecimals))
      setAssetAmount(formattedAmount)
      const newPercent = ((isBuy ? parseFloat(input) : newAmount) / maxAllowed) * 100
      setUsdPercent(newPercent)
      setIsError(newPercent > 100) // Error if exceeds 100%
    } else {
      setAssetAmount('')
      setUsdPercent(0)
      setIsError(false)
    }
  }

  const updateFromPercent = (percent: number) => {
    setUsdPercent(percent)
    setIsError(percent > 100) // Error if exceeds 100%
    if (isBuy) {
      const newTotal = (percent / 100) * maxAllowed
      setUsdAmount(newTotal.toString())
      if (parseFloat(limitPrice) > 0) {
        const newAmount = newTotal / parseFloat(limitPrice)
        const formattedAmount = normalizeDecimalString(newAmount.toFixed(szDecimals))
        setAssetAmount(formattedAmount)
      } else {
        setAssetAmount('')
      }
    } else {
      const newAmount = (percent / 100) * maxAllowed
      const formattedAmount = normalizeDecimalString(newAmount.toFixed(szDecimals))
      setAssetAmount(formattedAmount)
      setUsdAmount((newAmount * parseFloat(limitPrice)).toString())
    }
  }

  useEffect(() => {
    updateFromPercent(usdPercent)
  }, [isBuy])

  // Update error state when maxAllowed changes
  useEffect(() => {
    if (maxAllowed === 0) return
    setIsError(usdPercent > 100)
  }, [maxAllowed, usdPercent, setIsError])

  return (
    <div className="flex flex-col gap-2">
      <div className={cn('flex items-center justify-between gap-2', isRTL && 'flex-row-reverse')}>
        <label
          htmlFor="spot-order-size"
          className="font-medium text-white/70 text-xs whitespace-nowrap"
        >
          {'Amount'}
        </label>
        <label className="block font-medium text-white/20 text-xs whitespace-nowrap">
          {'Available to Trade'} = {maxAllowed.toFixed(2)} {isBuy ? 'USDC' : selectedAssetName}
        </label>
      </div>
      <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
        <Input
          type="text"
          placeholder="0"
          value={(() => {
            const val = isInputUsd ? usdAmount : assetAmount
            return val === 'NaN' || Number.isNaN(Number(val)) ? '' : val
          })()}
          onChange={isInputUsd ? updateFromUsdAmount : updateFromAssetAmount}
          id="spot-order-size"
          /*
            R3-B17: `selectedAsset` is Hyperliquid's internal token key
            (e.g. "@1035" for HYPE) until the human-readable name resolves.
            Prefer `selectedAssetName` so screen readers announce "Order
            size in HYPE" rather than "Order size in @1035".
          */
          aria-label={
            isInputUsd ? 'Order size in USD' : `Order size in ${selectedAssetName || 'asset'}`
          }
          className={cn('w-full text-white flex-1', isRTL ? 'text-start' : 'text-end')}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={'sm'}
              className="text-xs w-16 flex items-center justify-start"
              // className="flex items-center gap-1 ml-auto font-medium text-xs align-middle cursor-pointer"
            >
              <p className="text-xs flex-1 w-full">{isInputUsd ? 'USD' : selectedAssetName}</p>
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit" align="end">
            <DropdownMenuItem onClick={() => setIsInputUsd(true)}>
              <p className="text-xs w-10 text-center">USD</p>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsInputUsd(false)}>
              <p className="text-xs w-10 text-center">{selectedAssetName}</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-1 flex-col gap-2 mt-2 w-full items-center justify-center">
        <div
          className={cn(
            'w-full flex items-center justify-center gap-2',
            isRTL && 'flex-row-reverse'
          )}
        >
          <Slider
            min={0}
            max={100}
            dir={isRTL ? 'rtl' : 'ltr'}
            value={[usdPercent]}
            onValueChange={(value) => setUsdPercent(value[0])}
            className="flex-1 w-full"
          />
          <div
            className={cn(
              'flex !w-16 shrink-0 items-center pr-2 justify-center text-white/70 rounded-md gap-2',
              isRTL && 'flex-row-reverse pr-0 pl-2',
              usdPercent > 100 && 'border border-red-500 rounded-md'
            )}
          >
            <label htmlFor="spot-order-size-percent" className="sr-only">
              {'Order size percent of max'}
            </label>
            <Input
              className={cn(
                'flex-1 p-0 !text-xs text-end text-white bg-transparent border-none',
                isRTL && 'text-start',
                usdPercent > 100 && 'text-red-500'
              )}
              value={
                isPercentFocused
                  ? percentInputStr
                  : Number.isNaN(usdPercent)
                    ? ''
                    : usdPercent.toFixed(2)
              }
              id="spot-order-size-percent"
              aria-label="Order size percent of max"
              onChange={(e) => setPercentInputStr(e.target.value)}
              onFocus={() => {
                setIsPercentFocused(true)
                setPercentInputStr(Number.isNaN(usdPercent) ? '' : usdPercent.toFixed(2))
              }}
              onBlur={() => {
                setIsPercentFocused(false)
                const parsed = parseFloat(percentInputStr)
                if (!Number.isNaN(parsed)) {
                  updateFromPercent(parsed)
                }
              }}
            />
            <IconPercentage className={cn('size-3', usdPercent > 100 && 'text-red-500')} />
          </div>
        </div>
        <ToggleGroup
          size={'sm'}
          className={cn(
            'flex mt-1 items-center justify-between w-full',
            isRTL && 'flex-row-reverse'
          )}
          type="single"
          value={usdPercent.toString()}
          onValueChange={(value) => value !== '' && updateFromPercent(parseInt(value, 10))}
        >
          <ToggleGroupItem
            value={'25'}
            className={cn(
              'cursor-pointer text-xs font-semibold data-[state=on]:bg-transparent transition-colors duration-150 focus:outline-none',
              usdPercent === 25 ? 'bg-primary text-white' : 'bg-transparent text-white/70'
              // isRTL ? 'rounded-r-md' : 'rounded-l-md'
            )}
          >
            25%
          </ToggleGroupItem>
          <ToggleGroupItem
            value={'50'}
            className={cn(
              'cursor-pointer text-xs font-semibold data-[state=on]:bg-transparent transition-colors duration-150 focus:outline-none',
              usdPercent === 50 ? 'bg-primary text-white' : 'bg-transparent text-white/70'
            )}
          >
            50%
          </ToggleGroupItem>
          <ToggleGroupItem
            value={'75'}
            className={cn(
              'cursor-pointer text-xs font-semibold data-[state=on]:bg-transparent transition-colors duration-150 focus:outline-none',
              usdPercent === 75 ? 'bg-primary text-white' : 'bg-transparent text-white/70'
            )}
          >
            75%
          </ToggleGroupItem>
          <ToggleGroupItem
            value={'100'}
            className={cn(
              'cursor-pointer text-xs font-semibold data-[state=on]:bg-transparent transition-colors duration-150 focus:outline-none',
              usdPercent === 100 ? 'bg-primary text-white' : 'bg-transparent text-white/70'
              // isRTL ? 'rounded-l-md' : 'rounded-r-md'
            )}
          >
            100%
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}

export default AmountInputSpot
