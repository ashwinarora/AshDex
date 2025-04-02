'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import WalletActions from '../../../components/landBorrow/WalletActions'
import LendBorrowTabs from '../../../components/landBorrow/LendBorrowTabs'
import { ORDER_INTERVALS } from '@/utils/constants'
import wethicon from '../../../assets/images/weth_icon.svg'
import exporticon from '../../../assets/images/export_icon.svg'
import infoicon from '../../../assets/images/info_icon.svg'
import nexticon from '../../../assets/images/next_icon.svg'

const tabs = ['Supply APR', 'Borrow APR', 'Interest Rate'] as string[]

function LendBorrowDetails() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedInterval, setSelectedInterval] = useState<(typeof ORDER_INTERVALS)[number]>('1D')

  const Headerassets = [
    {
      title: 'Reserve Size',
      subtitle: '$87,219.48'
    },
    {
      title: 'Available Liquidity',
      subtitle: '$37,789.85'
    },
    {
      title: 'Utilization rate',
      subtitle: '80.00%'
    },
    {
      title: 'Oracle Price',
      subtitle: '$2,370.00'
    }
  ]

  const supplyInfo = [
    { label: 'Total Supplied', value: '$87.08K', difference: '36.74' },
    { label: 'Supply APY', value: '0.72%' },
    { label: 'MAX LTV', value: '80.00%' },
    { label: 'Liquidation Threshold', value: '82.56%' },
    { label: 'Liquidation Bonus', value: '5%' }
  ]

  const borrowInfo = [
    { label: 'Total Borrowed', value: '$87.08K', difference: '36.74' },
    { label: 'Borrow APY', value: '0.72%' },
    { label: 'Liquidation Penalty', value: '5%' }
  ]

  const eModeInfoDesc = [
    'E-Mode increases your LTV for a selected category of assets, meaning that when E-Mode is enabled, you will have higher borrowing power over assets of the same E-Mode category which are defined by ZeroLend Governance. You can enter E-Mode from your Dashboard. To learn more about E-Mode and applied restrictions in.'
  ]

  const eModeInfo = [
    { label: 'E-Mode Category', value: 'ETH correlated' },
    { label: 'Max LTV', value: '95.00%' },
    { label: 'Liquidation Threshold', value: '97.50%' },
    { label: 'Liquidation Penalty', value: '1.00%' }
  ]

  return (
    <>
      <div className="p-6 bg-[#0d021f]">
        <div className="flex items-center text-[#8B8BA0] text-sm font-medium px-2 gap-x-2.5">
          <span>Market</span>
          <span>
            <Image className="opacity-70" src={nexticon} alt="nexticon" width={5} height={5} />
          </span>
          <span>/Linea</span>
          <span>
            <Image className="opacity-70" src={nexticon} alt="nexticon" width={5} height={5} />
          </span>{' '}
          <span className="text-white">WETH</span>
        </div>
        <div className="grid md:grid-cols-4 gap-5 mt-6">
          {/* Left Panel */}
          <div className="md:col-span-3 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 p-4">
                <Image src={wethicon} alt="WETH" width={35} height={35} />
                <div>
                  <h2 className="text-base text-white font-bold">{'WETH'}</h2>
                  <p className="text-sm text-[#8B8BA0] font-medium">{'Wrapped ETH'}</p>
                </div>
                <Image
                  className="opacity-70 cursor-pointer"
                  src={exporticon}
                  alt="WETH"
                  width={15}
                  height={15}
                />
              </div>
              <div className="flex flex-wrap gap-x-3">
                {Headerassets?.map((asset, index) => {
                  const isLastItem = index === Headerassets?.length - 1
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-b w-[180px] text-center from-white/5 via-gray-400/5 border-2 border-white/10 backdrop-blur-[48px] p-4 rounded-xl"
                    >
                      <div className="flex justify-center items-center mb-1.5 gap-x-1">
                        <p className="text-[#8B8BA0] text-sm font-medium">{asset?.title}</p>
                        <Image
                          className="opacity-80 cursor-pointer"
                          src={infoicon}
                          alt="infoicon"
                          width={15}
                          height={15}
                        />
                      </div>
                      <p className="text-white flex items-center justify-center gap-x-2 font-medium text-xl">
                        {asset?.subtitle}
                        {isLastItem && (
                          <Image
                            className="opacity-60 cursor-pointer"
                            src={exporticon}
                            alt="exporticon"
                            width={13}
                            height={13}
                          />
                        )}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* SupplyInfo */}
            <div className="bg-gradient-to-b pb-5 from-white/5 to-gray-600/5 p-4 rounded-xl">
              <h3 className="text-base pt-1 pb-3 px-2 text-white font-bold">
                Collateral/Supply Info
              </h3>
              <div className="flex px-2 flex-wrap gap-x-3">
                {supplyInfo?.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-b px-5 w-[227px] text-center from-white/5 via-gray-400/5 border-2 border-white/10 backdrop-blur-[48px] p-4 rounded-xl"
                    >
                      <div className="flex justify-start items-center mb-1.5 gap-x-1">
                        <p className="text-[#8B8BA0] text-sm font-medium">{item?.label}</p>
                        <Image
                          className="opacity-80 cursor-pointer"
                          src={infoicon}
                          alt="infoicon"
                          width={15}
                          height={15}
                        />
                      </div>
                      <p className="text-white flex items-center justify-start font-medium text-xl">
                        {item?.value}
                        {item?.difference && (
                          <span className="px-[5px] ml-3 rounded-[8px] text-xs font-medium text-[#FFFFFF] py-[2px] bg-[#1F1F30]">
                            {item?.difference}
                          </span>
                        )}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* BorrowInfo */}
            <div className="bg-gradient-to-b pb-5 from-white/5 to-gray-600/5 p-4 rounded-xl">
              <h3 className="text-base pt-1 pb-3 px-2 text-white font-bold">Borrow Info</h3>
              <div className="flex w-full px-2 flex-wrap gap-x-3">
                {borrowInfo?.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-b px-5 w-[32%] text-center from-white/5 via-gray-400/5 border-2 border-white/10 backdrop-blur-[48px] p-4 rounded-xl"
                    >
                      <div className="flex justify-start items-center mb-1.5 gap-x-1">
                        <p className="text-[#8B8BA0] text-sm font-medium">{item?.label}</p>
                        <Image
                          className="opacity-80 cursor-pointer"
                          src={infoicon}
                          alt="infoicon"
                          width={15}
                          height={15}
                        />
                      </div>
                      <p className="text-white flex items-center justify-start font-medium text-xl">
                        {item?.value}
                        {item?.difference && (
                          <span className="px-[5px] ml-3 rounded-[8px] text-xs font-medium text-[#FFFFFF] py-[2px] bg-[#1F1F30]">
                            {item?.difference}
                          </span>
                        )}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* EMode */}
            <div className="bg-gradient-to-b pb-5 from-white/5 to-gray-600/5 p-4 rounded-xl">
              <h3 className="text-base pt-1 px-2 pb-2 text-white font-bold">E-Mode</h3>
              <p className="text-[15px] pb-3 px-2 text-[#8B8BA0] text-meduim">{eModeInfoDesc[0]}</p>
              <div className="grid grid-cols-2 w-[65%] gap-y-2.5 gap-x-8 px-2 mt-2 text-white">
                {eModeInfo?.map((item, index) => (
                  <div key={index} className="flex  text-sm font-medium justify-between">
                    <span className="text-[#8B8BA0]">{item?.label}</span>
                    <span className="text-white ">{item?.value}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Tab Section */}
            <div className="bg-gradient-to-b pb-10 from-white/5 to-gray-600/5 p-4 rounded-xl">
              <LendBorrowTabs
                tabs={tabs as string[]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedInterval={selectedInterval}
                setSelectedInterval={setSelectedInterval}
                intervals={Array.from(ORDER_INTERVALS)}
              />
            </div>
          </div>
          {/* Right Panel */}
          <div>
            <WalletActions />
          </div>
        </div>
      </div>
    </>
  )
}

export default LendBorrowDetails
