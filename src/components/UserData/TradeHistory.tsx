'use client'
import React, { useState, useEffect, useMemo } from 'react'
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
import WalletNotConnected from '@/components/ConnectWalletModal/DisconnectedWalletState'
import dynamic from 'next/dynamic'
// import ResponsiveDataCard from '@/components/Trading/ResponsiveDataCard'
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react'
import ReactiveText from '@/components/reactive-text'
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
import { Separator } from '@/components/ui/separator'
import { useScreenSize } from '@/hooks/useScreenSize'
import { useTranslate } from '@tolgee/react'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import * as hl from '@nktkas/hyperliquid'

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
  const { t } = useTranslate()
  const { address, isConnected } = useAccount()
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

  console.log(tradeHistory)

  const columns = useMemo(
    () => [
      columnHelper.accessor('time', {
        id: 'timestamp',
        header: () => t('Time'),
        cell: (info) => new Date(info.getValue()).toLocaleString('en-US'),
        enableSorting: false,
        meta: { label: t('Time') }
      }),
      columnHelper.accessor('coin', {
        id: 'coin',
        header: () => t('Coin'),
        cell: (info) => {
          const coinName = info.getValue()
          if (coinName.includes('@')) {
            return spotKeyToName.get(coinName)
          }
          return coinName
        },
        enableSorting: false,
        meta: { label: t('Coin') }
      }),
      columnHelper.accessor('dir', {
        id: 'dir',
        header: () => t('Direction'),
        cell: (info) => (
          <p
            className={`${info.getValue().includes('Open') || info.getValue().includes('Buy') ? 'text-green' : 'text-red'}`}
          >
            {info.getValue()}
          </p>
        ),
        enableSorting: false,
        meta: { label: t('Direction') }
      }),
      columnHelper.accessor('px', {
        id: 'px',
        header: () => t('Price'),
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" />,
        enableSorting: true,
        sortingFn: (rowA, rowB) => Number(rowA.original.px) - Number(rowB.original.px),
        meta: { label: t('Price') }
      }),
      columnHelper.accessor('sz', {
        id: 'sz',
        header: () => t('Size'),
        cell: (info) => info.getValue(),
        enableSorting: true,
        sortingFn: (rowA, rowB) => Number(rowA.original.sz) - Number(rowB.original.sz),
        meta: { label: t('Size') }
      }),

      columnHelper.accessor((row) => Number(row.px) * Math.abs(Number(row.sz)), {
        id: 'tradeValue',
        header: () => t('Trade Value'),
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" />,
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          Number(rowA.original.px) * Math.abs(Number(rowA.original.sz)) -
          Number(rowB.original.px) * Math.abs(Number(rowB.original.sz)),
        meta: { label: t('Trade Value') }
      }),

      columnHelper.accessor('fee', {
        id: 'fee',
        header: () => t('Fee'),
        cell: (info) => '$' + Number(info.getValue()).toFixed(2),
        enableSorting: true,
        sortingFn: (rowA, rowB) => Number(rowA.original.fee) - Number(rowB.original.fee),
        meta: { label: t('Fee') }
      }),

      columnHelper.accessor('closedPnl', {
        id: 'closedPnl',
        header: () => t('Closed PnL'),
        cell: (info) => info.getValue(),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          Number(rowA.original.closedPnl) - Number(rowB.original.closedPnl),
        meta: { label: t('Closed PnL') }
      }),
      columnHelper.accessor('crossed', {
        id: 'crossed',
        header: () => t('Crossed'),
        cell: (info) => (info.getValue() ? t('Yes') : t('No')),
        enableSorting: false,
        meta: { label: t('Crossed') }
      })
    ],
    [t, columnHelper]
  )

  const table = useReactTable({
    data: tradeHistory,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  // const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
  //   const formatValue = (key: string, value: unknown) => {
  //     if (key === 'crossed') {
  //       return value === true ? 'Yes' : 'No'
  //     }
  //     return value ?? '-'
  //   }
  //   return (
  //     <div className="flex flex-col gap-2 text-white text-sm">
  //       {columns?.map((col) => (
  //         <div key={col?.key} className="flex justify-between">
  //           <span className="text-[#8B8BA0]">{col?.label}</span>
  //           <span className={col?.key === 'contract' ? 'truncate' : ''}>
  //             <span
  //               className={`flex items-center gap-x-2 ${
  //                 col?.key === 'crossed'
  //                   ? `${item?.crossed ? 'bg-[#28283e] text-green' : 'bg-[#27273b] text-red'} px-1.5 py-1 w-fit rounded-lg font-medium`
  //                   : col?.key === 'side'
  //                     ? 'text-red'
  //                     : ''
  //               }`}
  //             >
  //               {String(formatValue(col?.key, item[col?.key]))}
  //             </span>
  //           </span>
  //         </div>
  //       ))}
  //     </div>
  //   )
  // }

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
