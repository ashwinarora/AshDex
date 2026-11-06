import type { Hex } from 'viem'
import type { TreasuryTarget } from '@/utils/tradingAccount'
import type { KeyValueStorage } from './agentKey'

/** Where treasury mode is remembered across reloads. Holds public identifiers only. */
export const TREASURY_MODE_STORAGE_KEY = 'ashdexTreasuryMode'

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/

/** The remembered treasury, or `null` when none or malformed. */
export const loadPersistedTreasury = (storage: KeyValueStorage): TreasuryTarget | null => {
  const raw = storage.getItem(TREASURY_MODE_STORAGE_KEY)
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as { network?: unknown; treasury?: unknown }
    if (value.network !== 'mainnet' && value.network !== 'testnet') return null
    if (typeof value.treasury !== 'string' || !ADDRESS_RE.test(value.treasury)) return null
    return { network: value.network, address: value.treasury.toLowerCase() as Hex }
  } catch {
    return null
  }
}

export const savePersistedTreasury = (
  storage: KeyValueStorage,
  treasury: TreasuryTarget | null
): void => {
  if (!treasury) {
    storage.removeItem(TREASURY_MODE_STORAGE_KEY)
    return
  }
  storage.setItem(
    TREASURY_MODE_STORAGE_KEY,
    JSON.stringify({ network: treasury.network, treasury: treasury.address.toLowerCase() })
  )
}
