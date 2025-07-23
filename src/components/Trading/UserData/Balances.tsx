'use client'
import { useAccount } from 'wagmi'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import { useState, useMemo, useEffect } from 'react'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table'
import SendModal from './component/SendModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react'
import { useScreenSize } from '@/hooks/useScreenSize'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'

type BalanceProps = {
  setSelectedAsset: (asset: string) => void
}

type BalanceData = {
  coin: string
  token: string | number
  total: string | number
  hold: string | number
  entryNtl: string | number
}

const Balances = ({ setSelectedAsset }: BalanceProps) => {
  const { isConnected } = useAccount()
  const { clearingHouseState, spotState } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      spotState: state.spotState,
      agentWallet: state.agentWallet
    }))
  )
  const [sorting, setSorting] = useState<SortingState>([])
  const [isMounted, setIsMounted] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [coin, setCoin] = useState('')
  const columnHelper = useMemo(() => createColumnHelper<BalanceData>(), [])
  const { isTablet, isMobile } = useScreenSize()
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const combinedData = useMemo(() => {
    if (!isConnected) return []

    const perpData = {
      coin: 'USDC(Perps)',
      token: 'USDC',
      total: clearingHouseState?.marginSummary?.accountValue || '-',
      hold: clearingHouseState?.withdrawable || '-',
      entryNtl: '-'
    }

    const spotData =
      spotState?.balances?.map((state) => ({
        ...state,
        coin: state.coin === 'USDC' ? 'USDC(Spot)' : state.coin
      })) || []

    return [perpData, ...spotData]
  }, [
    isConnected,
    clearingHouseState?.marginSummary?.accountValue,
    clearingHouseState?.withdrawable,
    spotState?.balances
  ])

  const columns = useMemo(
    () => [
      columnHelper.accessor('coin', {
        id: 'coin',
        header: () => <span className="flex justify-start items-center gap-1">Coin</span>,
        cell: (info) => {
          const coin = info.getValue().replace('(', ' (')
          if (coin === 'USDC (Spot)' || coin === 'USDC (Perps)')
            return <span className="text-white text-xs">{coin}</span>
          return (
            <Button
              variant="link"
              size="defaultLink"
              className="text-accent-foreground font-bold text-xs hover:text-accent-foreground transition-all hover:no-underline"
              onClick={() => {
                setSelectedAsset(coin)
                router.push(`/spot`)
              }}
            >
              {coin}
            </Button>
          )
        },
        enableSorting: true,
        meta: { label: 'Coin' }
      }),
      columnHelper.accessor('token', {
        id: 'token',
        header: () => <span className="flex justify-start items-center gap-1">Tokens</span>,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Tokens' }
      }),
      columnHelper.accessor('total', {
        id: 'total',
        header: () => <span className="flex justify-start items-center gap-1">Total Balance</span>,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Total Balance' }
      }),
      columnHelper.accessor('hold', {
        id: 'hold',
        header: () => <span className="flex justify-start items-center gap-1">Hold</span>,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Hold' }
      }),
      columnHelper.accessor((row) => Number(row.entryNtl) / Number(row.total), {
        id: 'averagePrice',
        header: () => <span className="flex justify-start items-center gap-1">Average Price</span>,
        cell: (info) => (isNaN(info.getValue()) ? '-' : info.getValue().toFixed(2)),
        enableSorting: true,
        meta: { label: 'Average Price' }
      }),
      columnHelper.display({
        id: 'send',
        header: () => <span className="flex justify-start items-center gap-1">Send</span>,
        cell: (info) => {
          const coin = info.row.original.coin
          if (coin === 'USDC(Perps)') return '--'

          return (
            <Button
              onClick={() => {
                setCoin(() => coin)
                setIsSendModalOpen(true)
              }}
              variant={'link'}
              size={'sm'}
              className="text-xs !p-0"
            >
              Send
            </Button>
          )
        },
        enableSorting: false,
        meta: { label: 'Send' }
      })
    ],
    [columnHelper, isSendModalOpen]
  )
  const table = useReactTable({
    data: combinedData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  if (!isMounted) {
    return null
  }

  if (!isConnected) {
    return <WalletNotConnected />
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
                    {item === 'Coin' && <Separator className="w-full bg-white/10" />}
                  </div>
                ))}
                {isSendModalOpen && (
                  <SendModal
                    isOpen={isSendModalOpen}
                    onClose={() => setIsSendModalOpen(false)}
                    spotDefaultName={coin}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col rounded-md gap-2">
      <Table>
        <TableHeader>
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
                    header.id === 'coin' ? 'justify-start' : 'justify-end',
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
      {isSendModalOpen && (
        <SendModal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          spotDefaultName={coin}
        />
      )}
    </div>
  )
}

export default Balances
