import React, { useMemo } from 'react'
import Image from 'next/image'
import editicon from '@/assets/images/edit_icon.svg'
import { useHyperliquid } from '@/store/HyperliquidStore'

interface TPSLCellProps {
  asset: string
  openModal: () => void
}

const TPSL_Cell: React.FC<TPSLCellProps> = ({ asset, openModal }: TPSLCellProps) => {
  const { openOrders } = useHyperliquid()

  const triggerPrices = useMemo(() => {
    const assetOrders = openOrders.filter((order) => order.coin === asset)
    const tpOrder = assetOrders.find((order) => order.orderType === 'Take Profit Limit')
    const slOrder = assetOrders.find((order) => order.orderType === 'Stop Limit')
    return {
      tp: tpOrder?.triggerPx,
      sl: slOrder?.triggerPx
    }
  }, [openOrders, asset])

  return (
    <div className="flex items-center gap-2">
      {triggerPrices.tp && triggerPrices.sl ? (
        <span className="w-17 break-words overflow-hidden">
          {triggerPrices.tp}/{triggerPrices.sl}
        </span>
      ) : (
        '-/-'
      )}
      <button
        onClick={() => {
          openModal()
        }}
      >
        <Image
          src={editicon}
          alt="Edit"
          style={{ width: 16, height: 'auto' }}
          className="w-4 h-4 cursor-pointer"
        />
      </button>
    </div>
  )
}

export default TPSL_Cell
