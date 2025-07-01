'use client'
import { useHyperliquid } from '@/store/HyperliquidStore'
import {
  IconSelector,
  IconStar,
  IconStarFilled,
  IconTriangleFilled,
  IconTriangleInvertedFilled
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { useFavorites } from '@/store/FavoritesStore'
import ReactiveText from '@/components/common/ReactiveText'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  SortingState
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface AssetTableProps {
  searchTerm: string
  setSelectedAsset: (asset: string) => void
  selectedAsset: string
  setIsOpen: (isOpen: boolean) => void
}

interface PerpAssetData {
  symbol: string
  price: number
  prevDayPrice: number
  volume: number
  openInterest: number
  maxLeverage: number
}

const formatPrice = (price: number | undefined | null) => {
  if (price === undefined || price === null) return '-'
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(numPrice)) return '-'
  return numPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })
}

const AssetTable = ({
  searchTerm,
  setSelectedAsset,
  selectedAsset,
  setIsOpen
}: AssetTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const { perpsMeta, perpAssetContext } = useHyperliquid()
  const { favorites, toggleFavorite } = useFavorites(false)

  // Build table data for Tanstack Table (show all perps, no filtering)
  const tableData: PerpAssetData[] = useMemo(() => {
    if (!perpsMeta || !perpAssetContext) return []
    const data = perpsMeta.universe
      .filter((asset) => asset.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((asset, idx) => {
        const ctx = perpAssetContext[idx]
        const price = ctx?.midPx ? Number(ctx.midPx) : 0
        const prevDayPrice = ctx?.prevDayPx ? Number(ctx.prevDayPx) : 0
        const volume = ctx?.dayNtlVlm ? Number(ctx.dayNtlVlm) : 0
        const openInterest =
          ctx?.midPx && ctx?.openInterest ? Number(ctx.midPx) * Number(ctx.openInterest) : 0
        const maxLeverage = asset.maxLeverage || 1
        return {
          symbol: asset.name,
          price,
          prevDayPrice,
          volume,
          openInterest,
          maxLeverage
        }
      })
    return data
  }, [perpsMeta, perpAssetContext, searchTerm])

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
          const { symbol, maxLeverage } = info.row.original
          const isFavorite = favorites.has(symbol)
          return (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(symbol)
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
              <p className="text-white">{symbol.split('-')[0]}-USDC</p>
              {maxLeverage && (
                <p className="bg-primary/40 px-2 rounded-md text-xs">{maxLeverage}×</p>
              )}
            </div>
          )
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          // Favorites always on top, then sort alphabetically
          if (favorites.has(rowA.original.symbol) && !favorites.has(rowB.original.symbol)) return -1
          if (!favorites.has(rowA.original.symbol) && favorites.has(rowB.original.symbol)) return 1
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
          return <div className="text-right text-white text-xs">${formattedPrice}</div>
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
            <div className={`text-right text-xs ${className}`}>
              <div className="flex justify-end items-center">
                {isPositive ? (
                  <IconTriangleFilled className="size-2 mr-1" />
                ) : (
                  <IconTriangleInvertedFilled className="size-2 mr-1" />
                )}
                {difference !== undefined && prevDayPrice !== 0 && (
                  <>
                    <ReactiveText
                      precision={2}
                      className="text-xs"
                      value={difference}
                      type="currency"
                      isStatic={true}
                    />
                    (
                    <ReactiveText
                      precision={2}
                      className="text-xs"
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
              <ReactiveText value={Number(volume || 0)} className="text-xs" type="currency" />
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
              <ReactiveText
                value={Number(openInterest || 0)}
                className="text-xs text-white/50"
                type="currency"
              />
            </div>
          )
        },
        enableSorting: true
      })
    ],
    [columnHelper, toggleFavorite, favorites]
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
    setIsOpen(false)
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-accent">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn(
                  'cursor-pointer hover:text-accent-foreground w-full',
                  header.id === 'symbol' ? 'justify-start' : 'justify-end',
                  header.id === 'symbol' || header.id === 'prevDayPrice' ? 'w-3/12' : 'w-2/12'
                )}
                onClick={() => {
                  if (header.column.getCanSort()) {
                    header.column.toggleSorting()
                  }
                }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="scroll-smooth">
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            onClick={() => handleRowClick(row.original.symbol)}
            className={cn(
              'hover:bg-white/5 w-full transition-colors duration-150 cursor-pointer',
              selectedAsset === row.original.symbol && 'bg-secondary'
            )}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cn(
                  'font-medium whitespace-nowrap w-2/12',
                  (cell.column.id === 'symbol' || cell.column.id === 'prevDayPrice') && 'w-3/12'
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default AssetTable
