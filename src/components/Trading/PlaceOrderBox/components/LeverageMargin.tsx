'use client'
import { getLeverageTicks, getUniverseIndex } from '@/utils/utils'

import { useEffect, useMemo, useState } from 'react'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { Slider } from '@/components/ui/slider'
import { cn, numberInputValidator } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Input } from '@/components/ui/input'

interface LeverageMarginProps {
  selectedAsset: string
  leverage: number
  setLeverage: React.Dispatch<React.SetStateAction<number>>
}

const LeverageMargin = ({ selectedAsset, leverage, setLeverage }: LeverageMarginProps) => {
  const { data: universe } = usePerpsUniverse()
  const { clearingHouseState } = useHyperliquid()

  const [error, setError] = useState<{ isValid: boolean; error: string | null }>({
    isValid: true,
    error: null
  })
  const [leverageInput, setLeverageInput] = useState<string>(leverage.toString())

  useEffect(() => {
    const { isValid, error } = numberInputValidator({
      value: leverageInput,
      min: 1,
      max: maxLeverage
    })
    setError({ isValid, error })
    if (isValid) {
      setLeverage(parseInt(leverageInput, 10))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error.isValid, leverageInput])

  useEffect(() => {
    setLeverageInput(leverage.toString())
  }, [leverage])

  const handleLeverageChange = (value: string) => {
    setLeverageInput(value)
  }

  // set the leverage to the existing position leverage
  useEffect(() => {
    const existingPosition = clearingHouseState?.assetPositions.find((pos) => {
      return pos.position.coin === selectedAsset
    })
    if (existingPosition) {
      setLeverage(existingPosition.position.leverage.value)
    }
  }, [])

  const maxLeverage = useMemo(() => {
    if (!universe.length) return 1
    const assetIndex = getUniverseIndex(universe, selectedAsset)
    return universe?.[assetIndex]?.maxLeverage || 1
  }, [universe, selectedAsset])

  // useful when user changes the asset
  useEffect(() => {
    if (maxLeverage < leverage) {
      setLeverage(maxLeverage)
    }
  }, [maxLeverage, setLeverage, leverage])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p
          className={cn(
            'text-xs font-medium transition-colors duration-150',
            error.isValid ? 'text-white/50' : 'text-red'
          )}
        >
          Leverage
        </p>
        <div className="flex items-center gap-2">
          {/* <Button onClick={() => setLeverage((prev) => Math.max(prev - 1, 1))} variant='outline' size='icon'>
            <MinusIcon className='size-4' />
          </Button> */}
          <Input
            className={cn('w-16 text-white', !error.isValid && 'bg-red/10 text-red')}
            value={leverageInput}
            onChange={(e) => handleLeverageChange(e.target.value)}
          />
          {/* <Button onClick={() => setLeverage((prev) => Math.min(prev + 1, maxLeverage))} variant='outline' size='icon'>
            <PlusIcon className='size-4' />
          </Button> */}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 w-full items-center justify-center">
        <Slider
          min={1}
          max={maxLeverage}
          value={[leverage]}
          onValueChange={(value) => setLeverage(value[0])}
        />
        <ToggleGroup
          size={'sm'}
          className="flex mt-1 items-center bg-white/5 justify-between w-full"
          type="single"
          value={leverage.toString()}
          onValueChange={(value) => value !== '' && setLeverage(parseInt(value, 10))}
        >
          {getLeverageTicks(maxLeverage, 3).map((value, index) => (
            <ToggleGroupItem
              key={`leverage-tick-${value}-${index}`}
              value={value.toString()}
              className={cn(
                'first:rounded-l-md last:rounded-r-md cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
                leverage === value ? 'bg-primary text-white' : 'bg-transparent text-white/50'
              )}
            >
              {value}x
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}

export default LeverageMargin
