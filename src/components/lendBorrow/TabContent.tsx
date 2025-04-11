'use client'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { useWalletModal } from '@/context/WalletModalContext'
import { useToast } from '@/context/ToastContext'
import Switch from '../common/Switch'
import lendBorrowData from '@/utils/lendBorrow.json'
import ethicon from '../../assets/images/eth_icon.svg'
import wethicon from '../../assets/images/weth_icon.svg'

interface ITabContentProps {
  activeTab: 'Supply' | 'Borrow'
  setActiveTab: (tab: 'Supply' | 'Borrow') => void
  setIsLoading: (loading: boolean) => void
}

type TabName = 'Supply' | 'Borrow'

const TabContent: React.FC<ITabContentProps> = ({ activeTab, setActiveTab, setIsLoading }) => {
  const { supplyAndBorrowTabData } = lendBorrowData?.lendBorrow
  const { isConnected } = useAccount()
  const { toggleConnectWalletModal } = useWalletModal()
  const { showToast } = useToast()
  const [amount, setAmount] = useState('0.00')
  const [isChecked, setIsChecked] = useState<boolean>(true)

  const onTabClick = (tab: 'Supply' | 'Borrow') => {
    setIsLoading(true)
    setTimeout(() => {
      setActiveTab(tab)
      setIsLoading(false)
      showToast(
        'success',
        'Asset successfully deposited!',
        `You have added 5,000 USDC to the pool. You are now earning 2.9% APY.`
      )
      // showToast(
      //   'error',
      //   'Deposit failed!',
      //   `The transaction was not completed. Check your balance, gas fees, and try again.`
      // )
    }, 2000)
  }

  const activeTabData = useMemo(() => {
    return supplyAndBorrowTabData?.find((tab) => tab?.tab === activeTab)
  }, [activeTab])

  useEffect(() => {
    setAmount('0.00')
    setIsChecked(true)
    setIsLoading(false)
  }, [activeTab])

  return (
    <div className="">
      <div className="mb-3 px-4 py-2">
        <label className="text-sm text-[#8B8BA0] font-medium">Amount</label>
        <div className="flex justify-between items-center pr-1 pt-1">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`rounded-md py-1 ${parseFloat(amount) > 100 ? 'text-[#E2464A]' : 'text-white'} focus:outline-none focus:none focus:none text-base font-semibold`}
          />
          <div className="flex">
            <button className="text-sm font-medium p-[8px] text-white bg-white/10 rounded-lg">
              MAX
            </button>
            <span className="ml-3 text-white flex items-center text-sm font-medium">
              <Image
                src={isChecked ? ethicon : wethicon}
                width={30}
                height={30}
                className="pr-2"
                alt="ethicon"
              />
              {isChecked ? 'ETH' : 'WETH'}
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-[#8B8BA0] mt-2">
          {parseFloat(amount) > 100 ? (
            <span className={`${parseFloat(amount) > 100 ? 'text-[#E2464A]' : ''}`}>
              {isChecked
                ? `You can ${activeTab?.toLowerCase()} a maximum of 100 ETH.`
                : `You can ${activeTab?.toLowerCase()} a maximum of 100 WETH.`}
            </span>
          ) : (
            <span>
              Wallet balance: <span className="text-white">0 ETH</span>
            </span>
          )}
        </p>
      </div>

      <div className="flex border-y p-4 border-white/10  items-center mb-3">
        <Switch label="" setIsChecked={setIsChecked} isChecked={isChecked} />
        <span className="text-sm text-[#E8E0F1] font-medium">
          {activeTab === 'Borrow' ? 'Unwrap' : 'Wrap'} ETH (to {activeTab?.toLowerCase()} WETH)
        </span>
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
            (amount === '0.00' || amount === '0' || amount === '' || parseFloat(amount) > 100)
          }
          className={
            'py-[12px] px[24px] disabled:opacity-50 disabled:bg-white/10 disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer'
          }
        >
          {isConnected ? activeTab : 'Connect wallet'}
        </button>
      </div>

      <div className="p-4 text-sm mb-3 space-y-1">
        {activeTabData && (
          <>
            <p className="flex justify-between ">
              <span className="font-normal opacity-50 text-[#E8E0F1]">Supply APY</span>
              <span className="text-white font-medium">{activeTabData?.apy}</span>
            </p>
            {activeTab === 'Supply' && (
              <p className="flex justify-between pt-2">
                <span className="font-normal opacity-50 text-[#E8E0F1]">Collateralization</span>
                <span className="text-white font-medium">{activeTabData?.collateralization}</span>
              </p>
            )}
            <p className="flex justify-between pt-2">
              <span className="font-normal opacity-50 text-[#E8E0F1]">Health Factor</span>
              <span className="text-white font-medium">{activeTabData?.healthFactor}</span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default TabContent
