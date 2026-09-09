'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useConnection } from 'wagmi'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  SortingState
} from '@tanstack/react-table'
import WalletNotConnected from '@/components/ConnectWalletModal/DisconnectedWalletState'
import dynamic from 'next/dynamic'
// import ResponsiveDataCard from '@/components/Trading/ResponsiveDataCard'
import { IconChevronDown, IconChevronUp, IconHistory, IconSelector } from '@tabler/icons-react'
import ReactiveText from '@/components/reactive-text'
import { formatTimestamp } from '@/utils/format'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { useScreenSize } from '@/hooks/useScreenSize'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import * as hl from '@nktkas/hyperliquid'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// type ColumnType = {
//   key: string
//   label: string
// }

// type RenderRowProps = {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   item: any
//   columns: ColumnType[]
// }

const columnHelper = createColumnHelper<hl.UserFillsResponse[number]>()

const TradeHistoryTable: React.FC<{ isRTL: boolean }> = ({ isRTL }) => {
  const { address, isConnected } = useConnection()
  const { spotKeyToName } = useSpotMeta()
  const [sorting, setSorting] = useState<SortingState>([])
  const [mounted, setMounted] = useState(false)
  const { sdkInfoClient } = useHyperliquidStore(
    useShallow((state) => ({
      sdkInfoClient: state.sdkInfoClient
    }))
  )
  const { isTablet, isMobile } = useScreenSize()
  // Use useEffect to set mounted to true after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: tradeHistory } = useQuery({
    queryKey: ['tradeHistory', address],
    queryFn: async () => {
      if (!address) return []
      if (!sdkInfoClient) return []
      const response = await sdkInfoClient?.userFills({
        user: address,
        aggregateByTime: true
      })
      return response
    },
    enabled: !!address && !!sdkInfoClient,
    initialData: []
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('time', {
        id: 'timestamp',
        header: () => 'Time',
        cell: (info) => formatTimestamp(info.getValue()),
        enableSorting: false,
        meta: { label: 'Time' }
      }),
      columnHelper.accessor('coin', {
        id: 'coin',
        header: () => 'Coin',
        cell: (info) => {
          const coinName = info.getValue()
          if (coinName.includes('@')) {
            return spotKeyToName.get(coinName)
          }
          return coinName
        },
        enableSorting: false,
        meta: { label: 'Coin' }
      }),
      columnHelper.accessor('dir', {
        id: 'dir',
        header: () => 'Direction',
        cell: (info) => (
          <p
            className={`${info.getValue().includes('Open') || info.getValue().includes('Buy') ? 'text-green' : 'text-red'}`}
          >
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

      columnHelper.accessor((row) => Number(row.px) * Math.abs(Number(row.sz)), {
        id: 'tradeValue',
        header: () => 'Trade Value',
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" />,
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          Number(rowA.original.px) * Math.abs(Number(rowA.original.sz)) -
          Number(rowB.original.px) * Math.abs(Number(rowB.original.sz)),
        meta: { label: 'Trade Value' }
      }),

      columnHelper.accessor('fee', {
        id: 'fee',
        header: () => 'Fee',
        cell: (info) => '$' + Number(info.getValue()).toFixed(2),
        enableSorting: true,
        sortingFn: (rowA, rowB) => Number(rowA.original.fee) - Number(rowB.original.fee),
        meta: { label: 'Fee' }
      }),

      columnHelper.accessor('closedPnl', {
        id: 'closedPnl',
        header: () => 'Closed PnL',
        cell: (info) => info.getValue(),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          Number(rowA.original.closedPnl) - Number(rowB.original.closedPnl),
        meta: { label: 'Closed PnL' }
      }),
      columnHelper.accessor('crossed', {
        id: 'crossed',
        header: () => 'Crossed',
        cell: (info) => (info.getValue() ? 'Yes' : 'No'),
        enableSorting: false,
        meta: { label: 'Crossed' }
      })
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: tradeHistory,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  if (table.getRowModel().rows.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center py-12 justify-center gap-2">
        <IconHistory className="size-10 text-white" />
        <span className="text-white">{'No Trade History Found'}</span>
        <p className="text-white/70 text-center text-xs">
          {'Start trading to see your trade history here'}
        </p>
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

  if (isTablet || isMobile) {
    const header = table.getHeaderGroups()[0].headers.map((header) => {
      return flexRender(header.column.columnDef.header, header.getContext())
    })
    return (
      <div className="w-full h-full min-h-48 flex flex-col rounded-md pt-2 gap-2">
        <div className="flex xl:hidden flex-col items-center justify-start gap-2">
          {table.getRowModel().rows.map((row) => {
            const cell = row.getVisibleCells().map((cell) => {
              return flexRender(cell.column.columnDef.cell, cell.getContext())
            })
            const coinName = row.original.coin.includes('@')
              ? spotKeyToName.get(row.original.coin)
              : row.original.coin
            const dir = row.original.dir
            const isBuy = dir.includes('Open') || dir.includes('Buy')
            const closedPnl = Number(row.original.closedPnl)

            return (
              <Collapsible key={row.id} className="w-full">
                <CollapsibleTrigger className="w-full">
                  <div className="w-full flex items-center justify-between p-4 bg-background rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-xs">{coinName}</span>
                      <span
                        className={cn(
                          'text-xs px-1.5 py-0.5 rounded',
                          isBuy ? 'bg-green/20 text-green' : 'bg-red/20 text-red'
                        )}
                      >
                        {dir}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs',
                          closedPnl === 0
                            ? 'text-white/70'
                            : closedPnl > 0
                              ? 'text-green'
                              : 'text-red'
                        )}
                      >
                        {closedPnl !== 0
                          ? `${closedPnl >= 0 ? '+' : ''}${closedPnl.toFixed(2)}`
                          : ''}
                      </span>
                      <IconChevronDown className="size-4 text-white/70" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-2 bg-background rounded-b-md flex flex-col gap-2 -mt-2">
                    {/* Info rows - skip coin (index 1) and direction (index 2) */}
                    {header.map((item, index) => {
                      // Skip coin and direction as they're in the header
                      if (index === 1 || index === 2) return null
                      return (
                        <div
                          className={cn(
                            'flex items-center justify-between',
                            isRTL && 'flex-row-reverse'
                          )}
                          key={index}
                        >
                          <span className="text-white/70 text-xs">{item}</span>
                          <span className="text-white text-xs">{cell[index]}</span>
                        </div>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <Table>
        <TableHeader className={cn('sticky top-0 bg-secondary', isRTL && 'flex-row-reverse')}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className={cn(isRTL && 'flex-row-reverse')} key={headerGroup.id}>
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
                    header.id === 'timestamp'
                      ? isRTL
                        ? 'justify-end'
                        : 'justify-start'
                      : isRTL
                        ? 'justify-start'
                        : 'justify-end',
                    header.column.columnDef.enableSorting
                      ? 'hover:text-accent-foreground'
                      : 'hover:text-white/70',
                    header.column.getIsSorted() === 'asc' || header.column.getIsSorted() === 'desc'
                      ? 'text-accent-foreground'
                      : 'text-white/70'
                  )}
                >
                  {header.isPlaceholder ? null : (
                    <>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.columnDef.enableSorting ? (
                        header.column.getIsSorted() === 'asc' ? (
                          <IconChevronUp className="text-inherit size-4" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <IconChevronDown className="text-inherit size-4" />
                        ) : (
                          <IconSelector className="text-inherit size-4" />
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
            <TableRow className={cn('h-8', isRTL && 'flex-row-reverse')} key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    'font-medium text-white text-xs',
                    isRTL ? 'first:text-end text-start' : 'first:text-start text-end'
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* <ResponsiveDataCard
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
      /> */}
    </div>
  )
}

// Export a dynamic version of the component with ssr disabled
export default dynamic(() => Promise.resolve(TradeHistoryTable), { ssr: false })
