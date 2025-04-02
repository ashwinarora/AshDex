'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import TabContent from './TabContent'
import Loading from '../common/Loading'
import ethicon from '../../assets/images/eth_icon.svg'
import wethicon from '../../assets/images/weth_icon.svg'

const WalletActions: React.FC = () => {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'Supply' | 'Borrow'>('Supply')
  const [isLoading, setIsLoading] = useState(false)

  const supplies = [
    { name: 'WETH', amount: '$100', icon: wethicon },
    { name: 'EZETH', amount: '$5', icon: ethicon },
    { name: 'SOLVBTC.M', amount: '$91', icon: wethicon },
    { name: 'ETH', amount: '$23', icon: ethicon },
    { name: 'BTC', amount: '$75', icon: wethicon },
    { name: 'USDT', amount: '$50', icon: ethicon },
    { name: 'DAI', amount: '$18', icon: wethicon },
    { name: 'USDC', amount: '$33', icon: ethicon },
    { name: 'MATIC', amount: '$45', icon: wethicon },
    { name: 'BNB', amount: '$67', icon: ethicon }
  ]

  const statusMessages = {
    Supply: {
      title: 'Processing your deposit…',
      subtitle: 'The transaction has been sent to the blockchain. This may take some time.'
    },
    Borrow: {
      title: 'Loan request sent…',
      subtitle: 'Waiting for network confirmation. Please wait a few seconds.'
    }
  }

  return (
    <>
      <div className="bg-gradient-to-b from-white/5 to-gray-500/5 rounded-xl border-2 border-white/10 backdrop-blur-[40px]">
        <div className="flex border-b mb-2 border-white/10 items-center justify-evenly space-x-2  p-4 ">
          <button
            onClick={() => setActiveTab('Supply')}
            className={`w-full  py-2 rounded-full transition-colors duration-200 cursor-pointer ${
              activeTab === 'Supply'
                ? 'bg-[#FFFFFF0F] text-white font-bold'
                : ' text-[#8B8BA0] font-medium'
            }`}
          >
            Supply
          </button>
          <button
            onClick={() => setActiveTab('Borrow')}
            className={`w-full  py-2 rounded-full transition-colors duration-200 cursor-pointer ${
              activeTab === 'Borrow'
                ? 'bg-[#FFFFFF0F] text-white font-bold'
                : ' text-[#8B8BA0] font-medium'
            }`}
          >
            Borrow
          </button>
        </div>
        {isLoading ? (
          <Loading
            title={statusMessages[activeTab]?.title}
            subTitle={statusMessages[activeTab]?.subtitle}
            className="py-[6.75rem]"
          />
        ) : (
          <TabContent
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            setIsLoading={setIsLoading}
          />
        )}
      </div>
      {isConnected && (
        <div className="mt-6 h-[280px] bg-white/10 border-2 border-white/10 p-4 rounded-2xl">
          <div className="flex justify-between items-center text-white mb-3">
            <p className="font-bold text-white text-base">Your Supplies</p>
            <button className="px-[22px] cursor-pointer py-[10px] bg-[#FFFFFF0F] text-white font-bold rounded-xl text-sm">
              Withdraw
            </button>
          </div>
          <div className="space-y-3 max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
            {supplies?.map((supply, index) => (
              <div
                key={index}
                className="flex pb-2.5 border-b-2 border-[#33293B] items-center text-base font-medium justify-between text-white"
              >
                <div className="flex items-center space-x-2">
                  <Image
                    alt={supply?.icon}
                    height={27}
                    width={27}
                    src={supply?.icon}
                    className="text-lg"
                  />
                  <span>{supply?.name}</span>
                </div>
                <span>{supply?.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isConnected && (
        <div className="mt-6 h-[280px] bg-white/10 border-2 border-white/10 p-4 rounded-2xl">
          <div className="flex justify-between items-center text-white mb-3">
            <p className="font-bold text-white text-base">Your Borrow</p>
            <button className="px-[22px] cursor-pointer py-[10px] bg-[#FFFFFF0F] text-white font-bold rounded-xl text-sm">
              Repay
            </button>
          </div>
          <div className="space-y-3 max-h-[200px] overflow-y-scroll [&::-webkit-scrollbar]:hidden">
            {supplies?.map((supply, index) => (
              <div
                key={index}
                className="flex pb-2.5 border-b-2 border-[#33293B] items-center text-base font-medium justify-between text-white"
              >
                <div className="flex items-center space-x-2">
                  <Image
                    alt={supply?.icon}
                    height={27}
                    width={27}
                    src={supply?.icon}
                    className="text-lg"
                  />
                  <span>{supply?.name}</span>
                </div>
                <span>{supply?.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default WalletActions
