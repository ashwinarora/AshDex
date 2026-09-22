'use client'
import { useConnection } from 'wagmi'
import { IconHistory } from '@tabler/icons-react'
import WalletNotConnected from '@/components/ConnectWalletModal/DisconnectedWalletState'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatTimestamp } from '@/utils/format'
import { useSettledOutcomes } from '@/hooks/useOutcomeMarket'
import { formatShares, formatUsd, venueLabel } from '@/components/Outcomes/outcomeFormat'

/** HL reports `price:79980` for native markets and just `template` for venue ones. */
const detailsLabel = (details: string): string => {
  if (details === 'template') return 'Resolved by deployer template'
  const m = details.match(/^price:(.+)$/)
  return m ? `Settlement price ${m[1]}` : details
}

const settledTo = (f: number, names: [string, string]) =>
  f === 1
    ? names[0]
    : f === 0
      ? names[1]
      : `${names[0]} ${(f * 100).toFixed(0)}% / ${names[1]} ${((1 - f) * 100).toFixed(0)}%`

/** Settled outcome markets the user traded, with how they resolved. */
const OutcomeHistory = ({ isRTL }: { isRTL: boolean }) => {
  const { address, isConnected } = useConnection()
  const { rows, isLoading, pendingIds } = useSettledOutcomes(address)

  if (!isConnected) return <WalletNotConnected />
  if (!isLoading && rows.length === 0) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center py-12 gap-2"
        data-testid="outcome-history-empty"
      >
        <IconHistory className="size-10 text-white" />
        <span className="text-white">No Settled Outcomes</span>
        <p className="text-white/70 text-center text-xs">
          {pendingIds.length > 0
            ? `${pendingIds.length} market${pendingIds.length > 1 ? 's' : ''} awaiting settlement`
            : 'Markets you traded will appear here once they settle'}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-x-auto" data-testid="outcome-history">
      <Table>
        <TableHeader>
          <TableRow className={cn(isRTL && 'flex-row-reverse')}>
            <TableHead className="text-xs">Market</TableHead>
            <TableHead className="text-xs">Settled to</TableHead>
            <TableHead className="text-xs">Details</TableHead>
            <TableHead className="text-xs text-right">Settled shares</TableHead>
            <TableHead className="text-xs text-right">Payout</TableHead>
            <TableHead className="text-xs text-right">Realized PnL</TableHead>
            <TableHead className="text-xs text-right">Fees</TableHead>
            <TableHead className="text-xs text-right">Settled at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.outcomeId} data-testid={`outcome-history-${r.outcomeId}`}>
              <TableCell className="text-xs max-w-xs">
                <span className="text-white">{r.title}</span>
                {r.outcomeLabel && <span className="text-text-3"> — {r.outcomeLabel}</span>}
                {r.venue && (
                  <span className="ml-1 text-[10px] text-primary">{venueLabel(r.venue)}</span>
                )}
              </TableCell>
              <TableCell className="text-xs">
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded',
                    r.settleFraction === 1
                      ? 'bg-green/20 text-green'
                      : r.settleFraction === 0
                        ? 'bg-red/20 text-red'
                        : 'bg-white/10 text-white'
                  )}
                >
                  {settledTo(r.settleFraction, r.sideNames)}
                </span>
              </TableCell>
              <TableCell className="text-xs text-text-3">{detailsLabel(r.details)}</TableCell>
              <TableCell className="text-xs text-right">
                {r.settledShares[0] > 0 && `${formatShares(r.settledShares[0])} ${r.sideNames[0]}`}
                {r.settledShares[0] > 0 && r.settledShares[1] > 0 && ' · '}
                {r.settledShares[1] > 0 && `${formatShares(r.settledShares[1])} ${r.sideNames[1]}`}
                {r.settledShares[0] === 0 && r.settledShares[1] === 0 && '--'}
              </TableCell>
              <TableCell className="text-xs text-right text-white">{formatUsd(r.payout)}</TableCell>
              <TableCell
                className={cn('text-xs text-right', r.realizedPnl >= 0 ? 'text-green' : 'text-red')}
              >
                {r.realizedPnl >= 0 ? '+' : '-'}
                {formatUsd(Math.abs(r.realizedPnl))}
              </TableCell>
              <TableCell className="text-xs text-right text-text-3">
                {formatUsd(r.fees, 4)}
              </TableCell>
              <TableCell className="text-xs text-right text-text-3">
                {r.settledAt ? formatTimestamp(r.settledAt) : '--'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isLoading && <p className="text-xs text-text-3 p-2">Loading settlements…</p>}
    </div>
  )
}

export default OutcomeHistory
