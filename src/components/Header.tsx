'use client'
import React, { useState, FC, useEffect, useRef } from 'react'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import Image from 'next/image'
import { toHumanNumber, truncateAddress } from '@/utils/utils'
import ConnectWalletModal from './ConnectWalletModal'
import nexonlogo from '@/assets/images/logo.svg'
import bridgingbtnlogo from '@/assets/images/bridge_icon.svg'
import moonicon from '@/assets/images/dark_mode.svg'
import walleticon from '@/assets/images/wallet_icon.svg'
import menuline from '@/assets/images/menu_icon.svg'
import menuClose from '@/assets/images/close_icon.svg'
import helpicon from '@/assets/images/help_icon.svg'
import bellicon from '@/assets/images/bell_icon.svg'
import arrowdownicon from '@/assets/images/arrowdown_icon.svg'
import balanceicon from '@/assets/images/balance.svg'
import copyicon from '@/assets/images/copy_icon.svg'
import switchicon from '@/assets/images/switch_icon.svg'
import disconnecticon from '@/assets/images/disconnect_icon.svg'
import { useComponentRendered } from '@/hooks/useComponentRendered'

const Header: FC = () => {
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()
  const { isRendered } = useComponentRendered()
  const { data: balanceData } = useBalance({ address })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string>('Futures')
  const [notificationCount] = useState(5)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const handleConnectWallet = () => {
    setIsModalOpen(true)
  }

  const handleCopy = () => {
    const textToCopy = `${truncateAddress(address!)} - ${toHumanNumber(
      balanceData?.value,
      balanceData?.decimals,
      4
    )} ${balanceData?.symbol}`

    navigator.clipboard.writeText(textToCopy)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <>
      <header
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
        className="flex border-b items-center bg-[#1c0c30] justify-between xl:px-5 xl:py-1 2xl:px-10 2xl:py-5 px-0 py-1"
      >
        <div className="flex items-center justify-center space-x-4">
          <h1 className="flex items-center mr-6 lg:mr-6 xl:12 gap-2 px-3 py-2 text-[#E8E0F1] text-2xl rounded-md hover:bg-gray-900 font-semibold">
            <Image height={20} width={20} src={nexonlogo} alt="Nexon Logo" className="w-6 h-6" />
            Nexon
          </h1>
          <nav className="lg:flex hidden text-[#8B8BA0] text-base items-center lg:space-x-1 xl:space-x-5">
            {['Futures', 'Spot', 'Lend/Borrow', 'Predictions', 'Stake', 'Vaults'].map(menu => (
              <a
                key={menu}
                href="#"
                onClick={() => setActiveMenu(menu)}
                className={`py-[5px] px-[16px] rounded-full transition-all duration-300
                  ${
                    activeMenu === menu
                      ? 'text-[#08030D] bg-[#E8E0F1]'
                      : 'hover:text-[#08030D] hover:bg-[#E8E0F1]'
                  }`}
              >
                {menu}
              </a>
            ))}

            {/* More Dropdown */}
            <button
              className={`flex items-center gap-x-1.5 transition-all duration-300 
                ${activeMenu === 'More' ? 'text-blue-500' : 'hover:text-blue-500'}`}
              onClick={() => setActiveMenu('More')}
            >
              More
              {/* <FaChevronDown /> */}
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-3 2xl:space-x-4 justify-end">
          <button className="2xl:px-[20px] ml-2 px-[10px] py-[10px] flex items-center bg-[#322944] font-bold text-[#FFFFFF] text-sm rounded-md cursor-pointer">
            <Image
              height={20}
              width={20}
              src={bridgingbtnlogo}
              alt="bridgingbtnlogo"
              className="w-5 h-5 2xl:mr-2"
            />
            <span className="font-bold text-sm text-[#FFFFFF] hidden 2xl:block">Bridge</span>
          </button>
          <button className="p-1 md:block hidden hover:text-blue-400 text-gray-400">
            <Image height={20} width={20} src={moonicon} alt="moonicon" className="w-5 h-5 mr-1" />
          </button>
          <button className="p-1 md:block hidden hover:text-blue-400 text-gray-400">
            <Image height={20} width={20} src={helpicon} alt="helpicon" className="w-5 h-5 mr-1" />
          </button>
          <button className="relative p-1 hover:text-blue-400 text-gray-400">
            <Image src={bellicon} alt="bellicon" height={20} width={20} className="w-5 h-5 mr:2" />
            {notificationCount > 0 && (
              <span
                className="absolute -top-1 right-0 2xl:-right-0 flex items-center justify-center w-[18px] h-[17px] 
                bg-[#5F46F9] text-[#FFFFFF] text-[11px] font-['Proxima Nova'] font-normal leading-[140%] 
                rounded-[12px]"
              >
                {notificationCount}
              </span>
            )}
          </button>

          {isConnected && isRendered ? (
            <div className="relative 2xl:w-[45%] xl:w-2/3 w-1/6 ">
              {/* Wallet Button */}
              <button
                ref={buttonRef}
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex w-full relative hover:bg-[#322944] items-center p-[10px] bg-[#1C0C30] cursor-pointer rounded-lg overflow-hidden"
              >
                <Image
                  height={20}
                  width={20}
                  src={balanceicon}
                  alt="BalanceIcon"
                  className="w-[22px] h-[22px] mr-2"
                />
                <span className="text-sm font-medium truncate text-[#E8E0F1]">
                  {toHumanNumber(balanceData?.value, balanceData?.decimals, 4)}{' '}
                  {balanceData?.symbol}
                </span>
                <span className="border-l border-gray-600 h-4 mx-2"></span>
                <span className="font-medium truncate">{truncateAddress(address!)}</span>
                <Image
                  height={20}
                  width={20}
                  src={arrowdownicon}
                  alt="arrowdown"
                  className="w-3 h-3 ml-2"
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full right-0 mt-2 w-[250px] bg-[#0F0816] border border-[#322944] rounded-2xl shadow-lg z-50 p-5"
                >
                  {/* Wallet Address & Copy */}
                  <div className="flex items-start text-[#E8E0F1]">
                    <Image src={balanceicon} alt="BalanceIcon" className="w-[40px] h-[40px] mr-3" />
                    <div className="flex flex-col">
                      <span className="truncate">{truncateAddress(address!)}</span>
                      {/* Balance */}
                      <div className="text-sm text-[#E8E0F1]">
                        {toHumanNumber(balanceData?.value, balanceData?.decimals, 4)}{' '}
                        {balanceData?.symbol}
                      </div>
                    </div>
                    <button onClick={handleCopy} className="px-3 py-1 opacity-70 cursor-pointer">
                      <Image height={20} width={20} src={copyicon} alt="Copy" className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Switch Wallet */}
                  <button className="flex text-base items-center w-full mt-3 px-3 py-2 font-medium rounded-md text-[#E8E0F1] hover:bg-[#322944] cursor-pointer">
                    <Image
                      height={20}
                      width={20}
                      src={switchicon}
                      alt="Switch Wallet"
                      className="w-5 h-5 mr-3"
                    />
                    Switch Wallet
                  </button>

                  {/* Disconnect */}
                  <button
                    onClick={() => disconnect()}
                    className="flex items-center text-base w-full mt-2 px-3 py-2 text-[#E2464A] font-medium rounded-md text-md hover:bg-[#322944] cursor-pointer"
                  >
                    <Image
                      height={20}
                      width={20}
                      src={disconnecticon}
                      alt="Disconnect"
                      className="w-5 h-5 mr-3"
                    />
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="2xl:px-[20px] px-[11px] ml:1 md:ml-4 flex items-center py-[10px] bg-[#5F46F9] font-bold text-[#FFFFFF] text-sm rounded-md md:rounded-xl cursor-pointer"
            >
              <Image height={20} width={20} src={walleticon} alt="walleticon" className="w-5 h-5" />
              <span className="ml-2 hidden 2xl:block">Connect Wallet</span>
            </button>
          )}
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className="p-1 lg:hidden block hover:text-blue-400 text-[#ffffff]"
          >
            <Image
              height={20}
              width={20}
              src={isOpen ? menuClose : menuline}
              alt="menu-icon"
              className={`w-[20px] h-[20px] mr-5`}
            />
          </button>
        </div>
      </header>

      {/* Sidebar Menu */}
      {isOpen && (
        <div className="left-0 top-0 w-full h-full bg-[#1a1027] px-3 py-4 shadow-lg">
          <div className="flex mb-3 ml-1 gap-2">
            <button className="md:px-[20px] px-[10px] py-[10px] flex items-center  bg-[#322944] font-bold text-[#FFFFFF] text-sm rounded-md cursor-pointer">
              <Image height={20} width={20} src={helpicon} alt="helpicon" className="w-5 h-5" />
            </button>
            <button className="md:px-[20px] px-[10px] py-[10px] flex items-center  bg-[#322944] font-bold text-[#FFFFFF] text-sm rounded-md cursor-pointer">
              <Image
                height={20}
                width={20}
                src={moonicon}
                alt="moonicon"
                className="w-4 h-4 md:mr-2"
              />
            </button>
          </div>
          <nav className="flex flex-start flex-col text-[#8B8BA0] text-sm items-center">
            {[
              'Futures',
              'Spot',
              'Lend/Borrow',
              'Predictions',
              'Stake',
              'Vaults',
              'Leaderboards',
              'Referrals',
              'Points',
              'Sub-accounts',
              'Stats',
              'Docs',
              'Vocabulary for novices',
              'Settings'
            ].map(menu => (
              <a
                key={menu}
                href="#"
                onClick={() => setActiveMenu(menu)}
                className={`py-[5px] w-full px-[12px] mb-2 rounded-full transition-all duration-300
                  ${
                    activeMenu === menu
                      ? 'text-[#08030D] bg-[#E8E0F1]'
                      : 'hover:text-[#08030D] hover:bg-[#E8E0F1]'
                  }`}
              >
                {menu}
              </a>
            ))}
          </nav>
        </div>
      )}

      <ConnectWalletModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </>
  )
}

export default Header
