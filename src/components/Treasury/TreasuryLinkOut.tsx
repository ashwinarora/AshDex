'use client'

import type { ComponentProps, ReactNode } from 'react'
import { IconExternalLink } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useTradingAccount } from '@/hooks/useTradingAccount'
import { HLTOOLS_APP_URL } from '@/utils/constants'
import {
  buildTreasuryPageUrl,
  buildTreasuryProposeUrl,
  type TreasuryProposeKind
} from '@/utils/treasury/proposeLink'

/** A user-signed action's hl-tools counterpart; `deposit` goes to the treasury's page. */
export type TreasuryLinkKind = TreasuryProposeKind | 'deposit'

/**
 * Treasury mode can't sign user-signed actions (the treasury is a multisig),
 * so they become links to hl-tools, where the co-signers propose them.
 */
export const useTreasuryLinkOut = () => {
  const { mode, treasury } = useTradingAccount()
  const hrefFor = (kind: TreasuryLinkKind): string | null => {
    if (!treasury) return null
    const args = {
      hltoolsUrl: HLTOOLS_APP_URL,
      network: treasury.network,
      treasury: treasury.address
    }
    return kind === 'deposit'
      ? buildTreasuryPageUrl(args)
      : buildTreasuryProposeUrl({ ...args, kind })
  }
  return { isTreasury: mode === 'treasury', hrefFor }
}

/**
 * Wallet mode: renders `children` (the normal button). Treasury mode: renders
 * an hl-tools link for `kind` instead, or nothing when `kind` is `null` (no
 * hl-tools counterpart) or hl-tools isn't configured.
 */
export const WalletActionOrTreasuryLink = ({
  kind,
  label,
  children,
  className,
  variant = 'outline',
  size
}: {
  kind: TreasuryLinkKind | null
  /** The action, e.g. "Withdraw". The link reads "<label> in hl-tools". */
  label: string
  children: ReactNode
  className?: string
  variant?: ComponentProps<typeof Button>['variant']
  size?: ComponentProps<typeof Button>['size']
}) => {
  const { isTreasury, hrefFor } = useTreasuryLinkOut()
  if (!isTreasury) return <>{children}</>
  const href = kind ? hrefFor(kind) : null
  if (!href) return null
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title="Propose in hl-tools"
        aria-label={`${label}: Propose in hl-tools`}
        data-testid={`treasury-link-${kind}`}
      >
        {`${label} in hl-tools`}
        <IconExternalLink className="size-3" />
      </a>
    </Button>
  )
}
