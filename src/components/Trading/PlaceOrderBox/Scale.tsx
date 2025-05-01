import { useAccount } from 'wagmi'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import BuyOrSell from './components/BuyOrSell'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { OrderData, placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { getUniverseIndex } from '@/utils/utils'
import { BUILDER_ADDRESS } from '@/utils/constants'
import Slider1 from '@/assets/images/slider_value.svg'
import usdcicon from '@/assets/images/usdc_icon.svg'
import plusicon from '@/assets/images/plus_icon.svg'
import minusicon from '@/assets/images/minus_icon.svg'
import refreshpurpleIcon from '@/assets/images/refreshpurple2_icon.svg'
import { IPlaceOrderProps } from '.'
import CheckBox from '@/components/common/CheckBox'
import { useAgentApproval } from '@/context/EstablishConnection'

interface Order {
  price: number
  size: number
}
function calculateScaleOrders(
  totalUSD: number,
  startPrice: number,
  endPrice: number,
  totalOrders: number,
  skew: number
): Order[] {
  const orders: Order[] = []
  if (totalOrders === 1) {
    orders.push({ price: startPrice, size: totalUSD / startPrice })
    return orders
  }
  const prices: number[] = []
  for (let i = 0; i < totalOrders; i++) {
    const price = startPrice + (i * (endPrice - startPrice)) / (totalOrders - 1)
    prices.push(price)
  }
  const adjustedSkew = skew * (endPrice / startPrice)
  const weights: number[] = []
  for (let i = 0; i < totalOrders; i++) {
    const weight = 1 + (i * (adjustedSkew - 1)) / (totalOrders - 1)
    weights.push(weight)
  }
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  for (let i = 0; i < totalOrders; i++) {
    const allocationUSD = totalUSD * (weights[i] / totalWeight)
    const assetSize = allocationUSD / prices[i]
    orders.push({ price: prices[i], size: assetSize })
  }
  return orders
}

const Scale = ({ selectedAsset }: IPlaceOrderProps) => {
  const { universe, agentWallet, hyperliquidAxios, clearingHouseState } = useHyperLiquid()
  const { chain } = useAccount()
  const [totalSize, setTotalSize] = useState<number>()
  const [startPrice, setStartPrice] = useState<number>()
  const [endPrice, setEndPrice] = useState<number>()
  const [totalOrders, setTotalOrders] = useState<number>(10)
  const [sizeSkew, setSizeSkew] = useState<number>()
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const [usdPercent, setUsdPercent] = useState(0)

  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()

  const maxAllowedUsd = useMemo(() => {
    if (!clearingHouseState) return 0
    if (!isReduceOnly) return clearingHouseState.withdrawable
    const existingPosition = clearingHouseState.assetPositions.find((pos) => {
      return pos.position.coin === selectedAsset
    })
    if (!existingPosition) return clearingHouseState.withdrawable
    if (existingPosition.position.szi > 0 && isBuy) return 0
    if (existingPosition.position.szi < 0 && !isBuy) return 0
    let maxUsd = clearingHouseState.withdrawable
    let totalUSD = 0
    while (true) {
      const orders = calculateScaleOrders(totalUSD, startPrice!, endPrice!, totalOrders!, sizeSkew!)
      const totalSize = orders.reduce((sum, order) => sum + order.size, 0)
      if (totalSize >= Math.abs(existingPosition.position.szi)) {
        break
      }
      maxUsd = totalUSD
      totalUSD += 1 // Increment totalUSD for the next iteration
    }
    return Math.min(maxUsd, clearingHouseState.withdrawable)
  }, [
    isReduceOnly,
    clearingHouseState,
    selectedAsset,
    isBuy,
    startPrice,
    endPrice,
    totalOrders,
    sizeSkew
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!universe.length) return
    if (!agentWallet) return
    if (!currentFeeApproval) return
    const orders = calculateScaleOrders(totalSize!, startPrice!, endPrice!, totalOrders!, sizeSkew!)
    console.log(orders)
    const assetIndex = getUniverseIndex(universe, selectedAsset)
    const szDecimals = universe[assetIndex].szDecimals
    const ordersData: OrderData[] = orders.map((order) => ({
      assetIndex: assetIndex,
      isBuy: isBuy,
      price: order.price.toFixed(0),
      size: Number(order.size.toFixed(szDecimals)).toString(),
      reduceOnly: false,
      orderType: {
        limit: {
          tif: 'Gtc'
        }
      }
    }))
    const res = await placeOrder(agentWallet, chain?.testnet || false, hyperliquidAxios, {
      orders: ordersData,
      grouping: 'na',
      builder: {
        address: BUILDER_ADDRESS,
        fee: currentFeeApproval
      }
    })
    console.log(res)
  }
  const handleUsdPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clearingHouseState) return
    const newUsdPercent = parseFloat(e.target.value) || 0
    setUsdPercent(newUsdPercent)
    setTotalSize((newUsdPercent * maxAllowedUsd) / 100)
  }
  const handleIncrease = () => setTotalOrders((prev) => prev + 1)
  const handleDecrease = () => setTotalOrders((prev) => (prev > 0 ? prev - 1 : 0))
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : 0
    setTotalOrders(isNaN(value) ? 0 : value)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="border-b border-white/10">
        <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col w-full rounded-md shadow-md">
          <div className="space-y-2">
            <div className="border-b px-4 mb-2 border-[#FFFFFF0F]">
              <label className="mb-1">
                <span className="block mb-1 text-sm font-medium text-[#8B8BA0]">Start Price</span>
                <div className="flex">
                  <input
                    type="text"
                    value={startPrice ?? '0'}
                    onChange={(e) =>
                      setStartPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
                  />
                  <span className="text-white flex items-center text-sm font-medium">
                    <Image src={usdcicon} width={45} height={45} className="pr-1" alt="usdcicon" />
                    USDC
                  </span>
                </div>
              </label>
            </div>
            <div className="border-b px-4 mb-2 border-[#FFFFFF0F]">
              <label className="mb-1">
                <span className="block mb-1 text-sm font-medium text-[#8B8BA0]">End Price</span>
                <div className="flex ">
                  <input
                    type="text"
                    value={endPrice ?? '0'}
                    onChange={(e) =>
                      setEndPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
                  />
                  <span className="text-[#7D67FF] gap-x-1.5 flex items-center text-sm font-medium">
                    <Image src={refreshpurpleIcon} alt="Refresh Icon" className="w-3.5 h-3.5" />
                    Last
                  </span>
                </div>
              </label>
            </div>

            <div className="flex w-full mb-2 items-end px-4 border-b border-[#FFFFFF0F] pb-2">
              <div className="w-5/6">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={usdPercent}
                  onChange={handleUsdPercentChange}
                  className="w-full cursor-pointer appearance-none h-2.5 rounded-lg outline-none"
                  style={{
                    background:
                      'linear-gradient(to right, #5F46F9 0%, #5F46F9 ' +
                      usdPercent +
                      '%, #2A1B3D ' +
                      usdPercent +
                      '%, #2A1B3D 100%)'
                  }}
                />
                <Image src={Slider1} alt="" width={20} height={20} className="w-full mt-1" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="relative pl-4">
                <input
                  type="string"
                  className="w-20 h-11 rounded-md border border-white/10 bg-white/10 outline-none px-4 py-2 flex justify-between"
                  value={usdPercent}
                  onChange={handleUsdPercentChange}
                />
                <span className="absolute right-2 top-2.5 text-gray-500">%</span>
              </div>
            </div>

            <div className="border-b px-4 mb-3 border-[#FFFFFF0F]">
              <label className="mb-2">
                <div className="flex mb-1 justify-between">
                  <span className="block  text-sm font-medium text-[#8B8BA0]">Total Size</span>
                  <span className="block text-sm font-medium text-[#8B8BA0]">
                    Balance: {clearingHouseState?.withdrawable.toFixed(2)} USDC
                  </span>
                </div>
                <div className="flex ">
                  <input
                    type="text"
                    value={totalSize ?? '0'}
                    onChange={(e) =>
                      setTotalSize(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
                  />
                  <span className="text-white flex items-center text-sm font-medium">
                    <Image src={usdcicon} width={45} height={45} className="pr-1" alt="usdcicon" />
                    USDC
                  </span>
                </div>
              </label>
            </div>
            <div className="border-b px-4 mb-3 border-[#FFFFFF0F]">
              <span className="block mb-3 text-sm font-bold text-[#8B8BA0]">Scale Settings</span>
              <label className="mb-2">
                <span className="block mb-2 text-sm font-medium text-[#8B8BA0]">
                  Number of Orders
                </span>
                <div className="flex items-center gap-2 mb-3 rounded-lg">
                  <button
                    onClick={handleDecrease}
                    className="rounded-md px-3 py-5 border border-white/10 bg-white/10 cursor-pointer"
                  >
                    <Image
                      src={minusicon}
                      width={20}
                      height={20}
                      className="pr-1"
                      alt="minusicon"
                    />
                  </button>
                  <input
                    type="text"
                    value={totalOrders}
                    onChange={handleChange}
                    className="w-full text-center rounded-md px-3 py-[9px] border-2 border-white/10 bg-white/10 text-base font-medium focus:outline-none"
                  />
                  <button
                    onClick={handleIncrease}
                    className="rounded-md px-3 py-4 border border-white/10 bg-white/10 cursor-pointer"
                  >
                    <Image src={plusicon} width={20} height={20} className="pr-1" alt="plusicon" />
                  </button>
                </div>
              </label>
            </div>

            <label className="mb-2 px-4">
              <span className="block mb-1 text-sm font-medium text-[#8B8BA0]">Size Skew</span>
              <input
                type="text"
                value={sizeSkew ?? ''}
                onChange={(e) =>
                  setSizeSkew(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="0.00"
                className="w-full rounded-md text-white p-2 placeholder:text-lg placeholder:text-[#8B8BA0] focus:outline-none  focus:none focus:none text-lg font-medium"
              />
            </label>
            <label className="mb-4 mt-1 px-4 flex items-center">
              <CheckBox
                label=""
                setIsChecked={(checked) => setIsReduceOnly(checked)}
                isChecked={isReduceOnly}
              />
              <span className="text-sm font-medium text-[#E8E0F1]">Reduce Only</span>
            </label>
          </div>
        </div>
      </div>

      <div className="p-4 pb-0 border-t border-white/10">
        {!isAgentApproved || currentFeeApproval === 0 ? (
          <button
            type="button"
            className="py-2 rounded-2xl w-full  bg-primary hover:bg-purple-600 text-white cursor-pointer"
            onClick={async () => openAgentModal()}
          >
            Establish Connection
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            type="submit"
            disabled={totalSize! > maxAllowedUsd}
            className="py-[12px] px[24px] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer"
          >
            Scale Buy ({totalOrders} Orders)
          </button>
        )}
      </div>
      {/* <span className="font-medium mx-4 mb-4 text-sm text-[#8B8BA0]">
        Order will execute <b>0.912 BTC</b> in <b>10 equal orders of 0.076 BTC.</b>
      </span> */}
    </div>
  )
}
export default Scale
