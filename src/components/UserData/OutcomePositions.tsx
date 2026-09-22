'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useConnection } from 'wagmi'
import { useShallow } from 'zustand/react/shallow'
import { IconChartBar } from '@tabler/icons-react'
import WalletNotConnected from '@/components/ConnectWalletModal/DisconnectedWalletState'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useUserFee } from '@/hooks/useUserFee'
import { useOutcomePositions } from '@/hooks/useOutcomeMarket'
import { placeOutcomeOrder } from '@/utils/outcomes/placeOutcomeOrder'
import { formatOutcomePrice, marketPriceWithSlippage } from '@/utils/outcomes/order'
import type { OutcomePosition } from '@/utils/outcomes/positions'
import {
  formatOutcomePx,
  formatShares,
  formatUsd,
  outcomeTradeHref,
  venueLabel
} from '@/components/Outcomes/outcomeFormat'

const pnlClass = (v: number | null) =>
  v === null ? 'text-white/70' : v >= 0 ? 'text-green' : 'text-red'

/** Outcome share holdings (from `+enc` spot balances) shown as positions. */
const OutcomePositions = ({ isRTL }: { isRTL: boolean }) => {
  const { isConnected } = useConnection()
  const [mounted, setMounted] = useState(false)
  const { positions, remnants, isReady } = useOutcomePositions()
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const { getAdjustedBuilderFee } = useUserFee()
  const { sdkL1ActionClient, pushNewOpenOrders } = useHyperliquidStore(
    useShallow((s) => ({
      sdkL1ActionClient: s.sdkL1ActionClient,
      pushNewOpenOrders: s.pushNewOpenOrders
    }))
  )
  const [closing, setClosing] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])

  const totals = useMemo(
    () => ({
      value: positions.reduce((s, p) => s + (p.value ?? 0), 0),
      pnl: positions.reduce((s, p) => s + (p.pnl ?? 0), 0)
    }),
    [positions]
  )

  const marketClose = async (p: OutcomePosition) => {
    if (!isAgentApproved || currentFeeApproval <= 0) {
      openAgentModal()
      return
    }
    const available = Math.floor(p.size - p.hold)
    if (p.markPx === null || available <= 0) return
    setClosing(p.coin)
    try {
      await placeOutcomeOrder({
        sdkL1ActionClient,
        assetId: p.side.assetId,
        coin: p.coin,
        sideLabel: p.side.name,
        isBuy: false,
        legs: [
          {
            price: formatOutcomePrice(marketPriceWithSlippage(p.markPx, false, 8)),
            size: String(available),
            tif: 'Ioc'
          }
        ],
        adjustedBuilderFee: getAdjustedBuilderFee(true),
        pushNewOpenOrders
      })
    } finally {
      setClosing(null)
    }
  }

  if (!mounted) return <div className="w-full h-full bg-secondary" />
  if (!isConnected) return <WalletNotConnected />
  if (isReady && positions.length === 0 && remnants.length === 0) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center py-12 gap-2"
        data-testid="outcome-positions-empty"
      >
        <IconChartBar className="size-10 text-white" />
        <span className="text-white">No Outcome Positions</span>
        <p className="text-white/70 text-center text-xs">Buy Yes or No shares to see them here</p>
      </div>
    )
  }

  return (
    <div
      className="w-full h-full flex flex-col gap-2 overflow-x-auto"
      data-testid="outcome-positions"
    >
      <Table>
        <TableHeader>
          <TableRow className={cn(isRTL && 'flex-row-reverse')}>
            <TableHead className="text-xs">Market</TableHead>
            <TableHead className="text-xs">Side</TableHead>
            <TableHead className="text-xs text-right">Size</TableHead>
            <TableHead className="text-xs text-right">Avg Price</TableHead>
            <TableHead className="text-xs text-right">Mark</TableHead>
            <TableHead className="text-xs text-right">Value</TableHead>
            <TableHead className="text-xs text-right">PnL (ROE)</TableHead>
            <TableHead className="text-xs text-right">Payout if wins</TableHead>
            <TableHead className="text-xs text-right">Max loss</TableHead>
            <TableHead className="text-xs text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((p) => (
            <TableRow key={p.coin} data-testid={`outcome-position-${p.encoding}`}>
              <TableCell className="text-xs max-w-xs">
                <Link
                  href={outcomeTradeHref(p.outcome.outcomeId, p.side.side)}
                  className="hover:text-primary"
                >
                  <span className="text-white">{p.outcome.title}</span>
                  {p.outcome.outcomeLabel && (
                    <span className="text-text-3"> — {p.outcome.outcomeLabel}</span>
                  )}
                </Link>
                {p.outcome.venue && (
                  <span className="ml-1 text-[10px] text-primary">
                    {venueLabel(p.outcome.venue)}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-xs">
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-xs',
                    p.side.side === 0 ? 'bg-green/20 text-green' : 'bg-red/20 text-red'
                  )}
                >
                  {p.side.name}
                </span>
              </TableCell>
              <TableCell className="text-xs text-right text-white">
                {formatShares(p.size)}
                {p.hold > 0 && (
                  <span className="text-text-3"> ({formatShares(p.hold)} on hold)</span>
                )}
              </TableCell>
              <TableCell className="text-xs text-right">{formatOutcomePx(p.avgPx)}</TableCell>
              <TableCell className="text-xs text-right">{formatOutcomePx(p.markPx)}</TableCell>
              <TableCell className="text-xs text-right text-white">{formatUsd(p.value)}</TableCell>
              <TableCell className={cn('text-xs text-right', pnlClass(p.pnl))}>
                {p.pnl === null ? '--' : `${p.pnl >= 0 ? '+' : '-'}${formatUsd(Math.abs(p.pnl))}`}
                {p.pnlPct !== null && (
                  <span className="text-[10px]"> ({p.pnlPct.toFixed(1)}%)</span>
                )}
              </TableCell>
              <TableCell className="text-xs text-right text-green">
                {formatUsd(p.payoutIfWins)}
              </TableCell>
              <TableCell className="text-xs text-right text-red">{formatUsd(p.maxLoss)}</TableCell>
              <TableCell className="text-xs text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button asChild variant="outline" size="sm" className="h-6 text-[11px] px-2">
                    <Link href={outcomeTradeHref(p.outcome.outcomeId, p.side.side)}>Trade</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[11px] px-2"
                    disabled={closing === p.coin || p.markPx === null || p.size - p.hold < 1}
                    onClick={() => marketClose(p)}
                    data-testid={`outcome-position-close-${p.encoding}`}
                  >
                    {closing === p.coin ? 'Closing…' : 'Market Close'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {remnants.map((r) => (
            <TableRow key={r.coin} className="opacity-70">
              <TableCell className="text-xs" colSpan={2}>
                {r.coin} <span className="text-text-3">(settled / unknown market)</span>
              </TableCell>
              <TableCell className="text-xs text-right">{formatShares(r.total)}</TableCell>
              <TableCell colSpan={7} className="text-xs text-text-3">
                Awaiting settlement sweep
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {positions.length > 0 && (
        <div className="flex items-center justify-end gap-4 px-2 text-xs text-text-2">
          <span>Total value {formatUsd(totals.value)}</span>
          <span className={pnlClass(totals.pnl)}>
            Total PnL {totals.pnl >= 0 ? '+' : '-'}
            {formatUsd(Math.abs(totals.pnl))}
          </span>
        </div>
      )}
    </div>
  )
}

export default OutcomePositions
