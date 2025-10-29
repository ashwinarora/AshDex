'use client'
import { getLeverageTicks, getPerpsUniverseIndex } from '@/utils/utils'

import { useEffect, useMemo, useState } from 'react'

import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { Slider } from '@/components/ui/slider'
import { cn, numberInputValidator } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Input } from '@/components/ui/input'
import { IconX } from '@tabler/icons-react'
import { useShallow } from 'zustand/react/shallow'
import { useTranslate } from '@tolgee/react'

interface LeverageMarginProps {
  selectedAsset: string
  leverage: number
  setLeverage: React.Dispatch<React.SetStateAction<number>>
  isRTL: boolean
}

const LeverageMargin = ({ selectedAsset, leverage, setLeverage, isRTL }: LeverageMarginProps) => {
  const { t } = useTranslate()
  const { clearingHouseState, perpsMeta, activeAssetData } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      perpsMeta: state.perpsMeta,
      activeAssetData: state.activeAssetData
    }))
  )

  const [error, setError] = useState<{ isValid: boolean; error: string | null }>({
    isValid: true,
    error: null
  })
  const [leverageInput, setLeverageInput] = useState<string>(leverage.toString())
  const [isEdited, setIsEdited] = useState<boolean>(false)

  console.log("isEdited", isEdited)

  useEffect(() => {
    if (!activeAssetData) return
    if (isEdited) return
    setLeverage(activeAssetData.leverage.value)
  }, [activeAssetData])

  useEffect(() => {
    setIsEdited(false)
  }, [selectedAsset])

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
    setIsEdited(true)
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
    if (!perpsMeta?.universe.length) return 1
    const assetIndex = getPerpsUniverseIndex(perpsMeta?.universe || [], selectedAsset)
    return perpsMeta?.universe[assetIndex]?.maxLeverage || 1
  }, [perpsMeta, selectedAsset])

  // useful when user changes the asset
  useEffect(() => {
    if (maxLeverage < leverage) {
      setLeverage(maxLeverage)
    }
  }, [maxLeverage, setLeverage, leverage])

  return (
    <div className="flex flex-col gap-2">
      <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
        <p
          className={cn(
            'text-xs font-medium transition-colors duration-150',
            error.isValid ? 'text-white/70' : 'text-red'
          )}
        >
          {t('Leverage')}
        </p>
        <div className="flex items-center gap-2">
          {/* <Button onClick={() => setLeverage((prev) => Math.max(prev - 1, 1))} variant='outline' size='icon'>
            <MinusIcon className='size-4' />
          </Button> */}
          <div
            className={cn(
              'flex w-16 items-center pr-2 justify-center  text-white/70 rounded-md gap-2',
              !error.isValid && 'text-red',
              isRTL && 'flex-row-reverse pl-2'
            )}
          >
            <Input
              className={cn(
                'flex-1 p-0 text-end text-white bg-transparent border-none',
                !error.isValid && 'text-red',
                isRTL && 'text-start'
              )}
              value={leverageInput}
              onChange={(e) => handleLeverageChange(e.target.value)}
            />
            <IconX className="size-3" />
          </div>
          {/* <Button onClick={() => setLeverage((prev) => Math.min(prev + 1, maxLeverage))} variant='outline' size='icon'>
            <PlusIcon className='size-4' />
          </Button> */}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 w-full items-center justify-center">
        <Slider
          min={1}
          max={maxLeverage}
          dir={isRTL ? 'rtl' : 'ltr'}
          className={cn('w-full')}
          value={[leverage]}
          onValueChange={(value) => {
            setLeverage(value[0])
            setIsEdited(true)
          }}
        />
        <ToggleGroup
          size={'sm'}
          className={cn(
            'flex mt-1 items-center h-8 justify-between w-full',
            isRTL && 'flex-row-reverse'
          )}
          type="single"
          value={leverage.toString()}
          // onValueChange={(value) => {value !== '' && setLeverage(parseInt(value, 10))}}
          onValueChange={(value) => {
            if (value === '') return
            setLeverage(parseInt(value, 10))
            setIsEdited(true)
          }}
        >
          {getLeverageTicks(maxLeverage, 3).map((value, index) => (
            <ToggleGroupItem
              key={`leverage-tick-${value}-${index}`}
              value={value.toString()}
              className={cn(
                'cursor-pointer text-xs font-semibold data-[state=on]:bg-transparent transition-colors duration-150 focus:outline-none'
                // leverage === value ? 'bg-primary text-white' : 'bg-transparent text-white/70'
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
