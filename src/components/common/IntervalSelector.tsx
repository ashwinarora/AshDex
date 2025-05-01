'use client'
import Image from 'next/image'
import { CHART_INTERVALS } from '@/utils/constants'
import calendaricon from '@/assets/images/calendar_icon.svg'
import Dropdown from '../common/Dropdown'

interface IntervalSelectorProps {
  selectedInterval: (typeof CHART_INTERVALS)[number]
  setSelectedInterval: (interval: (typeof CHART_INTERVALS)[number]) => void
  intervals: (typeof CHART_INTERVALS)[number][]
}

const IntervalSelector: React.FC<IntervalSelectorProps> = ({
  selectedInterval,
  setSelectedInterval,
  intervals
}) => {
  return (
    <div className="flex items-center gap-2 pt-4 px-4 py-3 border-b-2 border-white/10">
      {/* Intervals List */}
      <div className="flex items-center overflow-hidden gap-2 text-white text-sm">
        {intervals.map((interval) => (
          <button
            key={interval}
            onClick={() => setSelectedInterval(interval)}
            className={`px-2 text-sm cursor-pointer py-1 rounded-full transition-all ${
              selectedInterval === interval
                ? 'bg-white/10 font-semibold text-white backdrop-blur-lg'
                : 'text-gray-400 font-medium hover:text-gray-300'
            }`}
          >
            {interval}
          </button>
        ))}
      </div>

      {/* Dropdown for more intervals */}
      <Dropdown
        options={intervals}
        selected={selectedInterval}
        onSelect={(option) => setSelectedInterval(option as (typeof CHART_INTERVALS)[number])}
        className=" text-sm text-white bg-secondary"
      />

      {/* Calendar Icon */}
      <Image
        src={calendaricon}
        alt="Calendar"
        style={{ width: 16, height: 'auto' }}
        className="w-4 mx-2 h-4 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
      />
    </div>
  )
}

export default IntervalSelector
