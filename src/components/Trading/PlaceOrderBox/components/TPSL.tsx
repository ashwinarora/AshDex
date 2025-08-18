import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TPSLProps {
  limitPrice: string
  isBuy: boolean
  tpsl: TPSLType
  setTpsl: (tpsl: TPSLType) => void
  leverage: number
}

export type TPSLType = {
  isTpsl: boolean
  takeProfit: number
  stopLoss: number
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
      setTpsl({ ...tpsl, takeProfit: Number(value) })
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
      setTpsl({ ...tpsl, stopLoss: Number(value) })
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
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        {/* <Switch id="tpsl" checked={tpsl.isTpsl} onCheckedChange={setIsTpsl} /> */}
        <label htmlFor="tpsl" className="text-xs font-semibold">
          Set Take Profit and Stop Loss Values
        </label>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col w-full items-start gap-2">
          <div className="flex items-center w-full justify-between gap-2">
            <span className="flex-1 text-start text-nowrap font-medium text-white/50 text-xs">
              TP Value
            </span>
            <span className="flex-1 text-end text-nowrap font-medium text-white/50 text-xs">
              TP %
            </span>
          </div>
          <div className="flex items-center gap-2 w-full">
            <Input
              type="text"
              inputMode="decimal"
              className="text-white text-sm text-end flex-1"
              value={tpsl.takeProfit || ''}
              onChange={handleTakeProfitValueChange}
              placeholder="0.00"
            />
            <Input
              type="text"
              inputMode="decimal"
              className="text-white text-sm text-end w-16"
              value={calculateTakeProfitPercentage(tpsl.takeProfit) || ''}
              onChange={handleTakeProfitPercentageChange}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="flex flex-col w-full items-start gap-2">
          <div className="flex items-center w-full justify-between gap-2">
            <span className="flex-1 text-start text-nowrap font-medium text-white/50 text-xs">
              SL Value
            </span>
            <span className="flex-1 text-end text-nowrap font-medium text-white/50 text-xs">
              SL %
            </span>
          </div>
          <div className="flex items-center gap-2 w-full">
            <Input
              type="text"
              inputMode="decimal"
              className="text-white text-sm text-end flex-1"
              value={tpsl.stopLoss || ''}
              onChange={handleStopLossValueChange}
              placeholder="0.00"
            />
            <Input
              type="text"
              inputMode="decimal"
              className="text-white text-sm text-end w-16"
              value={calculateStopLossPercentage(tpsl.stopLoss) || ''}
              onChange={handleStopLossPercentageChange}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant={tpsl.isTpsl ? 'destructive' : 'default'}
        onClick={() => setIsTpsl(!tpsl.isTpsl)}
        className="w-full"
      >
        {tpsl.isTpsl ? 'Clear TP/SL' : 'Set TP/SL'}
      </Button>
    </div>
  )
}

export default TPSL
