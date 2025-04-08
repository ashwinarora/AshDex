'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { VAULTS_TAB } from '../../utils/constants'
import BoardViewVaults from './BoardViewVaults'
import { useWalletModal } from '@/context/WalletModalContext'
import chartIcon from '../../assets/images/chart_icon.svg'
import infoIcon from '../../assets/images/info_icon.svg'
import walleticon from '@/assets/images/wallet_icon.svg'
import listicon from '@/assets/images/list_icon.svg'
import boardicon from '@/assets/images/board_icon.svg'
import searchnormalicon from '@/assets/images/search-normal.svg'
import ListViewVaults from './ListViewVaults'

const Vaults = () => {
  const { toggleConnectWalletModal } = useWalletModal()
  const { isConnected } = useAccount()
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
  const [selectedTab, setSelectedTab] = useState<(typeof VAULTS_TAB)[number]>('My Vaults')
  const handleEnableTrading = () => {}

  return (
    <div id="vaults" className="bg-[#0d021f] text-white p-6">
      <div className="max-[1450px]:mx-1 mx-10">
        <div className="">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6">
            <div className="flex items-center gap-x-3">
              <div
                className="flex items-center justify-center rounded-2xl border-2 border-white/10 px-6 py-4 w-[299px] h-[90px] backdrop-blur-[48.3px]"
                style={{
                  background:
                    'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
                }}
              >
                <p className="text-[#8B8BA0] text-sm font-medium text-center">
                  Placeholder for gamification
                </p>
              </div>

              <div
                className="flex items-center gap-4 rounded-xl border-[2px] border-white/10 p-4 backdrop-blur-[48.3px] w-fit"
                style={{
                  background:
                    'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg">
                  <Image src={chartIcon} alt="chart" width={20} height={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-sm text-[#8B8BA0] font-medium">
                    Total Value
                    <Image src={infoIcon} alt="info" width={15} height={15} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-medium text-white tracking-wide">$534 753 940</p>
                    <span className="text-sm text-[#2FA766] font-semibold">+ $0.1</span>
                    <span className="text-xs text-[#8B8BA0]">24h</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={!isConnected ? toggleConnectWalletModal : handleEnableTrading}
              className="2xl:px-[20px] px-[11px] ml:1 md:ml-4 flex items-center py-[10px] bg-[#5F46F9] font-bold text-[#FFFFFF] text-sm rounded-md md:rounded-xl cursor-pointer"
            >
              {!isConnected && (
                <Image
                  height={20}
                  width={20}
                  src={walleticon}
                  alt="walleticon"
                  className="w-5 h-5 mr-2"
                />
              )}
              <span className="hidden 2xl:block">
                {' '}
                {isConnected ? 'Enable Trading' : 'Connect Wallet'}
              </span>
            </button>
          </div>
        </div>

        <div
          className="rounded-xl mt-5 border-[2px] border-white/10 backdrop-blur-[40px] p-4"
          style={{
            background:
              'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
          }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center ">
            <p className="font-bold text-white text-base">Vaults</p>
            <div className="flex bg-[#FFFFFF0F] rounded-lg p-2 mt-2 sm:mt-0">
              <button
                className={`px-4 py-3 cursor-pointer ${viewMode === 'list' ? 'bg-[#FFFFFF0F]' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <Image src={listicon} alt="list" width={16} height={16} />
              </button>
              <button
                className={`px-4 py-3 cursor-pointer ${viewMode === 'board' ? 'bg-[#FFFFFF0F]' : ''}`}
                onClick={() => setViewMode('board')}
              >
                <Image src={boardicon} alt="board" width={16} height={16} />
              </button>
            </div>
          </div>

          {/* Search and Filters Container */}
          <div className="mt-3 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            {/* Filters Section */}
            <div className="flex items-center gap-x-1.5 text-sm text-white">
              {VAULTS_TAB?.map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedTab(item)}
                  className={`px-4 py-1.5 cursor-pointer rounded-full transition-all duration-150 ${
                    selectedTab === item
                      ? 'bg-[#FFFFFF1A] text-white font-semibold'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-[25%]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Image src={searchnormalicon} alt="search" width={18} height={18} />
              </div>
              <input
                type="text"
                placeholder="Search by vault address, name or leader..."
                className="w-full bg-[#FFFFFF0F] text-sm placeholder:text-[#8B8BA0] text-white pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:outline-none focus:ring-2  transition-all duration-150"
              />
            </div>
          </div>

          {/* Conditionally Render List or Board View */}
          {viewMode === 'list' ? (
            <div className="mt-4">
              <ListViewVaults />
            </div>
          ) : (
            <div className="mt-4">
              <BoardViewVaults />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Vaults
