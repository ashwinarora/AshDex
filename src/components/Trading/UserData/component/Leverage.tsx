import { useMemo, useState } from 'react'
import SmallModal from '@/components/common/SmallModal'
import { IPositionData } from '@/utils/hyperliquid/hyperLiquidTypes'
import { toast } from 'react-toastify'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { getLeverageTicks, getUniverseIndex } from '@/utils/utils'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'

interface LeverageModalProps {
  isOpen: boolean
  onClose: () => void
  asset: IPositionData
}

const LeverageModal = ({ isOpen, onClose, asset }: LeverageModalProps) => {
  const { data: universe } = usePerpsUniverse()

  const maxLeverage = useMemo(() => {
    if (!universe.length) return 1
    const assetIndex = getUniverseIndex(universe, asset.coin)
    return universe?.[assetIndex]?.maxLeverage || 1
  }, [universe, asset])

  const [leverage, setLeverage] = useState<number>(asset.leverage.value)
  const { sdk } = useHyperliquid()

  const marks = useMemo(() => [1, ...getLeverageTicks(maxLeverage, 3), maxLeverage], [maxLeverage])

  return (
    <SmallModal isOpen={isOpen} onClose={onClose} heading="Adjust Leverage">
      <div className="text-white">
        <p className="mb-2 text-sm">
          Control the leverage used for BTC positions. The maximum leverage is {maxLeverage}x.
          <br />
          Max position size decreases the higher your leverage.
        </p>
        <div className="mt-6 mb-2">
          <div className="relative bg-[#18122B] rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#8B8BA0]">Leverage</span>
              <div className="flex items-center ml-auto gap-1">
                <button
                  className="w-7 h-7 rounded bg-[#251B3A] text-[#B8AEE0] hover:bg-[#322944] flex items-center justify-center text-lg font-bold"
                  onClick={() => setLeverage((prev) => Math.max(prev - 1, 1))}
                  aria-label="Decrease leverage"
                >
                  -
                </button>
                <span className="w-12 text-center text-base font-semibold text-white">
                  {leverage}x
                </span>
                <button
                  className="w-7 h-7 rounded bg-[#251B3A] text-[#B8AEE0] hover:bg-[#322944] flex items-center justify-center text-lg font-bold"
                  onClick={() => setLeverage((prev) => Math.min(prev + 1, maxLeverage))}
                  aria-label="Increase leverage"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-4">
              <input
                type="range"
                min={1}
                max={maxLeverage}
                step={1}
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full h-2 bg-[#251B3A] rounded-lg appearance-none focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #5F46F9 0%, #5F46F9 ${((leverage - 1) / (maxLeverage - 1)) * 100}%, #251B3A ${((leverage - 1) / (maxLeverage - 1)) * 100}%, #251B3A 100%)`
                }}
              />
              {/* Slider marks */}
              <div className="flex justify-between mt-2 px-1">
                {marks.map((mark) => (
                  <span
                    key={mark}
                    className={`text-xs ${leverage === mark ? 'text-[#5F46F9] font-bold' : 'text-[#8B8BA0]'}`}
                  >
                    {mark}x
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 mb-6 text-xs text-yellow-400 text-center">
          Note that setting a higher leverage increases the risk of liquidation.
        </div>
        <button
          className="w-full py-3 cursor-pointer rounded-xl bg-[#6C4DF6] hover:bg-[#5F46F9] text-white text-lg font-semibold transition mt-2"
          onClick={async () => {
            if (!asset) return
            const toastId = toast.loading('⏳ Updating leverage...')
            try {
              const res = await sdk.exchange.updateLeverage(
                asset.coin,
                asset.leverage.type,
                leverage
              )
              console.log(res)
              toast.update(toastId, {
                render: '✅ Leverage updated successfully',
                type: 'success',
                isLoading: false,
                autoClose: 2000
              })
              onClose && onClose()
            } catch (error) {
              console.error('Error updating leverage:', error)
              toast.update(toastId, {
                render: '❌ ' + error,
                type: 'error',
                isLoading: false,
                autoClose: 3000
              })
            }
          }}
        >
          Confirm
        </button>
      </div>
    </SmallModal>
  )
}

export default LeverageModal
