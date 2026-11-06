// A treasury agent is an API wallet whose private key lives only in this
// browser. A multisig treasury approves it in hl-tools; AshDex then signs L1
// actions (orders, cancels, leverage) for the treasury with it. Each treasury
// gets its own storage slot, separate from the wallet's own agent key
// (`agentPrivateKey_<wallet>`), which these helpers never read or write.
import { isAddress, zeroAddress, type Hex } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  resolveTradingAccount,
  type HyperliquidNetwork,
  type TreasuryTarget
} from '@/utils/tradingAccount'

export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type TreasuryAgentRecord = {
  privateKey: Hex
  address: Hex
  /** Agent name without the ` valid_until` suffix (hl-tools appends that). */
  name: string
  /**
   * Expiry in ms, cached from extraAgents once the approval is live. `null`
   * until then. extraAgents stays the source of truth.
   */
  validUntil: number | null
  createdAt: number
}

/** Longest agent name measured to be accepted so far. */
export const MAX_AGENT_NAME_LENGTH = 16

const STORAGE_PREFIX = 'treasuryAgent_'

export const treasuryAgentStorageKey = (network: HyperliquidNetwork, treasury: Hex): string =>
  `${STORAGE_PREFIX}${network}_${treasury.toLowerCase()}`

/** Default name: `ashdex <first 4 hex of the agent address>`, e.g. `ashdex dbe6`. */
export const defaultAgentName = (agentAddress: Hex): string =>
  `ashdex ${agentAddress.slice(2, 6).toLowerCase()}`

/** Trimmed name if it is usable, else `null`. */
export const normalizeAgentName = (name: string): string | null => {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length > MAX_AGENT_NAME_LENGTH) return null
  return trimmed
}

/** A `0x` + 64-hex private key that viem accepts, else `null`. */
export const parsePrivateKey = (input: string): Hex | null => {
  const trimmed = input.trim()
  if (!/^0x[0-9a-fA-F]{64}$/.test(trimmed)) return null
  try {
    privateKeyToAccount(trimmed as Hex)
  } catch {
    return null
  }
  return trimmed.toLowerCase() as Hex
}

const isRecord = (value: unknown): value is TreasuryAgentRecord => {
  if (!value || typeof value !== 'object') return false
  const r = value as Record<string, unknown>
  return (
    typeof r.privateKey === 'string' &&
    typeof r.address === 'string' &&
    typeof r.name === 'string' &&
    (r.validUntil === null || typeof r.validUntil === 'number') &&
    typeof r.createdAt === 'number'
  )
}

const buildRecord = (privateKey: Hex, name: string | undefined, now: number) => {
  const address = privateKeyToAccount(privateKey).address
  const agentName = normalizeAgentName(name ?? defaultAgentName(address))
  if (!agentName) throw new Error(`Agent name must be 1-${MAX_AGENT_NAME_LENGTH} characters`)
  return { privateKey, address, name: agentName, validUntil: null, createdAt: now }
}

const save = (
  storage: KeyValueStorage,
  network: HyperliquidNetwork,
  treasury: Hex,
  record: TreasuryAgentRecord
) => {
  storage.setItem(treasuryAgentStorageKey(network, treasury), JSON.stringify(record))
}

/**
 * The treasury's stored agent, or `null` when there is none or the entry is
 * malformed (wrong shape, bad key, or an address that doesn't match the key).
 */
export const loadTreasuryAgent = (
  storage: KeyValueStorage,
  network: HyperliquidNetwork,
  treasury: Hex
): TreasuryAgentRecord | null => {
  const raw = storage.getItem(treasuryAgentStorageKey(network, treasury))
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isRecord(parsed)) return null
  const key = parsePrivateKey(parsed.privateKey)
  if (!key) return null
  if (privateKeyToAccount(key).address.toLowerCase() !== parsed.address.toLowerCase()) return null
  return parsed
}

/** Generate a fresh agent key for the treasury, replacing any stored one. */
export const createTreasuryAgent = ({
  storage,
  network,
  treasury,
  name,
  now = Date.now(),
  generateKey = generatePrivateKey
}: {
  storage: KeyValueStorage
  network: HyperliquidNetwork
  treasury: Hex
  name?: string
  now?: number
  generateKey?: () => Hex
}): TreasuryAgentRecord => {
  if (!isAddress(treasury, { strict: false })) throw new Error('Invalid treasury address')
  const record = buildRecord(generateKey(), name, now)
  save(storage, network, treasury, record)
  return record
}

/**
 * Store an existing agent key for the treasury (e.g. moved from another
 * browser), replacing any stored one. Throws on an invalid key or name.
 */
export const importTreasuryAgent = ({
  storage,
  network,
  treasury,
  privateKey,
  name,
  now = Date.now()
}: {
  storage: KeyValueStorage
  network: HyperliquidNetwork
  treasury: Hex
  privateKey: string
  name?: string
  now?: number
}): TreasuryAgentRecord => {
  if (!isAddress(treasury, { strict: false })) throw new Error('Invalid treasury address')
  const key = parsePrivateKey(privateKey)
  if (!key) throw new Error('Private key must be 0x followed by 64 hex characters')
  const record = buildRecord(key, name, now)
  save(storage, network, treasury, record)
  return record
}

/** The key to copy into another browser's import field. */
export const exportTreasuryAgentKey = (record: TreasuryAgentRecord): Hex => record.privateKey

/** Cache the expiry read from extraAgents. No-op when there is no stored agent. */
export const setTreasuryAgentValidUntil = (
  storage: KeyValueStorage,
  network: HyperliquidNetwork,
  treasury: Hex,
  validUntil: number | null
): TreasuryAgentRecord | null => {
  const record = loadTreasuryAgent(storage, network, treasury)
  if (!record) return null
  const next = { ...record, validUntil }
  save(storage, network, treasury, next)
  return next
}

export const removeTreasuryAgent = (
  storage: KeyValueStorage,
  network: HyperliquidNetwork,
  treasury: Hex
): void => {
  storage.removeItem(treasuryAgentStorageKey(network, treasury))
}

/**
 * The agent key to sign L1 actions with. In treasury mode it is the treasury's
 * slot, or `null` when none is stored (no trading until one exists); the
 * wallet slot is not read or written. In wallet mode it is the wallet's slot
 * (`walletSlotKey`), created on first use as before. `undefined` means there
 * is no wallet yet, so the caller should leave the current agent as is.
 */
export const selectAgentKey = ({
  storage,
  walletAddress,
  treasury,
  network,
  walletSlotKey,
  generateKey = generatePrivateKey
}: {
  storage: KeyValueStorage
  walletAddress: Hex
  treasury: TreasuryTarget | null
  network: HyperliquidNetwork
  walletSlotKey: string
  generateKey?: () => Hex
}): Hex | null | undefined => {
  if (walletAddress === zeroAddress) return undefined
  const account = resolveTradingAccount({ wallet: walletAddress, treasury, network })
  if (account.mode === 'treasury' && account.treasury) {
    return (
      loadTreasuryAgent(storage, account.treasury.network, account.treasury.address)?.privateKey ??
      null
    )
  }
  const stored = storage.getItem(walletSlotKey)
  if (stored) return stored as Hex
  const fresh = generateKey()
  storage.setItem(walletSlotKey, fresh)
  return fresh
}
