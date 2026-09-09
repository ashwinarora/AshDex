'use client'

import { getPerpsUniverseIndex } from '@/utils/utils'
import { useEffect, useMemo, useState } from 'react'

import { useHyperliquidStore } from '@/store/HyperliquidStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { IconChevronDown, IconPercentage } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToggleGroupItem } from '@/components/ui/toggle-group'
import { ToggleGroup } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { useShallow } from 'zustand/react/shallow'
interface AmountInputProps {
  selectedAsset: string
  assetAmount: string
  setAssetAmount: React.Dispatch<React.SetStateAction<string>>
  usdAmount: string
  setUsdAmount: React.Dispatch<React.SetStateAction<string>>
  limitPrice: string
  leverage: number
  isReduceOnly: boolean
  isBuy: boolean
  isRTL: boolean
  setIsError: React.Dispatch<React.SetStateAction<boolean>>
}

const AmountInput = ({
  selectedAsset,
  assetAmount,
  setAssetAmount,
  usdAmount,
  setUsdAmount,
  limitPrice,
  leverage,
  isReduceOnly,
  isBuy,
  isRTL,
  setIsError
}: AmountInputProps) => {
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
        handleUsdPercentChange(parsed)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [percentInputStr, isPercentFocused])

  const { clearingHouseState, perpsMeta } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      perpsMeta: state.perpsMeta
    }))
  )

  const szDecimals = useMemo(() => {
    const assetIndex = getPerpsUniverseIndex(perpsMeta?.universe || [], selectedAsset)
    if (assetIndex === -1) return 0
    return perpsMeta?.universe[assetIndex].szDecimals || 0
  }, [perpsMeta, selectedAsset])

  const maxAllowedUsd = useMemo(() => {
    if (!clearingHouseState) return 0
    if (!isReduceOnly) return Number(clearingHouseState.withdrawable) * leverage
    const existingPosition = clearingHouseState.assetPositions.find((pos) => {
      return pos.position.coin === selectedAsset
    })
    if (!existingPosition) return 0
    if (Number(existingPosition.position.szi) > 0 && isBuy) return 0
    if (Number(existingPosition.position.szi) < 0 && !isBuy) return 0
    const priceQuotient = parseFloat(limitPrice) / Number(existingPosition.position.entryPx)
    const maxAllowedUsd = Number(existingPosition.position.positionValue) * priceQuotient
    return maxAllowedUsd
  }, [isReduceOnly, clearingHouseState, selectedAsset, isBuy, limitPrice, leverage])

  useEffect(() => {
    if (!clearingHouseState) return
    if (usdAmount === '') return
    if (maxAllowedUsd === 0) return
    const newPercent = (parseFloat(usdAmount) / maxAllowedUsd) * 100
    setUsdPercent(newPercent)
    setIsError(newPercent > 100) // Update error state when max changes
  }, [clearingHouseState, usdAmount, maxAllowedUsd, setIsError])

  const handleAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clearingHouseState) return
    const input = e.target.value

    // Allow empty input or just a decimal point
    if (!input || input === '.') {
      setAssetAmount(input)
      setUsdAmount('')
      setUsdPercent(0)
      setIsError(false) // Empty is not an error, just incomplete
      return
    }

    // Allow numeric input with at most one decimal point
    if (!/^[0-9]*\.?[0-9]*$/.test(input)) {
      // Don't update state for invalid input, just reject it
      return
    }

    // Check if input has more decimal places than allowed
    const parts = input.split('.')
    if (parts.length > 1 && parts[1].length > szDecimals) {
      // Don't update state for invalid input, just reject it
      return
    }

    setAssetAmount(input)
    const numValue = parseFloat(input)
    if (!isNaN(numValue)) {
      const newUsdAmount = numValue * parseFloat(limitPrice)
      setUsdAmount(newUsdAmount.toString())
      const newPercent = (newUsdAmount / maxAllowedUsd) * 100
      setUsdPercent(newPercent)
      setIsError(newPercent > 100) // Error if exceeds 100%
    }
  }

  const handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clearingHouseState) return
    const input = e.target.value

    // Allow empty input or just a decimal point
    if (!input || input === '.') {
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
      const formattedAmount = newAmount.toFixed(szDecimals).replace(/\.?0+$/, '')
      setAssetAmount(formattedAmount)
    } else {
      setAssetAmount('')
    }
    const newPercent = (parseFloat(input) / maxAllowedUsd) * 100
    setUsdPercent(newPercent)
    setIsError(newPercent > 100) // Error if exceeds 100%
  }

  const handleUsdPercentChange = (newUsdPercent: number) => {
    if (!clearingHouseState) return
    setUsdPercent(newUsdPercent)
    setIsError(newUsdPercent > 100) // Error if exceeds 100%
    const rawAmount = (newUsdPercent * maxAllowedUsd) / 100 / parseFloat(limitPrice)
    const roundedAmount = rawAmount.toFixed(szDecimals).replace(/\.?0+$/, '')
    setAssetAmount(roundedAmount)
    setUsdAmount(((newUsdPercent * maxAllowedUsd) / 100).toString())
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={cn('flex items-center justify-between gap-2', isRTL && 'flex-row-reverse')}>
        <label
          htmlFor="preorder-size"
          className="font-medium text-white/70 text-xs whitespace-nowrap"
        >
          {'Position Size'}
        </label>
        <label className="block font-medium text-white/20 text-xs whitespace-nowrap">
          {'Max'} ={' '}
          {isInputUsd
            ? `${maxAllowedUsd.toFixed(2)} USD`
            : `${(maxAllowedUsd / parseFloat(limitPrice)).toFixed(szDecimals)} ${selectedAsset}`}
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
          onChange={isInputUsd ? handleUSDChange : handleAssetChange}
          id="preorder-size"
          aria-label={isInputUsd ? 'Order size in USD' : `Order size in ${selectedAsset}`}
          className={cn('flex-1 text-white shrink-0', isRTL ? 'text-start' : 'text-end')}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={'sm'}
              className="text-xs w-16 flex items-center justify-start"
              // className="flex items-center gap-1 ml-auto font-medium text-xs align-middle cursor-pointer"
            >
              <p className="text-xs flex-1 w-full">{isInputUsd ? 'USD' : selectedAsset}</p>
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit" align="end">
            <DropdownMenuItem onClick={() => setIsInputUsd(true)}>
              <p className="text-xs w-10 text-center">USD</p>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsInputUsd(false)}>
              <p className="text-xs w-10 text-center">{selectedAsset}</p>
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
            onValueChange={(value) => handleUsdPercentChange(value[0])}
            className="flex-1 w-full"
          />
          <div
            className={cn(
              'flex !w-16 shrink-0 items-center pr-2 justify-center text-white/70 rounded-md gap-2',
              isRTL && 'flex-row-reverse pr-0 pl-2',
              usdPercent > 100 && 'bg-red/20 rounded-md'
            )}
          >
            <label htmlFor="preorder-size-percent" className="sr-only">
              {'Order size percent of max'}
            </label>
            <Input
              className={cn(
                'flex-1 p-0 !text-[10px] text-end text-white bg-transparent border-none',
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
              id="preorder-size-percent"
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
                  handleUsdPercentChange(parsed)
                }
              }}
            />
            <IconPercentage className={cn('size-3', usdPercent > 100 && 'text-red-500')} />
          </div>
        </div>
        <ToggleGroup
          size={'sm'}
          className={cn(
            'flex mt-1 items-center h-8 justify-between w-full',
            isRTL && 'flex-row-reverse'
          )}
          type="single"
          value={usdPercent.toString()}
          onValueChange={(value) => value !== '' && handleUsdPercentChange(parseInt(value, 10))}
        >
          <ToggleGroupItem
            value={'25'}
            className={cn(
              'cursor-pointer text-xs font-semibold data-[state=on]:bg-transparent transition-colors duration-150 focus:outline-none',
              usdPercent === 25
                ? 'bg-accent text-accent-foreground'
                : 'bg-transparent text-white/70'
              // isRTL ? 'rounded-r-md' : 'rounded-l-md'
            )}
          >
            25%
          </ToggleGroupItem>
          <ToggleGroupItem
            value={'50'}
            className={cn(
              'cursor-pointer text-xs font-semibold data-[state=on]:bg-transparent transition-colors duration-150 focus:outline-none',
              usdPercent === 50
                ? 'bg-accent text-accent-foreground'
                : 'bg-transparent text-white/70'
            )}
          >
            50%
          </ToggleGroupItem>
          <ToggleGroupItem
            value={'75'}
            className={cn(
              'cursor-pointer text-xs font-semibold data-[state=on]:bg-transparent transition-colors duration-150 focus:outline-none',
              usdPercent === 75
                ? 'bg-accent text-accent-foreground'
                : 'bg-transparent text-white/70'
            )}
          >
            75%
          </ToggleGroupItem>
          <ToggleGroupItem
            value={'100'}
            className={cn(
              'cursor-pointer text-xs font-semibold data-[state=on]:bg-transparent transition-colors duration-150 focus:outline-none',
              usdPercent === 100
                ? 'bg-accent text-accent-foreground'
                : 'bg-transparent text-white/70'
            )}
          >
            100%
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}

export default AmountInput
