'use client'
import { useState, FC, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useConnection, useDisconnect } from 'wagmi'
import Image from 'next/image'
import { truncateAddress } from '@/utils/utils'
import { useWalletModal } from '@/context/WalletModalContext'
import { toast } from 'sonner'
import BridgeButton from './Bridge/BridgeButton'
import NetworkSwitchButton from './NetworkSwitchButton'
import FaucetButton from './Faucet/FaucetButton'
import { useTreasuryLinkOut } from './Treasury/TreasuryLinkOut'
import ashdexLogo from '@/assets/images/logo.svg'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from './ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import {
  IconChevronDown,
  IconCopy,
  IconLogout,
  IconMenu,
  IconStackPop,
  IconWallet,
  IconBuildingBridge,
  IconBuildingBank,
  IconArrowBackUp,
  IconSettings
} from '@tabler/icons-react'
import WithdrawModal from './DepositWithdraw/WithdrawModal'
import { useScreenSize } from '@/hooks/useScreenSize'
import BridgeModal from './Bridge/BridgeModal'
import { useAccountAbstraction, useHyperliquidStore } from '@/store/HyperliquidStore'
import { useTradingAccount } from '@/hooks/useTradingAccount'
import { HYPERLIQUID_NETWORK } from '@/utils/constants'
import { treasuryPageHref } from '@/utils/treasury/route'

type MenuItem = {
  name: string
  path: string
  isComingSoon?: boolean
}

const Header: FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const disconnect = useDisconnect()
  const { address, isConnected } = useConnection()
  const [mounted, setMounted] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false)
  const { openConnectWalletModal } = useWalletModal()
  const { isTreasury, hrefFor } = useTreasuryLinkOut()
  const treasuryWithdrawHref = hrefFor('withdraw3')
  const { treasury } = useTradingAccount()
  const setTreasury = useHyperliquidStore((s) => s.setTreasury)
  const { isMobile } = useScreenSize()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const walletId = address

  useEffect(() => {
    setMounted(true)
  }, [])

  const isWalletConnected = mounted && isConnected && !!walletId
  const accountAbstraction = useAccountAbstraction()
  const modeLabel =
    accountAbstraction === 'unifiedAccount'
      ? 'Unified'
      : accountAbstraction === 'portfolioMargin'
        ? 'Portfolio margin'
        : null

  const desktopMenu: MenuItem[] = [
    { name: 'Futures', path: '/', isComingSoon: false },
    { name: 'Spot', path: '/spot', isComingSoon: false },
    { name: 'Outcomes', path: '/outcomes', isComingSoon: false },
    { name: 'Portfolio', path: '/portfolio', isComingSoon: false }
  ]

  const mobileMenu: MenuItem[] = desktopMenu

  const getActiveMenu = (pathname: string, menu: { name: string; path: string }[]) => {
    if (
      pathname === '/' ||
      pathname === '' ||
      (pathname.startsWith('/') &&
        pathname.split('/').length > 1 &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !isNaN(pathname.split('/')[1]?.charAt(0) as any))
    )
      return 'Futures'

    const firstSegment = pathname?.split('/')[1]

    if (firstSegment === 'spot') return 'Spot'
    if (firstSegment === 'outcomes') return 'Outcomes'

    return menu.find((item) => item?.path?.split('/')[1] === firstSegment)?.name
  }
  const activeMenu = getActiveMenu(pathname ?? '', mobileMenu)

  // The account shown in the header button: the treasury while trading for one.
  const shownAddress = treasury?.address ?? walletId

  const handleCopy = () => {
    if (shownAddress) navigator.clipboard.writeText(shownAddress)
    toast.success('Copied to clipboard')
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
    <div className="top-0 z-40 sticky flex justify-between items-center bg-secondary backdrop-filter backdrop-blur-xl px-4 w-full h-12">
      <div
        onClick={() => router.push('/')}
        className="flex items-center gap-2 pr-4 rounded-md text-white text-2xl font-semibold cursor-pointer"
      >
        <Image
          style={{ width: 22, height: 'auto' }}
          src={ashdexLogo}
          alt="AshDex"
          className="w-6 h-6"
        />
        <span className="tracking-tight">
          <span className="text-text-1">Ash</span>
          <span className="text-text-3">Dex</span>
        </span>
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
              {desktopMenu?.map(({ name, path, isComingSoon }) => {
                if (isComingSoon) {
                  return (
                    <DropdownMenuItem
                      disabled
                      key={name}
                      className="flex items-center justify-between"
                    >
                      {name}
                      <span className="!text-[10px] p-0.5 px-1.5 bg-primary/50 rounded-md text-white">
                        Coming Soon
                      </span>
                    </DropdownMenuItem>
                  )
                }
                return (
                  <DropdownMenuItem
                    key={name}
                    onClick={() => router.push(path)}
                    className="flex items-center justify-between"
                  >
                    {name}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <NavigationMenu className="h-full md:flex hidden w-full items-center justify-start">
            {desktopMenu?.map(({ name, path, isComingSoon }) =>
              isComingSoon ? (
                // Render as an anchor with aria-disabled=true so screen readers
                // announce it as a disabled nav target, not as plain text.
                // No href = not activatable; onClick prevented for good measure.
                <a
                  key={name}
                  role="link"
                  aria-disabled="true"
                  onClick={(e) => e.preventDefault()}
                  className="h-full flex flex-row gap-2 text-white items-center justify-center w-fit px-6 text-sm cursor-not-allowed opacity-70"
                >
                  {name}
                  <span className="!text-[10px] p-0.5 px-1.5 bg-primary/50 rounded-md text-white">
                    Coming Soon
                  </span>
                </a>
              ) : (
                <NavigationMenuItem
                  className="h-full flex items-center justify-center w-24"
                  key={name}
                >
                  <NavigationMenuLink
                    href={path}
                    className={cn(
                      'text-white hover:text-white text-sm h-full w-full flex items-center justify-center rounded-none',
                      activeMenu === name && 'text-primary hover:text-primary font-semibold'
                    )}
                  >
                    {name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            )}
          </NavigationMenu>
        )}
      </div>
      <div className="flex items-center gap-2">
        <NetworkSwitchButton />
        <FaucetButton />
        {!isMobile && <BridgeButton />}
        {isWalletConnected ? (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={'outline'}
                  size={'sm'}
                  className="flex text-white text-xs items-center gap-2"
                  data-testid="header-wallet-button"
                >
                  {isTreasury && (
                    <span
                      className="rounded-sm bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 font-medium flex items-center gap-1"
                      data-testid="header-treasury-chip"
                      title="Trading for a treasury"
                    >
                      <IconBuildingBank className="size-3" />
                      {/* Icon only on phones, where the header row has no room to spare. */}
                      <span className="max-sm:hidden">{'Treasury'}</span>
                    </span>
                  )}
                  {modeLabel && (
                    <span
                      className="rounded-sm bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 font-medium"
                      data-testid="header-account-mode"
                      title={
                        accountAbstraction === 'unifiedAccount'
                          ? 'Unified account: one balance backs spot and cross perps.'
                          : 'Portfolio margin: pooled collateral across eligible assets.'
                      }
                    >
                      {modeLabel}
                    </span>
                  )}
                  <span className="max-xl:hidden flex font-medium  truncate">
                    {truncateAddress(shownAddress!)}
                  </span>
                  <IconChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {treasury && (
                  <>
                    <DropdownMenuLabel className="text-xs font-normal">
                      {`Trading for treasury ${truncateAddress(treasury.address)}`}
                      <br />
                      {`Signing as ${truncateAddress(walletId!)}`}
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => setTreasury(null)}
                      data-testid="header-back-to-wallet"
                    >
                      <IconArrowBackUp className="size-4 text-inherit" />
                      Back to my wallet
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(treasuryPageHref(treasury.network, treasury.address))
                      }
                    >
                      <IconSettings className="size-4 text-inherit" />
                      Treasury setup
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {!treasury && (
                  <DropdownMenuItem
                    onClick={() => router.push(treasuryPageHref(HYPERLIQUID_NETWORK))}
                    data-testid="header-trade-for-treasury"
                  >
                    <IconBuildingBank className="size-4 text-inherit" />
                    Trade for a treasury
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleCopy}>
                  <IconCopy className="size-4 text-inherit" />
                  Copy Address
                </DropdownMenuItem>

                <DropdownMenuItem onClick={openConnectWalletModal}>
                  <IconWallet className="size-4 text-inherit" />
                  Switch Wallet
                </DropdownMenuItem>

                {!isTreasury ? (
                  <DropdownMenuItem onClick={() => setIsWithdrawOpen(true)}>
                    <IconStackPop className="size-4 text-inherit" />
                    Withdraw
                  </DropdownMenuItem>
                ) : (
                  treasuryWithdrawHref && (
                    <DropdownMenuItem asChild>
                      <a
                        href={treasuryWithdrawHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Propose in hl-tools"
                        data-testid="treasury-link-withdraw3"
                      >
                        <IconStackPop className="size-4 text-inherit" />
                        Withdraw in hl-tools
                      </a>
                    </DropdownMenuItem>
                  )
                )}

                {isMobile && (
                  <DropdownMenuItem onClick={() => setIsBridgeModalOpen(true)}>
                    <IconBuildingBridge className="size-4 text-inherit" />
                    Bridge
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => {
                    disconnect.mutate()
                  }}
                  variant="destructive"
                >
                  <IconLogout className="size-4 text-inherit" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button onClick={openConnectWalletModal} size={'sm'} className="flex items-center gap-2">
            <IconWallet className="size-4" />
            <span className="text-xs">Connect Wallet</span>
          </Button>
        )}
      </div>
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(!isWithdrawOpen)} />
      <BridgeModal isOpen={isBridgeModalOpen} onClose={() => setIsBridgeModalOpen(false)} />
    </div>
  )
}

export default Header
