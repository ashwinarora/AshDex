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
import { toast } from 'sonner'
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
import { cn } from '@/lib/utils'
import {
  IconChevronDown,
  IconCopy,
  IconLogout,
  IconMenu,
  IconSettings,
  IconStackPop,
  IconWallet
} from '@tabler/icons-react'
import WithdrawModal from './DepositWithdraw/WithdrawModal'
import { useScreenSize } from '@/hooks/useScreenSize'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
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
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const isRendered = useComponentRendered()
  const { toggleConnectWalletModal } = useWalletModal()
  const { currentUser } = useUser()
  const { isMobile } = useScreenSize()
  // const [isOpen, setIsOpen] = useState(false)
  // const [notificationCount] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  useNexonReferral()

  const desktopMenu: MenuItem[] = [
    { name: 'Futures', path: '/', isComingSoon: false },
    { name: 'Spot', path: '/spot', isComingSoon: false },
    { name: 'Portfolio', path: '/portfolio', isComingSoon: false },
    { name: 'Referrals', path: '/', isComingSoon: true }
    // { name: 'Lend/Borrow', path: '/lendBorrow', isComingSoon: true },
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
      <div className="h-full flex-1 w-full md:w-fit flex px-2 items-center md:!justify-start justify-end">
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={'outline'}
                size={'sm'}
                className="flex size-8 text-white text-xs items-center gap-2"
              >
                <IconMenu className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-48 w-fit" align="end">
              {desktopMenu?.map(({ name, path }) => (
                <DropdownMenuItem
                  key={name}
                  onClick={() => router.push(path)}
                  className="flex items-center justify-between"
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <NavigationMenu className="h-full md:flex hidden w-full items-center justify-start">
            {desktopMenu?.map(({ name, path, isComingSoon }) =>
              isComingSoon ? (
                <HoverCard key={name}>
                  <HoverCardTrigger>
                    <div className="h-full flex flex-col items-center justify-center w-24 text-white/50 text-sm">
                      {name}
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-fit h-fit p-2" align="center">
                    <p className="text-white text-xs">Coming Soon</p>
                  </HoverCardContent>
                </HoverCard>
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
        )}
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
                  <IconChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuItem onClick={handleCopy}>
                  <IconCopy className="size-4 text-inherit" />
                  Copy Address
                </DropdownMenuItem>

                <DropdownMenuItem onClick={toggleConnectWalletModal}>
                  <IconWallet className="size-4 text-inherit" />
                  Switch Wallet
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <IconSettings className="size-4 text-inherit" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setIsWithdrawOpen(true)}>
                  <IconStackPop className="size-4 text-inherit" />
                  Withdraw
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => disconnect()} variant="destructive">
                  <IconLogout className="size-4 text-inherit" />
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
            <IconWallet className="size-4" />
            <span className="text-xs">Connect Wallet</span>
          </Button>
        )}
      </div>
      {/* {isWithdrawOpen && ( */}
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(!isWithdrawOpen)} />
      {/* )} */}
    </div>
  )
}

export default Header
