'use client'
import { useAccount } from 'wagmi'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import { useState, useMemo } from 'react'
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
  const columnHelper = useMemo(() => createColumnHelper<BalanceData>(), [])

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
      spotState?.balances.map((state) => ({
        ...state,
        coin: (state.coin === 'USDC' ? 'USDC(Spot)' : state.coin).replace('PERP', 'SPOT')
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

  if (!isConnected) {
    return <WalletNotConnected />
  }

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full hidden lg:table text-white">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="pt-3 pb-1 px-7 text-sm font-normal text-[#8B8BA0] text-left"
                >
                  {header.isPlaceholder ? null : (
                    <button
                      onClick={header.column.getToggleSortingHandler()}
                      className="flex justify-start items-center gap-1"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: '▲',
                        desc: '▼'
                      }[header.column.getIsSorted() as string] ?? null}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-white/10">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-4 px-7 opacity-80 text-white font-medium text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={tableColumns}
        data={tableData}
        renderRow={(item) => <RenderRowData item={item} columns={tableColumns} />}
      />
    </div>
  )
}

export default Balances
