'use client'
import React from 'react'
import Image from 'next/image'
import infoicon from '@/assets/images/info_icon.svg'
import sortingIcon from '@/assets/images/sorting_icon.svg'
import arrowdownfillicon from '@/assets/images/arrowdownfill_icon.svg'

interface Column {
  key: string
  label: string
}

interface ResponsiveDataCardProps {
  columns: Column[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderRow?: (item: any) => React.ReactNode
  showExportButton?: boolean
  positionTab?: boolean
}

const ResponsiveDataCard: React.FC<ResponsiveDataCardProps> = ({
  columns,
  data,
  renderRow,
  showExportButton,
  positionTab
}) => {
  return (
    <div className="lg:hidden flex flex-col">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-x-2">
          <Image
            src={infoicon}
            alt="Info"
            style={{ width: 20, height: 'auto' }}
            className="w-6 h-6 cursor-pointer"
          />
          <span className="text-base text-[#8B8BA0]">{columns[0]?.label}</span>
          <Image
            src={arrowdownfillicon}
            alt="arrowdown"
            style={{ width: 10, height: 'auto' }}
            className="w-2.5 h-2.5 cursor-pointer"
          />
        </div>
        <div className="flex items-center">
          {showExportButton && (
            <span className="text-sm font-medium text-[#7D67FF] mr-3">Export as CSV</span>
          )}
          {positionTab && (
            <span className="text-sm font-semibold text-[#7D67FF] mr-3">Close all positions</span>
          )}
          <Image
            src={sortingIcon}
            alt="Sort"
            style={{ width: 20, height: 'auto' }}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
      </div>
      {data?.map((item, index) => (
        <div key={index} className="border-b border-white/10 py-4 ">
          {renderRow ? (
            renderRow(item)
          ) : (
            <div className="flex flex-col gap-2">
              {columns?.map((col) => (
                <div key={col?.key} className="flex justify-between text-sm text-white/80">
                  <span className="text-[#8B8BA0]">{col?.label}</span>
                  <span>{item[col?.key]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ResponsiveDataCard
