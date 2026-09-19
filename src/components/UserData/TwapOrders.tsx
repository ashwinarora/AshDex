'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { useShallow } from 'zustand/react/shallow'
import { toast } from 'sonner'
import type { TwapHistoryResponse, UserTwapSliceFillsResponse } from '@nktkas/hyperliquid/api/info'
import type { TwapStatesWsEvent } from '@nktkas/hyperliquid'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { IconNotebook } from '@tabler/icons-react'
import WalletNotConnected from '@/components/ConnectWalletModal/DisconnectedWalletState'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useAgentApproval } from '@/context/EstablishConnection'
import { formatTimestamp } from '@/utils/format'
import { resolveAssetIndex } from '@/utils/resolveAssetIndex'
import { toastSdkError } from '@/lib/toastSdkError'
import { useSpotMeta } from '@/hooks/useSpotMeta'

/**
 * BUG-11: TWAP tables show timestamps in the user's browser locale to match
 * Hyperliquid's own UI, while the shared `formatTimestamp` (used across
 * ledger, trade history, deposits, withdrawals) stays on UTC. Scoped to this
 * file to avoid a cross-cutting regression pass.
 */
const formatLocaleTimestamp = (ms: number): string => {
  if (!Number.isFinite(ms)) return formatTimestamp(ms)
  return new Date(ms).toLocaleString()
}

type TwapSubTab = 'active' | 'history' | 'fills'

type TwapStateRow = TwapStatesWsEvent['states'][number]

const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(h)}:${p(m)}:${p(s)}`
}

const statusLabel: Record<string, string> = {
  finished: 'Finished',
  activated: 'Activated',
  terminated: 'Terminated',
  waitingForTrigger: 'Waiting for Trigger',
  stopped: 'Stopped',
  error: 'Error'
}

type SpotUniverseEntry = { name: string; tokens: readonly number[] }
type SpotTokenEntry = { name: string }
type SpotMetaLite = {
  universe: readonly SpotUniverseEntry[]
  tokens: readonly SpotTokenEntry[]
}

/**
 * Render a Hyperliquid `state.coin` (as returned by twapStates / twapHistory)
 * as a human-readable pair name. Perp coins pass through unchanged (`"BTC"`).
 * Canonical spot pairs already look like `"PURR/USDC"` and pass through too.
 * Non-canonical spot pairs come in as raw handles (`"@1035"`); we resolve
 * base + quote via `spotMeta.tokens` and produce `"HYPE/USDC"`. See BUG-17.
 */
const formatSpotPairName = (coin: string, spotMeta: SpotMetaLite | undefined): string => {
  if (!spotMeta) return coin
  const universeEntry = spotMeta.universe.find((u) => u.name === coin)
  if (!universeEntry) return coin // perp, or spot meta not loaded → keep raw
  if (coin.includes('/')) return coin // canonical pair name, already displayable
  const base = spotMeta.tokens[universeEntry.tokens[0]]?.name
  const quote = spotMeta.tokens[universeEntry.tokens[1]]?.name
  if (base && quote) return `${base}/${quote}`
  return coin
}

/**
 * True when the given coin string maps to a spot-universe entry. Used to pick
 * the correct branch in `resolveAssetIndex` for terminate (BUG-21).
 */
const isSpotCoin = (coin: string, spotMeta: SpotMetaLite | undefined): boolean =>
  !!spotMeta && !!spotMeta.universe.find((u) => u.name === coin)

const TwapOrders = ({ isRTL }: { isRTL: boolean }) => {
  const { isConnected, address } = useConnection()
  const [subTab, setSubTab] = useState<TwapSubTab>('active')
  const [history, setHistory] = useState<TwapHistoryResponse>([])
  const [fills, setFills] = useState<UserTwapSliceFillsResponse>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [fillsLoading, setFillsLoading] = useState(false)
  const [nowTick, setNowTick] = useState(() => Date.now())

  const { twapStates, sdkL1ActionClient, sdkInfoClient, perpsMeta, agentWallet } =
    useHyperliquidStore(
      useShallow((state) => ({
        twapStates: state.twapStates,
        sdkL1ActionClient: state.sdkL1ActionClient,
        sdkInfoClient: state.sdkInfoClient,
        perpsMeta: state.perpsMeta,
        agentWallet: state.agentWallet
      }))
    )
  const { data: spotMeta } = useSpotMeta()
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()

  useEffect(() => {
    // Only run the wall-clock ticker while the Active sub-tab is showing —
    // idle re-renders on hidden panels would waste render budget.
    if (subTab !== 'active') return
    const id = setInterval(() => setNowTick(Date.now()), 1000)
    return () => clearInterval(id)
  }, [subTab])

  useEffect(() => {
    if (subTab !== 'history') return
    if (!sdkInfoClient || !address) return
    let cancelled = false
    setHistoryLoading(true)
    sdkInfoClient
      .twapHistory({ user: address })
      .then((data) => {
        if (!cancelled) setHistory(data)
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setHistoryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [subTab, sdkInfoClient, address])

  useEffect(() => {
    if (subTab !== 'fills') return
    if (!sdkInfoClient || !address) return
    let cancelled = false
    setFillsLoading(true)
    sdkInfoClient
      .userTwapSliceFills({ user: address })
      .then((data) => {
        if (!cancelled) setFills(data)
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setFillsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [subTab, sdkInfoClient, address])

  const handleTerminate = useCallback(
    (twapId: number, rawCoin: string) => {
      const run = async () => {
        if (!isAgentApproved || currentFeeApproval <= 0) {
          openAgentModal()
          return
        }
        if (!sdkL1ActionClient) return
        const toastId = toast.loading('Terminating TWAP…')
        try {
          // BUG-21 fix: previously we tried the spot resolver first and, on
          // miss, fell back to the perps resolver — which could match a
          // same-named perp (HYPE and PURR both exist as perps on testnet)
          // and send `twapCancel` to the wrong asset index. Now we key the
          // resolver on the actual universe the row belongs to.
          const isSpotRow = isSpotCoin(rawCoin, spotMeta)
          const assetIndex = resolveAssetIndex(rawCoin, {
            isSpot: isSpotRow,
            perpsUniverse: perpsMeta?.universe,
            spotUniverse: spotMeta?.universe
          })
          if (assetIndex === null) {
            toast.error('Could not resolve asset index', { id: toastId })
            return
          }
          await sdkL1ActionClient.twapCancel({ a: assetIndex, t: twapId })
          toast.success('TWAP terminated', { id: toastId })
        } catch (err) {
          toastSdkError(err, 'Error terminating TWAP', { id: toastId })
        }
      }
      run()
    },
    [isAgentApproved, currentFeeApproval, openAgentModal, sdkL1ActionClient, perpsMeta, spotMeta]
  )

  const activeRows = useMemo(() => {
    return twapStates.map((tuple) => {
      const [twapId, state] = tuple as [number, TwapStateRow[1]]
      const elapsedMs = Math.max(0, nowTick - state.timestamp)
      const elapsedSec = Math.floor(elapsedMs / 1000)
      const totalSec = state.minutes * 60
      const runtime =
        state.trigger && Number(state.executedSz) === 0
          ? 'Untriggered'
          : `${formatDuration(elapsedSec)} / ${formatDuration(totalSec)}`
      // BUG-17 fix: twapStates returns the coin as it appears in Hyperliquid's
      // universe — perps as "BTC", canonical spot as "PURR/USDC", non-canonical
      // spot as "@1035". `formatSpotPairName` normalizes those to display
      // strings ("PURR/USDC", "HYPE/USDC"). Previous implementation used
      // `spotKeyToName.get(state.coin)`, which returns only the base ("PURR",
      // "HYPE") and displayed rows as `PURR` instead of `PURR/USDC`.
      const displayCoin = formatSpotPairName(state.coin, spotMeta)
      return {
        twapId,
        coin: displayCoin,
        rawCoin: state.coin,
        sz: state.sz,
        executedSz: state.executedSz,
        executedNtl: state.executedNtl,
        runtime,
        trigger: state.trigger?.px ?? null,
        stopPx: state.stopPx,
        reduceOnly: state.reduceOnly,
        timestamp: state.timestamp,
        side: state.side
      }
    })
  }, [twapStates, nowTick, spotMeta])

  if (!isConnected) return <WalletNotConnected />

  return (
    <div className={cn('flex flex-col gap-2 w-full h-full', isRTL && 'items-end')}>
      <ToggleGroup
        type="single"
        value={subTab}
        onValueChange={(v) => {
          if (v === '') return
          setSubTab(v as TwapSubTab)
        }}
        className="w-fit"
      >
        <ToggleGroupItem
          value="active"
          className="!px-3 !text-xs data-[state=on]:bg-transparent data-[state=on]:text-primary"
        >
          Active {activeRows.length > 0 && `(${activeRows.length})`}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="history"
          className="!px-3 !text-xs data-[state=on]:bg-transparent data-[state=on]:text-primary"
        >
          History
        </ToggleGroupItem>
        <ToggleGroupItem
          value="fills"
          className="!px-3 !text-xs data-[state=on]:bg-transparent data-[state=on]:text-primary"
        >
          Fill History
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="horizontal" />

      {subTab === 'active' && (
        <ActiveTable
          rows={activeRows}
          // BUG-15: the click handler at :143 also requires `currentFeeApproval > 0`,
          // so the button-label predicate must include it too — otherwise the row
          // reads "Terminate" but clicking silently reopens the approval modal.
          isTradingEnabled={!!agentWallet && isAgentApproved && currentFeeApproval > 0}
          onTerminate={handleTerminate}
          onEnable={openAgentModal}
          isRTL={isRTL}
        />
      )}
      {subTab === 'history' && (
        <HistoryTable rows={history} loading={historyLoading} spotMeta={spotMeta} isRTL={isRTL} />
      )}
      {subTab === 'fills' && <FillsTable rows={fills} loading={fillsLoading} isRTL={isRTL} />}
    </div>
  )
}

const EmptyState = ({ label }: { label: string }) => (
  <div className="w-full h-full flex flex-col items-center py-12 justify-center gap-2">
    <IconNotebook className="size-10 text-white" />
    <span className="text-white">{label}</span>
  </div>
)

type ActiveRow = {
  twapId: number
  coin: string
  rawCoin: string
  sz: string
  executedSz: string
  executedNtl: string
  runtime: string
  trigger: string | null
  stopPx: string | null
  reduceOnly: boolean
  timestamp: number
  side: 'A' | 'B'
}

const ActiveTable = ({
  rows,
  isTradingEnabled,
  onTerminate,
  onEnable,
  isRTL
}: {
  rows: ActiveRow[]
  isTradingEnabled: boolean
  onTerminate: (twapId: number, rawCoin: string) => void
  onEnable: () => void
  isRTL: boolean
}) => {
  if (rows.length === 0) return <EmptyState label="No TWAPs Yet" />
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-white/70">
            <Th>Market</Th>
            <Th>Size</Th>
            <Th>Executed Size</Th>
            <Th>Average Price</Th>
            <Th>Running Time / Total</Th>
            <Th>Trigger Price</Th>
            <Th>Max/Min Price</Th>
            <Th>Reduce Only</Th>
            <Th>Creation Time</Th>
            <Th align="right">Terminate</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const executed = Number(row.executedSz)
            const notional = Number(row.executedNtl)
            const avgPrice = executed > 0 && notional > 0 ? notional / executed : null
            return (
              <tr key={row.twapId} className="text-white border-t border-white/10">
                <Td>{row.coin}</Td>
                <Td>{row.sz}</Td>
                <Td>{row.executedSz}</Td>
                <Td>{avgPrice !== null ? avgPrice.toFixed(2) : '--'}</Td>
                <Td>{row.runtime}</Td>
                <Td>{row.trigger ?? '--'}</Td>
                <Td>{row.stopPx ?? '--'}</Td>
                <Td>{row.reduceOnly ? 'Yes' : 'No'}</Td>
                <Td>{formatLocaleTimestamp(row.timestamp)}</Td>
                <Td align="right">
                  {!isTradingEnabled ? (
                    <Button
                      onClick={onEnable}
                      variant="link"
                      className={cn(
                        'p-0 h-fit text-xs w-full flex items-center gap-1',
                        isRTL ? 'justify-start' : 'justify-end'
                      )}
                    >
                      Enable Trading
                    </Button>
                  ) : (
                    <Button
                      // BUG-21: pass the raw universe key (state.coin) — the
                      // display coin has been humanised for the Market column
                      // and won't resolve back to an asset index.
                      onClick={() => onTerminate(row.twapId, row.rawCoin)}
                      variant="link"
                      className={cn(
                        'p-0 h-fit text-xs w-full flex items-center gap-1',
                        isRTL ? 'justify-start' : 'justify-end'
                      )}
                      data-testid={`twap-terminate-${row.twapId}`}
                    >
                      Terminate
                    </Button>
                  )}
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const HistoryTable = ({
  rows,
  loading,
  spotMeta
}: {
  rows: TwapHistoryResponse
  loading: boolean
  spotMeta: SpotMetaLite | undefined
  isRTL: boolean
}) => {
  if (loading && rows.length === 0) return <EmptyState label="Loading TWAP history…" />
  if (rows.length === 0) return <EmptyState label="No TWAP History Yet" />
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-white/70">
            <Th>Time</Th>
            <Th>Market</Th>
            <Th>Total Size</Th>
            <Th>Executed Size</Th>
            <Th>Average Price</Th>
            <Th>Total Runtime</Th>
            <Th>Trigger Price</Th>
            <Th>Max/Min Price</Th>
            <Th>Reduce Only</Th>
            <Th>Randomize</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const s = row.state
            const rawStatus = row.status.status
            const executed = Number(s.executedSz)
            const notional = Number(s.executedNtl)
            const avgPrice = executed > 0 && notional > 0 ? notional / executed : null
            // BUG-17: display the full pair name for spot rows.
            const displayCoin = formatSpotPairName(s.coin, spotMeta)
            // BUG-18: for terminal rows (Terminated/Stopped/Finished/Error) the
            // interesting quantity is how long the TWAP actually ran, not the
            // scheduled duration. `row.time` is server unix-seconds of the
            // status transition; `s.timestamp` is unix-ms of activation.
            // Activation rows keep the scheduled runtime.
            const scheduledSec = s.minutes * 60
            const actualSec =
              rawStatus === 'activated'
                ? scheduledSec
                : Math.min(scheduledSec, Math.max(0, row.time - Math.floor(s.timestamp / 1000)))
            return (
              <tr
                key={`${row.time}-${row.twapId ?? i}`}
                className="text-white border-t border-white/10"
              >
                <Td>{formatLocaleTimestamp(row.time * 1000)}</Td>
                <Td>{displayCoin}</Td>
                <Td>{s.sz}</Td>
                <Td>{s.executedSz}</Td>
                <Td>{avgPrice !== null ? avgPrice.toFixed(2) : '--'}</Td>
                <Td>{formatDuration(actualSec)}</Td>
                <Td>{s.trigger?.px ?? '--'}</Td>
                <Td>{s.stopPx ?? '--'}</Td>
                <Td>{s.reduceOnly ? 'Yes' : 'No'}</Td>
                <Td>{s.randomize ? 'Yes' : 'No'}</Td>
                <Td>{statusLabel[rawStatus] ?? rawStatus}</Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const FillsTable = ({
  rows,
  loading
}: {
  rows: UserTwapSliceFillsResponse
  loading: boolean
  isRTL: boolean
}) => {
  if (loading && rows.length === 0) return <EmptyState label="Loading fill history…" />
  if (rows.length === 0) return <EmptyState label="No TWAP Fills Yet" />
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-white/70">
            <Th>Time</Th>
            <Th>Market</Th>
            <Th>Direction</Th>
            <Th>Price</Th>
            <Th>Size</Th>
            <Th>Trade Value</Th>
            <Th>Fee</Th>
            <Th>Closed PNL</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const f = row.fill
            const tradeValue = Number(f.px) * Number(f.sz)
            return (
              <tr key={`${f.tid}-${i}`} className="text-white border-t border-white/10">
                <Td>{formatLocaleTimestamp(f.time)}</Td>
                <Td>{f.coin}</Td>
                <Td>{f.dir}</Td>
                <Td>{f.px}</Td>
                <Td>{f.sz}</Td>
                <Td>{tradeValue.toFixed(2)}</Td>
                <Td>
                  {f.fee}
                  {f.feeToken ? ` ${f.feeToken}` : ''}
                </Td>
                <Td>{f.closedPnl}</Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const Th = ({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) => (
  <th
    className={cn(
      'px-2 py-1 font-normal whitespace-nowrap',
      align === 'right' ? 'text-right' : 'text-left'
    )}
  >
    {children}
  </th>
)

const Td = ({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) => (
  <td className={cn('px-2 py-1 whitespace-nowrap', align === 'right' ? 'text-right' : 'text-left')}>
    {children}
  </td>
)

export default TwapOrders
