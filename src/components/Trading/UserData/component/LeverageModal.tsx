import { useMemo, useState } from 'react'
import SmallModal from '@/components/common/SmallModal'
import { toast } from 'react-toastify'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { getLeverageTicks, getPerpsUniverseIndex } from '@/utils/utils'
import { AssetPosition } from '@nktkas/hyperliquid'

interface LeverageModalProps {
  isOpen: boolean
  onClose: () => void
  asset: AssetPosition['position']
}

const LeverageModal = ({ isOpen, onClose, asset }: LeverageModalProps) => {
  const { perpsMeta } = useHyperliquid()

  const maxLeverage = useMemo(() => {
    if (!perpsMeta?.universe.length) return 1
    const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, asset.coin)
    return perpsMeta.universe[assetIndex]?.maxLeverage || 1
  }, [perpsMeta, asset])

  const [leverage, setLeverage] = useState<number>(asset.leverage.value)
  const { sdkExchangeClient } = useHyperliquid()

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
          <div className="relative bg-[#18122B] px-4 py-3 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-[#8B8BA0] text-xs">Leverage</span>
              <div className="flex items-center gap-1 ml-auto">
                <button
                  className="flex justify-center items-center bg-[#251B3A] hover:bg-[#322944] rounded w-7 h-7 font-bold text-[#B8AEE0] text-lg"
                  onClick={() => setLeverage((prev) => Math.max(prev - 1, 1))}
                  aria-label="Decrease leverage"
                >
                  -
                </button>
                <span className="w-12 font-semibold text-white text-base text-center">
                  {leverage}x
                </span>
                <button
                  className="flex justify-center items-center bg-[#251B3A] hover:bg-[#322944] rounded w-7 h-7 font-bold text-[#B8AEE0] text-lg"
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
                className="bg-[#251B3A] rounded-lg focus:outline-none w-full h-2 appearance-none"
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
        <div className="mt-2 mb-6 text-yellow-400 text-xs text-center">
          Note that setting a higher leverage increases the risk of liquidation.
        </div>
        <button
          className="bg-[#6C4DF6] hover:bg-[#5F46F9] mt-2 py-3 rounded-xl w-full font-semibold text-white text-lg transition cursor-pointer"
          onClick={async () => {
            if (!asset) return
            const toastId = toast.loading('⏳ Updating leverage...')
            try {
              if (!sdkExchangeClient) return
              if (!perpsMeta) return
              const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, asset.coin)
              const res = await sdkExchangeClient.updateLeverage({
                asset: assetIndex,
                isCross: asset.leverage.type === 'cross',
                leverage: leverage
              })
              console.log(res)
              // const resSdk = await sdk.exchange.updateLeverage(
              //   asset.coin,
              //   asset.leverage.type,
              //   leverage
              // )
              // console.log(resSdk)
              toast.update(toastId, {
                render: '✅ Leverage updated successfully',
                type: 'success',
                isLoading: false,
                autoClose: 2000
              })
              onClose()
              // if (res.status === 'err') {
              //   toast.update(toastId, {
              //     render: '❌ ' + res.error,
              //     type: 'error',
              //     isLoading: false,
              //     autoClose: 6000
              //   })
              //   return
              // } else {
              // }
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
