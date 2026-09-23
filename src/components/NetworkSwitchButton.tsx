'use client'

import { FC } from 'react'
import { usePathname } from 'next/navigation'
import { IconArrowsExchange } from '@tabler/icons-react'
import { Button } from './ui/button'
import { isTestnet, MAINNET_APP_URL, TESTNET_APP_URL } from '@/utils/constants'
import { buildNetworkSwitchUrl } from '@/utils/networkSwitch'

/**
 * Jumps to the sibling deployment running the other Hyperliquid network.
 * Hidden when the counterpart URL is not configured in the environment.
 */
const NetworkSwitchButton: FC = () => {
  const pathname = usePathname()
  const label = isTestnet ? 'Mainnet' : 'Testnet'
  const href = buildNetworkSwitchUrl(isTestnet ? MAINNET_APP_URL : TESTNET_APP_URL, pathname ?? '/')

  if (!href) return null

  return (
    <Button
      asChild
      variant={'outline'}
      size={'sm'}
      className="flex items-center gap-2 text-xs text-white"
    >
      <a href={href} data-testid="network-switch-button" title={`Switch to ${label}`}>
        <IconArrowsExchange className="size-4" />
        {label}
      </a>
    </Button>
  )
}

export default NetworkSwitchButton
