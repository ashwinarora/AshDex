'use client'
import { useState, FC, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAccount, useDisconnect } from 'wagmi'
import Image from 'next/image'
import Link from 'next/link'
import { truncateAddress } from '@/utils/utils'
import { useComponentRendered } from '@/hooks/useComponentRendered'
import { useWalletModal } from '@/context/WalletModalContext'
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
import { useTermsSignature } from '@/hooks/useTermsSignature'
import clsx from 'clsx'
import useUserStore from '@/store/userStore'
import { useTranslate } from '@tolgee/react'
type MenuItem = {
  name: string
  path: string
  isComingSoon?: boolean
}

const Header: FC = () => {
  const pathname = usePathname()
  const { t } = useTranslate()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const { toggleConnectWalletModal, isModalOpen } = useWalletModal()
  const { isMobile } = useScreenSize()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')

  // const [isOpen, setIsOpen] = useState(false)
  // const [notificationCount] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const { data: termsData } = useTermsSignature()
  useNexonReferral()

  // if user is connected and terms are not signed, disconnect and show error
  useEffect(() => {
    if (!isConnected) return
    if (!termsData) return
    if (termsData.signed) return
    if (isModalOpen) return
    disconnect()
    toast.error(t('Please sign the terms to continue'))
  }, [isConnected, termsData?.signed, isModalOpen])

  const desktopMenu: MenuItem[] = [
    { name: t('Futures'), path: '/', isComingSoon: false },
    { name: t('Spot'), path: '/spot', isComingSoon: false },
    { name: t('Portfolio'), path: '/portfolio', isComingSoon: false },
    { name: t('Referrals'), path: '/referrals', isComingSoon: false }
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
    { name: t('Settings'), path: '/settings' }
  ]

  const getActiveMenu = (pathname: string, menu: { name: string; path: string }[]) => {
    // Check if path is root or starts with an asset parameter
    if (
      pathname === '/' ||
      pathname === '' ||
      (pathname.startsWith('/') &&
        pathname.split('/').length > 1 &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !isNaN(pathname.split('/')[1]?.charAt(0) as any))
    )
      return t('Futures')

    // Get first segment of path to check against menu items
    const firstSegment = pathname?.split('/')[1]

    // Special case for spot paths with asset parameter
    if (firstSegment === 'spot') return t('Spot')

    return menu.find((item) => item?.path?.split('/')[1] === firstSegment)?.name
  }
  const activeMenu = getActiveMenu(pathname, mobileMenu)

  const handleCopy = () => {
    if (address) navigator.clipboard.writeText(address)
    toast.success(t('Copied to clipboard'))
  }

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
    <div
      className={clsx(
        'top-0 z-40 sticky flex justify-between items-center bg-secondary backdrop-filter backdrop-blur-xl px-4 w-full h-12',
        isRTL && 'flex-row-reverse'
      )}
    >
      <Link
        href="/"
        className={clsx(
          'flex items-center gap-2 rounded-md font-semibold text-[#E8E0F1] text-2xl cursor-pointer',
          isRTL ? 'pl-4' : 'pr-4'
        )}
      >
        <Image
          style={{ width: 20, height: 'auto' }}
          src={nexonlogo}
          alt="Nexon Logo"
          className="w-6 h-6"
        />
        Nexon
      </Link>
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
                <DropdownMenuItem key={name} asChild>
                  <Link href={path} className="flex items-center justify-between">
                    {name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <NavigationMenu
            className={clsx(
              'h-full md:flex hidden w-full items-center justify-start',
              isRTL && 'flex-row-reverse'
            )}
          >
            {desktopMenu?.map(({ name, path, isComingSoon }) =>
              isComingSoon ? (
                <HoverCard key={name}>
                  <HoverCardTrigger>
                    <div className="h-full flex flex-col items-center justify-center w-24 text-white/50 text-sm">
                      {name}
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-fit h-fit p-2" align="center">
                    <p className="text-white text-xs">{t('Coming Soon')}</p>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <NavigationMenuItem
                  className="h-full flex items-center justify-center w-24"
                  key={name}
                >
                  <Link href={path} className=" w-full h-full cursor-pointer">
                    <NavigationMenuLink
                      className={cn(
                        'text-secondary-foreground hover:bg-popover focus:bg-none text-sm h-full w-full flex items-center justify-center rounded-none',
                        activeMenu === name && 'text-accent-foreground font-semibold'
                      )}
                    >
                      {name}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )
            )}
            {/* </NavigationMenuList> */}
          </NavigationMenu>
        )}
      </div>
      <div className={clsx('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
        <BridgeButton />
        {isConnected ? (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={'outline'}
                  size={'sm'}
                  className="flex text-white text-xs items-center gap-2"
                >
                  <Avatar className="size-4" avatar={''} />
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
                  {t('Copy Address')}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={toggleConnectWalletModal}>
                  <IconWallet className="size-4 text-inherit" />
                  {t('Switch Wallet')}
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <IconSettings className="size-4 text-inherit" />
                    {t('Settings')}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setIsWithdrawOpen(true)}>
                  <IconStackPop className="size-4 text-inherit" />
                  {t('Withdraw')}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => disconnect()} variant="destructive">
                  <IconLogout className="size-4 text-inherit" />
                  {t('Disconnect')}
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
            <span className="text-xs">{t('Connect Wallet')}</span>
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
