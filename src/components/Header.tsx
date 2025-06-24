'use client'
import { useState, FC, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount, useDisconnect } from 'wagmi'
import Image from 'next/image'
import { truncateAddress } from '@/utils/utils'
import { useComponentRendered } from '@/hooks/useComponentRendered'
import { useWalletModal } from '@/context/WalletModalContext'
import { useUser } from '@/context/UserContext'
import Avatar from './common/Avatar'
import { toast } from 'react-toastify'
import BridgeButton from './common/BridgeButton'
import nexonlogo from '@/assets/images/logo.svg'
import { useNexonReferral } from '@/hooks/useNexonReferral'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from './ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { ChevronDownIcon, CopyIcon, LogOutIcon, SettingsIcon, WalletIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
type MenuItem = {
  name: string
  path: string
  isComingSoon?: boolean
}

const Header: FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()
  const isRendered = useComponentRendered()
  const { toggleConnectWalletModal } = useWalletModal()
  const { currentUser } = useUser()
  // const [isOpen, setIsOpen] = useState(false)
  // const [notificationCount] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  useNexonReferral()

  const desktopMenu: MenuItem[] = [
    { name: 'Futures', path: '/', isComingSoon: false },
    { name: 'Spot', path: '/spot', isComingSoon: false },
    { name: 'Referrals', path: '/referrals', isComingSoon: false }
    // { name: 'Lend/Borrow', path: '/lendBorrow', isComingSoon: true },
    // { name: 'Predictions', path: '/predictions', isComingSoon: true },
    // { name: 'Stake', path: '/stake', isComingSoon: true },
    // { name: 'Vaults', path: '/vaults', isComingSoon: true }
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

  const handleCopy = () => {
    if (address) navigator.clipboard.writeText(address)
    toast.success('Copied to clipboard')
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // setIsOpen(false)
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
    <div className="top-0 z-40 sticky flex justify-between items-center bg-secondary backdrop-filter backdrop-blur-xl px-4 w-full h-14">
      <div
        onClick={() => router.push('/')}
        className="flex items-center gap-2 pr-4 rounded-md font-semibold text-[#E8E0F1] text-2xl cursor-pointer"
      >
        <Image
          style={{ width: 20, height: 'auto' }}
          src={nexonlogo}
          alt="Nexon Logo"
          className="w-6 h-6"
        />
        Nexon
      </div>
      <div className="h-full flex-1 w-fit">
        <NavigationMenu className="h-full w-fit">
          {/* <NavigationMenuList className='h-full w-fit'> */}
          {desktopMenu?.map(({ name, path, isComingSoon }) =>
            isComingSoon ? (
              <div
                key={name}
                className="h-full flex flex-col items-center justify-center w-24 text-white/50 text-sm"
              >
                {name}
                {/* <Badge variant={'outline'} className='text-white/50 text-xs'>Coming Soon</Badge> */}
              </div>
            ) : (
              <NavigationMenuItem
                className="h-full flex items-center justify-center w-24"
                key={name}
              >
                <NavigationMenuLink
                  href={path}
                  className={cn(
                    'text-white/50 hover:text-white text-sm h-full w-full flex items-center justify-center rounded-none',
                    activeMenu === name && 'text-white bg-border font-semibold'
                  )}
                >
                  {name}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          )}
          {/* </NavigationMenuList> */}
        </NavigationMenu>
      </div>
      <div className="flex items-center gap-2">
        <BridgeButton />
        {isConnected && isRendered ? (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={'outline'}
                  size={'sm'}
                  className="flex text-white text-xs items-center gap-2"
                >
                  <Avatar className="size-4" avatar={currentUser?.avatar_url || '0'} />
                  {/* <span className="max-xl:hidden flex mx-2 border-gray-600 border-l h-4"></span> */}
                  <span className="max-xl:hidden flex font-medium  truncate">
                    {truncateAddress(address!)}
                  </span>
                  <ChevronDownIcon className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuItem onClick={handleCopy}>
                  <CopyIcon className="size-4 text-inherit" />
                  Copy Address
                </DropdownMenuItem>

                <DropdownMenuItem onClick={toggleConnectWalletModal}>
                  <WalletIcon className="size-4 text-inherit" />
                  Switch Wallet
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <SettingsIcon className="size-4 text-inherit" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => disconnect()} variant="destructive">
                  <LogOutIcon className="size-4 text-inherit" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button
            onClick={toggleConnectWalletModal}
            size={'sm'}
            className="flex items-center gap-2"
          >
            <WalletIcon className="size-4" />
            <span className="text-xs">Connect Wallet</span>
          </Button>
        )}
      </div>
    </div>
    // <>
    //   <header className="top-0 z-55 sticky flex justify-between items-center bg-secondary backdrop-filter backdrop-blur-xl px-2 w-full h-max">
    //     <div className="flex justify-center items-center space-x-4 align-middle">
    //       <h1
    //         onClick={() => router.push('/')}
    //         className="flex items-center gap-2 mr-6 lg:mr-6 px-3 rounded-md font-semibold text-[#E8E0F1] text-2xl cursor-pointer"
    //       >
    //         <Image
    //           style={{ width: 20, height: 'auto' }}
    //           src={nexonlogo}
    //           alt="Nexon Logo"
    //           className="w-6 h-6"
    //         />
    //         Nexon
    //       </h1>
    //       <nav className="hidden xl:flex items-center xl:gap-2 text-[#8B8BA0] text-sm">
    //         {desktopMenu?.map(({ name, path }) => (
    //           <Link
    //             key={name}
    //             href={path}
    //             onClick={() => handleMenuClick(path)}
    //             className={`tab-btn xl:px-6 px-4
    //               ${activeMenu === name && 'tab-btn-active'}`}
    //           >
    //             {name}
    //           </Link>
    //         ))}
    //         {/* More Dropdown */}
    //         <button
    //           className={`flex items-center gap-1 group cursor-pointer  transition-all duration-300 relative hover:text-white`}
    //         >
    //           More
    //           <span className="flex justify-center items-center bg-primary opacity-0 group-hover:opacity-100 px-1 rounded text-white text-xs text-nowrap transition-all duration-300">
    //             Coming Soon!
    //           </span>
    //         </button>
    //       </nav>
    //     </div>
    //     <div className="flex justify-end items-center space-x-3 2xl:space-x-4">
    //       <BridgeButton />
    //       <button className="hidden xl:block p-1 text-gray-400 hover:text-white">
    //         <IconMoonFilled size={24} />
    //       </button>
    //       <button className="hidden xl:block p-1 text-gray-400 hover:text-white">
    //         <IconHelp size={24} />
    //       </button>
    //       <button className="relative p-1 text-gray-400 hover:text-white">
    //         <IconBell size={24} />

    //         {notificationCount > 0 && (
    //           <span className="-top-1 right-0 2xl:-right-0 absolute flex justify-center items-center bg-primary rounded-[12px] w-[18px] h-[17px] text-white">
    //             {notificationCount}
    //           </span>
    //         )}
    //       </button>

    //     <button
    //       onClick={() => setIsOpen((prev) => !prev)}
    //       className="min-xl:hidden block p-1 text-white hover:text-blue-400"
    //     >
    //       <Image
    //         width={20}
    //         height={20}
    //         src={isOpen ? menuClose : menuline}
    //         alt="menu-icon"
    //         className={`w-5 h-5 mr-5`}
    //       />
    //     </button>
    //   </div>
    // </header>
    //   {/* Sidebar Menu */}
    //   {isOpen && (
    //     <div className="top-20 left-0 z-55 fixed bg-[#1a1027] shadow-lg px-3 py-4 w-full">
    //       <div className="flex gap-2 mb-3 ml-1">
    //         <button className="flex items-center bg-white/10 px-[10px] md:px-[20px] py-[10px] rounded-md font-bold text-white text-sm cursor-pointer">
    //           <Image
    //             style={{ width: 20, height: 'auto' }}
    //             src={helpicon}
    //             alt="helpicon"
    //             className="w-5 h-5"
    //           />
    //         </button>
    //         <button className="flex items-center bg-white/10 px-[10px] md:px-[20px] py-[10px] rounded-md font-bold text-white text-sm cursor-pointer">
    //           <Image
    //             style={{ width: 20, height: 'auto' }}
    //             src={moonicon}
    //             alt="moonicon"
    //             className="md:mr-2 w-4 h-4"
    //           />
    //         </button>
    //       </div>
    //       <nav className="flex flex-col flex-start items-center text-[#8B8BA0] text-sm">
    //         {mobileMenu?.map(({ name, path }) => (
    //           <Link
    //             key={name}
    //             href={path}
    //             onClick={() => handleMenuClick(path)}
    //             className={`py-[5px] w-full px-[12px] mb-2 rounded-full transition-all duration-300
    //               ${
    //                 activeMenu === name
    //                   ? 'text-[#08030D] bg-[#E8E0F1]'
    //                   : 'hover:text-[#08030D] hover:bg-[#E8E0F1]'
    //               }`}
    //           >
    //             {name}
    //           </Link>
    //         ))}
    //       </nav>
    //     </div>
    //   )}
    // </>
  )
}

export default Header
