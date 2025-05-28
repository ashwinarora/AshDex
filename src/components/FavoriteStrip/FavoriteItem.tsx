'use client'
import { IconTriangleFilled, IconTriangleInvertedFilled } from '@tabler/icons-react'

interface FavoriteItemProps {
  favorite?: {
    name: string
    value: string
    index: string
    price?: string | number
    change24h?: string | number
  }
  setSelectedAsset: (asset: string) => void
}

const FavoriteItem = ({ favorite, setSelectedAsset }: FavoriteItemProps) => {
  // If favorite is undefined, don't continue
  if (!favorite) {
    return null
  }

  // Extract just the percentage part from the change24h string
  const getPercentageOnly = (change: string | number | undefined): string => {
    if (!change) return '-/-'

    if (typeof change === 'string') {
      // Look for percentage in parentheses like "(+6.69%)"
      const percentMatch = change.match(/\(([+-]?\d+\.?\d*%)\)/)
      if (percentMatch && percentMatch[1]) {
        return percentMatch[1] // Return just the percentage part
      }

      // If no parentheses but contains % sign, return as is
      if (change.includes('%')) {
        return change
      }

      // Try to convert to number and format
      const num = parseFloat(change)
      if (!isNaN(num)) {
        return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
      }
    } else if (typeof change === 'number') {
      // If it's already a number, format it
      return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
    }

    return '-/-'
  }

  // Determine if change is positive based on the string format or number
  const isPositiveChange =
    typeof favorite.change24h === 'string'
      ? favorite.change24h.includes('+')
      : typeof favorite.change24h === 'number'
        ? favorite.change24h >= 0
        : false

  const priceChangeClass = isPositiveChange
    ? 'text-green' // green for positive
    : 'text-red' // red for negative

  // Get just the percentage part
  const percentageOnly = getPercentageOnly(favorite.change24h)

  return (
    <div
      onClick={() => setSelectedAsset(favorite.name)}
      className="flex justify-center items-center gap-1 hover:bg-white/5 px-3 pt-1 pb-2 h-full cursor-pointer"
    >
      {/* <Image
        src={starticon}
        alt="staricon"
        style={{ width: 20, height: 'auto' }}
        className="flex-shrink-0 my-auto w-4 h-4"
      /> */}
      <span className="my-auto font-medium text-[#E8E0F1] text-sm">{favorite.name}</span>
      {/* <span className="my-auto text-[12px] text-gray-400">
        {favorite.price
          ? typeof favorite.price === 'string'
            ? favorite.price
            : `$${favorite.price}`
          : '-/-'}
      </span> */}
      <div className={`text-[12px] ${priceChangeClass} my-auto flex items-center`}>
        {isPositiveChange ? (
          <IconTriangleFilled size={12} className="mr-1" />
        ) : (
          <IconTriangleInvertedFilled size={12} className="mr-1" />
        )}
        {percentageOnly}
      </div>
    </div>
  )
}

export default FavoriteItem
