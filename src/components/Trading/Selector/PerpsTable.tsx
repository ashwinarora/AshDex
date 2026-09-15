'use client'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import {
  IconChevronDown,
  IconChevronUp,
  IconMinus,
  IconSelector,
  IconStar,
  IconStarFilled,
  IconTriangleFilled,
  IconTriangleInvertedFilled
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { useFavorites } from '@/store/FavoritesStore'
import ReactiveText from '@/components/reactive-text'
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
import { useScreenSize } from '@/hooks/useScreenSize'
import { useShallow } from 'zustand/react/shallow'
import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { derivePerpsMarketList, type PerpAssetData } from '@/utils/marketList'

interface AssetTableProps {
  searchTerm: string
  selectedTab: string
  setSelectedAsset: (asset: string) => void
  selectedAsset: string

  setIsOpen: (isOpen: boolean) => void

  isRTL: boolean
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
  selectedTab,
  setSelectedAsset,
  selectedAsset,
  setIsOpen,
  isRTL
}: AssetTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const { perpsMeta, perpAssetContext } = useHyperliquidStore(
    useShallow((state) => ({
      perpsMeta: state.perpsMeta,
      perpAssetContext: state.perpAssetContext
    }))
  )

  const { favorites, toggleFavorite } = useFavorites(false)
  const { isMobile } = useScreenSize()

  // Build table data via the pure derivePerpsMarketList — applies isDelisted
  // filter, search filter, and favorites-tab filter. No hardcoded whitelist:
  // the app shows whatever Hyperliquid returns.
  const tableData: PerpAssetData[] = useMemo(() => {
    if (!perpsMeta || !perpAssetContext) return []
    return derivePerpsMarketList(perpsMeta.universe, perpAssetContext, {
      searchTerm,
      favoritesOnly: selectedTab === 'Favorites‌‌‍‍‌‌‌‍‌‌‌‍‍‍‌‌‌‌‌‌‌‌‍‌‍‌‌',
      favorites
    })
  }, [perpsMeta, perpAssetContext, searchTerm, selectedTab, favorites])

  const columnHelper = createColumnHelper<PerpAssetData>()

  const columns = useMemo(() => {
    if (isMobile) {
      return [
        columnHelper.accessor('symbol', {
          id: 'symbol',
          header: () => <div className="flex items-center gap-1">{'Market'}</div>,
          cell: (info) => {
            const { symbol, maxLeverage } = info.row.original
            const isFavorite = favorites.has(symbol)
            return (
              <div
                className={cn(
                  'flex items-center md:gap-2 gap-1 text-xs',
                  isRTL && 'flex-row-reverse'
                )}
              >
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
                <div
                  className={cn('flex flex-col md:flex-row gap-1 md:gap-2', isRTL && 'items-end')}
                >
                  <p className="text-white">{symbol.split('-')[0]}-USD</p>
                  {maxLeverage && (
                    <p className="bg-primary/40 w-fit px-2 rounded-md text-xs">{maxLeverage}×</p>
                  )}
                </div>
              </div>
            )
          },
          enableSorting: true,
          sortingFn: (rowA, rowB) => {
            // Favorites always on top, then sort alphabetically
            if (favorites.has(rowA.original.symbol) && !favorites.has(rowB.original.symbol))
              return -1
            if (!favorites.has(rowA.original.symbol) && favorites.has(rowB.original.symbol))
              return 1
            const symbolA = rowA.original.symbol.toUpperCase()
            const symbolB = rowB.original.symbol.toUpperCase()
            return symbolA.localeCompare(symbolB)
          }
        }),
        columnHelper.accessor('volume', {
          id: 'volume',
          header: () => <div className="flex items-center gap-1">{'Volume'}</div>,
          cell: (info) => {
            const volume = info.getValue()
            return (
              <div className={cn(isRTL ? 'text-start' : 'text-end')}>
                <ReactiveText value={Number(volume || 0)} className="text-xs" type="currency" />
              </div>
            )
          },
          enableSorting: true
        }),
        columnHelper.accessor('price', {
          id: 'price',
          header: () => <div className="flex items-center gap-1">{'Price / 24h'}</div>,
          cell: (info) => {
            const { price, prevDayPrice } = info.row.original
            const formattedPrice = formatPrice(price)
            const difference = price - prevDayPrice
            const isPositive = difference >= 0
            const className = isPositive ? 'text-green' : 'text-red'
            return (
              <div className={cn('flex flex-col gap-1', isRTL && 'items-start')}>
                <div className={cn('text-white text-xs', isRTL ? 'text-start' : 'text-end')}>
                  ${formattedPrice}
                </div>
                <div className={cn('text-xs', isRTL ? 'text-start' : 'text-end', className)}>
                  <div
                    className={cn(
                      'flex items-center',
                      isRTL ? 'flex-row-reverse justify-start' : 'justify-end'
                    )}
                  >
                    {isPositive ? (
                      <IconTriangleFilled className={cn('size-2', isRTL ? 'ml-1' : 'mr-1')} />
                    ) : (
                      <IconTriangleInvertedFilled
                        className={cn('size-2', isRTL ? 'ml-1' : 'mr-1')}
                      />
                    )}
                    {difference !== undefined && prevDayPrice !== 0 && (
                      <ReactiveText
                        precision={2}
                        className="text-xs"
                        value={prevDayPrice !== 0 ? (difference / prevDayPrice) * 100 : 0}
                        type="percentage"
                        isStatic={true}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          },
          enableSorting: true
        })
      ]
    } else {
      return [
        columnHelper.accessor('symbol', {
          id: 'symbol',
          header: () => <div className="flex items-center gap-1">{'Market'}</div>,
          cell: (info) => {
            const { symbol, maxLeverage } = info.row.original
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
                <p className="text-white">{symbol.split('-')[0]}-USD</p>
                {maxLeverage && (
                  <p className="bg-primary/40 px-2 rounded-md text-xs">{maxLeverage}×</p>
                )}
              </div>
            )
          },
          enableSorting: true,
          sortingFn: (rowA, rowB) => {
            // Favorites always on top, then sort alphabetically
            if (favorites.has(rowA.original.symbol) && !favorites.has(rowB.original.symbol))
              return -1
            if (!favorites.has(rowA.original.symbol) && favorites.has(rowB.original.symbol))
              return 1
            const symbolA = rowA.original.symbol.toUpperCase()
            const symbolB = rowB.original.symbol.toUpperCase()
            return symbolA.localeCompare(symbolB)
          }
        }),
        columnHelper.accessor('price', {
          id: 'price',
          header: () => <div className="flex items-center gap-1">{'Price'}</div>,
          cell: (info) => {
            const price = info.getValue()
            const formattedPrice = formatPrice(price)
            return (
              <div className={cn('text-white text-xs', isRTL ? 'text-start' : 'text-end')}>
                ${formattedPrice}
              </div>
            )
          },
          enableSorting: true
        }),
        columnHelper.accessor('prevDayPrice', {
          id: 'prevDayPrice',
          header: () => <div className="flex items-center gap-1">{'24h Change'}</div>,
          cell: (info) => {
            const { price, prevDayPrice } = info.row.original
            const difference = price - prevDayPrice
            const className =
              difference > 0 ? 'text-green' : difference < 0 ? 'text-red' : 'text-white'
            return (
              <div className={cn('text-xs', isRTL ? 'text-start' : 'text-end', className)}>
                <div
                  className={cn('flex items-center gap-1 justify-end', isRTL && 'flex-row-reverse')}
                >
                  {className === 'text-green' ? (
                    <IconTriangleFilled className="size-2 mr-1 text-green" />
                  ) : className === 'text-red' ? (
                    <IconTriangleInvertedFilled className="size-2 mr-1 text-red" />
                  ) : (
                    <IconMinus className="size-2 mr-1 text-white" />
                  )}
                  {difference !== undefined && prevDayPrice !== 0 && (
                    <div className="flex items-center">
                      <ReactiveText
                        precision={Math.abs(difference) < 0.01 ? 4 : 2}
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
                    </div>
                  )}
                </div>
              </div>
            )
          },
          enableSorting: true,
          sortingFn: (rowA, rowB) => {
            const diffA = rowA.original.price - rowA.original.prevDayPrice
            const diffB = rowB.original.price - rowB.original.prevDayPrice
            const pctA = rowA.original.prevDayPrice ? (diffA / rowA.original.prevDayPrice) * 100 : 0
            const pctB = rowB.original.prevDayPrice ? (diffB / rowB.original.prevDayPrice) * 100 : 0
            return pctA - pctB
          }
        }),
        columnHelper.accessor('volume', {
          id: 'volume',
          header: () => <div className="flex items-center gap-1">{'Volume'}</div>,
          cell: (info) => {
            const volume = info.getValue()
            return (
              <div className={cn(isRTL ? 'text-start' : 'text-end')}>
                <ReactiveText value={Number(volume || 0)} className="text-xs" type="currency" />
              </div>
            )
          },
          enableSorting: true
        }),
        columnHelper.accessor('openInterest', {
          id: 'openInterest',
          header: () => <div className="flex items-center gap-1">{'Open Interest'}</div>,
          cell: (info) => {
            const openInterest = info.getValue()
            return (
              <div className={cn(isRTL ? 'text-start' : 'text-end')}>
                <ReactiveText
                  value={Number(openInterest || 0)}
                  className="text-xs text-white/70"
                  type="currency"
                />
              </div>
            )
          },
          enableSorting: true
        })
      ]
    }
  }, [columnHelper, toggleFavorite, favorites, isMobile, isRTL])

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

  const parentRef = useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28, // px height of each row
    overscan: 5,
    scrollPaddingStart: 48 // Account for header height
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  return (
    <Table ref={parentRef}>
      <TableHeader className="sticky -top-1 md:top-0 z-10 bg-popover">
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
                'hover:bg-white/10 w-full transition-colors duration-150 cursor-pointer',
                selectedAsset === row.original.symbol && 'bg-accent',
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
        {tableData.length === 0 && searchTerm.length > 0 && (
          <TableRow>
            <TableCell
              colSpan={columns?.length ?? 1}
              className="text-center py-8 text-white/60 text-sm"
              data-testid="market-list-empty-state"
            >
              No markets match &quot;{searchTerm}&quot;
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default AssetTable
