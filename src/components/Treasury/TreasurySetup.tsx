'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useConnection } from 'wagmi'
import { useShallow } from 'zustand/react/shallow'
import type { Hex } from 'viem'
import { toast } from 'sonner'
import { IconExternalLink } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useWalletModal } from '@/context/WalletModalContext'
import {
  HLTOOLS_APP_URL,
  HYPERLIQUID_NETWORK,
  isTestnet,
  MAINNET_APP_URL,
  TESTNET_APP_URL
} from '@/utils/constants'
import { truncateAddress } from '@/utils/utils'
import type { HyperliquidNetwork } from '@/utils/tradingAccount'
import {
  createTreasuryAgent,
  importTreasuryAgent,
  loadTreasuryAgent,
  setTreasuryAgentValidUntil,
  type TreasuryAgentRecord
} from '@/utils/treasury/agentKey'
import { treasuryAgentStatus } from '@/utils/treasury/agentStatus'
import {
  AGENT_DAYS_OPTIONS,
  buildApproveAgentProposeUrl,
  buildRemoveAgentProposeUrl,
  DEFAULT_AGENT_DAYS,
  type AgentDays
} from '@/utils/treasury/proposeLink'
import {
  isHexAddress,
  parseTreasuryRoute,
  siblingTreasuryUrl,
  treasuryPageHref
} from '@/utils/treasury/route'
import ImportKeyForm from './ImportKeyForm'
import ExportKey from './ExportKey'

// While waiting for the co-signers, re-read extraAgents this often (and on focus).
const AGENTS_REFETCH_MS = 30_000

const Card = ({ children, testId }: { children: ReactNode; testId?: string }) => (
  <section className="bg-secondary rounded-md p-4 flex flex-col gap-3" data-testid={testId}>
    {children}
  </section>
)

const formatDate = (ms: number) =>
  new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

/** `/treasury`: pick a treasury, check it is a multisig, then key → approval → ready. */
const TreasurySetup = () => {
  const searchParams = useSearchParams()
  const route = useMemo(() => parseTreasuryRoute(searchParams, HYPERLIQUID_NETWORK), [searchParams])
  const siblingUrl =
    route.kind === 'otherNetwork'
      ? siblingTreasuryUrl(isTestnet ? MAINNET_APP_URL : TESTNET_APP_URL, searchParams.toString())
      : null

  useEffect(() => {
    if (siblingUrl) window.location.replace(siblingUrl)
  }, [siblingUrl])

  return (
    <>
      <h1 className="text-2xl font-semibold text-white">{'Trade for a treasury'}</h1>
      {route.kind === 'invalid' && (
        <Card testId="treasury-invalid">
          <p>{route.reason}</p>
        </Card>
      )}
      {route.kind === 'otherNetwork' && (
        <Card testId="treasury-other-network">
          <p>
            {siblingUrl
              ? `This link is for ${route.network}. Opening the ${route.network} AshDex…`
              : `This link is for ${route.network}, but this AshDex runs on ${HYPERLIQUID_NETWORK}.`}
          </p>
        </Card>
      )}
      {route.kind === 'pick' && <PickTreasury network={route.network} />}
      {route.kind === 'treasury' && (
        <TreasuryPanel
          key={route.treasury}
          network={route.network}
          treasury={route.treasury}
          linkAgent={route.agent}
        />
      )}
    </>
  )
}

const PickTreasury = ({ network }: { network: HyperliquidNetwork }) => {
  const router = useRouter()
  const [value, setValue] = useState('')
  const valid = isHexAddress(value.trim())
  return (
    <Card testId="treasury-pick">
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (valid) router.push(treasuryPageHref(network, value.trim().toLowerCase() as Hex))
        }}
      >
        <label htmlFor="treasury-address" className="text-sm">
          {'Treasury address (a Hyperliquid multi-sig account)'}
        </label>
        <input
          id="treasury-address"
          name="treasury-address"
          autoComplete="off"
          spellCheck={false}
          placeholder="0x…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 w-full rounded-md border bg-white/10 px-3 text-sm text-white font-mono"
          data-testid="treasury-address-input"
        />
        <Button type="submit" disabled={!valid} className="w-fit">
          {'Continue'}
        </Button>
      </form>
    </Card>
  )
}

const TreasuryPanel = ({
  network,
  treasury,
  linkAgent
}: {
  network: HyperliquidNetwork
  treasury: Hex
  linkAgent: Hex | null
}) => {
  const sdkInfoClient = useHyperliquidStore((s) => s.sdkInfoClient)
  const { address: wallet } = useConnection()

  const signers = useQuery({
    queryKey: ['multiSigSigners', treasury],
    queryFn: () => sdkInfoClient!.userToMultiSigSigners({ user: treasury }),
    enabled: !!sdkInfoClient
  })

  if (signers.isPending) return <p className="text-sm">{'Checking the treasury…'}</p>
  if (signers.isError) {
    return (
      <Card>
        <p>{'Could not read this account from Hyperliquid.'}</p>
        <Button size="sm" variant="outline" className="w-fit" onClick={() => signers.refetch()}>
          {'Try again'}
        </Button>
      </Card>
    )
  }
  if (!signers.data) {
    return (
      <Card testId="treasury-not-multisig">
        <p>{'This account is not a multi-sig treasury'}</p>
      </Card>
    )
  }

  const { authorizedUsers, threshold } = signers.data
  const isSigner = !!wallet && authorizedUsers.some((u) => u.toLowerCase() === wallet.toLowerCase())

  return (
    <>
      <Card testId="treasury-signers">
        <p className="text-white font-mono text-sm break-all">{treasury}</p>
        <p className="text-white" data-testid="treasury-threshold">
          {`${threshold} of ${authorizedUsers.length} signers`}
        </p>
        <ul className="flex flex-wrap gap-2 text-xs font-mono">
          {authorizedUsers.map((u) => (
            <li key={u} className="rounded bg-white/10 px-2 py-0.5" title={u}>
              {truncateAddress(u)}
            </li>
          ))}
        </ul>
        {wallet && (
          <p className="text-sm" data-testid="treasury-signer-status">
            {isSigner
              ? "You're a signer of this treasury."
              : "You're not a signer: a signer has to propose the approval."}
          </p>
        )}
      </Card>
      <KeyPanel network={network} treasury={treasury} linkAgent={linkAgent} />
    </>
  )
}

const KeyPanel = ({
  network,
  treasury,
  linkAgent
}: {
  network: HyperliquidNetwork
  treasury: Hex
  linkAgent: Hex | null
}) => {
  const router = useRouter()
  const { isConnected } = useConnection()
  const { openConnectWalletModal } = useWalletModal()
  const { sdkInfoClient, setTreasury, applyAgent } = useHyperliquidStore(
    useShallow((s) => ({
      sdkInfoClient: s.sdkInfoClient,
      setTreasury: s.setTreasury,
      applyAgent: s.applyAgent
    }))
  )
  // `undefined` until read from localStorage on the client.
  const [record, setRecord] = useState<TreasuryAgentRecord | null | undefined>(undefined)
  const [importing, setImporting] = useState(false)
  const [days, setDays] = useState<AgentDays>(DEFAULT_AGENT_DAYS)

  useEffect(() => {
    setRecord(loadTreasuryAgent(localStorage, network, treasury))
  }, [network, treasury])

  const agents = useQuery({
    queryKey: ['treasuryExtraAgents', treasury],
    queryFn: () => sdkInfoClient!.extraAgents({ user: treasury }),
    enabled: !!sdkInfoClient,
    refetchInterval: AGENTS_REFETCH_MS,
    refetchOnWindowFocus: true
  })

  const status = treasuryAgentStatus({
    keyAddress: record?.address,
    cachedValidUntil: record?.validUntil,
    extraAgents: agents.data ?? [],
    now: Date.now()
  })

  // Remember the expiry once seen live, so a later disappearance reads as "removed".
  const readyValidUntil = status.status === 'ready' ? status.validUntil : null
  useEffect(() => {
    if (readyValidUntil == null || record?.validUntil === readyValidUntil) return
    setRecord(setTreasuryAgentValidUntil(localStorage, network, treasury, readyValidUntil))
    applyAgent()
  }, [readyValidUntil, record?.validUntil, network, treasury, applyAgent])

  const saved = useCallback(
    (next: TreasuryAgentRecord) => {
      setRecord(next)
      setImporting(false)
      // Keep the store in step if this treasury is the one being traded.
      applyAgent()
      agents.refetch()
    },
    [applyAgent, agents]
  )

  const makeKey = () => {
    try {
      saved(createTreasuryAgent({ storage: localStorage, network, treasury }))
      toast.success('Trading key created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create a key')
    }
  }

  const importKey = (privateKey: string) => {
    try {
      saved(
        importTreasuryAgent({
          storage: localStorage,
          network,
          treasury,
          privateKey,
          name: record?.name
        })
      )
      toast.success('Key imported')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not import the key')
    }
  }

  const startTrading = () => {
    setTreasury({ address: treasury, network })
    router.push('/')
  }

  if (record === undefined || agents.isPending) {
    return <p className="text-sm">{'Checking this browser’s key…'}</p>
  }

  const mismatch =
    !!linkAgent && !!record && record.address.toLowerCase() !== linkAgent.toLowerCase()

  const keyButtons = (label: string) =>
    importing ? (
      <ImportKeyForm onImport={importKey} onCancel={() => setImporting(false)} />
    ) : (
      <div className="flex flex-wrap gap-2">
        <Button onClick={makeKey} data-testid="treasury-make-key">
          {label}
        </Button>
        <Button variant="outline" onClick={() => setImporting(true)} data-testid="treasury-import">
          {'Import a key'}
        </Button>
      </div>
    )

  const keyLine = record && (
    <p className="text-xs font-mono" data-testid="treasury-key">
      {`API wallet ${truncateAddress(record.address)} · "${record.name}"`}
    </p>
  )

  return (
    <>
      <Card testId={`treasury-state-${mismatch ? 'mismatch' : status.status}`}>
        {mismatch && (
          <>
            <p className="text-white">
              {`This browser holds a different key for this treasury: the link names ${truncateAddress(linkAgent!)}, this browser holds ${truncateAddress(record!.address)}.`}
            </p>
            {keyButtons('Make a new key')}
          </>
        )}

        {!mismatch && status.status === 'noKey' && (
          <>
            <p className="text-white">
              {linkAgent
                ? `The link names API wallet ${truncateAddress(linkAgent)}, but this browser has no key for this treasury. Import it, or make a new one.`
                : 'This browser has no trading key for this treasury yet.'}
            </p>
            {keyButtons('Make a trading key')}
          </>
        )}

        {!mismatch && status.status === 'pending' && (
          <PendingApproval
            network={network}
            treasury={treasury}
            record={record!}
            days={days}
            setDays={setDays}
            keyLine={keyLine}
          />
        )}

        {!mismatch && status.status === 'ready' && (
          <>
            <p className="text-white">
              {status.validUntil === null
                ? 'Ready: this browser can trade for the treasury (no set expiry).'
                : `Ready: this browser can trade for the treasury until ${formatDate(status.validUntil)}.`}
            </p>
            {keyLine}
            {isConnected ? (
              <Button className="w-fit" onClick={startTrading} data-testid="treasury-start">
                {'Trade for this treasury'}
              </Button>
            ) : (
              <Button className="w-fit" onClick={openConnectWalletModal}>
                {'Connect your wallet to start'}
              </Button>
            )}
          </>
        )}

        {!mismatch && status.status === 'expired' && (
          <>
            <p className="text-white">
              {`Your API wallet is past its expiry (${formatDate(status.validUntil)}). Hyperliquid may still accept it, so ask your co-signers to remove it in hl-tools, or approve a new key (it replaces this one, same name).`}
            </p>
            {keyLine}
            {record && (
              <RemoveAgentLink network={network} treasury={treasury} agentName={record.name} />
            )}
            {keyButtons('Make a new key')}
          </>
        )}

        {!mismatch && status.status === 'removed' && (
          <>
            <p className="text-white">
              {
                'Removed: this key was removed from the treasury or replaced by another key. Make a new key and ask your co-signers to approve it.'
              }
            </p>
            {keyLine}
            {keyButtons('Make a new key')}
          </>
        )}
      </Card>
      {/* Export only a key that can still trade: a removed or past-expiry key
          should not be spread to other browsers. */}
      {record && (status.status === 'pending' || status.status === 'ready') && (
        <ExportKey key={record.address} record={record} />
      )}
    </>
  )
}

const RemoveAgentLink = ({
  network,
  treasury,
  agentName
}: {
  network: HyperliquidNetwork
  treasury: Hex
  agentName: string
}) => {
  const href = buildRemoveAgentProposeUrl({
    hltoolsUrl: HLTOOLS_APP_URL,
    network,
    treasury,
    agentName
  })
  if (!href) return null
  return (
    <Button asChild variant="outline" className="w-fit">
      <a href={href} target="_blank" rel="noopener noreferrer" data-testid="treasury-remove">
        {'Remove in hl-tools'}
        <IconExternalLink className="size-3" />
      </a>
    </Button>
  )
}

const PendingApproval = ({
  network,
  treasury,
  record,
  days,
  setDays,
  keyLine
}: {
  network: HyperliquidNetwork
  treasury: Hex
  record: TreasuryAgentRecord
  days: AgentDays
  setDays: (d: AgentDays) => void
  keyLine: ReactNode
}) => {
  const href = buildApproveAgentProposeUrl({
    hltoolsUrl: HLTOOLS_APP_URL,
    network,
    treasury,
    agentAddress: record.address,
    agentName: record.name,
    agentDays: days
  })
  return (
    <>
      <p className="text-white">{'Waiting for the signers to approve it'}</p>
      {keyLine}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="treasury-days" className="text-sm">
          {'Valid for'}
        </label>
        <select
          id="treasury-days"
          name="treasury-days"
          value={days}
          onChange={(e) => setDays(Number(e.target.value) as AgentDays)}
          className="h-8 rounded-md border bg-white/10 px-2 text-sm text-white"
          data-testid="treasury-days"
        >
          {AGENT_DAYS_OPTIONS.map((d) => (
            <option key={d} value={d} className="bg-secondary">
              {d === 1 ? '1 day' : `${d} days`}
            </option>
          ))}
        </select>
        {href ? (
          <Button asChild>
            <a href={href} target="_blank" rel="noopener noreferrer" data-testid="treasury-ask">
              {'Ask your co-signers in hl-tools'}
              <IconExternalLink className="size-3" />
            </a>
          </Button>
        ) : (
          <p className="text-xs">
            {
              'hl-tools is not configured (NEXT_PUBLIC_HLTOOLS_URL), so propose the approval there by hand.'
            }
          </p>
        )}
      </div>
      <p className="text-xs">{'This page checks again every 30 seconds.'}</p>
    </>
  )
}

export default TreasurySetup
