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
import { useTranslate } from '@tolgee/react'

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
  isRTL
}: AmountInputProps) => {
  const { t } = useTranslate()
  const [usdPercent, setUsdPercent] = useState(0)
  const [isInputUsd, setIsInputUsd] = useState(false)

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
    setUsdPercent((parseFloat(usdAmount) / maxAllowedUsd) * 100)
  }, [clearingHouseState, usdAmount, maxAllowedUsd])

  const handleAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clearingHouseState) return
    const input = e.target.value

    // Allow empty input or just a decimal point
    if (!input || input === '.') {
      setAssetAmount(input)
      setUsdAmount('')
      setUsdPercent(0)
      return
    }

    // Allow numeric input with at most one decimal point
    if (!/^[0-9]*\.?[0-9]*$/.test(input)) {
      return
    }

    // Check if input has more decimal places than allowed
    const parts = input.split('.')
    if (parts.length > 1 && parts[1].length > szDecimals) {
      return
    }

    setAssetAmount(input)
    const numValue = parseFloat(input)
    if (!isNaN(numValue)) {
      setUsdAmount((numValue * parseFloat(limitPrice)).toString())
      setUsdPercent(((numValue * parseFloat(limitPrice)) / maxAllowedUsd) * 100)
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
      return
    }

    // Only allow numeric input with at most one decimal point
    if (!/^[0-9]*\.?[0-9]*$/.test(input)) {
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
    setUsdPercent((parseFloat(input) / maxAllowedUsd) * 100)
  }

  const handleUsdPercentChange = (newUsdPercent: number) => {
    if (!clearingHouseState) return
    setUsdPercent(newUsdPercent)
    const rawAmount = (newUsdPercent * maxAllowedUsd) / 100 / parseFloat(limitPrice)
    const roundedAmount = rawAmount.toFixed(szDecimals).replace(/\.?0+$/, '')
    setAssetAmount(roundedAmount)
    setUsdAmount(((newUsdPercent * maxAllowedUsd) / 100).toString())
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={cn('flex items-center justify-between gap-2', isRTL && 'flex-row-reverse')}>
        <p className="font-medium text-white/50 text-xs whitespace-nowrap">{t('Position Size')}</p>
        <label className="block font-medium text-white/10 text-xs whitespace-nowrap">
          {t('Max')} ={' '}
          {isInputUsd
            ? `${maxAllowedUsd.toFixed(2)} USD`
            : `${(maxAllowedUsd / parseFloat(limitPrice)).toFixed(szDecimals)} ${selectedAsset}`}
        </label>
      </div>
      <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
        <Input
          type="text"
          placeholder="0"
          value={
            isInputUsd ? Number(usdAmount).toFixed(2) : Number(assetAmount).toFixed(szDecimals)
          }
          onChange={isInputUsd ? handleUSDChange : handleAssetChange}
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
              'flex !w-16 shrink-0 items-center pr-2 justify-center bg-white/5 text-white/50 rounded-md gap-2',
              isRTL && 'flex-row-reverse pr-0 pl-2'
            )}
          >
            <Input
              className={cn(
                'flex-1 p-0 text-end text-white bg-transparent border-none',
                isRTL && 'text-start'
              )}
              value={usdPercent.toString()}
              onChange={(e) => handleUsdPercentChange(parseInt(e.target.value, 10))}
            />
            <IconPercentage className="size-3" />
          </div>
        </div>
        <ToggleGroup
          size={'sm'}
          className={cn(
            'flex mt-1 bg-white/5 items-center justify-between w-full',
            isRTL && 'flex-row-reverse'
          )}
          type="single"
          value={usdPercent.toString()}
          onValueChange={(value) => value !== '' && handleUsdPercentChange(parseInt(value, 10))}
        >
          <ToggleGroupItem
            value={'25'}
            className={cn(
              'cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
              Math.round(usdPercent) === 25
                ? 'bg-accent text-accent-foreground'
                : 'bg-transparent text-white/50',
              isRTL ? 'rounded-r-md' : 'rounded-l-md'
            )}
          >
            25%
          </ToggleGroupItem>
          <ToggleGroupItem
            value={'50'}
            className={cn(
              'cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
              Math.round(usdPercent) === 50
                ? 'bg-accent text-accent-foreground'
                : 'bg-transparent text-white/50'
            )}
          >
            50%
          </ToggleGroupItem>
          <ToggleGroupItem
            value={'75'}
            className={cn(
              'cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
              Math.round(usdPercent) === 75
                ? 'bg-accent text-accent-foreground'
                : 'bg-transparent text-white/50'
            )}
          >
            75%
          </ToggleGroupItem>
          <ToggleGroupItem
            value={'100'}
            className={cn(
              'rounded-r-md cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
              Math.round(usdPercent) === 100
                ? 'bg-accent text-accent-foreground'
                : 'bg-transparent text-white/50',
              isRTL ? 'rounded-l-md' : 'rounded-r-md'
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
