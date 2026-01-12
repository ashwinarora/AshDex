'use client'
import React, { useState, useEffect, useMemo } from 'react'
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
import { IconChevronDown, IconChevronUp, IconSelector, IconExternalLink } from '@tabler/icons-react'
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
import { isTestnet } from '@/utils/constants'
import * as hl from '@nktkas/hyperliquid'

type LedgerUpdate = hl.WsUserNonFundingLedgerUpdatesEvent['nonFundingLedgerUpdates'][number]

type FilteredLedgerUpdate = LedgerUpdate & {
  delta: {
    type: 'deposit' | 'withdraw' | 'accountClassTransfer'
    usdc: string
    toPerp?: boolean
    fee?: string
    nonce?: number
  }
}

const columnHelper = createColumnHelper<FilteredLedgerUpdate>()

const getArbiscanUrl = (hash: string) => {
  return isTestnet
    ? `https://sepolia.arbiscan.io/tx/${hash}`
    : `https://arbiscan.io/tx/${hash}`
}

const getActionLabel = (type: string) => {
  switch (type) {
    case 'deposit':
      return 'Deposit'
    case 'withdraw':
      return 'Withdrawal'
    case 'accountClassTransfer':
      return 'Transfer'
    default:
      return type
  }
}

const getSource = (delta: FilteredLedgerUpdate['delta']) => {
  switch (delta.type) {
    case 'deposit':
      return 'Arbitrum'
    case 'withdraw':
      return 'Perps'
    case 'accountClassTransfer':
      return delta.toPerp ? 'Spot' : 'Perps'
    default:
      return '--'
  }
}

const getDestination = (delta: FilteredLedgerUpdate['delta']) => {
  switch (delta.type) {
    case 'deposit':
      return 'Perps'
    case 'withdraw':
      return 'Arbitrum'
    case 'accountClassTransfer':
      return delta.toPerp ? 'Perps' : 'Spot'
    default:
      return '--'
  }
}

const getValueChange = (delta: FilteredLedgerUpdate['delta']) => {
  const amount = Number(delta.usdc)
  switch (delta.type) {
    case 'deposit':
      return amount
    case 'withdraw':
      return -Math.abs(amount)
    case 'accountClassTransfer':
      return delta.toPerp ? amount : -Math.abs(amount)
    default:
      return amount
  }
}

const DepositsWithdrawalsTable: React.FC<{ isRTL: boolean }> = ({ isRTL }) => {
  const { t } = useTranslate()
  const { isConnected } = useAccount()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }])
  const [mounted, setMounted] = useState(false)
  const { ledgerUpdates } = useHyperliquidStore(
    useShallow((state) => ({
      ledgerUpdates: state.ledgerUpdates
    }))
  )
  const { isTablet, isMobile } = useScreenSize()

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredData = useMemo(() => {
    return ledgerUpdates.filter(
      (update): update is FilteredLedgerUpdate =>
        update.delta.type === 'deposit' ||
        update.delta.type === 'withdraw' ||
        update.delta.type === 'accountClassTransfer'
    )
  }, [ledgerUpdates])

  const columns = useMemo(
    () => [
      columnHelper.accessor('time', {
        id: 'timestamp',
        header: () => t('Time'),
        cell: (info) => {
          const hash = info.row.original.hash
          return (
            <a
              href={getArbiscanUrl(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-accent-foreground transition-colors"
            >
              {new Date(info.getValue()).toLocaleString('en-US')}
              <IconExternalLink className="size-3" />
            </a>
          )
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => rowA.original.time - rowB.original.time,
        meta: { label: t('Time') }
      }),
      columnHelper.display({
        id: 'status',
        header: () => t('Status'),
        cell: () => <span className="text-green">{t('Completed')}</span>,
        enableSorting: false,
        meta: { label: t('Status') }
      }),
      columnHelper.accessor((row) => row.delta.type, {
        id: 'action',
        header: () => t('Action'),
        cell: (info) => getActionLabel(info.getValue()),
        enableSorting: false,
        meta: { label: t('Action') }
      }),
      columnHelper.accessor((row) => getSource(row.delta), {
        id: 'source',
        header: () => t('Source'),
        cell: (info) => info.getValue(),
        enableSorting: false,
        meta: { label: t('Source') }
      }),
      columnHelper.accessor((row) => getDestination(row.delta), {
        id: 'destination',
        header: () => t('Destination'),
        cell: (info) => info.getValue(),
        enableSorting: false,
        meta: { label: t('Destination') }
      }),
      columnHelper.accessor((row) => getValueChange(row.delta), {
        id: 'valueChange',
        header: () => t('Account Value Change'),
        cell: (info) => {
          const value = info.getValue()
          const isPositive = value >= 0
          return (
            <span className={isPositive ? 'text-green' : 'text-red'}>
              {isPositive ? '' : '-'}
              {Math.abs(value).toFixed(2)} USDC
            </span>
          )
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          getValueChange(rowA.original.delta) - getValueChange(rowB.original.delta),
        meta: { label: t('Account Value Change') }
      }),
      columnHelper.accessor((row) => row.delta.fee, {
        id: 'fee',
        header: () => t('Fee'),
        cell: (info) => {
          const fee = info.getValue()
          if (!fee || fee === '0') return '--'
          return `${Number(fee).toFixed(2)} USDC`
        },
        enableSorting: false,
        meta: { label: t('Fee') }
      })
    ],
    [t]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  if (!isConnected) {
    return <WalletNotConnected />
  }

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
                    {(item === t('Action') || item === t('Destination')) && (
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
    </div>
  )
}

export default dynamic(() => Promise.resolve(DepositsWithdrawalsTable), { ssr: false })
