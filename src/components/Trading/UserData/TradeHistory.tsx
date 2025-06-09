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
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { hyperliquidAxios } from '@/config/axios'
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

const columnHelper = createColumnHelper<ITradeHistory & { meta?: { label: string } }>()

const columns = [
  columnHelper.accessor('time', {
    id: 'timestamp',
    header: () => 'Time',
    cell: (info) => new Date(info.getValue()).toLocaleString('en-US'),
    enableSorting: false,
    meta: { label: 'Time' }
  }),
  columnHelper.accessor('coin', {
    id: 'coin',
    header: () => 'Coin',
    cell: (info) => (
       
        info.getValue() 
    ),
    enableSorting: false,
    meta: { label: 'Coin' }
  }),
  columnHelper.accessor('dir', {
    id: 'dir',
    header: () => 'Direction',
    cell: (info) => (
      <p className={`${info.getValue().includes('Close') ? 'text-green' : 'text-red'}`}>
        {info.getValue()}
      </p>
    ),
    enableSorting: false,
    meta: { label: 'Direction' }
  }),
  columnHelper.accessor('px', {
    id: 'px',
    header: () => 'Price',
    cell: (info) => <ReactiveText value={info.getValue()} type="currency" />,
    enableSorting: true,
    sortingFn: (rowA, rowB) => Number(rowA.original.px) - Number(rowB.original.px),
    meta: { label: 'Price' }
  }),
  columnHelper.accessor('sz', {
    id: 'sz',
    header: () => 'Size',
    cell: (info) => info.getValue(),
    enableSorting: true,
    sortingFn: (rowA, rowB) => Number(rowA.original.sz) - Number(rowB.original.sz),
    meta: { label: 'Size' }
  }),

  columnHelper.accessor('closedPnl', {
    id: 'closedPnl',
    header: () => 'Closed PnL',
    cell: (info) => (info.getValue()
    ),
    enableSorting: true,
    sortingFn: (rowA, rowB) => Number(rowA.original.closedPnl) - Number(rowB.original.closedPnl),
    meta: { label: 'Closed PnL' }
  }),
  columnHelper.accessor('crossed', {
    id: 'crossed',
    header: () => 'Crossed',
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
      customClass = 'rounded-lg px-2 py-0.5 text-xs font-medium w-fit inline-block'
      if (cellValue === true) {
        customClass += ' bg-green/10 text-green'
      } else if (cellValue === false) {
        customClass += ' bg-red/10 text-red'
      }
    } else if (columnId === 'side') {
      customClass += ' text-sm font-normal'
      const value = (cellValue as string)?.toLowerCase()
      if (value === 'buy') {
        customClass += ' text-green'
      } else if (value === 'sell') {
        customClass += ' text-red'
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
                    ? `${item?.crossed ? 'bg-[#28283e] text-green' : 'bg-[#27273b] text-red'} px-1.5 py-1 w-fit rounded-lg font-medium`
                    : col?.key === 'side'
                      ? 'text-red'
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
    return <div className="dark:bg-gray-800 p-4 h-40 overflow-x-auto dark:text-gray-100"></div>
  }

  return (
    <div className="px-3 w-full overflow-x-auto">
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
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const columnId = cell.column.id
                const cellValue = cell.getValue()
                const customClass = getCellClass(columnId, cellValue)
                return (
                  <td key={cell.id} className="p-2 py-1 text-white text-sm align-middle">
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
