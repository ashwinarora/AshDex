'use client'
import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useHyperLiquid } from '@/context/HyperLiquid'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  SortingState
} from '@tanstack/react-table'
import { ITradeHistory } from '@/utils/hyperliquid/hyperLiquidTypes'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import dynamic from 'next/dynamic'

const columnHelper = createColumnHelper<ITradeHistory>()

const columns = [
  columnHelper.accessor('coin', {
    header: 'Coin',
    cell: (info) => info.getValue(),
    enableSorting: false
  }),
  columnHelper.accessor('px', {
    header: 'Price',
    cell: (info) => info.getValue(),
    enableSorting: true,
    sortingFn: (rowA, rowB) => Number(rowA.original.px) - Number(rowB.original.px)
  }),
  columnHelper.accessor('sz', {
    header: 'Size',
    cell: (info) => info.getValue(),
    enableSorting: true,
    sortingFn: (rowA, rowB) => Number(rowA.original.sz) - Number(rowB.original.sz)
  }),
  columnHelper.accessor('side', {
    header: 'Side',
    cell: (info) => info.getValue(),
    enableSorting: false
  }),
  columnHelper.accessor('time', {
    header: 'Time',
    cell: (info) => new Date(info.getValue()).toLocaleString(),
    enableSorting: true,
    sortingFn: (rowA, rowB) => rowA.original.time - rowB.original.time
  }),
  columnHelper.accessor('dir', {
    header: 'Direction',
    cell: (info) => info.getValue(),
    enableSorting: false
  }),
  columnHelper.accessor('closedPnl', {
    header: 'Closed PnL',
    cell: (info) => info.getValue(),
    enableSorting: true,
    sortingFn: (rowA, rowB) => Number(rowA.original.closedPnl) - Number(rowB.original.closedPnl)
  }),
  columnHelper.accessor('crossed', {
    header: 'Crossed',
    cell: (info) => (info.getValue() ? 'Yes' : 'No'),
    enableSorting: false
  })
]

const TradeHistoryTable: React.FC = () => {
  const { address, isConnected } = useAccount()
  const { hyperliquidAxios } = useHyperLiquid()
  const [sorting, setSorting] = useState<SortingState>([])
  const [mounted, setMounted] = useState(false)

  // Use useEffect to set mounted to true after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: tradeHistory } = useQuery<ITradeHistory[]>({
    queryKey: ['tradeHistory', address],
    queryFn: async () => {
      const response = await hyperliquidAxios.post('/info', {
        type: 'userFills',
        user: address,
        aggregateByTime: true
      })
      return response.data
    },
    enabled: !!address && !!hyperliquidAxios,
    initialData: []
  })

  const table = useReactTable({
    data: tradeHistory,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  if (!isConnected) {
    return <WalletNotConnected />
  }

  // During server-side rendering and initial client render, show a placeholder
  if (!mounted) {
    return <div className="overflow-x-auto p-4 dark:bg-gray-800 dark:text-gray-100 h-40"></div>
  }

  return (
    <div className="overflow-x-auto p-4 dark:bg-gray-800 dark:text-gray-100">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left text-sm font-medium uppercase tracking-wider"
                >
                  {header.isPlaceholder ? null : (
                    <button
                      onClick={header.column.getToggleSortingHandler()}
                      className="flex items-center gap-1"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: '▲',
                        desc: '▼'
                      }[header.column.getIsSorted() as string] ?? null}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-700">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="odd:bg-gray-800 even:bg-gray-900">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 whitespace-nowrap text-sm">
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

// Export a dynamic version of the component with ssr disabled
export default dynamic(() => Promise.resolve(TradeHistoryTable), { ssr: false })
