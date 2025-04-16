import React from 'react'
import Image from 'next/image'
import { useHyperLiquid } from '@/context/HyperLiquid'
import editicon from '@/assets/images/edit_icon.svg'
import infoicon from '@/assets/images/info_icon.svg'
import shortingicon from '@/assets/images/shorting_icon.svg'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'
import { IPosition } from '@/utils/hyperliquid/hyperLiquidTypes'
import { formatPrice, getUniverseIndex } from '@/utils/utils'
import { placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { BUILDER_ADDRESS } from '@/utils/constants'
import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'

const columns = [
  { key: 'coin', label: 'Position' },
  { key: 'entryPx', label: 'Entry Price' },
  { key: 'markPx', label: 'Mark Price' },
  { key: 'fundingPnl', label: 'Funding P&L' },
  { key: 'size', label: 'Size' },
  { key: 'unrealizedPnl', label: 'Unrealized PnL' },
  { key: 'liquidationPx', label: 'Liq. Price' },
  { key: 'marginUsed', label: 'Margin' },
  { key: 'status', label: 'Status' }
]

const Positions = () => {
  const { address } = useAccount()
  const { clearingHouseState, universe, sdk, agentWallet, isTestnet, hyperliquidAxios, allMids } =
    useHyperLiquid()

  const { data: currentFeeApproval } = useQuery<number>({
    queryKey: ['maxBuilderFee', address, BUILDER_ADDRESS]
  })

  console.log(clearingHouseState)

  const closePosition = async ({ position }: IPosition) => {
    if (!agentWallet) return
    if (!currentFeeApproval) return
    const assetIndex = getUniverseIndex(universe, position.coin)
    const szDecimals = universe[assetIndex].szDecimals
    const tif = 'Gtc'
    const isBuy = !(position.szi > 0)
    const res = await sdk.exchange.updateLeverage(
      position.coin,
      position.leverage.type,
      position.leverage.value
    )
    const price = isBuy ? allMids[position.coin] * 1.1 : allMids[position.coin] * 0.9
    console.log(res)
    const order = await placeOrder(agentWallet, isTestnet, hyperliquidAxios, {
      grouping: 'na',
      builder: {
        address: BUILDER_ADDRESS,
        fee: currentFeeApproval
      },
      orders: [
        {
          assetIndex: assetIndex,
          isBuy: isBuy,
          reduceOnly: true,
          price: formatPrice(price, szDecimals),
          size: Math.abs(position.szi).toString(),
          orderType: {
            limit: {
              tif: tif
            }
          }
        }
      ]
    })
    console.log(order)
  }

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full hidden lg:table text-white">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="pt-3 pb-1 px-7 text-sm font-normal text-[#8B8BA0] text-left"
              >
                <div className="flex justify-start items-center gap-1">
                  <Image
                    src={shortingicon}
                    alt="Sort"
                    height={16}
                    width={16}
                    className="w-3 h-3 cursor-pointer"
                  />
                  <span>{col.label}</span>
                  <Image
                    src={infoicon}
                    alt="Info"
                    height={16}
                    width={16}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
              </th>
            ))}
            <th className="pt-3 pb-1 px-7 text-left text-sm font-normal text-[#7D67FF]">
              <button
                className="cursor-pointer hover:text-indigo-300 font-medium py-2 mr-2"
                onClick={() => {
                  clearingHouseState?.assetPositions?.forEach((position) => {
                    closePosition(position)
                  })
                }}
              >
                Close all positions
              </button>
            </th>
            <th className="pt-3 pb-1 pl-2 pr-10 text-left text-sm font-normal text-[#8B8BA0]">
              <div className="flex justify-start items-center gap-1">
                <Image
                  src={shortingicon}
                  alt="Sort"
                  height={16}
                  width={16}
                  className="w-3 h-3 cursor-pointer"
                />
                <span>{'TP/SL for position'}</span>
                <Image
                  src={infoicon}
                  alt="Info"
                  height={16}
                  width={16}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {clearingHouseState?.assetPositions?.map((position, index) => (
            <tr key={index} className="border-b border-white/10">
              <td className="py-4 px-7 text-[#FFFFFF] opacity-80 font-normal text-sm">
                <div className="flex items-center gap-1">
                  <span
                    className={`w-[4px] h-[36px] rounded-sm ${index % 2 === 0 ? 'bg-[#E2464A]' : 'bg-[#2FA766]'}`}
                  ></span>
                  <Image src={bitcoinicon} alt="Bitcoin" className="w-6 h-6 mx-1 cursor-pointer" />
                  {position.position.coin}{' '}
                  <span className="text-[#7D67FF] ml-1 px-1 py-1 rounded-lg bg-[#5F46F91A] font-semibold text-sm">
                    {position.position.leverage.value}
                  </span>
                </div>
              </td>
              <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.position.entryPx}
              </td>
              <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.position.entryPx}
              </td>
              <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.position.cumFunding.allTime}
              </td>
              <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.position.szi}
              </td>
              <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.position.unrealizedPnl}
              </td>
              <td className="py-4 px-7 opacity-80 text-[#E2464A] font-normal text-sm">
                {position.position.liquidationPx}
              </td>
              <td className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.position.liquidationPx}
              </td>
              <td className="py-4 px-7 opacity-80 text-[#FFFFFF]">
                <span className="bg-[#1F1F30] font-medium text-sm px-2 py-1 text-[#2FA766] rounded-lg">
                  Open
                </span>
              </td>
              <td className="py-4 opacity-80 text-[#7D67FF] text-sm px-7">
                <button
                  className="px-3 cursor-pointer hover:text-indigo-300 font-medium py-2 mr-2"
                  onClick={() => closePosition(position)}
                >
                  Cancel
                </button>
                <span className="px-3 font-medium py-2">Limit</span>
                <span className="px-3 py-2 text-sm bg-[#322944] ml-2 text-white bg-opacity-10 border-2 border-white/10 border-opacity-10 rounded-md">
                  dummy
                </span>
                <span className="px-3 text-sm py-2 bg-[#322944] ml-2 text-white bg-opacity-10 border-2 border-white/10 border-opacity-10 rounded-md">
                  dummy
                </span>
              </td>
              <td className="py-4 opacity-80 text-[#FFFFFF] font-normal text-sm px-7">
                {true ? (
                  <div className="flex items-center gap-2">
                    <span className="w-17 break-words overflow-hidden">Dummy</span>
                    <Image src={editicon} alt="Edit" className="w-4 h-4 cursor-pointer" />
                  </div>
                ) : (
                  '-/-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Positions
