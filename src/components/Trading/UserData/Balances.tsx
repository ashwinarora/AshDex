'use client'
import { useAccount } from 'wagmi'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import { useState, useMemo, useEffect } from 'react'
// import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { useHyperliquid } from '@/store/HyperliquidStore'
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
import { IconArrowMoveDown, IconArrowMoveUp, IconArrowsMoveVertical } from '@tabler/icons-react'
import { useScreenSize } from '@/hooks/useScreenSize'


type BalanceData = {
  coin: string
  token: string | number
  total: string | number
  hold: string | number
  entryNtl: string | number
}

const Balances = () => {
  const { isConnected } = useAccount()
  const { clearingHouseState, spotState } = useHyperliquid()
  const [sorting, setSorting] = useState<SortingState>([])
  const [isMounted, setIsMounted] = useState(false)
  const columnHelper = useMemo(() => createColumnHelper<BalanceData>(), [])
  const { isTablet } = useScreenSize()


  useEffect(() => {
    setIsMounted(true)
  }, [])

  const columns = useMemo(
    () => [
      columnHelper.accessor('coin', {
        id: 'coin',
        header: () => <span className="flex justify-start items-center gap-1">Coin</span>,
        cell: (info) => info.getValue().replace('(', ' ('),
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
      columnHelper.accessor('entryNtl', {
        id: 'entryNtl',
        header: () => <span className="flex justify-start items-center gap-1">Entry NTL</span>,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Entry NTL' }
      }),
      columnHelper.display({
        id: 'send',
        header: () => <span className="flex justify-start items-center gap-1">Send</span>,
        cell: (info) => {
          const coin = info.row.original.coin
          if (coin === 'USDC(Perps)') return '--'


          return <SendModal spotDefaultName={coin} />
        },
        enableSorting: false,
        meta: { label: 'Send' }
      })
    ],
    [columnHelper]
  )

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


  if (isTablet) {
    return <div className="w-full h-full flex flex-col rounded-md gap-2">
      <div className='flex xl:hidden flex-col items-center justify-start gap-2'>
        {combinedData.map((data, index) => {
          const header = Object.keys(data)
          const cell = Object.values(data)
          return (
            <div key={index} className='w-full flex flex-col justify-between rounded-md h-40 bg-accent p-4'>
              {header.map((item, index) => (<div key={index} className='flex text-xs justify-between'>
                <span className='text-white/50'>{item.charAt(0).toUpperCase() + item.slice(1) || '-'}</span>
                <span className='text-white'>{cell[index] || '-'}</span>
              </div>))}
            </div>
          )
        })}
      </div>
    </div>
  }


  return (
    <div className="w-full h-full flex flex-col rounded-md gap-2">
      <Table className='hidden xl:flex'>
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
    </div>
  )
}

export default Balances
