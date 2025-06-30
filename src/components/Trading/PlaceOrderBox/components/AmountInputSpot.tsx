'use client'
import { useMemo, useState } from 'react'
import { useHyperliquid } from '@/store/HyperliquidStore'
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
import { IconChevronDown } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface AmountInputSpotProps {
  selectedAsset: string
  assetAmount: string
  setAssetAmount: React.Dispatch<React.SetStateAction<string>>
  usdAmount: string
  setUsdAmount: React.Dispatch<React.SetStateAction<string>>
  limitPrice: string
  isBuy: boolean
}

const isMatch = (a: string, b: string): boolean => a.split('/')[0] === b.split('/')[0]

const AmountInputSpot = ({
  selectedAsset,
  assetAmount,
  setAssetAmount,
  usdAmount,
  setUsdAmount,
  limitPrice,
  isBuy
}: AmountInputSpotProps) => {
  const { spotState } = useHyperliquid()
  const { data: spotMeta, spotKeyToName } = useSpotMeta()
  const [usdPercent, setUsdPercent] = useState(0)
  const [isInputUsd, setIsInputUsd] = useState(false)

  const szDecimals = useMemo(() => {
    const tokenData = spotMeta?.tokens.find((token) => token.name.includes(selectedAsset))
    return tokenData?.szDecimals || 0
  }, [selectedAsset, spotMeta])

  const maxAllowed = useMemo(() => {
    if (!spotState) return 0
    const max = isBuy
      ? (spotState?.balances.find((b) => b.coin === 'USDC')?.total ?? 0)
      : (spotState?.balances.find((b) => isMatch(b.coin, selectedAsset))?.total ?? 0)
    return Number(max)
  }, [spotState, selectedAsset, isBuy])

  const updateFromAssetAmount = (input: string) => {
    // Allow empty input or just a decimal point
    if (!input || input === '.') {
      setAssetAmount(input)
      setUsdAmount('')
      setUsdPercent(0)
      return
    }

    // Only allow numeric input with at most one decimal point
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
      const newTotal = numValue * parseFloat(limitPrice)
      setUsdAmount(newTotal.toString())
      setUsdPercent(((isBuy ? newTotal : numValue) / maxAllowed) * 100)
    }
  }

  const updateFromUsdAmount = (input: string) => {
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
      setUsdPercent(((isBuy ? parseFloat(input) : newAmount) / maxAllowed) * 100)
    } else {
      setAssetAmount('')
      setUsdPercent(0)
    }
  }

  const updateFromPercent = (percent: number) => {
    setUsdPercent(percent)
    if (isBuy) {
      const newTotal = (percent / 100) * maxAllowed
      setUsdAmount(newTotal.toString())
      if (parseFloat(limitPrice) > 0) {
        const newAmount = newTotal / parseFloat(limitPrice)
        const formattedAmount = newAmount.toFixed(szDecimals).replace(/\.?0+$/, '')
        setAssetAmount(formattedAmount)
      } else {
        setAssetAmount('')
      }
    } else {
      const newAmount = (percent / 100) * maxAllowed
      const formattedAmount = newAmount.toFixed(szDecimals).replace(/\.?0+$/, '')
      setAssetAmount(formattedAmount)
      setUsdAmount((newAmount * parseFloat(limitPrice)).toString())
    }
  }

  return (
    <div className="flex flex-col gap-2 px-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-white/50 text-xs whitespace-nowrap">Amount</p>
        <label className="block font-medium text-white/10 text-xs whitespace-nowrap">
          Available to Trade = {maxAllowed.toFixed(2)}{' '}
          {isBuy ? 'USDC' : spotKeyToName.get(selectedAsset)}
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="0"
          value={
            isInputUsd ? Number(usdAmount).toFixed(2) : Number(assetAmount).toFixed(szDecimals)
          }
          onChange={(e) =>
            isInputUsd ? updateFromUsdAmount(e.target.value) : updateFromAssetAmount(e.target.value)
          }
          className="w-full text-right text-white"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="text-xs min-w-18 w-fit flex items-center justify-start"
              // className="flex items-center gap-1 ml-auto font-medium text-xs align-middle cursor-pointer"
            >
              <p className="text-xs flex-1 w-full">
                {isInputUsd ? 'USD' : spotKeyToName.get(selectedAsset)}
              </p>
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit" align="end">
            <DropdownMenuItem onClick={() => setIsInputUsd(true)}>
              <p className="text-xs w-10 text-center">USD</p>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsInputUsd(false)}>
              <p className="text-xs w-10 text-center">{spotKeyToName.get(selectedAsset)}</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-1 flex-col gap-4 w-full items-center justify-center">
        {/* <Slider min={0} max={100} value={[usdPercent]} onValueChange={(value) => setUsdPercent(Number(value[0]))} /> */}
        <ToggleGroup
          size={'sm'}
          className="flex mt-1 bg-white/5 items-center justify-between w-full"
          type="single"
          value={usdPercent.toString()}
          onValueChange={(value) => value !== '' && updateFromPercent(parseInt(value, 10))}
        >
          <ToggleGroupItem
            value={'25'}
            className={cn(
              'rounded-l-md cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
              usdPercent === 25 ? 'bg-primary text-white' : 'bg-transparent text-white/50'
            )}
          >
            25%
          </ToggleGroupItem>
          <ToggleGroupItem
            value={'50'}
            className={cn(
              'cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
              usdPercent === 50 ? 'bg-primary text-white' : 'bg-transparent text-white/50'
            )}
          >
            50%
          </ToggleGroupItem>
          <ToggleGroupItem
            value={'75'}
            className={cn(
              'cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
              usdPercent === 75 ? 'bg-primary text-white' : 'bg-transparent text-white/50'
            )}
          >
            75%
          </ToggleGroupItem>
          <ToggleGroupItem
            value={'100'}
            className={cn(
              'rounded-r-md cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
              usdPercent === 100 ? 'bg-primary text-white' : 'bg-transparent text-white/50'
            )}
          >
            100%
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )

  // return (
  //   <>
  //     <div className="flex flex-col gap-2 mx-3">
  //       <label className="block font-medium text-gray-400 text-xs">
  //         Available to Trade = {maxAllowed.toFixed(2)} {isBuy ? 'USDC' : getCoinName(selectedAsset)}
  //       </label>
  //       <div className="flex items-center px-3 border border-white/10 rounded-md align-middle">
  //         <p className="font-medium text-white/50 text-xs whitespace-nowrap">Amount</p>
  //         <div className="relative flex items-center w-full">
  //           <input
  //             type="text"
  //             placeholder="0.0000"
  //             value={
  //               isInputUsd ? Number(usdAmount).toFixed(2) : Number(assetAmount).toFixed(szDecimals)
  //             }
  //             onChange={(e) =>
  //               isInputUsd
  //                 ? updateFromUsdAmount(e.target.value)
  //                 : updateFromAssetAmount(e.target.value)
  //             }
  //             className="p-1.5 rounded-md focus:outline-none w-full font-medium text-sm text-right focus:none focus:none"
  //           />
  //           <select
  //             value={isInputUsd ? 'usdc' : 'asset'}
  //             onChange={(e) => setIsInputUsd(e.target.value === 'usdc')}
  //             className="bg-transparent border-none focus:outline-none text-[#8B8BA0] text-xs cursor-pointer"
  //           >
  //             <option value="asset">{getCoinName(selectedAsset)}</option>
  //             <option value="usdc">USDC</option>
  //           </select>
  //         </div>
  //       </div>
  //       <div className="flex justify-between items-end pb-1 w-full">
  //         <div className="pr-3 w-full">
  //           <input
  //             type="range"
  //             min={0}
  //             max={100}
  //             step={1}
  //             value={Number(usdPercent) || 0}
  //             onChange={(e) => updateFromPercent(parseFloat(e.target.value) || 0)}
  //             className="[&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-webkit-slider-thumb]:border-none rounded-lg [&::-moz-range-thumb]:rounded-full [&::-webkit-slider-thumb]:rounded-full outline-none w-full [&::-moz-range-thumb]:w-3 [&::-webkit-slider-thumb]:w-3 h-0.5 [&::-moz-range-thumb]:h-3 [&::-webkit-slider-thumb]:h-3 appearance-none [&::-moz-range-thumb]:appearance-none [&::-webkit-slider-thumb]:appearance-none cursor-pointer [&::-moz-range-thumb]:cursor-pointer [&::-webkit-slider-thumb]:cursor-pointer"
  //             style={{
  //               background: `linear-gradient(to right, #5F46F9 0%, #5F46F9 ${Number(usdPercent)}%, #2A1B3D ${Number(usdPercent)}%, #2A1B3D 100%)`
  //             }}
  //           />
  //           <div className="flex justify-between mt-0.5 text-gray-500 text-xs">
  //             <span>0%</span>
  //             <span>25%</span>
  //             <span>50%</span>
  //             <span>75%</span>
  //             <span>100%</span>
  //           </div>
  //         </div>
  //         <div className="flex items-center border border-white/10 rounded-md">
  //           <input
  //             type="number"
  //             max={100}
  //             min={0}
  //             maxLength={3}
  //             minLength={1}
  //             readOnly={true}
  //             className="px-2 py-1 outline-none w-10 h-8 text-xs text-right"
  //             value={Number(usdPercent) || 0}
  //           />
  //           <IconPercentage className="mr-2 w-4 h-4" />
  //         </div>
  //       </div>
  //     </div>
  //   </>
  // )
}

export default AmountInputSpot
