import React, { useCallback, useMemo, useState } from 'react'
import Image from 'next/image'
import { useHyperLiquid } from '@/context/HyperLiquid'
import editicon from '@/assets/images/edit_icon.svg'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'
import { IPositionData } from '@/utils/hyperliquid/hyperLiquidTypes'
import { formatPrice, getUniverseIndex } from '@/utils/utils'
import { placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { BUILDER_ADDRESS } from '@/utils/constants'
import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table'
import HeaderWithIcons from './component/HeaderWithIcon'

const Positions = () => {
  const { address } = useAccount()
  const { clearingHouseState, universe, sdk, agentWallet, isTestnet, hyperliquidAxios, allMids } =
    useHyperLiquid()
  const [sorting, setSorting] = useState<SortingState>([])

  const { data: currentFeeApproval } = useQuery<number>({
    queryKey: ['maxBuilderFee', address, BUILDER_ADDRESS]
  })

  const helper = useMemo(() => createColumnHelper<IPositionData>(), [])

  const closePosition = useCallback(
    async (position: IPositionData) => {
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
    },
    [agentWallet, currentFeeApproval, universe, sdk, allMids, isTestnet, hyperliquidAxios]
  )

  const columns = useMemo(
    () => [
      helper.accessor('coin', {
        header: 'Position',
        cell: (info) => {
          const coin = info.getValue()
          const { szi, leverage } = info.row.original
          return (
            <div className="flex items-center gap-1">
              <span
                className={`w-[4px] h-[36px] rounded-sm ${szi < 0 ? 'bg-[#E2464A]' : 'bg-[#2FA766]'}`}
              ></span>
              <Image src={bitcoinicon} alt="Bitcoin" className="w-6 h-6 mx-1 cursor-pointer" />
              {coin}{' '}
              <span className="text-[#7D67FF] ml-1 px-1 py-1 rounded-lg bg-[#5F46F91A] font-semibold text-sm">
                {leverage.value}x
              </span>
            </div>
          )
        }
      }),
      helper.accessor('entryPx', {
        header: () => <HeaderWithIcons label="Entry Price" />
      }),
      helper.accessor('cumFunding.allTime', {
        header: () => <HeaderWithIcons label="Funding P&L" />
      }),
      helper.accessor('szi', {
        header: () => <HeaderWithIcons label="Size" />
      }),
      helper.accessor('unrealizedPnl', {
        header: () => <HeaderWithIcons label="Unrealized PnL" />
      }),
      helper.accessor('liquidationPx', {
        header: () => <HeaderWithIcons label="Liq. Price" />
      }),
      helper.accessor('marginUsed', {
        header: () => <HeaderWithIcons label="Margin" />
      }),
      helper.display({
        id: 'status',
        header: () => <HeaderWithIcons label="Status" />,
        cell: (info) => {
          const status = info.row.original
          return (
            <span className="bg-[#1F1F30] font-medium text-sm px-2 py-1 text-[#2FA766] rounded-lg">
              {status.szi > 0 ? 'Open' : 'Closed'}
            </span>
          )
        }
      }),
      helper.display({
        id: 'actions',
        header: () => <HeaderWithIcons label="Actions" />,
        cell: (info) => {
          const position = info.row.original
          return (
            <div className="flex items-center gap-2">
              <button
                className="px-3 cursor-pointer hover:text-indigo-300 font-medium py-2 mr-2"
                onClick={() => closePosition(position)}
              >
                Close
              </button>
              <span className="px-3 font-medium py-2">Limit</span>
              <span className="px-3 py-2 text-sm bg-[#322944] ml-2 text-white bg-opacity-10 border-2 border-white/10 border-opacity-10 rounded-md">
                dummy
              </span>
              <span className="px-3 text-sm py-2 bg-[#322944] ml-2 text-white bg-opacity-10 border-2 border-white/10 border-opacity-10 rounded-md">
                dummy
              </span>
            </div>
          )
        }
      }),
      helper.display({
        id: 'tp_sl',
        header: () => <HeaderWithIcons label="TP/SL for position" />,
        cell: () => {
          return (
            <div className="flex items-center gap-2">
              {true ? <span className="w-17 break-words overflow-hidden">Dummy</span> : '-/-'}
              <Image src={editicon} alt="Edit" className="w-4 h-4 cursor-pointer" />
            </div>
          )
        }
      })
    ],
    [helper, closePosition]
  )

  const tableData = useMemo(() => {
    if (!clearingHouseState?.assetPositions) return []
    return clearingHouseState.assetPositions.map((pos) => pos.position)
  }, [clearingHouseState?.assetPositions])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true
  })

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full hidden lg:table text-white">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="pt-3 pb-1 px-7 text-sm font-normal text-[#8B8BA0] text-left cursor-pointer"
                  onClick={
                    header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-white/10">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Positions
