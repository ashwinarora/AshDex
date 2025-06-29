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
import WalletNotConnected from '@/components/common/WalletNotConnected'
import dynamic from 'next/dynamic'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { IconArrowMoveDown, IconArrowMoveUp, IconArrowsMoveVertical } from '@tabler/icons-react'
import ReactiveText from '@/components/common/ReactiveText'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { Fill } from '@nktkas/hyperliquid'
import { Separator } from '@/components/ui/separator'
import { useScreenSize } from '@/hooks/useScreenSize'

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

const columnHelper = createColumnHelper<Fill>()

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
    cell: (info) => info.getValue(),
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
    cell: (info) => info.getValue(),
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
  const { sdkInfoClient } = useHyperliquid()
  const { isTablet } = useScreenSize()
  // Use useEffect to set mounted to true after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: tradeHistory } = useQuery<Fill[]>({
    queryKey: ['tradeHistory', address],
    queryFn: async () => {
      if (!address) return []
      if (!sdkInfoClient) return []
      const response = await sdkInfoClient?.userFills({
        user: address
      })
      return response
    },
    enabled: !!address && !!sdkInfoClient,
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

  // const getCellClass = (columnId: string, cellValue: unknown): string => {
  //   let customClass = 'opacity-80 font-normal text-sm'
  //   if (columnId === 'crossed') {
  //     customClass = 'rounded-lg px-2 py-0.5 text-xs font-medium w-fit inline-block'
  //     if (cellValue === true) {
  //       customClass += ' bg-green/10 text-green'
  //     } else if (cellValue === false) {
  //       customClass += ' bg-red/10 text-red'
  //     }
  //   } else if (columnId === 'side') {
  //     customClass += ' text-sm font-normal'
  //     const value = (cellValue as string)?.toLowerCase()
  //     if (value === 'buy') {
  //       customClass += ' text-green'
  //     } else if (value === 'sell') {
  //       customClass += ' text-red'
  //     }
  //   } else {
  //     customClass += ' text-[#FFFFFF]'
  //   }
  //   return customClass
  // }

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
    return <div className="h-full w-full bg-secondary"></div>
  }

  if (isTablet) {
    const header = table.getHeaderGroups()[0].headers.map((header) => {
      return flexRender(header.column.columnDef.header, header.getContext());
    });
    return <div className="w-full h-full flex flex-col rounded-md gap-2">
      <div className='flex xl:hidden flex-col items-center justify-start gap-2'>
        {table.getRowModel().rows.map((row) => {
          const cell = row.getVisibleCells().map((cell) => {
            return (flexRender(cell.column.columnDef.cell, cell.getContext()));
          });
          return (
            <div key={row.id} className='w-full flex flex-col justify-between rounded-md h-fit gap-3 bg-accent p-4'>
              {header.map((item, index) => (
                <div className='flex flex-col gap-3' key={index}>
                  <div className='flex items-center text-xs justify-between'>
                    <span className='text-white/50'>{item}</span>
                    <span className='text-white w-fit'>{cell[index]}</span>
                  </div>
                  {(item === 'Coin' || item === 'Trigger') &&  <Separator className='w-full bg-white/10' />}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  }

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <Table>
        <TableHeader className="sticky top-0 bg-secondary">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={() => {
                    if (header.column.getCanSort()) {
                      header.column.toggleSorting()
                    }
                  }}
                  className={cn(
                    'cursor-pointer w-full',
                    header.id === 'timestamp' ? 'justify-start' : 'justify-end',
                    header.column.columnDef.enableSorting
                      ? 'hover:text-accent-foreground'
                      : 'hover:text-white/50',
                    header.column.getIsSorted() === 'asc' || header.column.getIsSorted() === 'desc'
                      ? 'text-accent-foreground'
                      : 'text-white/50'
                  )}
                >
                  {header.isPlaceholder ? null : (
                    <>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.columnDef.enableSorting ? (
                        header.column.getIsSorted() === 'asc' ? (
                          <IconArrowMoveUp className="text-inherit size-4" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <IconArrowMoveDown className="text-inherit size-4" />
                        ) : (
                          <IconArrowsMoveVertical className="text-inherit size-4" />
                        )
                      ) : null}
                    </>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow className="h-12" key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="font-medium text-white text-xs first:text-left text-right"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
