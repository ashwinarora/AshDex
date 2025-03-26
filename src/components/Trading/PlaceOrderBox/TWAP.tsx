import { useState } from 'react'
import BuyOrSell from './components/BuyOrSell'
import { useHyperLiquid } from '@/context/HyperLiquid'

interface TWAPProps {
  selectedAsset: string
}

const TWAP = ({ selectedAsset }: TWAPProps) => {
  const { sdk } = useHyperLiquid()
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [size, setSize] = useState<number>(0)
  const [minutes, setMinutes] = useState<number>(0)
  const [randomize, setRandomize] = useState<boolean>(false)

  return (
    <div className="p-4 bg-gray-800 text-white">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <div className="mt-4">
        <label className="block mb-2">Size</label>
        <input
          type="number"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded"
        />
        <label className="block mb-2">Minutes</label>
        <input
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded"
        />
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={randomize}
            onChange={(e) => setRandomize(e.target.checked)}
            className="mr-2"
          />
          Randomize
        </label>
        <button
          className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded"
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
