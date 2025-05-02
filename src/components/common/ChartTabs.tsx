'use client'
import React from 'react'
import Image from 'next/image'
import arrowbackupicon from '@/assets/images/arrowbackup_icon.svg'
import arrowforwardupicon from '@/assets/images/arrowforwardup_icon.svg'
import ballpenicon from '@/assets/images/ballpen_icon.svg'
import layouticon from '@/assets/images/layout_icon.svg'
import chartbaricon from '@/assets/images/chartbar_icon.svg'
import tablersettingsicon from '@/assets/images/tablersettings_icon.svg'
import arrowmaximizeicon from '@/assets/images/arrowmaximize_icon.svg'

interface IChartTabsProps {
  tabs: string[]
  activeTab: number
  setActiveTab: (index: number) => void
}

const ChartTabs: React.FC<IChartTabsProps> = ({ tabs, activeTab, setActiveTab }) => {
  const icons = [
    arrowbackupicon,
    arrowforwardupicon,
    ballpenicon,
    layouticon,
    chartbaricon,
    tablersettingsicon,
    arrowmaximizeicon
  ]
  return (
    <div className="border-b border-white/10">
      <div className="flex max-lg:border-b px-4 pt-1 max-lg:border-white/10  items-center justify-between">
        <nav className="flex flex-wrap gap-x-5 max-lg:gap-x-4">
          {tabs?.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`py-2 px-1 font-medium text-base border-b-3 cursor-pointer whitespace-nowrap 
          ${activeTab === index ? 'border-primary text-white rounded-xs' : 'border-transparent text-[#8B8BA0]'}
        `}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="flex items-center pt-2 pb-3 pr-2 gap-x-4">
          {icons?.map((icon, index) => (
            <Image
              key={index}
              src={icon}
              style={{ width: 16, height: 'auto' }}
              alt="icon"
              className={`w-4 h-4 cursor-pointer hover:opacity-100 transition-opacity
        ${index === 2 ? 'ml-4' : ''}
        ${index === 4 ? 'mr-4' : ''}
        ${index > 1 ? 'max-lg:hidden' : ''} 
      `}
            />
          ))}
        </div>
      </div>

      <div className="hidden justify-between max-lg:flex items-center p-4 flex-wrap md:flex-nowrap">
        <div className="flex gap-x-4">
          {[ballpenicon, layouticon, chartbaricon].map((icon, index) => (
            <Image
              key={index + 2}
              src={icon}
              alt="icon"
              style={{ width: 16, height: 'auto' }}
              className="w-4 h-4 cursor-pointer hover:opacity-100 transition-opacity"
            />
          ))}
        </div>

        <div className="flex gap-x-4">
          {[tablersettingsicon, arrowmaximizeicon].map((icon, index) => (
            <Image
              key={index + 5}
              src={icon}
              alt={index === 0 ? 'settings' : 'expand'}
              className={`w-4 h-4 cursor-pointer hover:opacity-100  transition-opacity
               ${index === 1 ? 'mr-2' : ''}`}
              style={{ width: 16, height: 'auto' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChartTabs
