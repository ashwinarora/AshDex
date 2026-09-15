import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'

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
  const isRTL = false

  // Local string state for inputs - allows uninterrupted typing
  const [tpValueStr, setTpValueStr] = useState('')
  const [tpPctStr, setTpPctStr] = useState('')
  const [slValueStr, setSlValueStr] = useState('')
  const [slPctStr, setSlPctStr] = useState('')

  // Error states for validation feedback
  const [tpValueError, setTpValueError] = useState(false)
  const [tpPctError, setTpPctError] = useState(false)
  const [slValueError, setSlValueError] = useState(false)
  const [slPctError, setSlPctError] = useState(false)

  // Computed error state for button
  const hasError = tpValueError || tpPctError || slValueError || slPctError
  const errorMessage =
    tpValueError || tpPctError
      ? isBuy
        ? 'TP must be above entry price'
        : 'TP must be below entry price'
      : slValueError || slPctError
        ? isBuy
          ? 'SL must be below entry price'
          : 'SL must be above entry price'
        : ''

  // Track which field is currently focused to avoid overwriting during typing
  const focusedField = useRef<'tpValue' | 'tpPct' | 'slValue' | 'slPct' | null>(null)

  const setIsTpsl = (isTpsl: boolean) => {
    if (!isTpsl) {
      // Clear all local state when disabling
      setTpValueStr('')
      setTpPctStr('')
      setSlValueStr('')
      setSlPctStr('')
      setTpValueError(false)
      setTpPctError(false)
      setSlValueError(false)
      setSlPctError(false)
    }
    setTpsl({
      ...tpsl,
      isTpsl,
      takeProfit: isTpsl ? tpsl.takeProfit : 0,
      stopLoss: isTpsl ? tpsl.stopLoss : 0
    })
  }

  // === Calculation helpers ===
  const calculateTakeProfitPercentage = (value: number): number => {
    const limitPriceNum = parseFloat(limitPrice)
    if (!limitPriceNum || !value || isNaN(value)) return 0
    const priceMovementPercentage = Math.abs(((value - limitPriceNum) / limitPriceNum) * 100)
    return Number((priceMovementPercentage * leverage).toFixed(2))
  }

  const calculateTakeProfitValue = (percentage: number): number => {
    const limitPriceNum = parseFloat(limitPrice)
    if (!limitPriceNum || !percentage || isNaN(percentage)) return 0
    const priceMovementPercentage = percentage / leverage
    const value =
      limitPriceNum * (1 + (isBuy ? priceMovementPercentage : -priceMovementPercentage) / 100)
    return limitPriceNum > 1 ? Number(value.toFixed(2)) : Number(value.toFixed(3))
  }

  const calculateStopLossPercentage = (value: number): number => {
    const limitPriceNum = parseFloat(limitPrice)
    if (!limitPriceNum || !value || isNaN(value)) return 0
    const priceMovementPercentage = Math.abs(((value - limitPriceNum) / limitPriceNum) * 100)
    return Number((priceMovementPercentage * leverage).toFixed(2))
  }

  const calculateStopLossValue = (percentage: number): number => {
    const limitPriceNum = parseFloat(limitPrice)
    if (!limitPriceNum || !percentage || isNaN(percentage)) return 0
    const limitedPercentage = Math.min(percentage, 100)
    const priceMovementPercentage = limitedPercentage / leverage
    const value =
      limitPriceNum * (1 + (isBuy ? -priceMovementPercentage : priceMovementPercentage) / 100)
    return limitPriceNum > 1 ? Number(value.toFixed(2)) : Number(value.toFixed(3))
  }

  // === Validation helpers ===
  const isValidTpValue = (value: number): boolean => {
    const limitPriceNum = parseFloat(limitPrice)
    if (!limitPriceNum || value <= 0) return false
    // For buy: TP must be above limit price; for sell: TP must be below
    return isBuy ? value > limitPriceNum : value < limitPriceNum
  }

  const isValidSlValue = (value: number): boolean => {
    const limitPriceNum = parseFloat(limitPrice)
    if (!limitPriceNum || value <= 0) return false
    // For buy: SL must be below limit price; for sell: SL must be above
    return isBuy ? value < limitPriceNum : value > limitPriceNum
  }

  // Sanitize input: allow only digits and one decimal point
  const sanitizeNumericInput = (raw: string): string => {
    let value = raw.replace(/[^\d.]/g, '')
    const parts = value.split('.')
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('')
    }
    return value
  }

  // Parse a string to number, returning null if incomplete or invalid
  const parseNumber = (raw: string): number | null => {
    if (raw === '' || raw === '.' || raw.endsWith('.')) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  }

  // === Sync tpsl state to local strings (when not focused) ===
  useEffect(() => {
    if (focusedField.current !== 'tpValue') {
      setTpValueStr(tpsl.takeProfit > 0 ? String(tpsl.takeProfit) : '')
    }
    if (focusedField.current !== 'tpPct') {
      const pct = calculateTakeProfitPercentage(tpsl.takeProfit)
      setTpPctStr(pct > 0 ? String(pct) : '')
    }
  }, [tpsl.takeProfit, limitPrice, leverage, isBuy])

  useEffect(() => {
    if (focusedField.current !== 'slValue') {
      setSlValueStr(tpsl.stopLoss > 0 ? String(tpsl.stopLoss) : '')
    }
    if (focusedField.current !== 'slPct') {
      const pct = calculateStopLossPercentage(tpsl.stopLoss)
      setSlPctStr(pct > 0 ? String(pct) : '')
    }
  }, [tpsl.stopLoss, limitPrice, leverage, isBuy])

  // === Handlers: uninterrupted typing, validate on blur ===
  const handleTpValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeNumericInput(e.target.value)
    setTpValueStr(value)
    setTpValueError(false) // Clear error while typing
  }

  const handleTpValueBlur = () => {
    focusedField.current = null
    const n = parseNumber(tpValueStr)
    if (n === null) {
      if (tpValueStr === '') {
        setTpsl({ ...tpsl, takeProfit: 0 })
        setTpValueError(false)
      }
      return
    }
    if (!isValidTpValue(n)) {
      setTpValueError(true)
      return
    }
    setTpValueError(false)
    setTpsl({ ...tpsl, takeProfit: n })
  }

  const handleTpPctChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeNumericInput(e.target.value)
    setTpPctStr(value)
    setTpPctError(false)
  }

  const handleTpPctBlur = () => {
    focusedField.current = null
    const pct = parseNumber(tpPctStr)
    if (pct === null) {
      if (tpPctStr === '') {
        setTpsl({ ...tpsl, takeProfit: 0 })
        setTpPctError(false)
      }
      return
    }
    if (pct < 0) {
      setTpPctError(true)
      return
    }
    const tpValue = calculateTakeProfitValue(pct)
    if (!isValidTpValue(tpValue)) {
      setTpPctError(true)
      return
    }
    setTpPctError(false)
    setTpsl({ ...tpsl, takeProfit: tpValue })
  }

  const handleSlValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeNumericInput(e.target.value)
    setSlValueStr(value)
    setSlValueError(false)
  }

  const handleSlValueBlur = () => {
    focusedField.current = null
    const n = parseNumber(slValueStr)
    if (n === null) {
      if (slValueStr === '') {
        setTpsl({ ...tpsl, stopLoss: 0 })
        setSlValueError(false)
      }
      return
    }
    if (!isValidSlValue(n)) {
      setSlValueError(true)
      return
    }
    setSlValueError(false)
    setTpsl({ ...tpsl, stopLoss: n })
  }

  const handleSlPctChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeNumericInput(e.target.value)
    setSlPctStr(value)
    setSlPctError(false)
  }

  const handleSlPctBlur = () => {
    focusedField.current = null
    const pct = parseNumber(slPctStr)
    if (pct === null) {
      if (slPctStr === '') {
        setTpsl({ ...tpsl, stopLoss: 0 })
        setSlPctError(false)
      }
      return
    }
    if (pct < 0 || pct > 100) {
      setSlPctError(true)
      return
    }
    const slValue = calculateStopLossValue(pct)
    if (!isValidSlValue(slValue)) {
      setSlPctError(true)
      return
    }
    setSlPctError(false)
    setTpsl({ ...tpsl, stopLoss: slValue })
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <label htmlFor="tpsl" className={cn('text-xs font-semibold', isRTL && 'text-end')}>
        {'Set Take Profit and Stop Loss Values'}
      </label>

      <div className="flex flex-col gap-2 w-full">
        {/* Take Profit */}
        <div className="flex flex-col w-full items-start gap-2">
          <div
            className={cn(
              'flex items-center w-full justify-between gap-2',
              isRTL && 'flex-row-reverse'
            )}
          >
            <span
              className={cn(
                'flex-1 text-nowrap font-medium text-white/70 text-xs',
                isRTL ? 'text-end' : 'text-start'
              )}
            >
              {'TP Price ($)'}
            </span>
            <span
              className={cn(
                'flex-1 text-nowrap font-medium text-white/70 text-xs',
                isRTL ? 'text-start' : 'text-end'
              )}
            >
              {'TP %'}
            </span>
          </div>
          <div className={cn('flex items-center gap-2 w-full', isRTL && 'flex-row-reverse')}>
            <Input
              type="text"
              inputMode="decimal"
              className={cn(
                'text-sm text-end flex-1',
                tpValueError ? 'border-red text-red' : 'text-white'
              )}
              value={tpValueStr}
              onChange={handleTpValueChange}
              onFocus={() => (focusedField.current = 'tpValue')}
              onBlur={handleTpValueBlur}
              placeholder="0.00"
            />
            <Input
              type="text"
              inputMode="decimal"
              className={cn(
                'text-sm text-end w-16',
                tpPctError ? 'border-red text-red' : 'text-white'
              )}
              value={tpPctStr}
              onChange={handleTpPctChange}
              onFocus={() => (focusedField.current = 'tpPct')}
              onBlur={handleTpPctBlur}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Stop Loss */}
        <div className="flex flex-col w-full items-start gap-2">
          <div
            className={cn(
              'flex items-center w-full justify-between gap-2',
              isRTL && 'flex-row-reverse'
            )}
          >
            <span
              className={cn(
                'flex-1 text-start text-nowrap font-medium text-white/70 text-xs',
                isRTL && 'text-end'
              )}
            >
              {'SL Price ($)'}
            </span>
            <span
              className={cn(
                'flex-1 text-end text-nowrap font-medium text-white/70 text-xs',
                isRTL && 'text-start'
              )}
            >
              {'SL %'}
            </span>
          </div>
          <div className={cn('flex items-center gap-2 w-full', isRTL && 'flex-row-reverse')}>
            <Input
              type="text"
              inputMode="decimal"
              className={cn(
                'text-sm text-end flex-1',
                slValueError ? 'border-red text-red' : 'text-white'
              )}
              value={slValueStr}
              onChange={handleSlValueChange}
              onFocus={() => (focusedField.current = 'slValue')}
              onBlur={handleSlValueBlur}
              placeholder="0.00"
            />
            <Input
              type="text"
              inputMode="decimal"
              className={cn(
                'text-sm text-end w-16',
                slPctError ? 'border-red text-red' : 'text-white'
              )}
              value={slPctStr}
              onChange={handleSlPctChange}
              onFocus={() => (focusedField.current = 'slPct')}
              onBlur={handleSlPctBlur}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/*
        BUG-019: previously the CTA button label doubled as the validation
        error surface ("TP must be above entry price"). Users expect the
        button to describe the action, and errors to live next to the
        offending field. Move the message to a helper line above the button
        and keep the button label static.
      */}
      {hasError && (
        <p className="text-red text-xs" data-testid="preorder-tpsl-error">
          {errorMessage}
        </p>
      )}
      <Button
        size="sm"
        variant={tpsl.isTpsl ? 'destructive' : 'default'}
        onClick={() => setIsTpsl(!tpsl.isTpsl)}
        className={cn('w-full', hasError && 'opacity-50 cursor-not-allowed')}
        disabled={hasError}
        data-testid="preorder-tpsl-submit"
      >
        {tpsl.isTpsl ? 'Clear TP/SL' : 'Set TP/SL'}
      </Button>
    </div>
  )
}

export default TPSL
