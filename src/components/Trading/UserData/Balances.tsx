'use client'
import { useAccount } from 'wagmi'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import { useState, useMemo, useEffect } from 'react'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { useHyperliquid } from '@/store/HyperliquidStore'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table'
import HeaderWithIcons from './component/HeaderWithIcon'
import SendModal from './component/SendModal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { IconArrowMoveDown, IconArrowMoveUp, IconArrowsMoveVertical } from '@tabler/icons-react'

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

type BalanceData = {
  coin: string
  token: string | number
  total: string | number
  hold: string | number
  entryNtl: string | number
}

const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
  return (
    <div className="flex flex-col gap-2 text-white text-sm">
      {columns?.map((col) => (
        <div key={col?.key} className="flex justify-between">
          <span className="text-[#8B8BA0]">{col?.label}</span>
          <span className={col?.key === 'contract' ? 'truncate' : ''}>{item[col?.key] ?? '-'}</span>
        </div>
      ))}
    </div>
  )
}

const Balances = () => {
  const { isConnected } = useAccount()
  const { clearingHouseState, spotState } = useHyperliquid()
  const [sorting, setSorting] = useState<SortingState>([])
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const columnHelper = useMemo(() => createColumnHelper<BalanceData>(), [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const columns = useMemo(
    () => [
      columnHelper.accessor('coin', {
        id: 'coin',
        header: () => <HeaderWithIcons label="Coin" />,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Coin' }
      }),
      columnHelper.accessor('token', {
        id: 'token',
        header: () => <HeaderWithIcons label="Tokens" />,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Tokens' }
      }),
      columnHelper.accessor('total', {
        id: 'total',
        header: () => <HeaderWithIcons label="Total Balance" />,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Total Balance' }
      }),
      columnHelper.accessor('hold', {
        id: 'hold',
        header: () => <HeaderWithIcons label="Hold" />,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Hold' }
      }),
      columnHelper.accessor('entryNtl', {
        id: 'entryNtl',
        header: () => <HeaderWithIcons label="Entry NTL" />,
        cell: (info) => info.getValue(),
        enableSorting: true,
        meta: { label: 'Entry NTL' }
      }),
      columnHelper.display({
        id: 'send',
        header: () => <HeaderWithIcons label="Send" />,
        cell: (info) => {
          const coin = info.row.original.coin
          if (coin === 'USDC(Perps)') return '--'
          return (
            <button
              onClick={() => {
                setSelectedToken(coin)
                setIsSendModalOpen(true)
              }}
              className="text-[#7A6FA7] hover:text-[#E8E0F1]"
            >
              Send
            </button>
          )
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

  const tableData = useMemo(
    () =>
      table.getRowModel().rows.map((row) => {
        const rowData: Record<string, unknown> = {}
        row.getVisibleCells().forEach((cell) => {
          rowData[cell.column.id] = cell.getValue()
        })
        return rowData
      }),
    [table.getRowModel().rows]
  )

  const tableColumns = useMemo(
    () =>
      columns.map((col) => ({
        key: col.id as string,
        label: col.meta && 'label' in col.meta ? String(col.meta.label) : ''
      })),
    [columns]
  )

  if (!isMounted) {
    return null
  }

  if (!isConnected) {
    return <WalletNotConnected />
  }


  return (
    <div className='w-full h-full flex flex-col gap-2'>
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
                    header.column.columnDef.enableSorting ? 'hover:text-accent-foreground' : 'hover:text-white/50',
                    (header.column.getIsSorted() === 'asc' || header.column.getIsSorted() === 'desc') ? 'text-accent-foreground' : 'text-white/50'
                  )}
                >
                  {header.isPlaceholder ? null : (
                    <>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.columnDef.enableSorting ? header.column.getIsSorted() === 'asc' ? <IconArrowMoveUp className='text-inherit size-4' /> :
                        header.column.getIsSorted() === 'desc' ? <IconArrowMoveDown className='text-inherit size-4' /> : <IconArrowsMoveVertical className='text-inherit size-4' /> : null}
                    </>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="font-medium text-white text-xs first:text-left text-right">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table >
      <ResponsiveDataCard
        columns={tableColumns}
        data={tableData}
        renderRow={(item) => <RenderRowData item={item} columns={tableColumns} />}
      />
      {isSendModalOpen && (
        <SendModal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          spotDefaultName={selectedToken}
        />
      )}
    </div>
  )
}

export default Balances
