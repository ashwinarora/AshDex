'use client'

import { IconArrowUpRight, IconPick } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { HLTOOLS_URL } from '@/utils/faucet'

/**
 * House ad for hl-tools inside the faucet dialog.
 *
 * The faucet is a single, one-time 1,000 USDC drop, so anyone who opens this
 * dialog is by definition short on testnet funds — which makes it the one
 * place in the app where this pitch is genuinely useful rather than noise.
 * The whole card is the link (max click target); the CTA row only exists to
 * make that affordance obvious.
 *
 * Numbers are derived from hl-tools' source, NOT its README (which still
 * quotes ~$0.02/wallet and is wrong). In `useAutoChain`, the user seeds the
 * chain with `N + 1` USDC and every hop forwards `balance - TRANSFER_FEE_BUFFER`
 * (1.02, covering Hyperliquid's $1 fee on transfers to a fresh address). So
 * `1 - 0.02N` comes back and the run costs `1.02 * N` — about $1 of mainnet
 * USDC per wallet, each wallet yielding ~1,000 testnet USDC. That $1-per-1,000
 * rate is the honest headline, and it's why the wallet count caps at 50 (at
 * N = 50 the returned amount hits exactly zero).
 */
const STATS = [
  { value: '~$1', label: 'per 1,000 USDC', hero: true },
  { value: '50', label: 'wallets a run' },
  { value: '~$50k', label: 'max per run' }
]

const HlToolsPromo = () => (
  <a
    href={HLTOOLS_URL}
    target="_blank"
    rel="noopener noreferrer"
    data-testid="faucet-hltools-link"
    className="group relative block overflow-hidden rounded-lg border border-primary/25 bg-surface-2 p-4 transition-colors hover:border-primary/60"
  >
    {/* Warm corner glow — lifts the card off the dialog's flat surface and
        intensifies on hover without moving any layout. */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-primary/20 blur-3xl transition-opacity duration-300 group-hover:bg-primary/30"
    />

    <div className="relative flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <IconPick className="size-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">
            <span className="text-primary">{'hl'}</span>
            <span className="text-text-1">{'-tools'}</span>
          </span>
        </div>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-primary uppercase">
          {'Mine more'}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-base leading-snug font-semibold text-text-1">
          {"1,000 USDC doesn't go far."}
        </p>
        <p className="text-xs leading-relaxed text-text-3">
          {
            'hl-tools chains throwaway wallets through the faucet and sweeps the proceeds back to you — mine as much testnet USDC as your strategy needs.'
          }
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {STATS.map(({ value, label, hero }) => (
          <div
            key={label}
            className={cn(
              'flex flex-col gap-0.5 rounded-md px-2 py-1.5 text-center',
              // The exchange rate is the whole pitch, so it gets the accent.
              hero ? 'bg-primary/15 ring-1 ring-primary/30' : 'bg-white/[0.04]'
            )}
          >
            <span
              className={cn(
                'text-sm font-semibold tabular-nums',
                hero ? 'text-primary' : 'text-text-1'
              )}
            >
              {value}
            </span>
            <span
              className={cn('text-[10px] leading-tight', hero ? 'text-primary/70' : 'text-text-4')}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
        <span className="text-[11px] leading-tight text-text-4">
          {'From the same dev as AshDex'}
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
          {'Open hl-tools'}
          <IconArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </div>
  </a>
)

export default HlToolsPromo
