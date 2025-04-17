'use client'

import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useHyperLiquid } from '@/context/HyperLiquid'
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  flexRender,
} from '@tanstack/react-table'
import { HistoricOrder } from '@/utils/hyperliquid/hyperLiquidTypes'

const OrderHistory = () => {
  const { address } = useAccount()
  const { sdk } = useHyperLiquid()

  const { data: orderHistory = [] } = useQuery<HistoricOrder[]>({
    queryKey: ['orderHistory', address],
    queryFn: async () => sdk.info.getHistoricalOrders(address),
    enabled: !!address && !!sdk,
    initialData: [],
  })

  // sorting + pagination state
  const [sorting, setSorting] = useState<SortingState>([])
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const columnHelper = createColumnHelper<HistoricOrder>()

  const columns = useMemo(
    () => [
      columnHelper.accessor(row => row.order.coin, {
        id: 'coin',
        header: 'Coin',
        cell: info => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor(row => row.order.side, {
        id: 'side',
        header: 'Side',
        cell: info => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor(row => row.order.limitPx, {
        id: 'limitPx',
        header: 'Limit Price',
        cell: info => info.getValue().toFixed(2),
        enableSorting: true,
      }),
      columnHelper.accessor(row => row.order.sz, {
        id: 'size',
        header: 'Size',
        cell: info => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor(row => row.order.oid, {
        id: 'orderId',
        header: 'Order ID',
        cell: info => info.getValue().toString(),
        enableSorting: true,
      }),
      columnHelper.accessor(
        row => new Date(row.order.timestamp).toLocaleString(),
        {
          id: 'timestamp',
          header: 'Timestamp',
          cell: info => info.getValue(),
          enableSorting: true,
        }
      ),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: info => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor(
        row => new Date(row.statusTimestamp).toLocaleString(),
        {
          id: 'statusTs',
          header: 'Status Time',
          cell: info => info.getValue(),
          enableSorting: true,
        }
      ),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: orderHistory,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize } },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const sortDir = header.column.getIsSorted()
                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`
                      px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider
                      ${sortDir ? 'text-white' : 'text-gray-400'} 
                      cursor-pointer select-none
                    `}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {sortDir === 'asc' ? '▲' : sortDir === 'desc' ? '▼' : ''}
                    </div>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-700">
          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              className="hover:bg-gray-800 transition-colors"
            >
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-200"
                >
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* pagination controls */}
      <div className="mt-4 flex items-center justify-between text-gray-300 text-sm">
        <div className="flex gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 bg-gray-800 rounded disabled:opacity-50"
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 bg-gray-800 rounded disabled:opacity-50"
          >
            {'<'}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 bg-gray-800 rounded disabled:opacity-50"
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 bg-gray-800 rounded disabled:opacity-50"
          >
            {'>>'}
          </button>
        </div>

        <div>
          Page{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </strong>
        </div>

        <div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="bg-gray-800 text-gray-200 text-sm rounded p-1"
          >
            {[10, 20, 50].map(size => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default OrderHistory
