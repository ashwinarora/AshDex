'use client'
import { useState, FC, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import Image from 'next/image'
import { toHumanNumber, truncateAddress } from '@/utils/utils'
import { useComponentRendered } from '@/hooks/useComponentRendered'
import { useWalletModal } from '@/context/WalletModalContext'
import { useUser } from '@/context/UserContext'
import Link from 'next/link'
import Avatar from './common/Avatar'
import WithdrawModal from './DepositWithdraw/WithdrawModal'
import DepositModal from './DepositWithdraw/DepositModal'
import {
  IconBell,
  IconCopy,
  IconHelp,
  IconMoonFilled,
  IconSettings,
  IconSwitch3
} from '@tabler/icons-react'
import { toast } from 'react-toastify'
import BridgeButton from './common/BridgeButton'
import nexonlogo from '@/assets/images/logo.svg'
import moonicon from '@/assets/images/dark_mode.svg'
import walleticon from '@/assets/images/wallet_icon.svg'
import menuline from '@/assets/images/menu_icon.svg'
import menuClose from '@/assets/images/close_icon.svg'
import helpicon from '@/assets/images/help_icon.svg'
import arrowdownicon from '@/assets/images/arrowdown_icon.svg'
import disconnecticon from '@/assets/images/disconnect_icon.svg'
import { useNexonReferral } from '@/hooks/useNexonReferral'
type MenuItem = {
  name: string
  path: string
}

const Header: FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()
  const isRendered = useComponentRendered()
  const { data: balanceData } = useBalance({ address })
  const { toggleConnectWalletModal } = useWalletModal()
  const { currentUser } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [notificationCount] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  useNexonReferral()

  const desktopMenu: MenuItem[] = [
    { name: 'Futures', path: '/' },
    { name: 'Spot', path: '/spot' },
    { name: 'Referrals', path: '/referrals' }
    // { name: 'Lend/Borrow', path: '/lendBorrow' },
    // { name: 'Predictions', path: '/predictions' },
    // { name: 'Stake', path: '/stake' },
    // { name: 'Vaults', path: '/vaults' }
  ]

  const mobileMenu: MenuItem[] = [
    ...desktopMenu,
    // { name: 'Leaderboards', path: '/leaderboards' },
    // { name: 'Referrals', path: '/referrals' },
    // { name: 'Points', path: '/points' },
    // { name: 'Sub-accounts', path: '/sub-accounts' },
    // { name: 'Stats', path: '/stats' },
    // { name: 'Docs', path: '/docs' },
    // { name: 'Vocabulary for novices', path: '/vocabulary' },
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
    toast.success('Copied to clipboard')
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

  if (!isRendered) return null

  return (
    <>
      <header className="sticky top-0 flex items-center justify-between w-full px-2 z-55 backdrop-filter backdrop-blur-xl h-max bg-secondary">
        <div className="flex items-center justify-center space-x-4 align-middle">
          <h1
            onClick={() => router.push('/')}
            className="flex items-center gap-2 mr-6 lg:mr-6 px-3 py-2 rounded-md font-semibold text-[#E8E0F1] text-2xl cursor-pointer"
          >
            <Image
              style={{ width: 20, height: 'auto' }}
              src={nexonlogo}
              alt="Nexon Logo"
              className="w-6 h-6"
            />
            Nexon
          </h1>
          <nav className="hidden xl:flex items-center xl:gap-2 text-[#8B8BA0] text-sm xl:text-base">
            {desktopMenu?.map(({ name, path }) => (
              <Link
                key={name}
                href={path}
                onClick={() => handleMenuClick(path)}
                className={`tab-btn xl:px-6 px-4
                  ${activeMenu === name && 'tab-btn-active'}`}
              >
                {name}
              </Link>
            ))}
            {/* More Dropdown */}
            <button
              className={`flex items-center gap-1 group cursor-pointer  transition-all duration-300 relative hover:text-white`}
            >
              More
              <span className="flex items-center justify-center px-1 text-xs text-white transition-all duration-300 rounded opacity-0 bg-primary group-hover:opacity-100 text-nowrap">
                Coming Soon!
              </span>
            </button>
          </nav>
        </div>
        <div className="flex items-center justify-end space-x-3 2xl:space-x-4">
          <BridgeButton />
          <button className="hidden p-1 text-gray-400 xl:block hover:text-white">
            <IconMoonFilled size={24} />
          </button>
          <button className="hidden p-1 text-gray-400 xl:block hover:text-white">
            <IconHelp size={24} />
          </button>
          <button className="relative p-1 text-gray-400 hover:text-white">
            <IconBell size={24} />

            {notificationCount > 0 && (
              <span className="-top-1 right-0 2xl:-right-0 absolute flex justify-center items-center bg-primary rounded-[12px] w-[18px] h-[17px] text-white">
                {notificationCount}
              </span>
            )}
          </button>

          {isConnected && isRendered ? (
            <div className="relative w-1/6 2xl:w-[45%] xl:w-2/3">
              <button
                ref={buttonRef}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="relative flex items-center hover:bg-white/10 p-[10px] rounded-lg w-auto overflow-hidden cursor-pointer"
              >
                <Avatar className="w-6 h-6 mr-2" avatar={currentUser?.avatar_url || '0'} />
                <span className="max-[1025px]:hidden flex font-medium text-[#E8E0F1] text-sm truncate">
                  {toHumanNumber(balanceData?.value, balanceData?.decimals, 4)}{' '}
                  {balanceData?.symbol}
                </span>
                <span className="flex h-4 mx-2 border-l border-gray-600 max-xl:hidden"></span>
                <span className="flex font-medium truncate max-xl:hidden">
                  {truncateAddress(address!)}
                </span>
                <Image
                  style={{ width: 16, height: 'auto' }}
                  src={arrowdownicon}
                  alt="arrowdown"
                  className="w-3 h-3 ml-2"
                />
              </button>

              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="top-full right-0 z-[999] absolute bg-secondary shadow-lg mt-2 px-2 py-4 border border-white/10 rounded-2xl w-[270px]"
                >
                  <div className="flex items-start gap-2 px-2 text-[#E8E0F1]">
                    <div className="flex flex-col">
                      <span className="flex items-center truncate">
                        {truncateAddress(address!)}
                        <button
                          onClick={handleCopy}
                          className="px-3 py-1 transition-all duration-300 cursor-pointer opacity-70 hover:opacity-100"
                        >
                          <IconCopy className="w-4 h-4" />
                        </button>
                      </span>
                      <div className="text-[#E8E0F1] text-sm">
                        {toHumanNumber(balanceData?.value, balanceData?.decimals, 4)}{' '}
                        {balanceData?.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 px-2 text-[#E8E0F1] cursor-pointer">
                    <div className="flex flex-col">
                      <span className="text-[#E8E0F1] text-xs">Vault Trading Account</span>
                      <div className="text-[#E8E0F1] text-sm">
                        {toHumanNumber(balanceData?.value, balanceData?.decimals, 4)}{' '}
                        {balanceData?.symbol}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleConnectWalletModal}
                    className="flex items-center hover:bg-white/10 mt-3 px-2 py-2 rounded-md w-full font-medium text-[#E8E0F1] text-base cursor-pointer"
                  >
                    <IconSwitch3 size={24} className="mr-3" />
                    Switch Wallet
                  </button>
                  <Link
                    href="/settings"
                    className="flex items-center hover:bg-white/10 mt-3 px-2 py-2 rounded-md w-full font-medium text-[#E8E0F1] text-base cursor-pointer"
                  >
                    <IconSettings size={24} className="mr-3" />
                    Settings
                  </Link>
                  <button
                    onClick={() => setIsDepositOpen(true)}
                    className="flex items-center hover:bg-[#322944] mt-3 px-3 py-2 rounded-md w-full font-medium text-[#E8E0F1] text-base cursor-pointer"
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setIsWithdrawOpen(true)}
                    className="flex items-center hover:bg-[#322944] mt-3 px-3 py-2 rounded-md w-full font-medium text-[#E8E0F1] text-base cursor-pointer"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="flex items-center w-full px-3 py-2 mt-2 text-base font-medium rounded-md cursor-pointer hover:bg-white/10 text-red text-md"
                  >
                    <Image
                      style={{ width: 20, height: 'auto' }}
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
              className="flex items-center bg-primary md:ml-4 px-[11px] 2xl:px-[20px] py-2 rounded-md   font-bold text-white text-sm cursor-pointer ml:1"
            >
              <Image
                style={{ width: 20, height: 'auto' }}
                src={walleticon}
                alt="walleticon"
                className="w-5 h-5"
              />
              <span className="hidden ml-2 2xl:block">Connect Wallet</span>
            </button>
          )}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="block p-1 text-white min-xl:hidden hover:text-blue-400"
          >
            <Image
              width={20}
              height={20}
              src={isOpen ? menuClose : menuline}
              alt="menu-icon"
              className={`w-5 h-5 mr-5`}
            />
          </button>
        </div>
      </header>
      {/* Sidebar Menu */}
      {isOpen && (
        <div className="top-20 left-0 z-55 fixed bg-[#1a1027] shadow-lg px-3 py-4 w-full">
          <div className="flex gap-2 mb-3 ml-1">
            <button className="flex items-center bg-white/10 px-[10px] md:px-[20px] py-[10px] rounded-md font-bold text-white text-sm cursor-pointer">
              <Image
                style={{ width: 20, height: 'auto' }}
                src={helpicon}
                alt="helpicon"
                className="w-5 h-5"
              />
            </button>
            <button className="flex items-center bg-white/10 px-[10px] md:px-[20px] py-[10px] rounded-md font-bold text-white text-sm cursor-pointer">
              <Image
                style={{ width: 20, height: 'auto' }}
                src={moonicon}
                alt="moonicon"
                className="w-4 h-4 md:mr-2"
              />
            </button>
          </div>
          <nav className="flex flex-col flex-start items-center text-[#8B8BA0] text-sm">
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
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(!isDepositOpen)} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(!isWithdrawOpen)} />
    </>
  )
}

export default Header
