'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender
} from '@tanstack/react-table'
import WalletNotConnected from '@/components/ConnectWalletModal/DisconnectedWalletState'
import dynamic from 'next/dynamic'
// import ResponsiveDataCard from '@/components/Trading/ResponsiveDataCard'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { IconChevronUp, IconChevronDown, IconSelector, IconHistory } from '@tabler/icons-react'
import ReactiveText from '@/components/reactive-text'
import type { HistoricalOrdersResponse } from '@nktkas/hyperliquid/api/info'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useScreenSize } from '@/hooks/useScreenSize'
import { useTranslate } from '@tolgee/react'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const OrderHistoryTable: React.FC<{ isRTL: boolean }> = ({ isRTL }) => {
  const { t } = useTranslate()
  const { address, isConnected } = useAccount()
  const { sdkInfoClient } = useHyperliquidStore(
    useShallow((state) => ({
      sdkInfoClient: state.sdkInfoClient
    }))
  )
  const [mounted, setMounted] = useState(false)
  const { isTablet, isMobile } = useScreenSize()
  // Use useEffect to set mounted to true after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: orderHistory = [] } = useQuery<HistoricalOrdersResponse>({
    queryKey: ['orderHistory', address],
    queryFn: async () => {
      if (!sdkInfoClient || !address) return []
      return sdkInfoClient.historicalOrders({
        user: address
      })
    },
    enabled: !!address && !!sdkInfoClient,
    initialData: []
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const { spotKeyToName } = useSpotMeta()

  const columnHelper = createColumnHelper<
    HistoricalOrdersResponse[number] & { meta?: { label: string } }
  >()

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => new Date(row.order.timestamp).toLocaleString('en-US'), {
        id: 'timestamp',
        header: () => t('Time'),
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: t('Time') }
      }),
      columnHelper.accessor((row) => row.order.coin, {
        id: 'coin',
        header: () => t('Coin'),
        cell: (info) => {
          const name = info.getValue()
          if (name.includes('@')) {
            return spotKeyToName.get(name)
          }
          return name
        },
        enableSorting: true,
        meta: { label: t('Coin') }
      }),
      columnHelper.accessor((row) => row.order.side, {
        id: 'side',
        header: () => t('Direction'),
        cell: (info) => {
          const side = info.getValue()
          return (
            <p
              className={`${side.toLowerCase() === 'buy' || side.toUpperCase() === 'B' ? 'text-green' : 'text-red'}`}
            >
              {side.toUpperCase() === 'B' ? 'Buy' : side.toUpperCase() === 'A' ? 'Sell' : side}
            </p>
          )
        },
        enableSorting: true,
        meta: { label: t('Direction') }
      }),
      columnHelper.accessor((row) => row.order.limitPx, {
        id: 'limitPx',
        header: () => t('Price'),
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" precision={2} />,
        enableSorting: true,
        meta: { label: t('Price') }
      }),
      columnHelper.accessor((row) => row.order.sz, {
        id: 'sz',
        header: () => t('Size'),
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
        meta: { label: t('Size') }
      }),
      columnHelper.accessor((row) => row.order.origSz, {
        id: 'origSz',
        header: () => t('Filled Size'),
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
        meta: { label: t('Size') }
      }),
      columnHelper.accessor((row) => row.order.reduceOnly, {
        id: 'reduceOnly',
        header: () => t('Reduce Only'),
        cell: (info) => (info.row.original.order.reduceOnly ? t('Yes') : t('No')),
        enableSorting: false,
        meta: { label: t('Reduce Only') }
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: () => (
          <div
            className={cn(
              'flex !w-full justify-end items-center gap-2',
              isRTL && 'flex-row-reverse'
            )}
          >
            {t('Status')}
          </div>
        ),
        cell: (info) => {
          return (
            <div
              className={cn(
                'flex !w-full justify-end items-center gap-2',
                isRTL && 'flex-row-reverse justify-start'
              )}
            >
              {info.getValue() === 'filled' ? (
                <div className="bg-green/10 px-2 py-0.5 rounded-lg text-end  text-green text-xs w-fit">
                  Filled
                </div>
              ) : info.getValue() === 'rejected' ? (
                <div className="bg-red/10 px-2 py-0.5 rounded-lg text-end  text-red text-xs w-fit">
                  Rejected
                </div>
              ) : info.getValue() === 'canceled' ? (
                <div className="bg-gray-500/10 px-2 py-0.5 w-fit  text-end rounded-lg text-gray-500 text-xs">
                  Canceled
                </div>
              ) : info.getValue() === 'open' ? (
                <div className="bg-yellow-500/10 px-2 py-0.5 w-fit  text-end rounded-lg text-yellow-500 text-xs">
                  Open
                </div>
              ) : (
                <div className="bg-gray-500/10 px-2 py-0.5 w-fit  text-end rounded-lg text-gray-500 text-xs">
                  {info.getValue().slice(0, 15)}...
                </div>
              )}
            </div>
          )
        },
        enableSorting: true,
        meta: { label: t('Status') }
      }),
      columnHelper.accessor((row) => row.order.oid, {
        id: 'orderId',
        header: () => t('Order ID'),
        cell: (info) => info.getValue().toString(),
        enableSorting: true,
        meta: { label: t('Order ID') }
      })
    ],
    [columnHelper, t]
  )

  const table = useReactTable({
    data: orderHistory,
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
    return <div className="w-full h-full bg-secondary"></div>
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center py-12 justify-center gap-2">
        <IconHistory className="size-10 text-white" />
        <span className="text-white">{t('No Order History Found')}</span>
        <p className="text-white/70 text-center text-xs">
          {t('Start trading to see your order history here')}
        </p>
      </div>
    )
  }

  if (isTablet || isMobile) {
    const header = table.getHeaderGroups()[0].headers.map((header) => {
      return flexRender(header.column.columnDef.header, header.getContext())
    })
    return (
      <div className="w-full min-h-48 h-full flex flex-col rounded-md pt-2 gap-2">
        <div className="flex xl:hidden flex-col items-center justify-start gap-2">
          {table.getRowModel().rows.map((row) => {
            const cell = row.getVisibleCells().map((cell) => {
              return flexRender(cell.column.columnDef.cell, cell.getContext())
            })
            const coinName = row.original.order.coin.includes('@')
              ? spotKeyToName.get(row.original.order.coin)
              : row.original.order.coin
            const side = row.original.order.side
            const isBuy = side.toLowerCase() === 'buy' || side.toUpperCase() === 'B'
            const status = row.original.status

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
                        {isBuy ? 'Buy' : 'Sell'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs px-1.5 py-0.5 rounded',
                          status === 'filled'
                            ? 'bg-green/10 text-green'
                            : status === 'rejected'
                              ? 'bg-red/10 text-red'
                              : status === 'canceled'
                                ? 'bg-gray-500/10 text-gray-500'
                                : status === 'open'
                                  ? 'bg-yellow-500/10 text-yellow-500'
                                  : 'bg-gray-500/10 text-gray-500'
                        )}
                      >
                        {status === 'filled'
                          ? 'Filled'
                          : status === 'rejected'
                            ? 'Rejected'
                            : status === 'canceled'
                              ? 'Canceled'
                              : status === 'open'
                                ? 'Open'
                                : status.slice(0, 10)}
                      </span>
                      <IconChevronDown className="size-4 text-white/70" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-2 bg-background rounded-b-md flex flex-col gap-2 -mt-2">
                    {/* Info rows - skip coin (index 1), direction (index 2), and status (index 7) */}
                    {header.map((item, index) => {
                      // Skip coin, direction, and status as they're in the header
                      if (index === 1 || index === 2 || index === 7) return null
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
                    cell.column.id === 'timestamp' || cell.column.id === 'status'
                      ? isRTL
                        ? 'justify-end text-end !w-36'
                        : 'justify-start text-start !w-36'
                      : isRTL
                        ? 'justify-start text-start flex-2'
                        : 'justify-end text-end flex-2'
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
export default dynamic(() => Promise.resolve(OrderHistoryTable), { ssr: false })
