import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { useWalletModal } from '@/context/WalletModalContext'
import usdcicon from '../../assets/images/usdc_icon.svg'

interface ITabContentProps {
  activeTab: 'Deposit' | 'Withdraw'
  setActiveTab: (tab: 'Deposit' | 'Withdraw') => void
  setIsLoading: (loading: boolean) => void
}

type TabName = 'Deposit' | 'Withdraw'

const TabContent: React.FC<ITabContentProps> = ({ activeTab, setActiveTab, setIsLoading }) => {
  const { isConnected } = useAccount()
  const { toggleConnectWalletModal } = useWalletModal()

  const [amount, setAmount] = useState('')

  const onTabClick = (tab: 'Deposit' | 'Withdraw') => {
    setIsLoading(true)
    setTimeout(() => {
      setActiveTab(tab)
      setIsLoading(false)
      toggleConnectWalletModal()
    }, 2000)
  }

  useEffect(() => {
    setAmount('')
    setIsLoading(false)
  }, [activeTab])

  return (
    <>
      <div className="">
        <div className="flex border-b px-4 pb-4 pt-2  border-white/10 items-center mb-3">
          <span className="text-sm text-[#E8E0F1] font-medium whitespace-pre-line">
            {activeTab === 'Deposit'
              ? 'Deposit funds to Nexon Liquidity Vault (NLV).'
              : 'You have not yet deposited funds into Vault.\nAdd funds to Vault to complete the withdrawal.'}
          </span>
        </div>
        <div className="mb-3 border-b border-white/10 px-4 py-1">
          <label className="text-sm text-[#8B8BA0] font-medium">Amount</label>
          <div className="flex justify-between items-center pr-1 pt-1">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`rounded-md py-1 placeholder:text-[#8B8BA0] placeholder:opacity-70 ${parseFloat(amount) <= 0 ? 'text-[#E2464A]' : 'text-white'} focus:outline-none focus:none focus:none text-base font-semibold`}
            />
            <div className="flex">
              <button className="text-sm font-medium p-[8px] text-white bg-white/10 rounded-lg">
                MAX
              </button>
              <span className="ml-3 text-white flex items-center text-sm font-medium">
                <Image src={usdcicon} width={30} height={30} className="pr-2" alt="usdcicon" />
                {'USDC'}
              </span>
            </div>
          </div>
          <p className="text-sm font-medium text-[#8B8BA0] mt-1 mb-3">
            {activeTab === 'Deposit' ? (
              parseFloat(amount) <= 0 ? (
                <span className="text-[#E2464A]">Please enter an amount greater than 0 USDC</span>
              ) : (
                <span>
                  Available to deposit: <span className="text-white">14.20 USDC</span>
                </span>
              )
            ) : (
              <span>
                Available balance in vault: <span className="text-white">0.00 USDC</span>
              </span>
            )}
          </p>
        </div>
        <div className="px-4 py-2">
          <button
            onClick={() => {
              if (!isConnected) {
                toggleConnectWalletModal()
              } else {
                onTabClick(activeTab as TabName)
              }
            }}
            disabled={
              isConnected &&
              (amount === '0.00' || amount === '0' || amount === '' || parseFloat(amount) <= 0)
            }
            className={
              'py-[12px] px[24px] disabled:opacity-50 disabled:bg-white/10 disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-[#5F46F9] text-white cursor-pointer'
            }
          >
            {isConnected ? activeTab : 'Connect wallet'}
          </button>
        </div>
        <p className="flex px-4 py-2 mb-3">
          <span className="font-normal tracking-normal text-sm text-[#8B8BA0]">
            Lock-up period:{' '}
          </span>
          <span className="text-white tracking-normal text-sm ml-1 font-normal">4 days</span>
        </p>
      </div>
    </>
  )
}

export default TabContent
