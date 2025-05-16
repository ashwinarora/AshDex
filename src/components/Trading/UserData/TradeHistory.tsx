'use client'
import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
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
import HeaderWithIcons from './component/HeaderWithIcon'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { hyperliquidAxios } from '@/config/axios'

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

const columnHelper = createColumnHelper<ITradeHistory & { meta?: { label: string } }>()

const columns = [
  columnHelper.accessor('coin', {
    id: 'coin',
    header: () => <HeaderWithIcons label="Coin" />,
    cell: (info) => info.getValue(),
    enableSorting: false,
    meta: { label: 'Coin' }
  }),
  columnHelper.accessor('px', {
    id: 'px',
    header: () => <HeaderWithIcons label="Price" />,
    cell: (info) => info.getValue(),
    enableSorting: true,
    sortingFn: (rowA, rowB) => Number(rowA.original.px) - Number(rowB.original.px),
    meta: { label: 'Price' }
  }),
  columnHelper.accessor('sz', {
    id: 'sz',
    header: () => <HeaderWithIcons label="Size" />,
    cell: (info) => info.getValue(),
    enableSorting: true,
    sortingFn: (rowA, rowB) => Number(rowA.original.sz) - Number(rowB.original.sz),
    meta: { label: 'Size' }
  }),
  columnHelper.accessor('side', {
    id: 'side',
    header: () => <HeaderWithIcons label="Side" />,
    cell: (info) => info.getValue(),
    enableSorting: false,
    meta: { label: 'Side' }
  }),
  columnHelper.accessor('time', {
    id: 'time',
    header: () => <HeaderWithIcons label="Time" />,
    cell: (info) => new Date(info.getValue()).toLocaleString('en-US'),
    enableSorting: true,
    sortingFn: (rowA, rowB) => rowA.original.time - rowB.original.time,
    meta: { label: 'Time' }
  }),
  columnHelper.accessor('dir', {
    id: 'dir',
    header: () => <HeaderWithIcons label="Direction" />,
    cell: (info) => info.getValue(),
    enableSorting: false,
    meta: { label: 'Direction' }
  }),
  columnHelper.accessor('closedPnl', {
    id: 'closedPnl',
    header: () => <HeaderWithIcons label="Closed PnL" />,
    cell: (info) => info.getValue(),
    enableSorting: true,
    sortingFn: (rowA, rowB) => Number(rowA.original.closedPnl) - Number(rowB.original.closedPnl),
    meta: { label: 'Closed PnL' }
  }),
  columnHelper.accessor('crossed', {
    id: 'crossed',
    header: () => <HeaderWithIcons label="Crossed" />,
    cell: (info) => (info.getValue() ? 'Yes' : 'No'),
    enableSorting: false,
    meta: { label: 'Crossed' }
  })
]

const TradeHistoryTable: React.FC = () => {
  const { address, isConnected } = useAccount()
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

  const getCellClass = (columnId: string, cellValue: unknown): string => {
    let customClass = 'opacity-80 font-normal text-sm'
    if (columnId === 'crossed') {
      customClass = 'rounded-lg px-2 py-0.5 text-sm font-medium w-fit inline-block'
      if (cellValue === true) {
        customClass += ' bg-[#28283e] text-[#2FA766]'
      } else if (cellValue === false) {
        customClass += ' bg-[#27273b] text-[#E2464A]'
      }
    } else if (columnId === 'side') {
      customClass += ' text-sm font-normal'
      const value = (cellValue as string)?.toLowerCase()
      if (value === 'buy') {
        customClass += ' text-[#2FA766]'
      } else if (value === 'sell') {
        customClass += ' text-[#E2464A]'
      }
    } else {
      customClass += ' text-[#FFFFFF]'
    }
    return customClass
  }

  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    const formatValue = (key: string, value: unknown) => {
      if (key === 'crossed') {
        return value === true ? 'Yes' : 'No'
      }
      return value ?? '-'
    }
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        {columns?.map((col) => (
          <div key={col?.key} className="flex justify-between">
            <span className="text-[#8B8BA0]">{col?.label}</span>
            <span className={col?.key === 'contract' ? 'truncate' : ''}>
              <span
                className={`flex items-center gap-x-2 ${
                  col?.key === 'crossed'
                    ? `${item?.crossed ? 'bg-[#28283e] text-[#2FA766]' : 'bg-[#27273b] text-[#E2464A]'} px-1.5 py-1 w-fit rounded-lg font-medium`
                    : col?.key === 'side'
                      ? 'text-[#E2464A]'
                      : ''
                }`}
              >
                {String(formatValue(col?.key, item[col?.key]))}
              </span>
            </span>
          </div>
        ))}
      </div>
    )
  }

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
            <tr key={row.id} className="border-b border-white/10">
              {row.getVisibleCells().map((cell) => {
                const columnId = cell.column.id
                const cellValue = cell.getValue()
                const customClass = getCellClass(columnId, cellValue)
                return (
                  <td key={cell.id} className="py-4 px-7">
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
export default dynamic(() => Promise.resolve(TradeHistoryTable), { ssr: false })
