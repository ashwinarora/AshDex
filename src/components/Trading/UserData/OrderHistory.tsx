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
import WalletNotConnected from '@/components/common/WalletNotConnected'
import dynamic from 'next/dynamic'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { IconArrowMoveDown, IconArrowMoveUp, IconArrowsMoveVertical } from '@tabler/icons-react'
import ReactiveText from '@/components/common/ReactiveText'
import { FrontendOrder, OrderStatus } from '@nktkas/hyperliquid'
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
  const { sdkInfoClient } = useHyperliquid()
  const [mounted, setMounted] = useState(false)
  const { isTablet, isMobile } = useScreenSize()
  // Use useEffect to set mounted to true after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: orderHistory = [] } = useQuery<OrderStatus<FrontendOrder>[]>({
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
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  useEffect(() => {
    console.log('orderHistory', orderHistory)
  }, [orderHistory])

  const columnHelper = createColumnHelper<
    OrderStatus<FrontendOrder> & { meta?: { label: string } }
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
        header: () => 'Time',
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Time' }
      }),
      columnHelper.accessor((row) => row.order.coin, {
        id: 'coin',
        header: () => 'Coin',
        cell: (info) => info.getValue(),
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
          return (
            <div className="flex w-full justify-end items-center gap-2">
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
                  {info.getValue()}
                </div>
              )}
            </div>
          )
          // <div></div>
          // if (info.getValue() === 'filled') {
          //   return <div className="bg-green/10 px-2 py-0.5 rounded-lg text-end  text-green text-xs w-fit">Filled</div>
          // } else if (info.getValue() === 'rejected') {
          //   return <div className="bg-red/10 px-2 py-0.5 rounded-lg text-end  text-red text-xs w-fit">Rejected</div>
          // } else if (info.getValue() === 'canceled') {
          //   return (
          //     <div className="bg-gray-500/10 px-2 py-0.5 w-fit  text-end rounded-lg text-gray-500 text-xs">
          //       Canceled
          //     </div>
          //   )
          // } else if (info.getValue() === 'open') {
          //   return (
          //     <div className="bg-yellow-500/10 px-2 py-0.5 w-fit  text-end rounded-lg text-yellow-500 text-xs">
          //       Open
          //     </div>
          //   )
          // }
          // return <p className=" ">{info.getValue()}</p>
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
                      <span className="text-white/50">{item}</span>
                      <span className="text-white w-fit">{cell[index]}</span>
                    </div>
                    {(item === 'Coin' || item === 'Trigger') && (
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
                    header.id === 'timestamp' ? 'justify-start !w-36' : 'justify-end flex-2',
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
                  className={cn(
                    'font-medium text-white text-xs first:text-left text-right',
                    cell.column.id === 'timestamp'
                      ? 'justify-start text-start !w-36'
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
