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
import { truncateAddress } from '@/utils/utils'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { Separator } from '@/components/ui/separator'
import { useScreenSize } from '@/hooks/useScreenSize'
import { useTranslate } from '@tolgee/react'
import { isTestnet } from '@/utils/constants'
type FilteredLedgerUpdate = {
  time: number
  hash: `0x${string}`
  delta: {
    type: 'deposit' | 'withdraw' | 'accountClassTransfer' | 'send'
    usdc?: string
    toPerp?: boolean
    fee?: string
    nonce?: number
    // send type fields
    user?: string
    destination?: string
    token?: string
    amount?: string
    usdcValue?: string
  }
  isPending?: boolean
}

const columnHelper = createColumnHelper<FilteredLedgerUpdate>()

const getArbiscanUrl = (hash: string) => {
  return isTestnet ? `https://sepolia.arbiscan.io/tx/${hash}` : `https://arbiscan.io/tx/${hash}`
}

const getHyperliquidExplorerUrl = (hash: string) => {
  return isTestnet
    ? `https://testnet.hyperliquid.xyz/explorer/tx/${hash}`
    : `https://app.hyperliquid.xyz/explorer/tx/${hash}`
}

const getActionLabel = (type: string) => {
  switch (type) {
    case 'deposit':
      return 'Deposit'
    case 'withdraw':
      return 'Withdrawal'
    case 'accountClassTransfer':
      return 'Transfer'
    case 'send':
      return 'Send'
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
    case 'send':
      return delta.user ? truncateAddress(delta.user) : '--'
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
    case 'send':
      return delta.destination ? truncateAddress(delta.destination) : '--'
    default:
      return '--'
  }
}

const getValueChange = (delta: FilteredLedgerUpdate['delta'], connectedAddress?: string) => {
  const amount = Number(delta.usdc || delta.usdcValue || '0')
  switch (delta.type) {
    case 'deposit':
      return amount
    case 'withdraw':
      return -Math.abs(amount)
    case 'accountClassTransfer':
      return delta.toPerp ? amount : -Math.abs(amount)
    case 'send': {
      // If connected user is the sender, it's negative (outgoing)
      // If connected user is the destination, it's positive (incoming)
      const isSender =
        connectedAddress && delta.user?.toLowerCase() === connectedAddress.toLowerCase()
      return isSender ? -Math.abs(amount) : amount
    }
    default:
      return amount
  }
}

const DepositsWithdrawalsTable: React.FC<{ isRTL: boolean }> = ({ isRTL }) => {
  const { t } = useTranslate()
  const { isConnected, address } = useAccount()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }])
  const [mounted, setMounted] = useState(false)
  const { ledgerUpdates, pendingWithdrawals } = useHyperliquidStore(
    useShallow((state) => ({
      ledgerUpdates: state.ledgerUpdates,
      pendingWithdrawals: state.pendingWithdrawals
    }))
  )
  const { isTablet, isMobile } = useScreenSize()

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredData = useMemo(() => {
    // Filter completed transactions from WebSocket
    const completed = ledgerUpdates
      .filter((update) => {
        const deltaType = update.delta.type as string
        if (isTestnet) {
          // Testnet only has transfers between perps and spot (no deposit/withdraw)
          return deltaType === 'accountClassTransfer' || deltaType === 'send'
        }
        // Mainnet has deposit, withdraw, transfers, and sends
        return (
          deltaType === 'deposit' ||
          deltaType === 'withdraw' ||
          deltaType === 'accountClassTransfer' ||
          deltaType === 'send'
        )
      })
      .map((update) => update as unknown as FilteredLedgerUpdate)

    // Convert pending withdrawals to the same format (mainnet only)
    const pending: FilteredLedgerUpdate[] = pendingWithdrawals.map((pw) => ({
      time: pw.timestamp,
      hash: '0x' as `0x${string}`, // No hash yet for pending
      delta: {
        type: 'withdraw' as const,
        usdc: pw.displayAmount,
        fee: pw.fee,
        nonce: 0
      },
      isPending: true
    }))

    // Merge pending (at top) with completed
    return [...pending, ...completed]
  }, [ledgerUpdates, pendingWithdrawals])

  const columns = useMemo(
    () => [
      columnHelper.accessor('time', {
        id: 'timestamp',
        header: () => t('Time'),
        cell: (info) => {
          const timeString = new Date(info.getValue()).toLocaleString('en-US')
          const isPending = info.row.original.isPending
          const deltaType = info.row.original.delta.type
          const hash = info.row.original.hash

          // No link for pending items
          if (isPending) {
            return <span>{timeString}</span>
          }

          // Use Hyperliquid explorer for send and accountClassTransfer (L1 transactions)
          // Use Arbiscan for deposit/withdraw (Arbitrum bridge transactions) - mainnet only
          const isHyperliquidTx = deltaType === 'send' || deltaType === 'accountClassTransfer'
          const url = isHyperliquidTx ? getHyperliquidExplorerUrl(hash) : getArbiscanUrl(hash)

          // No Arbiscan link for testnet deposit/withdraw
          if (isTestnet && !isHyperliquidTx) {
            return <span>{timeString}</span>
          }

          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-accent-foreground transition-colors"
            >
              {timeString}
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
        cell: (info) => {
          const isPending = info.row.original.isPending
          return isPending ? (
            <span className="text-yellow-500">{t('Pending')}</span>
          ) : (
            <span className="text-green">{t('Completed')}</span>
          )
        },
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
      columnHelper.accessor((row) => getValueChange(row.delta, address), {
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
          getValueChange(rowA.original.delta, address) -
          getValueChange(rowB.original.delta, address),
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
    [t, address]
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
