'use client'
import IntervalSelector from './IntervalSelector'
import OhlcReadout from './OhlcReadout'

const ChartHeader = () => {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <IntervalSelector />
      <OhlcReadout />
    </div>
  )
}

export default ChartHeader
