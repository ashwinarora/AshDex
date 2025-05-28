import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
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
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { hyperliquidAxios } from '@/config/axios'
import { isTestnet } from '@/utils/constants'
import LimitCloseModal from './component/LimitCloseModal'
import MarketCloseModal from './component/MarketCloseModal'

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

const RenderRowData: React.FC<RenderRowProps> = ({ item }) => {
  return (
    <div className="flex flex-col gap-2 text-white text-sm">
      <div className="flex justify-between">
        <div className="flex items-center gap-1">
          <span className={`w-[4px] h-[30px] rounded-sm bg-green`}></span>
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
        <span className="text-sm text-red font-medium">{item?.liquidationPx}</span>{' '}
      </div>
      <div className="flex justify-between">
        <span className="text-[#8B8BA0]">Margin</span>{' '}
        <span className="text-sm font-medium">{item?.liquidationPx}</span>{' '}
      </div>
      <div className="flex justify-between">
        <span className="text-[#8B8BA0]">Status</span>{' '}
        <span className="bg-[#1F1F30] text-sm font-medium text-green px-1.5 py-0.5 rounded-lg">
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

const Positions = () => {
  const { isConnected } = useAccount()
  const { clearingHouseState, agentWallet, allMids } = useHyperliquid()
  const { data: universe } = usePerpsUniverse()
  const { sdk } = useHyperliquid()
  const [sorting, setSorting] = useState<SortingState>([])
  const [mounted, setMounted] = useState(false)
  const [isLimitCloseModalOpen, setIsLimitCloseModalOpen] = useState(false)
  const [isMarketCloseModalOpen, setIsMarketCloseModalOpen] = useState(false)
  const [closingAsset, setClosingAsset] = useState<string | null>(null)

  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()

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
              price: formatPrice(price, szDecimals).toString(),
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
                className={`w-[4px] h-[36px] rounded-sm ${szi < 0 ? 'bg-red' : 'bg-green'}`}
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
      helper.accessor('positionValue', {
        id: 'positionValue',
        header: () => <HeaderWithIcons label="Position Value" />,
        meta: { label: 'Position Value' },
        cell: (info) => `$${info.getValue().toFixed(2)}`
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
        cell: () => {
          return (
            <span className="bg-[#1F1F30] font-medium text-sm px-2 py-1 text-green rounded-lg">
              Open
            </span>
          )
        },
        meta: { label: 'Status' }
      }),
      helper.display({
        id: 'actions',
        header: () =>
          !isAgentApproved || currentFeeApproval === 0 ? (
            <button
              className="text-sm font-medium text-[#8B8BA0] underline hover:text-indigo-300"
              onClick={openAgentModal}
            >
              Connect
            </button>
          ) : (
            <span className="text-sm font-medium text-[#8B8BA0]">Close All</span>
          ),
        cell: (info) => {
          const position = info.row.original
          return (
            <div className="flex items-center gap-2">
              {!isAgentApproved || currentFeeApproval === 0 ? (
                <button
                  className="px-3 cursor-pointer hover:text-indigo-300 font-medium py-1 mr-2 hover:underline"
                  onClick={openAgentModal}
                >
                  Connect
                </button>
              ) : (
                <div>
                  <button
                    className="px-3 cursor-pointer hover:text-indigo-300 font-medium py-1 mr-2 hover:underline"
                    onClick={() => {
                      setClosingAsset(position.coin)
                      setIsLimitCloseModalOpen(true)
                    }}
                  >
                    Limit
                  </button>
                  <button
                    className="px-3 cursor-pointer hover:text-indigo-300 font-medium py-1 mr-2 hover:underline"
                    onClick={() => {
                      setClosingAsset(position.coin)
                      setIsMarketCloseModalOpen(true)
                    }}
                  >
                    Market
                  </button>
                </div>
              )}
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
    [helper, closePosition, isAgentApproved, currentFeeApproval, openAgentModal]
  )

  useEffect(() => {
    console.log(openAgentModal)
  }, [openAgentModal])

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

  if (!mounted) {
    return <div className="overflow-x-auto w-full px-3 lg:px-4 h-40"></div>
  }

  if (!isConnected) {
    return <WalletNotConnected />
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
      {isLimitCloseModalOpen && closingAsset && (
        <LimitCloseModal
          isOpen={isLimitCloseModalOpen}
          onClose={() => setIsLimitCloseModalOpen(false)}
          closingAsset={closingAsset}
        />
      )}
      {isMarketCloseModalOpen && closingAsset && (
        <MarketCloseModal
          isOpen={isMarketCloseModalOpen}
          onClose={() => setIsMarketCloseModalOpen(false)}
          closingAsset={closingAsset}
        />
      )}
    </div>
  )
}

export default dynamic(() => Promise.resolve(Positions), { ssr: false })
