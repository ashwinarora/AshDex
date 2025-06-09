'use client'
import { SpotOrder } from '@/utils/hyperliquid/hyperLiquidTypes'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { useWalletModal } from '@/context/WalletModalContext'
import { OPEN_ORDERS_SPOT_COLUMNS } from '@/utils/constants'
import infoicon from '@/assets/images/info_icon.svg'
import sortingIcon from '@/assets/images/sorting_icon.svg'
import noordericon from '@/assets/images/noorder_icon.svg'
import deleteicon from '@/assets/images/delete_icon.svg'

// Dummy spot orders array
const spotOrders: SpotOrder[] = Array.from({ length: 10 }, (_, index) => ({
  time: '11/05/25  12:35:16',
  symbol: 'BTC/USDT',
  symbolText: 'Quarterly 0925',
  type: 'Take Profit Market',
  side: 'Close Short',
  price: '98,284.03 USDC',
  amount: '12.34567 BTC',
  filled: '12.1234 BTC',
  reduceOnly: 'No',
  postOnly: 'Yes',
  triggerConditions: '95,2194.29',
  tp_sl: 'View',
  id: index + 1
}))

const OpenOrdersSpot = () => {
  const { isConnected } = useAccount()
  const { toggleConnectWalletModal } = useWalletModal()
  const columns = OPEN_ORDERS_SPOT_COLUMNS

  if (!isConnected) {
    return (
      <div className="flex my-8 max-[1025px]:pt-0 pt-7 flex-col text-center justify-center items-center w-full">
        <Image
          src={noordericon}
          style={{ width: 90, height: 'auto' }}
          alt="No Orders"
          className="h-[93px] w-[93px] max-[770px]:w-[70px] max-[770px]:h-[70px]"
        />
        <span className="font-medium text-center my-2.5 text-base text-white">
          You have no orders.
        </span>
        <button
          onClick={toggleConnectWalletModal}
          className="2xl:px-[20px] max-[770px]:mt-1 mt-5 px-[11px] flex items-center py-[10px] bg-[#5F46F9] font-bold text-white text-sm rounded-md md:rounded-xl cursor-pointer"
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full text-white">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col?.key}
                className="pt-3 pb-1 max-[1025px]:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-left"
              >
                <div className="flex justify-start items-center gap-1">
                  {col?.label && (
                    <>
                      <Image
                        src={sortingIcon}
                        alt="Sort"
                        style={{ width: 12, height: 'auto' }}
                        className="w-3 h-3 cursor-pointer"
                      />
                      <span>{col.label}</span>
                      <Image
                        src={infoicon}
                        alt="Info"
                        style={{ width: 16, height: 'auto' }}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spotOrders.map((order) => (
            <tr key={order.id} className="border-b border-white/10">
              <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-white font-normal text-sm">
                {order.time}
              </td>
              <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-white font-normal text-sm">
                <div className="flex flex-col gap-1">
                  <span>{order.symbol}</span>
                  <span className="text-[#8B8BA0] text-xs font-normal">{order.symbolText}</span>
                </div>
              </td>
              <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-white font-normal text-sm">
                {order.type}
              </td>
              <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-white font-normal text-sm">
                {order.side}
              </td>
              <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-white font-normal text-sm">
                {order.price}
              </td>
              <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-white font-normal text-sm">
                {order.amount}
              </td>
              <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-white font-normal text-sm">
                {order.filled}
              </td>
              <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-white font-normal text-sm">
                <span className="text-red ml-1 px-1.5 py-1 rounded-lg bg-[#1F1F30] font-semibold text-sm">
                  {order.reduceOnly}
                </span>
              </td>
              <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-white font-normal text-sm">
                <span className="text-green ml-1 px-1.5 py-1 rounded-lg bg-[#1F1F30] font-semibold text-sm">
                  {order.postOnly}
                </span>
              </td>
              <td className="py-2.5 pr-7 max-[1025px]:px-7 opacity-80 text-white font-normal text-sm">
                <div className="flex flex-col gap-1">
                  <span>{order.triggerConditions}</span>
                  <span className="text-[#8B8BA0] text-xs font-normal">Mark Price</span>
                </div>
              </td>
              <td className="py-2.5 pr-7 max-[1025px]:px-7 text-[#7D67FF] font-medium text-sm">
                {order.tp_sl}
              </td>
              <td className="py-2.5 pl-7 max-[1450px]:px-2 text-white font-normal text-sm">
                <Image
                  src={deleteicon}
                  alt="Delete"
                  style={{ width: 16, height: 'auto' }}
                  className="w-4 h-4 cursor-pointer"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OpenOrdersSpot
