import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useHyperLiquid } from '@/context/HyperLiquid'
import editicon from '@/assets/images/edit_icon.svg'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'
import { IPositionData } from '@/utils/hyperliquid/hyperLiquidTypes'
import { formatPrice, getUniverseIndex } from '@/utils/utils'
import { placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table'
import HeaderWithIcons from './component/HeaderWithIcon'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import { useAccount } from 'wagmi'
import dynamic from 'next/dynamic'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { toast } from 'react-toastify'

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

const Positions = () => {
  const { isConnected } = useAccount()
  const { clearingHouseState, universe, sdk, agentWallet, isTestnet, hyperliquidAxios, allMids } =
    useHyperLiquid()
  const [sorting, setSorting] = useState<SortingState>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const helper = useMemo(
    () => createColumnHelper<IPositionData & { meta?: { label: string } }>(),
    []
  )

  const allMidsRef = useRef(allMids)
  useEffect(() => {
    allMidsRef.current = allMids
  }, [allMids])

  const closePosition = useCallback(
    async (position: IPositionData) => {
      if (!agentWallet) return
      const assetIndex = getUniverseIndex(universe, position.coin)
      const szDecimals = universe[assetIndex].szDecimals
      const tif = 'Gtc'
      const isBuy = !(position.szi > 0)
      const toastId = toast.loading('Closing position...')
      try {
        const res = await sdk.exchange.updateLeverage(
          position.coin,
          position.leverage.type,
          position.leverage.value
        )
        console.log(res)
        const mid = allMidsRef.current[position.coin]
        const price = isBuy ? mid * 1.1 : mid * 0.9
        const order = await placeOrder(agentWallet, isTestnet, hyperliquidAxios, {
          grouping: 'na',
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
        const status = order.data.response.data.statuses[0]
        if (status.error) {
          toast.update(toastId, {
            render: '❌' + status.error,
            type: 'error',
            isLoading: false,
            autoClose: 3000
          })
        } else {
          toast.update(toastId, {
            render: '✅ Order placed successfully',
            type: 'success',
            isLoading: false,
            autoClose: 2000
          })
        }
      } catch (error) {
        console.error('Error closing position:', error)
        toast.update(toastId, {
          render: '❌' + error,
          type: 'error',
          isLoading: false,
          autoClose: 2000
        })
      }
    },
    [agentWallet, universe, sdk, isTestnet, hyperliquidAxios]
  )

  const columns = useMemo(
    () => [
      helper.accessor('coin', {
        id: 'coin',
        header: 'Position',
        cell: (info) => {
          const coin = info.getValue()
          const { szi, leverage } = info.row.original
          return (
            <div className="flex items-center gap-1">
              <span
                className={`w-[4px] h-[36px] rounded-sm ${szi < 0 ? 'bg-[#E2464A]' : 'bg-[#2FA766]'}`}
              ></span>
              <Image
                src={bitcoinicon}
                alt="Bitcoin"
                style={{ width: 24, height: 'auto' }}
                className="w-6 h-6 mx-1 cursor-pointer"
              />
              {coin}{' '}
              <span className="text-[#7D67FF] ml-1 px-1 py-1 rounded-lg bg-[#5F46F91A] font-semibold text-sm">
                {leverage.value}x
              </span>
            </div>
          )
        },
        meta: { label: 'Coin' }
      }),
      helper.accessor('entryPx', {
        id: 'entryPx',
        header: () => <HeaderWithIcons label="Entry Price" />,
        meta: { label: 'Entry Price' }
      }),
      helper.accessor('cumFunding.allTime', {
        id: 'cumFunding.allTime',
        header: () => <HeaderWithIcons label="Funding P&L" />,
        meta: { label: 'Funding P&L' }
      }),
      helper.accessor('szi', {
        id: 'szi',
        header: () => <HeaderWithIcons label="Size" />,
        meta: { label: 'Size' }
      }),
      helper.accessor('unrealizedPnl', {
        id: 'unrealizedPnl',
        header: () => <HeaderWithIcons label="Unrealized PnL" />,
        meta: { label: 'Unrealized PnL' }
      }),
      helper.accessor('liquidationPx', {
        id: 'liquidationPx',
        header: () => <HeaderWithIcons label="Liq. Price" />,
        meta: { label: 'Liq. Price' }
      }),
      helper.accessor('marginUsed', {
        id: 'marginUsed',
        header: () => <HeaderWithIcons label="Margin" />,
        meta: { label: 'Margin' }
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
        },
        meta: { label: 'Status' }
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
        },
        meta: { label: 'Actions' }
      }),
      helper.display({
        id: 'tp_sl',
        header: () => <HeaderWithIcons label="TP/SL for position" />,
        cell: ({ row }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { tp_sl } = row.original as any
          const tp = tp_sl?.tp
          const sl = tp_sl?.sl
          return (
            <div className="flex items-center gap-2">
              {tp && sl ? (
                <span className="w-17 break-words overflow-hidden">
                  {tp}/{sl}
                </span>
              ) : (
                '-/-'
              )}
              <Image
                src={editicon}
                alt="Edit"
                style={{ width: 16, height: 'auto' }}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          )
        },
        meta: { label: 'TP/SL for position' }
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

  const RenderRowData: React.FC<RenderRowProps> = ({ item }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        <div className="flex justify-between">
          <div className="flex items-center gap-1">
            <span className={`w-[4px] h-[30px] rounded-sm ${'bg-[#2FA766]'}`}></span>
            <Image
              src={bitcoinicon}
              alt="Bitcoin"
              style={{ width: 24, height: 'auto' }}
              className="w-6 h-6 mx-1 cursor-pointer"
            />
            {item?.coin}{' '}
            <span className="text-[#7D67FF] ml-1 px-1.5 py-1 rounded-lg bg-[#5F46F91A] font-semibold text-xs">
              {item?.leverage?.value + 'x'}
            </span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Entry Price</span>{' '}
          <span className="text-sm font-medium">{item?.entryPx}</span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Mark Price</span>{' '}
          <span className="text-sm font-medium">{item?.entryPx}</span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Funding P&L</span>{' '}
          <span className="text-sm font-medium">{item?.cumFunding?.allTime}</span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Size</span>{' '}
          <span className="text-sm font-medium">{item?.szi}</span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Unrealized PnL</span>{' '}
          <span className="text-sm font-medium">{item?.unrealizedPnl}</span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Liq. Price</span>{' '}
          <span className="text-sm text-[#E2464A] font-medium">{item?.liquidationPx}</span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Margin</span>{' '}
          <span className="text-sm font-medium">{item?.liquidationPx}</span>{' '}
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B8BA0]">Status</span>{' '}
          <span className="bg-[#1F1F30] text-sm font-medium text-[#2FA766] px-1.5 py-0.5 rounded-lg">
            {'Open'}
          </span>{' '}
        </div>
        <div className="flex justify-between gap-1">
          <div className="flex font-medium items-center text-[#7D67FF] text-sm">
            <span className="pr-3 py-2">Market</span>
            <span className="px-3 py-2">Limit</span>
          </div>
          <div className="flex items-center">
            <span className="px-3 py-1 text-sm bg-[#322944] ml-2 text-white bg-opacity-10 border-2 border-white/10 border-opacity-10 rounded-md">
              dummy
            </span>
            <span className="px-3 text-sm py-1.5 bg-[#322944] ml-2 text-white bg-opacity-10 border-2 border-white/10 border-opacity-10 rounded-md">
              dummy
            </span>
          </div>
        </div>
        <div className="flex justify-between gap-1">
          <span className="text-[#8B8BA0]">TP/SL for position</span>
          <span>
            {item?.tp_sl?.tp && item?.tp_sl?.sl ? (
              <div className="flex items-center gap-x-1">
                <span className="w-17 break-words overflow-hidden">
                  {item.tp_sl.tp}/{item.tp_sl.sl}
                </span>
                <Image
                  src={editicon}
                  alt="Edit"
                  style={{ width: 16, height: 'auto' }}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
            ) : (
              '-/-'
            )}
          </span>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return <WalletNotConnected />
  }

  if (!mounted) {
    return <div className="overflow-x-auto w-full px-3 lg:px-4 h-40"></div>
  }

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full hidden lg:table text-white">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="pt-3 pb-1 px-5 text-sm font-normal text-[#8B8BA0] text-left cursor-pointer"
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
                  className="py-4 px-5 opacity-80 text-[#FFFFFF] font-normal text-sm"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={columns.map((col) => ({
          key: col.id as string,
          label: col.meta && 'label' in col.meta ? String(col.meta.label) : ''
        }))}
        data={table.getRowModel().rows.map((row) => row.original)}
        renderRow={(item) => (
          <RenderRowData
            item={item}
            columns={columns.map((col) => ({
              key: col.id as string,
              label: col.meta && 'label' in col.meta ? String(col.meta.label) : ''
            }))}
          />
        )}
        positionTab={true}
      />
    </div>
  )
}

export default dynamic(() => Promise.resolve(Positions), { ssr: false })
