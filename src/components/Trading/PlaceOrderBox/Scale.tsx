import { useMemo, useState } from 'react'
import Image from 'next/image'
import BuyOrSell from './components/BuyOrSell'
import { OrderData } from '@/utils/hyperliquid/PlaceOrder'
import { getPerpsUniverseIndex } from '@/utils/utils'
import { BUILDER_ADDRESS } from '@/utils/constants'
import Slider1 from '@/assets/images/slider_value.svg'
import plusicon from '@/assets/images/plus_icon.svg'
import minusicon from '@/assets/images/minus_icon.svg'
import refreshpurpleIcon from '@/assets/images/refreshpurple2_icon.svg'
import { IPlaceOrderProps } from '.'
import CheckBox from '@/components/common/CheckBox'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquid } from '@/store/HyperliquidStore'
import MarginMode from './components/MarginMode'
import LeverageMargin from './components/LeverageMargin'
import { toast } from 'react-toastify'
interface Order {
  price: number
  size: number
}

function calculateScaleOrdersByUsd(
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

function calculateScaleOrdersByAssetSize(
  totalAssetSize: number,
  startPrice: number,
  endPrice: number,
  totalOrders: number,
  skew: number
): Order[] {
  const orders: Order[] = []
  if (totalOrders === 1) {
    orders.push({ price: startPrice, size: totalAssetSize })
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
    const allocationSize = totalAssetSize * (weights[i] / totalWeight)
    orders.push({
      price: prices[i],
      size: allocationSize
    })
  }
  return orders
}

const Scale = ({ selectedAsset }: IPlaceOrderProps) => {
  const { agentWallet, clearingHouseState, allMids, perpsMeta, sdkExchangeClient } =
    useHyperliquid()
  const [totalUsd, setTotalUsd] = useState<number>()
  const [totalAssetSize, setTotalAssetSize] = useState<number>()
  const [startPrice, setStartPrice] = useState<number>()
  const [endPrice, setEndPrice] = useState<number>()
  const [totalOrders, setTotalOrders] = useState<number>(2)
  const [sizeSkew, setSizeSkew] = useState<number>()
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false)
  const [percent, setPercent] = useState(0)
  const [isCross, setIsCross] = useState<boolean>(true)
  const [leverage, setLeverage] = useState<number>(1)
  const [isInputUsd, setIsInputUsd] = useState<boolean>(true)

  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()

  const maxAllowedUsd = useMemo(() => {
    if (!clearingHouseState) return 0
    if (!isReduceOnly) return Number(clearingHouseState.withdrawable) * leverage
    const existingPosition = clearingHouseState.assetPositions.find((pos) => {
      return pos.position.coin === selectedAsset
    })
    if (!existingPosition) return 0
    if (Number(existingPosition.position.szi) > 0 && isBuy) return 0
    if (Number(existingPosition.position.szi) < 0 && !isBuy) return 0
    const priceQuotient = Number(allMids[selectedAsset]) / Number(existingPosition.position.entryPx)
    const maxAllowedUsd = Number(existingPosition.position.positionValue) * priceQuotient
    return maxAllowedUsd
  }, [isReduceOnly, clearingHouseState, selectedAsset, isBuy, allMids, leverage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!perpsMeta) return
    if (!agentWallet) return
    if (!currentFeeApproval) return
    if (!totalUsd || !totalAssetSize) return
    const orders = calculateScaleOrdersByUsd(
      totalUsd!,
      startPrice!,
      endPrice!,
      totalOrders!,
      sizeSkew!
    )
    const usdOrders = calculateScaleOrdersByUsd(
      totalUsd!,
      startPrice!,
      endPrice!,
      totalOrders!,
      sizeSkew!
    )
    const assetOrders = calculateScaleOrdersByAssetSize(
      totalAssetSize!,
      startPrice!,
      endPrice!,
      totalOrders!,
      sizeSkew!
    )
    console.log({ usdOrders, assetOrders })
    const assetIndex = getPerpsUniverseIndex(perpsMeta.universe, selectedAsset)
    const szDecimals = perpsMeta.universe[assetIndex].szDecimals
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
    const toastId = toast.loading(`Placing ${totalOrders} orders...`)
    try {
      if (!sdkExchangeClient) return
      const placeOrderRes = await sdkExchangeClient.order({
        grouping: 'na',
        builder: {
          b: BUILDER_ADDRESS,
          f: currentFeeApproval
        },
        orders: ordersData.map((order) => ({
          a: order.assetIndex,
          b: order.isBuy,
          p: order.price,
          s: order.size,
          r: order.reduceOnly,
          t: order.orderType
        }))
      })
      console.log(placeOrderRes)
      // TODO: Handle the status of all Orders
      const status = placeOrderRes.response.data.statuses[0]
      if ('error' in status) {
        toast.update(toastId, {
          render: '❌' + status.error,
          type: 'error',
          isLoading: false,
          autoClose: 3000
        })
      } else if ('filled' in status) {
        const filled = status.filled
        const action = isBuy ? 'long' : 'short'
        const assetName = selectedAsset.split('-')[0]
        toast.update(toastId, {
          render: `✅ ${filled.totalSz} ${assetName} ${action} at average price of ${filled.avgPx}`,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        })
      } else if ('resting' in status) {
        toast.update(toastId, {
          render: `✅ Order Placed Successfully`,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        })
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.update(toastId, {
        render: 'Failed to place orders.',
        type: 'error',
        isLoading: false
      })
    }
  }

  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clearingHouseState) return
    const newUsdPercent = parseFloat(e.target.value) || 0
    setPercent(newUsdPercent)
    if (isInputUsd) {
      const totalUsd = (maxAllowedUsd * newUsdPercent) / 100
      const totalAssetSize = totalUsd / (Number(allMids[selectedAsset]) || 1)
      setTotalUsd(totalUsd)
      setTotalAssetSize(totalAssetSize)
    } else {
      const totalAssetSize = (maxAllowedUsd / (Number(allMids[selectedAsset]) || 1)) * newUsdPercent
      const totalUsd = totalAssetSize * (Number(allMids[selectedAsset]) || 1)
      setTotalAssetSize(totalAssetSize)
      setTotalUsd(totalUsd)
    }
  }

  const handleIncrease = () => setTotalOrders((prev) => prev + 1)
  const handleDecrease = () => setTotalOrders((prev) => (prev > 0 ? prev - 1 : 0))
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : 0
    setTotalOrders(isNaN(value) ? 0 : value)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <MarginMode isCross={isCross} setIsCross={setIsCross} />
      <LeverageMargin selectedAsset={selectedAsset} leverage={leverage} setLeverage={setLeverage} />
      <div className="flex-1 mt-6 overflow-y-auto no-scrollbar">
        <div className="flex flex-col w-full rounded-md shadow-md">
          <div className="space-y-2">
            <div className="border-b px-4 mb-1 border-[#FFFFFF0F]">
              <label className="block text-xs font-medium text-gray-300 mb-0.5">Start Price</label>
              <div className="flex">
                <input
                  type="text"
                  value={startPrice ?? '0'}
                  onChange={(e) =>
                    setStartPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="w-full rounded-md p-1.5 focus:outline-none focus:none focus:none text-sm font-medium"
                />
                <span className="text-white flex items-center text-xs font-medium">USDC</span>
              </div>
            </div>
            <div className="border-b px-4 mb-1 border-[#FFFFFF0F]">
              <label className="block text-xs font-medium text-gray-300 mb-0.5">End Price</label>
              <div className="flex">
                <input
                  type="text"
                  value={endPrice ?? '0'}
                  onChange={(e) =>
                    setEndPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="w-full rounded-md p-1.5 focus:outline-none focus:none focus:none text-sm font-medium"
                />
                <span className="text-[#7D67FF] gap-x-1.5 flex items-center text-xs font-medium">
                  <Image
                    src={refreshpurpleIcon}
                    style={{ width: 15, height: 'auto' }}
                    alt="Refresh Icon"
                    className="w-3.5 h-3.5"
                  />
                  Last
                </span>
              </div>
            </div>

            <div className="flex w-full mb-2 items-end px-4 border-b border-[#FFFFFF0F] pb-2">
              <div className="w-5/6">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={percent}
                  onChange={handlePercentChange}
                  className="w-full cursor-pointer appearance-none h-2.5 rounded-lg outline-none"
                  style={{
                    background:
                      'linear-gradient(to right, #5F46F9 0%, #5F46F9 ' +
                      percent +
                      '%, #2A1B3D ' +
                      percent +
                      '%, #2A1B3D 100%)'
                  }}
                />
                <Image src={Slider1} alt="Slider1" width={20} height={20} className="w-full mt-1" />
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
                  value={percent}
                  onChange={handlePercentChange}
                />
                <span className="absolute right-2 top-2.5 text-gray-500">%</span>
              </div>
            </div>

            <div className="border-b px-4 mb-1 border-[#FFFFFF0F]">
              <div className="flex mb-1 justify-between">
                <label className="block text-xs font-medium text-gray-300 mb-0.5">Total Size</label>
                <span className="block text-xs font-medium text-[#8B8BA0]">
                  Max:{' '}
                  {isInputUsd
                    ? `${maxAllowedUsd.toFixed(2)} USDC`
                    : `${(maxAllowedUsd / (Number(allMids[selectedAsset]) || 1)).toFixed(2)} ${selectedAsset}`}
                </span>
              </div>
              <div className="flex relative">
                <input
                  type="number"
                  value={isInputUsd ? (totalUsd ?? '') : (totalAssetSize ?? '')}
                  onChange={(e) => {
                    if (isInputUsd) {
                      const totalUsd = parseFloat(e.target.value)
                      const totalAssetSize = totalUsd / (Number(allMids[selectedAsset]) || 1)
                      setTotalUsd(totalUsd)
                      setTotalAssetSize(totalAssetSize)
                      setPercent((totalUsd / maxAllowedUsd) * 100)
                    } else {
                      const totalAssetSize = parseFloat(e.target.value)
                      const totalUsd = totalAssetSize * (Number(allMids[selectedAsset]) || 1)
                      setTotalAssetSize(totalAssetSize)
                      setTotalUsd(totalUsd)
                      setPercent((totalUsd / maxAllowedUsd) * 100)
                    }
                  }}
                  className="w-full rounded-md p-1.5 focus:outline-none text-sm font-medium pr-20"
                  placeholder={isInputUsd ? '0.00' : '0.0000'}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  <select
                    value={isInputUsd ? 'usd' : 'asset'}
                    onChange={(e) => setIsInputUsd(e.target.value === 'usd')}
                    className="bg-transparent border-none outline-none text-[#8B8BA0] text-xs cursor-pointer"
                  >
                    <option value="usd">USDC</option>
                    <option value="asset">{selectedAsset}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-4 border-b mb-1 border-[#FFFFFF0F]">
              <span className="block text-xs font-medium text-gray-300 mb-0.5">Scale Settings</span>
              <label className="mb-2">
                <span className="block text-xs font-medium text-gray-300 mb-0.5">
                  Number of Orders
                </span>
                <div className="flex items-center gap-2 mb-1 rounded-lg">
                  <button
                    onClick={handleDecrease}
                    className="rounded-md px-3 py-1.5 border border-white/10 bg-white/10 cursor-pointer"
                  >
                    <Image
                      src={minusicon}
                      style={{ width: 20, height: 20 }}
                      className="pr-1"
                      alt="minusicon"
                    />
                  </button>
                  <input
                    type="text"
                    value={totalOrders}
                    onChange={handleChange}
                    className="w-full text-center rounded-md px-3 py-1.5 border-2 border-white/10 bg-white/10 text-sm font-medium focus:outline-none"
                  />
                  <button
                    onClick={handleIncrease}
                    className="rounded-md px-3 py-1.5 border border-white/10 bg-white/10 cursor-pointer"
                  >
                    <Image
                      src={plusicon}
                      style={{ width: 20, height: 20 }}
                      className="pr-1"
                      alt="plusicon"
                    />
                  </button>
                </div>
              </label>
            </div>

            <div className="px-4 border-b mb-1 pb-2 border-[#FFFFFF0F]">
              <label className="block text-xs font-medium text-gray-300 mb-0.5">Size Skew</label>
              <input
                type="text"
                value={sizeSkew ?? ''}
                onChange={(e) =>
                  setSizeSkew(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="0.00"
                className="w-full rounded-md px-3 py-1.5 border-2 border-white/10 bg-white/10 text-sm font-medium focus:outline-none"
              />
            </div>
            <label className="mb-1 mt-1 px-4 flex items-center">
              <CheckBox
                label=""
                setIsChecked={(checked) => setIsReduceOnly(checked)}
                isChecked={isReduceOnly}
              />
              <span className="text-xs font-medium text-[#E8E0F1]">Reduce Only</span>
            </label>
          </div>
        </div>
      </div>

      <div className="p-4 pb-4 border-t border-white/10">
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
            disabled={totalUsd! > maxAllowedUsd}
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
