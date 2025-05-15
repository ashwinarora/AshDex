import { useState } from 'react'
import BuyOrSell from './components/BuyOrSell'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { IPlaceOrderProps } from '.'
import CheckBox from '@/components/common/CheckBox'

const TWAP = ({ selectedAsset }: IPlaceOrderProps) => {
  const { sdk } = useHyperLiquid()
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [size, setSize] = useState<number>(0)
  const [minutes, setMinutes] = useState<number>(0)
  const [randomize, setRandomize] = useState<boolean>(false)

  return (
    <div className="w-full h-full flex flex-col">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-1">
          <div className="border-b px-4 mb-1 border-[#FFFFFF0F]">
            <label className="block mb-0.5 text-xs font-medium text-[#8B8BA0]">Size</label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full rounded-md p-1.5 focus:outline-none focus:none focus:none text-sm font-medium"
            />
          </div>
          <div className="border-b px-4 mb-1 border-[#FFFFFF0F]">
            <label className="block mb-0.5 text-xs font-medium text-[#8B8BA0]">Minutes</label>
            <input
              type="text"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full rounded-md p-1.5 focus:outline-none focus:none focus:none text-sm font-medium"
            />
          </div>
          <label className="flex py-0.5 items-center px-4 mb-1">
            <CheckBox
              label=""
              setIsChecked={(checked) => setRandomize(checked)}
              isChecked={randomize}
            />
            <span className="text-xs font-medium text-[#E8E0F1]">Randomize</span>
          </label>
        </div>
      </div>
      <div className="p-2 border-t border-white/10">
        <button
          className="py-2 px-4 font-bold rounded-xl w-full text-xs bg-[#5F46F9] text-white cursor-pointer"
          onClick={async () => {
            const res = await sdk.exchange.placeTwapOrder({
              coin: selectedAsset,
              is_buy: isBuy,
              sz: size,
              minutes: minutes,
              randomize: randomize,
              reduce_only: false
            })
            console.log(res)
          }}
        >
          Place Order
        </button>
      </div>
    </div>
  )
}
export default TWAP
