'use client'

import React, { useMemo, useState, useEffect } from 'react'
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
  flexRender
} from '@tanstack/react-table'
import { HistoricOrder } from '@/utils/hyperliquid/hyperLiquidTypes'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import dynamic from 'next/dynamic'
import HeaderWithIcons from './component/HeaderWithIcon'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

const OrderHistoryTable: React.FC = () => {
  const { address, isConnected } = useAccount()
  const { sdk } = useHyperLiquid()
  const [mounted, setMounted] = useState(false)

  // Use useEffect to set mounted to true after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: orderHistory = [] } = useQuery<HistoricOrder[]>({
    queryKey: ['orderHistory', address],
    queryFn: async () => sdk.info.getHistoricalOrders(address),
    enabled: !!address && !!sdk,
    initialData: []
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  const columnHelper = createColumnHelper<HistoricOrder & { meta?: { label: string } }>()
  const getCellClass = (columnId: string, cellValue: unknown): string => {
    let customClass = 'opacity-80 font-normal text-sm'
    if (columnId === 'status') {
      customClass = 'rounded-lg px-2 py-0.5 text-sm font-medium w-fit inline-block'
      if (cellValue === 'Filled') {
        customClass += ' bg-[#28283e] text-[#2FA766]'
      } else if (cellValue === 'Rejected') {
        customClass += ' bg-[#27273b] text-[#E2464A]'
      } else if (cellValue === 'Cancelled') {
        customClass += ' bg-[#505061] text-[#FFFFFF]'
      }
    } else if (columnId === 'side') {
      customClass += ' text-[#2FA766]'
    } else {
      customClass += ' text-[#FFFFFF]'
    }

    return customClass
  }

  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        {columns?.map((col) => (
          <div key={col?.key} className="flex justify-between">
            <span className="text-[#8B8BA0]">{col?.label}</span>
            <span className={col?.key === 'contract' ? 'truncate' : ''}>
              <span
                className={`flex ${
                  col?.key === 'status'
                    ? `${item?.status === 'Filled' ? 'bg-[#28283e] text-[#2FA766]' : ''}
                          ${item?.status === 'Rejected' ? 'bg-[#27273b] text-[#E2464A]' : ''}
                          ${item?.status === 'Cancelled' ? 'bg-[#505061] text-[#FFFFFF]' : ''} px-1.5 py-1 w-fit rounded-lg font-medium`
                    : `${col?.key === 'side' ? 'text-[#2FA766]' : ''}`
                } item-center gap-x-2`}
              >
                {item[col?.key] ?? '-'}
              </span>
            </span>
          </div>
        ))}
      </div>
    )
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.order.coin, {
        id: 'coin',
        header: () => <HeaderWithIcons label="Coin" />,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Coin' }
      }),
      columnHelper.accessor((row) => row.order.side, {
        id: 'side',
        header: () => <HeaderWithIcons label="Side" />,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Side' }
      }),
      columnHelper.accessor((row) => row.order.limitPx, {
        id: 'limitPx',
        header: () => <HeaderWithIcons label="Limit Price" />,
        cell: (info) => info.getValue().toFixed(2),
        enableSorting: true,
        meta: { label: 'Limit Price' }
      }),
      columnHelper.accessor((row) => row.order.sz, {
        id: 'size',
        header: () => <HeaderWithIcons label="Size" />,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Size' }
      }),
      columnHelper.accessor((row) => row.order.oid, {
        id: 'orderId',
        header: () => <HeaderWithIcons label="Order ID" />,
        cell: (info) => info.getValue().toString(),
        enableSorting: true,
        meta: { label: 'Order ID' }
      }),
      columnHelper.accessor((row) => new Date(row.order.timestamp).toLocaleString('en-US'), {
        id: 'timestamp',
        header: () => <HeaderWithIcons label="Timestamp" />,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Timestamp' }
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: () => <HeaderWithIcons label="Status" />,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Status' }
      }),
      columnHelper.accessor((row) => new Date(row.statusTimestamp).toLocaleString('en-US'), {
        id: 'statusTs',
        header: () => <HeaderWithIcons label="Status Time" />,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Status Time' }
      })
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
    getPaginationRowModel: getPaginationRowModel()
  })

  if (!isConnected) {
    return <WalletNotConnected />
  }

  // During server-side rendering and initial client render, show a placeholder
  if (!mounted) {
    return <div className="overflow-x-auto p-4 dark:bg-gray-800 dark:text-gray-100 h-40"></div>
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
                  className="pt-3 pb-1 px-7 text-sm font-normal text-[#8B8BA0] text-left cursor-pointer"
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
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row?.id} className="border-b border-white/10">
              {row.getVisibleCells().map((cell) => {
                const columnId = cell?.column?.id
                const cellValue = cell?.getValue()
                const customClass = getCellClass(columnId, cellValue)
                return (
                  <td key={cell?.id} className="py-4 px-7">
                    <div className={customClass}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={columns.map((col) => ({
          key: col?.id as string,
          label: col?.meta && 'label' in col?.meta ? String(col?.meta?.label) : ''
        }))}
        data={table.getRowModel().rows.map((row) => {
          const rowData: Record<string, unknown> = {}
          row.getVisibleCells().forEach((cell) => {
            rowData[cell?.column?.id] = cell?.getValue()
          })
          return rowData
        })}
        renderRow={(item) => (
          <RenderRowData
            item={item}
            columns={columns.map((col) => ({
              key: col?.id as string,
              label: col?.meta && 'label' in col?.meta ? String(col?.meta?.label) : ''
            }))}
          />
        )}
      />
    </div>
  )
}

// Export a dynamic version of the component with ssr disabled
export default dynamic(() => Promise.resolve(OrderHistoryTable), { ssr: false })
