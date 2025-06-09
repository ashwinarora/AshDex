'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
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
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react'
import ReactiveText from '@/components/common/ReactiveText'

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
  const { sdk } = useHyperliquid()
  const [mounted, setMounted] = useState(false)

  // Use useEffect to set mounted to true after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: orderHistory = [] } = useQuery<HistoricOrder[]>({
    queryKey: ['orderHistory', address],
    queryFn: async () => {
      if (!sdk?.info.getHistoricalOrders || !address) return []
      return sdk.info.getHistoricalOrders(address)
    },
    enabled: !!address && !!sdk,
    initialData: []
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  useEffect(() => {
    console.log('orderHistory', orderHistory)
  }, [orderHistory])

  const columnHelper = createColumnHelper<HistoricOrder & { meta?: { label: string } }>()
  const getCellClass = (columnId: string, cellValue: unknown): string => {
    let customClass = 'opacity-80 font-normal text-sm'
    if (columnId === 'status') {
      customClass = 'rounded-lg px-2 py-0.5 text-sm font-medium w-fit inline-block'
      if (cellValue === 'Filled') {
        customClass += ' bg-[#28283e] text-green'
      } else if (cellValue === 'Rejected') {
        customClass += ' bg-[#27273b] text-red'
      } else if (cellValue === 'Cancelled') {
        customClass += ' bg-[#505061] text-[#FFFFFF]'
      }
    } else if (columnId === 'side') {
      customClass += ' text-green'
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
                    ? `${item?.status === 'Filled' ? 'bg-[#28283e] text-green' : ''}
                          ${item?.status === 'Rejected' ? 'bg-[#27273b] text-red' : ''}
                          ${item?.status === 'Cancelled' ? 'bg-[#505061] text-[#FFFFFF]' : ''} px-1.5 py-1 w-fit rounded-lg font-medium`
                    : `${col?.key === 'side' ? 'text-green' : ''}`
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
      columnHelper.accessor((row) => new Date(row.order.timestamp).toLocaleString('en-US'), {
        id: 'timestamp',
        header: () => 'Time',
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Time' }
      }),
      columnHelper.accessor((row) => row.order.coin, {
        id: 'coin',
        header: () => 'Coin',
        cell: (info) => (
          info.getValue() ),
        enableSorting: true,
        meta: { label: 'Coin' }
      }),
      columnHelper.accessor((row) => row.order.side, {
        id: 'side',
        header: () => 'Direction',
        cell: (info) => (
          <p className={`${info.getValue()?.toLowerCase() === 'buy' ? 'text-green' : 'text-red'}`}>
            {info.getValue()}
          </p>
        ),
        enableSorting: true,
        meta: { label: 'Direction' }
      }),
      columnHelper.accessor((row) => row.order.limitPx, {
        id: 'limitPx',
        header: () => 'Price',
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" />,
        enableSorting: true,
        meta: { label: 'Price' }
      }),
      columnHelper.accessor((row) => row.order.sz, {
        id: 'sz',
        header: () => 'Size',
        cell: (info) => (
          <>
            {info.row.original.order.origSz === info.getValue() ? (
              <ReactiveText value={info.getValue()} type="number" precision={5} />
            ) : (
              '--'
            )}
          </>
        ),
        enableSorting: true,
        meta: { label: 'Size' }
      }),
      columnHelper.accessor((row) => row.order.origSz, {
        id: 'origSz',
        header: () => 'Filled Size',
        cell: (info) => (
          <>
            {info.row.original.order.sz !== info.getValue() ? (
              <ReactiveText value={info.getValue()} type="number" precision={5} />
            ) : (
              '--'
            )}
          </>
        ),
        enableSorting: true,
        meta: { label: 'Size' }
      }),
      columnHelper.accessor((row) => row.order.reduceOnly, {
        id: 'reduceOnly',
        header: () => 'Reduce Only',
        cell: (info) => (info.row.original.order.reduceOnly ? 'Yes' : 'No'),
        enableSorting: false,
        meta: { label: 'Reduce Only' }
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: () => 'Status',
        cell: (info) => {
          if (info.getValue() === 'filled') {
            return <p className="bg-green/10 px-2 py-0.5 rounded-lg text-green text-xs">Filled</p>
          } else if (info.getValue() === 'perpMarginRejected') {
            return <p className="bg-red/10 px-2 py-0.5 rounded-lg text-red text-xs">Rejected</p>
          } else if (info.getValue() === 'canceled') {
            return (
              <p className="bg-gray-500/10 px-2 py-0.5 rounded-lg text-gray-500 text-xs">
                Canceled
              </p>
            )
          } else if (info.getValue() === 'open') {
            return (
              <p className="bg-yellow-500/10 px-2 py-0.5 rounded-lg text-yellow-500 text-xs">
                Open
              </p>
            )
          }
          return <p className=" ">{info.getValue()}</p>
        },
        enableSorting: true,
        meta: { label: 'Status' }
      }),
      columnHelper.accessor((row) => row.order.oid, {
        id: 'orderId',
        header: () => 'Order ID',
        cell: (info) => info.getValue().toString(),
        enableSorting: true,
        meta: { label: 'Order ID' }
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
    return <div className="dark:bg-gray-800 p-4 h-40 overflow-x-auto dark:text-gray-100"></div>
  }

  return (
    <div className="px-3 w-full overflow-auto">
      <table className="hidden lg:table w-full text-white border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-2 py-2 font-normal text-sm text-left cursor-pointer"
                  onClick={
                    header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined
                  }
                >
                  <div className="flex items-center text-white/50">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="inline-block">
                        {header.column.getIsSorted() === 'asc' ? (
                          <IconChevronDown className="w-4 h-4" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <IconChevronUp className="w-4 h-4" />
                        ) : (
                          <IconSelector className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-transparent">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className=" ">
              {row.getVisibleCells().map((cell) => {
                const columnId = cell.column.id
                const cellValue = cell.getValue()
                const customClass = getCellClass(columnId, cellValue)
                return (
                  <td key={cell.id} className="px-2 py-0.5 text-white text-sm align-middle">
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
