"use client"
import { useHyperliquid } from '@/store/HyperliquidStore'
import { IconSelector, IconStar, IconStarFilled, IconTriangleFilled, IconTriangleInvertedFilled } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { useFavorites } from '@/context/FavoritesContext'
import ReactiveText from '@/components/common/ReactiveText'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  SortingState
} from '@tanstack/react-table'

interface AssetTableProps {
  searchTerm: string
  setSelectedAsset: (asset: string) => void
}

interface PerpAssetData {
  symbol: string
  price: number
  prevDayPrice: number
  volume: number
  openInterest: number
  maxLeverage: number
  isFavorite: boolean
}

const type = 'perp'

const formatPrice = (price: number | undefined | null) => {
  if (price === undefined || price === null) return '-'
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(numPrice)) return '-'
  return numPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })
}

const AssetTable = ({ searchTerm, setSelectedAsset }: AssetTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const { perpsMeta, perpAssetContext } = useHyperliquid()
  const { isFavorite, toggleFavorite } = useFavorites()

  // Build table data for Tanstack Table (show all perps, no filtering)
  const tableData: PerpAssetData[] = useMemo(() => {
    if (!perpsMeta || !perpAssetContext) return []
    const data = perpsMeta.universe
      .filter(asset => asset.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((asset, idx) => {
        const ctx = perpAssetContext[idx]
        const price = ctx?.midPx ? Number(ctx.midPx) : 0
        const prevDayPrice = ctx?.prevDayPx ? Number(ctx.prevDayPx) : 0
        const volume = ctx?.dayNtlVlm ? Number(ctx.dayNtlVlm) : 0
        const openInterest = ctx?.midPx && ctx?.openInterest ? Number(ctx.midPx) * Number(ctx.openInterest) : 0
        const maxLeverage = asset.maxLeverage || 1
        return {
          symbol: asset.name,
          price,
          prevDayPrice,
          volume,
          openInterest,
          maxLeverage,
          isFavorite: isFavorite(asset.name, type)
        }
      })
    return data
  }, [perpsMeta, perpAssetContext, isFavorite, searchTerm])

  const columnHelper = createColumnHelper<PerpAssetData>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', {
        id: 'symbol',
        header: () => (
          <div className="flex items-center gap-1">
            Market
            <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
          </div>
        ),
        cell: (info) => {
          const { symbol, isFavorite, maxLeverage } = info.row.original
          return (
            <div className="flex items-center gap-2 pl-2">
              <button
                onClick={e => {
                  e.stopPropagation()
                  toggleFavorite(
                    {
                      name: symbol,
                      value: info.row.original.price.toString(),
                      index: symbol,
                      price: info.row.original.price,
                      change24h: info.row.original.prevDayPrice
                    },
                    type
                  )
                }}
                className="focus:outline-none w-5 h-5 text-primary hover:scale-105 cursor-pointer"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? (
                  <IconStarFilled size={16} />
                ) : (
                  <IconStar size={16} className="opacity-50 text-white" />
                )}
              </button>
              <p>{symbol.split('-')[0]}-USDC</p>
              {maxLeverage && (
                <p className="bg-primary/40 px-2 rounded-md text-xs">{maxLeverage}×</p>
              )}
            </div>
          )
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          // Favorites always on top, then sort alphabetically
          if (rowA.original.isFavorite && !rowB.original.isFavorite) return -1
          if (!rowA.original.isFavorite && rowB.original.isFavorite) return 1
          const symbolA = rowA.original.symbol.toUpperCase()
          const symbolB = rowB.original.symbol.toUpperCase()
          return symbolA.localeCompare(symbolB)
        }
      }),
      columnHelper.accessor('price', {
        id: 'price',
        header: () => (
          <div className="flex items-center gap-1">
            Price
            <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
          </div>
        ),
        cell: (info) => {
          const price = info.getValue()
          const formattedPrice = formatPrice(price)
          return <div className="text-right">${formattedPrice}</div>
        },
        enableSorting: true
      }),
      columnHelper.accessor('prevDayPrice', {
        id: 'prevDayPrice',
        header: () => (
          <div className="flex items-center gap-1">
            24h Change
            <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
          </div>
        ),
        cell: (info) => {
          const { price, prevDayPrice } = info.row.original
          const difference = price - prevDayPrice
          const isPositive = difference >= 0
          const className = isPositive ? 'text-green' : 'text-red'
          return (
            <div className={`text-right ${className}`}>
              <div className="flex justify-end items-center">
                {isPositive ? (
                  <IconTriangleFilled size={8} className="mr-1" />
                ) : (
                  <IconTriangleInvertedFilled size={8} className="mr-1" />
                )}
                {difference !== undefined && prevDayPrice !== 0 && (
                  <>
                    <ReactiveText
                      precision={2}
                      value={difference}
                      type="currency"
                      isStatic={true}
                    />
                    (
                    <ReactiveText
                      precision={2}
                      value={prevDayPrice !== 0 ? (difference / prevDayPrice) * 100 : 0}
                      type="percentage"
                      isStatic={true}
                    />
                    )
                  </>
                )}
              </div>
            </div>
          )
        },
        enableSorting: true
      }),
      columnHelper.accessor('volume', {
        id: 'volume',
        header: () => (
          <div className="flex items-center gap-1">
            Volume
            <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
          </div>
        ),
        cell: (info) => {
          const volume = info.getValue()
          return (
            <div className="text-right">
              <ReactiveText value={Number(volume || 0)} type="currency" />
            </div>
          )
        },
        enableSorting: true
      }),
      columnHelper.accessor('openInterest', {
        id: 'openInterest',
        header: () => (
          <div className="flex items-center gap-1">
            Open Interest
            <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
          </div>
        ),
        cell: (info) => {
          const openInterest = info.getValue()
          return (
            <div className="text-right">
              <ReactiveText value={Number(openInterest || 0)} type="currency" />
            </div>
          )
        },
        enableSorting: true
      })
    ],
    [columnHelper, toggleFavorite]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  const handleRowClick = (symbol: string) => {
    setSelectedAsset(symbol)
  }

  return (
    <div className="h-[300px] overflow-y-auto no-scrollbar">
      <table className="min-w-full text-white text-sm">
        <thead className="top-0 z-10 sticky text-white/70 ">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="group px-6 py-3 active:text-white text-left whitespace-nowrap cursor-pointer"
                  onClick={() => {
                    if (header.column.getCanSort()) {
                      header.column.toggleSorting()
                    }
                  }}
                >
                  <div
                    className={`flex ${header.id !== 'symbol' ? 'justify-end' : 'justify-start'} items-center gap-1`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => handleRowClick(row.original.symbol)}
              className="hover:bg-white/5 transition-colors duration-150 cursor-pointer"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-2 px-6 font-medium whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AssetTable
