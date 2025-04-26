'use client'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useHyperLiquid } from '@/context/HyperLiquid'
import useIsSpot from '@/hooks/useIsSpot'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table'
import HeaderWithIcons from './component/HeaderWithIcon'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import { IOpenOrder } from '@/utils/hyperliquid/webData2Types'
import dynamic from 'next/dynamic'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

interface RenderCancelButtonProps {
  row: {
    original: IOpenOrder & { meta?: { label: string } }
  }
}

const columnHelper = createColumnHelper<IOpenOrder & { meta?: { label: string } }>()

const OpenOrders = () => {
  const { isConnected } = useAccount()
  const { sdk, openOrders } = useHyperLiquid()
  const isSpot = useIsSpot()

  const [sorting, setSorting] = useState<SortingState>([])
  const renderCancelAllButton = useCallback(() => {
    return (
      <button
        className="bg-[#27273b] text-[#E2464A] font-bold py-1 px-2.5 rounded cursor-pointer"
        onClick={async () => {
          await sdk.custom.cancelAllOrders()
        }}
      >
        Cancel All
      </button>
    )
  }, [sdk])

  const renderCancelButton = useCallback(
    (
      rowOrOrder: RenderCancelButtonProps['row'] | (IOpenOrder & { meta?: { label: string } })
    ) => {
      const order = 'original' in rowOrOrder ? rowOrOrder?.original : rowOrOrder
      return (
        <button
          className="py-0.5 text-sm px-2 cursor-pointer bg-[#27273b] text-[#E2464A] font-bold rounded"
          onClick={async () => {
            await sdk.exchange.cancelOrder({ coin: order?.coin, o: order?.oid })
          }}
        >
          Cancel
        </button>
      )
    },
    [sdk]
  )

  const getCellClass = (columnId: string, cellValue: unknown): string => {
    const baseClass = 'opacity-80 font-normal text-sm'
    if (columnId === 'side') {
      const value = (cellValue as string)?.toLowerCase()
      if (value === 'buy') {
        return `${baseClass} text-[#2FA766]`
      } else if (value === 'sell') {
        return `${baseClass} text-[#E2464A]`
      }
    }
    return `${baseClass} text-[#FFFFFF]`
  }

  const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
    return (
      <div className="flex flex-col gap-2 text-white text-sm">
        {columns?.map((col) => {
          const isAction = col?.key === 'actions'
          return (
            <div key={col?.key} className="flex justify-between items-center">
              {isAction ? (
                renderCancelAllButton()
              ) : (
                <span className="text-[#8B8BA0]">{col?.label}</span>
              )}
              {isAction ? (
                renderCancelButton(item)
              ) : (
                <span className={col?.key === 'contract' ? 'truncate' : ''}>
                  <span
                    className={`
                      flex px-1.5 py-1 w-fit rounded-lg font-medium items-center gap-x-2
                      ${
                        col?.key === 'side'
                          ? item[col?.key]?.toLowerCase() === 'buy'
                            ? 'text-[#2FA766]'
                            : item[col?.key]?.toLowerCase() === 'sell'
                              ? 'text-[#E2464A]'
                              : ''
                          : ''
                      }
                    `}
                  >
                    {item[col?.key] ?? '-'}
                  </span>
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  }
  
  const [mounted, setMounted] = useState(false)

  // Use useEffect to set mounted to true after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const data = useMemo(
    () => openOrders.filter((o) => o.coin.includes(isSpot ? 'SPOT' : 'PERP')),
    [openOrders, isSpot]
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('coin', {
        id: 'coin',
        header: () => <HeaderWithIcons label="Coin" />,
        cell: (info) => info.getValue(),
        enableSorting: false,
        meta: { label: 'Coin' }
      }),
      columnHelper.accessor('side', {
        id: 'side',
        header: () => <HeaderWithIcons label="Side" />,
        cell: (info) => info.getValue(),
        enableSorting: false,
        meta: { label: 'Side' }
      }),
      columnHelper.accessor('limitPx', {
        id: 'px',
        header: () => <HeaderWithIcons label="Limit Price" />,
        cell: (info) => info.getValue(),
        meta: { label: 'Limit Price' }
      }),
      columnHelper.accessor('sz', {
        id: 'sz',
        header: () => <HeaderWithIcons label="Size" />,
        cell: (info) => info.getValue(),
        meta: { label: 'Size' }
      }),
      columnHelper.accessor('oid', {
        id: 'oid',
        header: () => <HeaderWithIcons label="Order ID" />,
        cell: (info) => info.getValue(),
        enableSorting: false,
        meta: { label: 'Order ID' }
      }),
      columnHelper.accessor('timestamp', {
        id: 'timestamp',
        header: () => <HeaderWithIcons label="Timestamp" />,
        cell: (info) => new Date(info.getValue()).toLocaleString(),
        meta: { label: 'Timestamp' }
      }),
      columnHelper.accessor('origSz', {
        id: 'origSz',
        header: () => <HeaderWithIcons label="Original Size" />,
        cell: (info) => info.getValue(),
        meta: { label: 'Original Size' }
      }),
      columnHelper.display({
        id: 'actions',
        header: () => renderCancelAllButton(),
        cell: ({ row }) => renderCancelButton(row),
        enableSorting: false,
        meta: { label: 'Actions' }
      })
    ],
    [sdk, renderCancelButton, renderCancelAllButton]
  )

  const table = useReactTable({
    data,
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
    return <div className="overflow-x-auto w-full px-3 h-40"></div>
  }

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full hidden lg:table text-white">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg?.headers?.map((header, index) => {
                const isLast = index === hg?.headers?.length - 1
                return (
                  <th
                    key={header.id}
                    className={`pt-3 pb-1 text-sm font-normal text-[#8B8BA0] text-left cursor-pointer ${
                      !isLast ? 'max-[1025px]:px-7 px-5' : ''
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-white/10">
              {row.getVisibleCells().map((cell, cellIndex) => {
                const columnId = cell.column.id
                const cellValue = cell.getValue()
                const isLastCell = cellIndex === row?.getVisibleCells().length - 1
                const customClass = getCellClass(columnId, cellValue)
                return (
                  <td key={cell.id} className={`py-3.5 ${isLastCell ? '' : 'px-5'}`}>
                    <div className={customClass}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={columns.map((col) => ({
          key: col?.id as string,
          label: col?.meta && 'label' in col.meta ? String(col?.meta?.label) : ''
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
              label: col?.meta && 'label' in col.meta ? String(col?.meta?.label) : ''
            }))}
          />
        )}
      />
    </div>
  )
}

// Export a dynamic version of the component with ssr disabled
export default dynamic(() => Promise.resolve(OpenOrders), { ssr: false })
