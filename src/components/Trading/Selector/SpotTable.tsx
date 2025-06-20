'use client'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { IconSelector } from '@tabler/icons-react'
import { useState, useMemo } from 'react'
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
import { useFavorites } from '@/context/FavoritesContext'
import ReactiveText from '@/components/common/ReactiveText'

interface AssetTableProps {
  searchTerm: string
  setSelectedAsset: (asset: string) => void
}

// Define the data structure for each asset
interface AssetData {
  symbol: string
  price: number
  prevDayPrice: number
  volume: number
  marketCap: number
  isFavorite: boolean
}

const type = 'spot'

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
  const { spotAssetContext } = useHyperliquid()
  const { data: spotMeta, spotKeyToName } = useSpotMeta()
  const { isFavorite, toggleFavorite } = useFavorites()

  // Create column helper for TanStack Table
  const columnHelper = createColumnHelper<AssetData>()

  // Transform filtered assets into data structure for TanStack Table
  const tableData: AssetData[] = useMemo(() => {
    if (!spotMeta) return []

    return spotAssetContext
      .filter((asset) => spotKeyToName.get(asset.coin)?.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((assetCtx) => {
        const price = assetCtx.markPx ? Number(assetCtx.markPx) : 0
        const prevDayPrice = assetCtx.prevDayPx ? Number(assetCtx.prevDayPx) : 0
        const volume = assetCtx.dayNtlVlm ? Number(assetCtx.dayNtlVlm) : 0
        const marketCap =
          assetCtx.markPx && 'tokenContract' in assetCtx
            ? Number(assetCtx.markPx) * Number(assetCtx.totalSupply || 1)
            : 0

        return {
          symbol: spotKeyToName.get(assetCtx.coin) || '',
          price,
          prevDayPrice,
          volume,
          marketCap,
          isFavorite: isFavorite(spotKeyToName.get(assetCtx.coin) || '', type)
        }
      })
  }, [spotMeta, spotAssetContext, isFavorite, searchTerm])

  // Define columns
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
          const { symbol, isFavorite } = info.row.original
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(
                    {
                      name: symbol,
                      value: info.row.original.price.toString(),
                      index: symbol
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
              <p>{symbol.split('-')[0]}/USDC</p>
            </div>
          )
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          // Favorites always on top, then sort alphabetically or reverse
          if (rowA.original.isFavorite && !rowB.original.isFavorite) return -1
          if (!rowA.original.isFavorite && rowB.original.isFavorite) return 1
          // Both are favorites or both are not favorites, sort alphabetically
          const symbolA = rowA.original.symbol.toUpperCase()
          const symbolB = rowB.original.symbol.toUpperCase()
          // Sort alphabetically (sorting direction is handled by the table)
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
          const isPositive = difference > 0
          const className = isPositive ? 'text-green' : 'text-red'

          return (
            <div className={`text-right ${className}`}>
              <div className="flex justify-end items-center">
                {isPositive ? (
                  <IconTriangleFilled size={8} className="mr-1" />
                ) : (
                  <IconTriangleInvertedFilled size={8} className="mr-1" />
                )}
                {difference !== undefined && (
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
                      value={(difference / price) * 100}
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
      columnHelper.accessor('marketCap', {
        id: 'marketCap',
        header: () => (
          <div className="flex items-center gap-1">
            Market Cap
            <IconSelector className="w-4 h-4 text-white/50 group-active:text-primary" />
          </div>
        ),
        cell: (info) => {
          const marketCap = info.getValue()
          return (
            <div className="text-right">
              <ReactiveText value={Number(marketCap || 0)} type="currency" />
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

  const handleRowClick = (assetKey: string) => {
    if (spotMeta) {
      const tokenIndex = spotMeta.tokens.findIndex((item) => item.name === assetKey)
      const spotUniverse = spotMeta.universe.find((item) => item.tokens[0] === tokenIndex)
      setSelectedAsset(spotUniverse?.name || '')
    }
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
