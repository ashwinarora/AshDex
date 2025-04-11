'use client'
import React, { useState, FC, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import Image from 'next/image'
import { toHumanNumber, truncateAddress } from '@/utils/utils'
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
import { useWalletModal } from '@/context/WalletModalContext'
import Link from 'next/link'

type MenuItem = {
  name: string
  path: string
}

const Header: FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()
  const { isRendered } = useComponentRendered()
  const { data: balanceData } = useBalance({ address })
  const { toggleConnectWalletModal } = useWalletModal()
  const [isOpen, setIsOpen] = useState(false)
  const [notificationCount] = useState(5)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const desktopMenu: MenuItem[] = [
    { name: 'Futures', path: '/' },
    { name: 'Spot', path: '/spot' },
    { name: 'Lend/Borrow', path: '/lendBorrow' },
    { name: 'Predictions', path: '/predictions' },
    { name: 'Stake', path: '/stake' },
    { name: 'Vaults', path: '/vaults' }
  ]

  const mobileMenu: MenuItem[] = [
    ...desktopMenu,
    { name: 'Leaderboards', path: '/leaderboards' },
    { name: 'Referrals', path: '/referrals' },
    { name: 'Points', path: '/points' },
    { name: 'Sub-accounts', path: '/sub-accounts' },
    { name: 'Stats', path: '/stats' },
    { name: 'Docs', path: '/docs' },
    { name: 'Vocabulary for novices', path: '/vocabulary' },
    { name: 'Settings', path: '/settings' }
  ]

  const getActiveMenu = (pathname: string, menu: { name: string; path: string }[]) => {
    if (pathname === '/' || pathname === '') return 'Futures'
    const firstSegment = pathname?.split('/')[1]
    return menu.find((item) => item?.path?.split('/')[1] === firstSegment)?.name
  }
  const activeMenu = getActiveMenu(pathname, mobileMenu)

  const handleMenuClick = (path: string) => {
    router.push(path)
  }

  const handleCopy = () => {
    if (address) navigator.clipboard.writeText(address)
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
        className="
    w-full h-20 sticky top-0 z-55
      backdrop-blur-xl backdrop-filter
    sm:px-9 flex border-b border-white/10
    items-center justify-between
  "
      >
        <div className="flex items-center justify-center space-x-4">
          <h1
            onClick={() => router.push('/')}
            className="flex items-center mr-6 lg:mr-6 xl:12 gap-2 px-3 py-2 text-[#E8E0F1] text-2xl rounded-md font-semibold cursor-pointer"
          >
            <Image height={20} width={20} src={nexonlogo} alt="Nexon Logo" className="w-6 h-6" />
            Nexon
          </h1>
          <nav className="min-[1025px]:flex hidden text-[#8B8BA0] text-base items-center gap-2 ">
            {desktopMenu?.map(({ name, path }) => (
              <Link
                key={name}
                href={path}
                onClick={() => handleMenuClick(path)}
                className={`tab-btn px-6
                  ${activeMenu === name && 'tab-btn-active'}`}
              >
                {name}
              </Link>
            ))}
            {/* More Dropdown */}
            <button className={`flex items-center gap-x-1.5 transition-all duration-300 `}>
              More
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
                bg-primary text-[#FFFFFF] text-[11px] font-['Proxima Nova'] font-normal leading-[140%] 
                rounded-[12px]"
              >
                {notificationCount}
              </span>
            )}
          </button>

          {isConnected && isRendered ? (
            <div className="relative 2xl:w-[45%] xl:w-2/3 w-1/6 ">
              <button
                ref={buttonRef}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex w-auto relative hover:bg-[#322944] items-center p-[10px] bg-[#1C0C30] cursor-pointer rounded-lg overflow-hidden"
              >
                <Image
                  height={20}
                  width={20}
                  src={balanceicon}
                  alt="BalanceIcon"
                  className="w-[22px] h-[22px] mr-2"
                />
                <span className="text-sm max-[1025px]:hidden flex font-medium truncate text-[#E8E0F1]">
                  {toHumanNumber(balanceData?.value, balanceData?.decimals, 4)}{' '}
                  {balanceData?.symbol}
                </span>
                <span className="border-l max-[1025px]:hidden flex border-gray-600 h-4 mx-2"></span>
                <span className="font-medium max-[1025px]:hidden flex truncate">
                  {truncateAddress(address!)}
                </span>
                <Image
                  height={20}
                  width={20}
                  src={arrowdownicon}
                  alt="arrowdown"
                  className="w-3 h-3 ml-2"
                />
              </button>

              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full z-[999] right-0 mt-2 w-[250px] bg-secondary border border-[#322944] rounded-2xl shadow-lg z-50 p-5"
                >
                  <div className="flex items-start text-[#E8E0F1]">
                    <Image
                      src={balanceicon}
                      alt="BalanceIcon"
                      width={20}
                      height={20}
                      className="w-[40px] h-[40px] mr-3"
                    />
                    <div className="flex flex-col">
                      <span className="truncate">{truncateAddress(address!)}</span>
                      <div className="text-sm text-[#E8E0F1]">
                        {toHumanNumber(balanceData?.value, balanceData?.decimals, 4)}{' '}
                        {balanceData?.symbol}
                      </div>
                    </div>
                    <button onClick={handleCopy} className="px-3 py-1 opacity-70 cursor-pointer">
                      <Image height={20} width={20} src={copyicon} alt="Copy" className="w-5 h-5" />
                    </button>
                  </div>
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
              onClick={toggleConnectWalletModal}
              className="2xl:px-[20px] px-[11px] ml:1 md:ml-4 flex items-center py-[10px] bg-primary font-bold text-[#FFFFFF] text-sm rounded-md md:rounded-xl cursor-pointer"
            >
              <Image height={20} width={20} src={walleticon} alt="walleticon" className="w-5 h-5" />
              <span className="ml-2 hidden 2xl:block">Connect Wallet</span>
            </button>
          )}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 min-[1025px]:hidden block hover:text-blue-400 text-[#ffffff]"
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
        <div className="sticky z-55 left-0 top-14 w-full  bg-[#1a1027] px-3 py-4 shadow-lg">
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
            {mobileMenu?.map(({ name, path }) => (
              <Link
                key={name}
                href={path}
                onClick={() => handleMenuClick(path)}
                className={`py-[5px] w-full px-[12px] mb-2 rounded-full transition-all duration-300
                  ${
                    activeMenu === name
                      ? 'text-[#08030D] bg-[#E8E0F1]'
                      : 'hover:text-[#08030D] hover:bg-[#E8E0F1]'
                  }`}
              >
                {name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}

export default Header
