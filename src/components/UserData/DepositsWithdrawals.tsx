'use client'
import React, { useState, useEffect, useMemo } from 'react'
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
import {
  IconChevronDown,
  IconChevronUp,
  IconSelector,
  IconExternalLink,
  IconDownloadOff
} from '@tabler/icons-react'
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
import { formatTimestamp } from '@/utils/format'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { useScreenSize } from '@/hooks/useScreenSize'
import { isTestnet } from '@/utils/constants'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
type FilteredLedgerUpdate = {
  time: number
  hash: `0x${string}`
  delta: {
    type: 'deposit' | 'withdraw' | 'accountClassTransfer' | 'send' | 'internalTransfer'
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
    case 'internalTransfer':
      return 'Internal Transfer'
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
    case 'internalTransfer':
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
    case 'internalTransfer':
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
    case 'send':
    case 'internalTransfer': {
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
  const { isConnected, address } = useConnection()
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
          return (
            deltaType === 'accountClassTransfer' ||
            deltaType === 'send' ||
            deltaType === 'internalTransfer'
          )
        }
        // Mainnet has deposit, withdraw, transfers, and sends
        return (
          deltaType === 'deposit' ||
          deltaType === 'withdraw' ||
          deltaType === 'accountClassTransfer' ||
          deltaType === 'send' ||
          deltaType === 'internalTransfer'
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
        header: () => 'Time',
        cell: (info) => {
          const timeString = formatTimestamp(info.getValue())
          const isPending = info.row.original.isPending
          const deltaType = info.row.original.delta.type
          const hash = info.row.original.hash

          // No link for pending items
          if (isPending) {
            return <span>{timeString}</span>
          }

          // Use Hyperliquid explorer for send, accountClassTransfer, and internalTransfer (L1 transactions)
          // Use Arbiscan for deposit/withdraw (Arbitrum bridge transactions) - mainnet only
          const isHyperliquidTx =
            deltaType === 'send' ||
            deltaType === 'accountClassTransfer' ||
            deltaType === 'internalTransfer'
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
        meta: { label: 'Time' }
      }),
      columnHelper.display({
        id: 'status',
        header: () => 'Status',
        cell: (info) => {
          const isPending = info.row.original.isPending
          return isPending ? (
            <span className="text-yellow-500">{'Pending'}</span>
          ) : (
            <span className="text-green">{'Completed'}</span>
          )
        },
        enableSorting: false,
        meta: { label: 'Status' }
      }),
      columnHelper.accessor((row) => row.delta.type, {
        id: 'action',
        header: () => 'Action',
        cell: (info) => getActionLabel(info.getValue()),
        enableSorting: false,
        meta: { label: 'Action' }
      }),
      columnHelper.accessor((row) => getSource(row.delta), {
        id: 'source',
        header: () => 'Source',
        cell: (info) => info.getValue(),
        enableSorting: false,
        meta: { label: 'Source' }
      }),
      columnHelper.accessor((row) => getDestination(row.delta), {
        id: 'destination',
        header: () => 'Destination',
        cell: (info) => info.getValue(),
        enableSorting: false,
        meta: { label: 'Destination' }
      }),
      columnHelper.accessor((row) => getValueChange(row.delta, address), {
        id: 'valueChange',
        header: () => 'Account Value Change',
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
        meta: { label: 'Account Value Change' }
      }),
      columnHelper.accessor((row) => row.delta.fee, {
        id: 'fee',
        header: () => 'Fee',
        cell: (info) => {
          const fee = info.getValue()
          if (!fee || fee === '0') return '--'
          return `${Number(fee).toFixed(2)} USDC`
        },
        enableSorting: false,
        meta: { label: 'Fee' }
      })
    ],
    [address]
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
  if (table.getRowModel().rows.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center py-12 justify-center gap-2">
        <IconDownloadOff className="size-10 text-white" />
        <span className="text-white">{'No Deposits or Withdrawals Found'}</span>
        <p className="text-white/70 text-center text-xs">{'Deposits Funds to get started'}</p>
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
            const actionType = getActionLabel(row.original.delta.type)
            const valueChange = getValueChange(row.original.delta, address)
            const isPending = row.original.isPending
            const isPositive = valueChange >= 0

            return (
              <Collapsible key={row.id} className="w-full">
                <CollapsibleTrigger className="w-full">
                  <div className="w-full flex items-center justify-between p-4 bg-background rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-xs">{actionType}</span>
                      {isPending && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500">
                          {'Pending'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs', isPositive ? 'text-green' : 'text-red')}>
                        {isPositive ? '+' : '-'}${Math.abs(valueChange).toFixed(2)}
                      </span>
                      <IconChevronDown className="size-4 text-white/70" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-2 bg-background rounded-b-md flex flex-col gap-2 -mt-2">
                    {/* Info rows - skip action (index 2) as it's in the header */}
                    {header.map((item, index) => {
                      // Skip action as it's in the header
                      if (index === 2) return null
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
    </div>
  )
}

export default dynamic(() => Promise.resolve(DepositsWithdrawalsTable), { ssr: false })
