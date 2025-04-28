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
    <div>
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <div className="border-b px-4 mb-3 border-[#FFFFFF0F]">
        <label className="block mb-1 text-sm font-medium text-[#8B8BA0]">Size</label>
        <input
          type="text"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
        />
      </div>
      <div className="border-b px-4 mb-3 border-[#FFFFFF0F]">
        <label className="block mb-1 text-sm font-medium text-[#8B8BA0]">Minutes</label>
        <input
          type="text"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
        />
      </div>
      <label className="flex py-1 items-center px-4 mb-4">
        <CheckBox
          label=""
          setIsChecked={(checked) => setRandomize(checked)}
          isChecked={randomize}
        />
        <span className="text-sm font-medium text-[#E8E0F1]">Randomize</span>
      </label>
      <div className="px-4">
        <button
          className={
            'py-[12px] px[24px] font-bold rounded-xl w-full text-base bg-[#5F46F9] text-white cursor-pointer'
          }
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
