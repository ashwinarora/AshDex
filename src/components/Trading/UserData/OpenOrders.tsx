'use client'
import { useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { useWalletModal } from '@/context/WalletModalContext'
import useIsSpot from '@/hooks/useIsSpot'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table'
import HeaderWithIcons from './component/HeaderWithIcon'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import { IOpenOrder } from '@/utils/hyperliquid/webData2Types'

const columnHelper = createColumnHelper<IOpenOrder>()

const OpenOrders = () => {
  const { isConnected } = useAccount()
  const { toggleConnectWalletModal } = useWalletModal()
  const { sdk, openOrders } = useHyperLiquid()
  const isSpot = useIsSpot()

  const data = useMemo(
    () => openOrders.filter((o) => o.coin.includes(isSpot ? 'SPOT' : 'PERP')),
    [openOrders, isSpot]
  )

  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(
    () => [
      columnHelper.accessor('coin', {
        header: () => <HeaderWithIcons label="Coin" />,
        cell: (info) => (
          <span className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
            {info.getValue()}
          </span>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('side', {
        header: () => <HeaderWithIcons label="Side" />,
        cell: (info) => (
          <span className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
            {info.getValue()}
          </span>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('limitPx', {
        header: () => <HeaderWithIcons label="Limit Price" />,
        cell: (info) => (
          <span className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
            {info.getValue()}
          </span>
        )
      }),
      columnHelper.accessor('sz', {
        header: () => <HeaderWithIcons label="Size" />,
        cell: (info) => (
          <span className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
            {info.getValue()}
          </span>
        )
      }),
      columnHelper.accessor('oid', {
        header: () => <HeaderWithIcons label="Order ID" />,
        cell: (info) => (
          <span className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
            {info.getValue()}
          </span>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('timestamp', {
        header: () => <HeaderWithIcons label="Timestamp" />,
        cell: (info) => (
          <span className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
            {new Date(info.getValue()).toLocaleString()}
          </span>
        )
      }),
      columnHelper.accessor('origSz', {
        header: () => <HeaderWithIcons label="Original Size" />,
        cell: (info) => (
          <span className="py-4 px-7 opacity-80 text-[#FFFFFF] font-normal text-sm">
            {info.getValue()}
          </span>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: () => (
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded cursor-pointer"
            onClick={async () => {
              await sdk.custom.cancelAllOrders()
            }}
          >
            Cancel All
          </button>
        ),
        cell: ({ row }) => (
          <button
            className="py-1 px-2 cursor-pointer bg-red-500 hover:bg-red-700 text-white font-bold rounded"
            onClick={async () => {
              const order = row.original
              await sdk.exchange.cancelOrder({ coin: order.coin, o: order.oid })
            }}
          >
            Cancel
          </button>
        ),
        enableSorting: false
      })
    ],
    [sdk]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  if (!isConnected) {
    return <WalletNotConnected />
  }

  return (
    <div className="overflow-x-auto w-full px-3">
      {isConnected ? (
        <table className="w-full text-white">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="pt-3 pb-1 max-[1025px]:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-left cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
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
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex my-8 max-[1025px]:pt-0 pt-7 flex-col text-center justify-center items-center w-full">
          <span className="font-medium text-center my-2.5 text-base text-[#FFFFFF]">
            You have no orders.
          </span>
          <button
            onClick={toggleConnectWalletModal}
            className="2xl:px-[20px] max-lg:mt-1 mt-5 px-[11px] flex items-center py-[10px] bg-primary font-bold text-[#FFFFFF] text-sm rounded-md md:rounded-xl cursor-pointer"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  )
}

export default OpenOrders
