'use client'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react'
import { useState, useMemo, useRef } from 'react'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  SortingState
} from '@tanstack/react-table'
import {
  IconStar,
  IconStarFilled,
  IconTriangleFilled,
  IconTriangleInvertedFilled
} from '@tabler/icons-react'
import { useFavorites } from '@/store/FavoritesStore'
import ReactiveText from '@/components/common/ReactiveText'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useScreenSize } from '@/hooks/useScreenSize'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useShallow } from 'zustand/react/shallow'

interface AssetTableProps {
  searchTerm: string
  setSelectedAsset: (asset: string) => void
  selectedAsset: string
  isRTL: boolean
}

// Define the data structure for each asset
interface AssetData {
  symbol: string
  price: number
  prevDayPrice: number
  volume: number
  marketCap: number
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

const AssetTable = ({ searchTerm, setSelectedAsset, selectedAsset, isRTL }: AssetTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const { spotAssetContext } = useHyperliquidStore(
    useShallow((state) => ({
      spotAssetContext: state.spotAssetContext
    }))
  )
  const { data: spotMeta, spotKeyToName, spotKeyToBaseName } = useSpotMeta()
  const { toggleFavorite, favorites } = useFavorites(true)
  const { isMobile } = useScreenSize()
  // Create column helper for TanStack Table
  const columnHelper = createColumnHelper<AssetData>()

  // Transform filtered assets into data structure for TanStack Table
  const tableData: AssetData[] = useMemo(() => {
    if (!spotMeta) return []

    return spotAssetContext
      .filter((asset) =>
        spotKeyToName.get(asset.coin)?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((assetCtx) => {
        const price = assetCtx.markPx ? Number(assetCtx.markPx) : 0
        const prevDayPrice = assetCtx.prevDayPx ? Number(assetCtx.prevDayPx) : 0
        const volume = assetCtx.dayNtlVlm ? Number(assetCtx.dayNtlVlm) : 0
        const marketCap = Number(assetCtx.circulatingSupply) * Number(assetCtx.markPx)

        return {
          symbol: assetCtx.coin,
          price,
          prevDayPrice,
          volume,
          marketCap
        }
      })
  }, [spotMeta, spotAssetContext, favorites, searchTerm])

  // Define columns
  const columns = useMemo(() => {
    if (isMobile) {
      return [
        columnHelper.accessor('symbol', {
          id: 'symbol',
          header: () => <div className="flex items-center gap-1">Market</div>,
          cell: (info) => {
            const { symbol } = info.row.original
            const isFavorite = favorites.has(symbol)
            return (
              <div className={cn('flex items-center gap-2 text-xs', isRTL && 'flex-row-reverse')}>
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
                <p className="text-white">
                  {spotKeyToName.get(symbol)}/{spotKeyToBaseName.get(symbol)}
                </p>
              </div>
            )
          },
          enableSorting: true,
          sortingFn: (rowA, rowB) => {
            // Favorites always on top, then sort alphabetically or reverse
            if (favorites.has(rowA.original.symbol) && !favorites.has(rowB.original.symbol))
              return -1
            if (!favorites.has(rowA.original.symbol) && favorites.has(rowB.original.symbol))
              return 1
            // Both are favorites or both are not favorites, sort alphabetically
            const symbolA = rowA.original.symbol.toUpperCase()
            const symbolB = rowB.original.symbol.toUpperCase()
            // Sort alphabetically (sorting direction is handled by the table)
            return symbolA.localeCompare(symbolB)
          }
        }),
        columnHelper.accessor('volume', {
          id: 'volume',
          header: () => <div className="flex items-center gap-1">Volume</div>,
          cell: (info) => {
            const volume = info.getValue()
            return (
              <div className="text-right text-xs">
                <ReactiveText value={Number(volume || 0)} type="currency" />
              </div>
            )
          },
          enableSorting: true
        }),
        columnHelper.accessor('price', {
          id: 'price',
          header: () => <div className="flex items-center gap-1">Price / 24h</div>,
          cell: (info) => {
            const { price, prevDayPrice } = info.row.original
            const formattedPrice = formatPrice(price)
            const difference = price - prevDayPrice
            const isPositive = difference >= 0
            const className = isPositive ? 'text-green' : 'text-red'
            return (
              <div className="flex flex-col gap-1">
                <div className="text-right text-white text-xs">${formattedPrice}</div>
                <div className={`text-right text-xs ${className}`}>
                  <div className="flex justify-end items-center">
                    {isPositive ? (
                      <IconTriangleFilled className="size-2 mr-1" />
                    ) : (
                      <IconTriangleInvertedFilled className="size-2 mr-1" />
                    )}
                    {difference !== undefined && prevDayPrice !== 0 && (
                      <div className="flex items-center">
                        <ReactiveText
                          precision={2}
                          className="text-xs"
                          value={prevDayPrice !== 0 ? (difference / prevDayPrice) * 100 : 0}
                          type="percentage"
                          isStatic={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          },
          enableSorting: true
        })
      ]
    }
    return [
      columnHelper.accessor('symbol', {
        id: 'symbol',
        header: () => (
          <div className={cn('flex items-center gap-1', isRTL && 'flex-row-reverse')}>Market</div>
        ),
        cell: (info) => {
          const { symbol } = info.row.original
          const isFavorite = favorites.has(symbol)
          return (
            <div className={cn('flex items-center gap-2 text-xs', isRTL && 'flex-row-reverse')}>
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
              <p className="text-white">
                {spotKeyToName.get(symbol)}/{spotKeyToBaseName.get(symbol)}
              </p>
            </div>
          )
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          // Favorites always on top, then sort alphabetically or reverse
          if (favorites.has(rowA.original.symbol) && !favorites.has(rowB.original.symbol)) return -1
          if (!favorites.has(rowA.original.symbol) && favorites.has(rowB.original.symbol)) return 1
          // Both are favorites or both are not favorites, sort alphabetically
          const symbolA = rowA.original.symbol.toUpperCase()
          const symbolB = rowB.original.symbol.toUpperCase()
          // Sort alphabetically (sorting direction is handled by the table)
          return symbolA.localeCompare(symbolB)
        }
      }),
      columnHelper.accessor('price', {
        id: 'price',
        header: () => <div className="flex items-center gap-1">Price</div>,
        cell: (info) => {
          const price = info.getValue()
          const formattedPrice = formatPrice(price)
          return (
            <div className={cn('text-white text-xs', isRTL ? 'text-left' : 'text-right')}>
              ${formattedPrice}
            </div>
          )
        },
        enableSorting: true
      }),
      columnHelper.accessor('prevDayPrice', {
        id: 'prevDayPrice',
        header: () => <div className="flex items-center gap-1">24h Change</div>,
        cell: (info) => {
          const { price, prevDayPrice } = info.row.original
          const difference = price - prevDayPrice
          const isPositive = difference > 0
          const className = isPositive ? 'text-green' : 'text-red'

          return (
            <div className={cn('text-xs', isRTL ? 'text-left' : 'text-right', className)}>
              <div
                className={cn('flex items-center gap-1 justify-end', isRTL && 'flex-row-reverse')}
              >
                {isPositive ? (
                  <IconTriangleFilled className="size-2 mr-1" />
                ) : (
                  <IconTriangleInvertedFilled className="size-2 mr-1" />
                )}
                {difference !== undefined && (
                  <div className="flex items-center">
                    <ReactiveText
                      precision={2}
                      value={difference}
                      type="currency"
                      isStatic={true}
                    />
                    (
                    <ReactiveText
                      precision={2}
                      value={(difference / price) * 100}
                      type="percentage"
                      isStatic={true}
                    />
                    )
                  </div>
                )}
              </div>
            </div>
          )
        },
        enableSorting: true
      }),
      columnHelper.accessor('volume', {
        id: 'volume',
        header: () => <div className="flex items-center gap-1">Volume</div>,
        cell: (info) => {
          const volume = info.getValue()
          return (
            <div className={cn(isRTL ? 'text-left' : 'text-right')}>
              <ReactiveText value={Number(volume || 0)} type="currency" />
            </div>
          )
        },
        enableSorting: true
      }),
      columnHelper.accessor('marketCap', {
        id: 'marketCap',
        header: () => <div className="flex items-center gap-1">Market Cap</div>,
        cell: (info) => {
          const marketCap = info.getValue()
          return (
            <div className={cn(isRTL ? 'text-left' : 'text-right')}>
              <ReactiveText
                className="text-white/50"
                value={Number(marketCap || 0)}
                type="currency"
              />
            </div>
          )
        },
        enableSorting: true
      })
    ]
  }, [columnHelper, toggleFavorite, favorites, isMobile])

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  const parentRef = useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 36,
    getScrollElement: () => parentRef.current,
    overscan: 5
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  const handleRowClick = (assetKey: string) => {
    setSelectedAsset(assetKey)
  }

  return (
    <Table ref={parentRef}>
      <TableHeader className="sticky -top-1 md:top-0 z-10 bg-accent">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow className={cn(isRTL && 'flex-row-reverse')} key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn(
                  'cursor-pointer hover:text-accent-foreground w-full',
                  header.id === 'symbol'
                    ? isRTL
                      ? 'justify-end'
                      : 'justify-start'
                    : isRTL
                      ? 'justify-start'
                      : 'justify-end',
                  !isMobile
                    ? header.id === 'symbol' || header.id === 'prevDayPrice'
                      ? 'w-3/12'
                      : 'w-2/12'
                    : 'w-full flex-1 shrink-0'
                )}
                onClick={() => {
                  if (header.column.getCanSort()) {
                    header.column.toggleSorting()
                  }
                }}
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
      <TableBody className="scroll-smooth" style={{ height: `${totalSize}px` }}>
        {virtualRows.map((virtualRow) => {
          const row = table.getRowModel().rows[virtualRow.index]
          return (
            <TableRow
              key={row.id}
              onClick={() => handleRowClick(row.original.symbol)}
              className={cn(
                'hover:bg-white/5 w-full transition-colors duration-150 cursor-pointer',
                selectedAsset === row.original.symbol && 'bg-secondary',
                isRTL && 'flex-row-reverse'
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    'font-medium whitespace-nowrap w-2/12',
                    !isMobile
                      ? (cell.column.id === 'symbol' || cell.column.id === 'prevDayPrice') &&
                          'w-3/12'
                      : 'w-full flex-1 shrink-0'
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default AssetTable
