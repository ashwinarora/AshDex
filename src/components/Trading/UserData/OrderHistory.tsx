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
import WalletNotConnected from '@/components/common/WalletNotConnected'
import dynamic from 'next/dynamic'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react'
import ReactiveText from '@/components/common/ReactiveText'
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
import { Separator } from '@/components/ui/separator'
import { useScreenSize } from '@/hooks/useScreenSize'
import { useTranslate } from '@tolgee/react'
import { useSpotMeta } from '@/hooks/useSpotMeta'

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

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

  useEffect(() => {
    console.log('orderHistory', orderHistory)
  }, [orderHistory])

  const columnHelper = createColumnHelper<
    HistoricalOrdersResponse[number] & { meta?: { label: string } }
  >()

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

  if (isTablet || isMobile) {
    const header = table.getHeaderGroups()[0].headers.map((header) => {
      return flexRender(header.column.columnDef.header, header.getContext())
    })
    return (
      <div className="w-full h-full flex flex-col rounded-md gap-2">
        <div className="flex xl:hidden flex-col items-center justify-start gap-2">
          {table.getRowModel().rows.map((row) => {
            const cell = row.getVisibleCells().map((cell) => {
              return flexRender(cell.column.columnDef.cell, cell.getContext())
            })
            return (
              <div
                key={row.id}
                className="w-full flex flex-col justify-between rounded-md h-fit gap-3 bg-accent p-4"
              >
                {header.map((item, index) => (
                  <div className="flex flex-col gap-3" key={index}>
                    <div className="flex items-center text-xs justify-between">
                      <span className="text-white/70">{item}</span>
                      <span className="text-white w-fit">{cell[index]}</span>
                    </div>
                    {(item === t('Coin') || item === t('Trigger')) && (
                      <Separator className="w-full bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
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
            <TableRow className={cn('h-10', isRTL && 'flex-row-reverse')} key={row.id}>
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
