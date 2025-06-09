import CheckBox from '@/components/common/CheckBox'

interface TPSLProps {
  limitPrice: string
  isBuy: boolean
  tpsl: TPSLType
  setTpsl: (tpsl: TPSLType) => void
  leverage: number
}

export type TPSLType = {
  isTpsl: boolean
  takeProfit: number | string
  stopLoss: number | string
}

const TPSL = ({ limitPrice, isBuy, tpsl, setTpsl, leverage }: TPSLProps) => {
  const setIsTpsl = (isTpsl: boolean) => {
    setTpsl({ ...tpsl, isTpsl })
  }

  const calculateTakeProfitPercentage = (value: number | string): number => {
    const numValue = typeof value === 'string' ? Number(value) : value
    if (!limitPrice || !numValue || isNaN(numValue)) return 0
    // Calculate the actual price movement percentage
    const priceMovementPercentage = Math.abs(
      ((numValue - parseFloat(limitPrice)) / parseFloat(limitPrice)) * 100
    )
    // Convert to equity percentage by multiplying by leverage
    return Number((priceMovementPercentage * leverage).toFixed(2))
  }

  const calculateTakeProfitValue = (percentage: number): number => {
    if (!limitPrice || !percentage || isNaN(percentage)) return 0
    // Convert equity percentage to price movement percentage
    const priceMovementPercentage = percentage / leverage
    const value =
      parseFloat(limitPrice) *
      (1 + (isBuy ? priceMovementPercentage : -priceMovementPercentage) / 100)
    return parseFloat(limitPrice) > 1 ? Number(value.toFixed(2)) : Number(value.toFixed(3))
  }

  const calculateStopLossPercentage = (value: number | string): number => {
    const numValue = typeof value === 'string' ? Number(value) : value
    if (!limitPrice || !numValue || isNaN(numValue)) return 0
    // Calculate the actual price movement percentage
    const priceMovementPercentage = Math.abs(
      ((numValue - parseFloat(limitPrice)) / parseFloat(limitPrice)) * 100
    )
    // Convert to equity percentage by multiplying by leverage
    return Number((priceMovementPercentage * leverage).toFixed(2))
  }

  const calculateStopLossValue = (percentage: number): number => {
    if (!limitPrice || !percentage || isNaN(percentage)) return 0
    const limitedPercentage = Math.min(percentage, 100) // Limit the equity percentage to 100%
    // Convert equity percentage to price movement percentage
    const priceMovementPercentage = limitedPercentage / leverage
    const value =
      parseFloat(limitPrice) *
      (1 + (isBuy ? -priceMovementPercentage : priceMovementPercentage) / 100)
    return parseFloat(limitPrice) > 1 ? Number(value.toFixed(2)) : Number(value.toFixed(3))
  }

  const cleanNumericInput = (value: string): string => {
    // Allow empty string for better UX
    if (value === '') return ''

    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^\d.]/g, '')

    // Ensure only one decimal point
    const parts = value.split('.')
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('')
    }

    // Remove leading zeros
    value = value.replace(/^0+/, '')

    // If empty after cleaning, set to 0
    if (!value) {
      value = '0'
    }

    // If decimal point is at start, add 0 before it
    if (value.startsWith('.')) {
      value = '0' + value
    }

    return value
  }

  const handleTakeProfitValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = cleanNumericInput(e.target.value)
    // Only convert to number if it's a complete number (not in the middle of typing)
    if (value !== '' && !value.endsWith('.')) {
      const numValue = Number(value)
      if (!isNaN(numValue)) {
        setTpsl({ ...tpsl, takeProfit: numValue })
      }
    } else {
      // Keep the string value while typing
      setTpsl({ ...tpsl, takeProfit: value })
    }
  }

  const handleTakeProfitPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = cleanNumericInput(e.target.value)
    // Only convert to number if it's a complete number (not in the middle of typing)
    if (value !== '' && !value.endsWith('.')) {
      const percentage = Number(value)
      if (!isNaN(percentage)) {
        const newValue = calculateTakeProfitValue(percentage)
        setTpsl({ ...tpsl, takeProfit: newValue })
      }
    }
  }

  const handleStopLossValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = cleanNumericInput(e.target.value)
    // Only convert to number if it's a complete number (not in the middle of typing)
    if (value !== '' && !value.endsWith('.')) {
      let numValue = Number(value)
      if (!isNaN(numValue)) {
        const limitPriceNum = parseFloat(limitPrice)
        // For buy orders: stop loss must be below limit price
        // For sell orders: stop loss must be above limit price
        if ((isBuy && numValue >= limitPriceNum) || (!isBuy && numValue <= limitPriceNum)) {
          numValue = isBuy ? limitPriceNum * 0.99 : limitPriceNum * 1.01
        }
        setTpsl({ ...tpsl, stopLoss: numValue })
      }
    } else {
      // Keep the string value while typing
      setTpsl({ ...tpsl, stopLoss: value })
    }
  }

  const handleStopLossPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = cleanNumericInput(e.target.value)
    // Only convert to number if it's a complete number (not in the middle of typing)
    if (value !== '' && !value.endsWith('.')) {
      const percentage = Number(value)
      if (!isNaN(percentage)) {
        const newValue = calculateStopLossValue(percentage)
        setTpsl({ ...tpsl, stopLoss: newValue })
      }
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <CheckBox
          label="Take Profit / Stop loss"
          isChecked={tpsl.isTpsl}
          setIsChecked={setIsTpsl}
        />
      </div>
      {tpsl.isTpsl && (
        <div className="flex flex-col gap-2 w-full">
          {/* Take Profit Row */}
          <div className="items-center gap-2 grid grid-cols-3 w-full">
            <div className="flex items-center gap-2 col-span-2 px-2 border border-white/10 rounded-md w-full">
              <span className="flex-1 font-medium text-[#8B8BA0] text-xs">Take Profit</span>
              <input
                type="text"
                inputMode="decimal"
                className="py-1 focus:outline-none w-[45%] text-white text-sm text-right"
                value={tpsl.takeProfit || ''}
                onChange={handleTakeProfitValueChange}
                placeholder="0.00"
              />
            </div>
            <div className="flex items-center gap-2 col-span-1 px-2 border border-white/10 rounded-md w-full">
              <span className="font-medium text-[#8B8BA0] text-xs whitespace-nowrap">Gain %</span>
              <input
                type="text"
                inputMode="decimal"
                className="py-1 focus:outline-none w-full text-white text-sm text-right"
                value={calculateTakeProfitPercentage(tpsl.takeProfit) || ''}
                onChange={handleTakeProfitPercentageChange}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Stop Loss Row */}
          <div className="items-center gap-2 grid grid-cols-3 w-full">
            <div className="flex items-center gap-2 col-span-2 px-2 border border-white/10 rounded-md w-full">
              <span className="flex-1 font-medium text-[#8B8BA0] text-xs">Stop Loss</span>
              <input
                type="text"
                inputMode="decimal"
                className="py-1 focus:outline-none w-[45%] text-white text-sm text-right"
                value={tpsl.stopLoss || ''}
                onChange={handleStopLossValueChange}
                placeholder="0.00"
              />
            </div>
            <div className="flex items-center gap-2 col-span-1 px-2 border border-white/10 rounded-md w-full">
              <span className="font-medium text-[#8B8BA0] text-xs whitespace-nowrap">Loss %</span>
              <input
                type="text"
                inputMode="decimal"
                className="py-1 focus:outline-none w-full text-white text-sm text-right"
                value={calculateStopLossPercentage(tpsl.stopLoss) || ''}
                onChange={handleStopLossPercentageChange}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TPSL
