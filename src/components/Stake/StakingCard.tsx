'use client'
import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { createChart, IChartApi, ISeriesApi, AreaData, AreaSeries } from 'lightweight-charts'
import { useWalletModal } from '@/context/WalletModalContext'
import Tooltip from '../common/Tooltip'
import { getTooltipContent } from '@/utils/utils'
import stakesData from '@/utils/stake.json'
import walleticon from '@/assets/images/wallet_icon.svg'
import DropDown from '@/assets/images/tabler_chevron-down.svg'
import infoicon from '@/assets/images/info_icon.svg'

const StakingCard = () => {
  const { chartData } = stakesData
  const { toggleConnectWalletModal } = useWalletModal()
  const { isConnected } = useAccount()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const chartdata: AreaData[] = chartData

  useEffect(() => {
    if (!chartContainerRef.current) return
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      layout: {
        textColor: '#8B8BA0',
        fontSize: 12,
        background: { color: 'transparent' }
      },
      grid: {
        vertLines: { color: '#23262F' },
        horzLines: { color: 'rgba(75, 67, 84, 0.1)' }
      },
      leftPriceScale: {
        visible: true,
        borderColor: '#23262F'
      },
      rightPriceScale: {
        visible: false
      }
    })
    seriesRef.current = chartRef.current.addSeries(AreaSeries, {
      lineWidth: 2,
      lineColor: '#5F46F9',
      priceLineColor: '#5F46F9',
      topColor: 'rgba(95, 70, 249, 0.16)',
      bottomColor: 'rgba(95, 70, 249, 0)',
      priceScaleId: 'left'
    })
    seriesRef.current.setData(chartdata)
    chartRef.current.timeScale().fitContent()
    return () => chartRef.current?.remove()
  }, [isConnected])

  return (
    <>
      <div
        style={{
          background:
            'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
        }}
        className={`${!isConnected && 'border-2 border-white/10'} backdrop-blur-[40px] rounded-xl p-3 shadow-md`}
      >
        {isConnected ? (
          <div className="p-2">
            <div className="flex justify-between items-center">
              {/* Left Section */}
              <div className="flex items-center gap-x-8">
                <div>
                  <p className="text-sm tracking-normal font-medium text-[#8B8BA0]">
                    Lifetime earnings
                  </p>
                  <p className="text-xl mt-1 text-[#FFFFFF] font-medium">
                    40,298.24 HYPE{' '}
                    <span className="text-sm ml-2 font-medium text-[#8B8BA0]">~$1,394.95</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm flex gap-x-[4px] items-center tracking-normal font-medium text-[#8B8BA0]">
                    Avg. APY
                    <Tooltip content={getTooltipContent('avgApy')}>
                      <Image src={infoicon} alt="Info" className="w-4 h-4 cursor-pointer" />
                    </Tooltip>
                  </p>
                  <p className="text-xl mt-1 text-[#FFFFFF] font-medium">2.83%</p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-x-4">
                <span className="text-sm tracking-normal font-medium text-[#8B8BA0]">
                  Rewards History
                </span>
                <span className="font-semibold border-white/10 bg-white/10 rounded-2xl py-2.5 text-white px-4.5 text-sm flex justify-between items-center">
                  {'All Time'}
                  <Image src={DropDown} width={20} height={20} className="pl-1" alt="" />
                </span>
              </div>
            </div>
            <div ref={chartContainerRef} className="w-full mt-4 h-[250px]" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <p className="text-[#FFFFFF] text-2xl tracking-normal font-medium">Staking</p>
              <button
                onClick={toggleConnectWalletModal}
                className="2xl:px-[20px] px-[11px] ml:1 md:ml-4 flex items-center py-[10px] bg-[#5F46F9] font-bold text-[#FFFFFF] text-sm rounded-md md:rounded-xl cursor-pointer"
              >
                <Image
                  height={20}
                  width={20}
                  src={walleticon}
                  alt="walleticon"
                  className="w-5 h-5"
                />
                <span className="ml-2 hidden 2xl:block">Connect Wallet</span>
              </button>
            </div>
            <p className="text-[#8B8BA0] mb-4 mt-2 text-sm font-medium w-[65%]">
              Secure the network and grow your holdings by staking with trusted validators. Connect
              your wallet to start earning passive income with competitive rewards and staking
              options.
            </p>
            <p className="text-[#8B8BA0] text-sm font-medium mb-1">
              Choose a validator and begin staking in just a few clicks!
            </p>
          </>
        )}
      </div>
    </>
  )
}

export default StakingCard
