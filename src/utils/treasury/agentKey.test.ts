import { describe, it, expect, beforeEach } from 'vitest'
import { privateKeyToAccount } from 'viem/accounts'
import { zeroAddress, type Hex } from 'viem'
import {
  createTreasuryAgent,
  defaultAgentName,
  exportTreasuryAgentKey,
  importTreasuryAgent,
  loadTreasuryAgent,
  normalizeAgentName,
  parsePrivateKey,
  removeTreasuryAgent,
  selectAgentKey,
  setTreasuryAgentValidUntil,
  treasuryAgentStorageKey,
  type KeyValueStorage
} from './agentKey'

const KEY_A = ('0x' + '11'.repeat(32)) as Hex
const KEY_B = ('0x' + '22'.repeat(32)) as Hex
const ADDR_A = privateKeyToAccount(KEY_A).address
const TREASURY = '0xAbCdEf0123456789aBcDeF0123456789AbCdEf01' as Hex
const WALLET_SLOT = 'agentPrivateKey_0x1111111111111111111111111111111111111111'

const memoryStorage = (): KeyValueStorage & { data: Map<string, string> } => {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k)
  }
}

let storage: ReturnType<typeof memoryStorage>
beforeEach(() => {
  storage = memoryStorage()
  storage.setItem(WALLET_SLOT, KEY_B)
})

describe('treasuryAgentStorageKey', () => {
  it('is per network and lower-cases the treasury', () => {
    expect(treasuryAgentStorageKey('testnet', TREASURY)).toBe(
      'treasuryAgent_testnet_0xabcdef0123456789abcdef0123456789abcdef01'
    )
    expect(treasuryAgentStorageKey('mainnet', TREASURY)).not.toBe(
      treasuryAgentStorageKey('testnet', TREASURY)
    )
  })
})

describe('agent names', () => {
  it('defaults to "ashdex" plus the first 4 hex of the address', () => {
    expect(defaultAgentName('0xDBE6000000000000000000000000000000000000')).toBe('ashdex dbe6')
  })

  it('accepts 1-16 characters after trimming', () => {
    expect(normalizeAgentName('  ashdex dbe6 ')).toBe('ashdex dbe6')
    expect(normalizeAgentName('x'.repeat(16))).toBe('x'.repeat(16))
    expect(normalizeAgentName('x'.repeat(17))).toBeNull()
    expect(normalizeAgentName('   ')).toBeNull()
  })
})

describe('parsePrivateKey', () => {
  it('accepts 0x + 64 hex and lower-cases it', () => {
    expect(parsePrivateKey(' 0x' + 'AB'.repeat(32) + ' ')).toBe('0x' + 'ab'.repeat(32))
  })

  it('rejects other shapes and out-of-range keys', () => {
    expect(parsePrivateKey('11'.repeat(32))).toBeNull()
    expect(parsePrivateKey('0x' + '11'.repeat(31))).toBeNull()
    expect(parsePrivateKey('0x' + 'zz'.repeat(32))).toBeNull()
    expect(parsePrivateKey('0x' + '00'.repeat(32))).toBeNull()
    expect(parsePrivateKey('0x' + 'ff'.repeat(32))).toBeNull()
  })
})

describe('create / load / remove', () => {
  it('creates, stores and loads a record', () => {
    const record = createTreasuryAgent({
      storage,
      network: 'testnet',
      treasury: TREASURY,
      now: 1000,
      generateKey: () => KEY_A
    })
    expect(record).toEqual({
      privateKey: KEY_A,
      address: ADDR_A,
      name: defaultAgentName(ADDR_A),
      validUntil: null,
      createdAt: 1000
    })
    expect(loadTreasuryAgent(storage, 'testnet', TREASURY)).toEqual(record)
    expect(loadTreasuryAgent(storage, 'mainnet', TREASURY)).toBeNull()
  })

  it('finds the record whatever the treasury address casing', () => {
    createTreasuryAgent({
      storage,
      network: 'testnet',
      treasury: TREASURY,
      generateKey: () => KEY_A
    })
    const lower = TREASURY.toLowerCase() as Hex
    expect(loadTreasuryAgent(storage, 'testnet', lower)?.address).toBe(ADDR_A)
  })

  it('uses a custom name and rejects a bad one', () => {
    const record = createTreasuryAgent({
      storage,
      network: 'testnet',
      treasury: TREASURY,
      name: 'desk 1',
      generateKey: () => KEY_A
    })
    expect(record.name).toBe('desk 1')
    expect(() =>
      createTreasuryAgent({
        storage,
        network: 'testnet',
        treasury: TREASURY,
        name: 'x'.repeat(17),
        generateKey: () => KEY_B
      })
    ).toThrow(/1-16 characters/)
    // The failed create left the earlier record in place.
    expect(loadTreasuryAgent(storage, 'testnet', TREASURY)?.name).toBe('desk 1')
  })

  it('rejects an invalid treasury address', () => {
    expect(() =>
      createTreasuryAgent({ storage, network: 'testnet', treasury: '0x1234' as Hex })
    ).toThrow(/treasury/)
  })

  it('never touches the wallet agent slot', () => {
    createTreasuryAgent({
      storage,
      network: 'testnet',
      treasury: TREASURY,
      generateKey: () => KEY_A
    })
    removeTreasuryAgent(storage, 'testnet', TREASURY)
    expect(storage.getItem(WALLET_SLOT)).toBe(KEY_B)
    expect([...storage.data.keys()]).toEqual([WALLET_SLOT])
  })

  it('returns null for malformed entries', () => {
    const slot = treasuryAgentStorageKey('testnet', TREASURY)
    storage.setItem(slot, 'not json')
    expect(loadTreasuryAgent(storage, 'testnet', TREASURY)).toBeNull()
    storage.setItem(slot, JSON.stringify({ privateKey: KEY_A }))
    expect(loadTreasuryAgent(storage, 'testnet', TREASURY)).toBeNull()
    // Address that doesn't belong to the key.
    storage.setItem(
      slot,
      JSON.stringify({
        privateKey: KEY_A,
        address: privateKeyToAccount(KEY_B).address,
        name: 'x',
        validUntil: null,
        createdAt: 1
      })
    )
    expect(loadTreasuryAgent(storage, 'testnet', TREASURY)).toBeNull()
  })
})

describe('import / export', () => {
  it('round-trips a key and derives the address', () => {
    const created = createTreasuryAgent({
      storage,
      network: 'testnet',
      treasury: TREASURY,
      generateKey: () => KEY_A
    })
    const other = memoryStorage()
    const imported = importTreasuryAgent({
      storage: other,
      network: 'testnet',
      treasury: TREASURY,
      privateKey: exportTreasuryAgentKey(created),
      name: created.name,
      now: 5
    })
    expect(imported.address).toBe(ADDR_A)
    expect(imported.name).toBe(created.name)
    expect(loadTreasuryAgent(other, 'testnet', TREASURY)).toEqual(imported)
  })

  it('rejects an invalid key', () => {
    expect(() =>
      importTreasuryAgent({ storage, network: 'testnet', treasury: TREASURY, privateKey: '0x12' })
    ).toThrow(/64 hex/)
  })
})

describe('setTreasuryAgentValidUntil', () => {
  it('caches the expiry on the stored record', () => {
    createTreasuryAgent({
      storage,
      network: 'testnet',
      treasury: TREASURY,
      generateKey: () => KEY_A
    })
    expect(
      setTreasuryAgentValidUntil(storage, 'testnet', TREASURY, 1794258383189)?.validUntil
    ).toBe(1794258383189)
    expect(loadTreasuryAgent(storage, 'testnet', TREASURY)?.validUntil).toBe(1794258383189)
  })

  it('is a no-op without a stored agent', () => {
    expect(setTreasuryAgentValidUntil(storage, 'testnet', TREASURY, 1)).toBeNull()
  })
})

describe('selectAgentKey', () => {
  const WALLET = '0x1111111111111111111111111111111111111111' as Hex
  const treasury = { address: TREASURY, network: 'testnet' as const }
  const args = { walletAddress: WALLET, network: 'testnet' as const, walletSlotKey: WALLET_SLOT }

  it('uses the wallet slot in wallet mode', () => {
    expect(selectAgentKey({ storage, ...args, treasury: null })).toBe(KEY_B)
  })

  it('creates the wallet slot on first use, as before', () => {
    const empty = memoryStorage()
    expect(
      selectAgentKey({ storage: empty, ...args, treasury: null, generateKey: () => KEY_A })
    ).toBe(KEY_A)
    expect(empty.getItem(WALLET_SLOT)).toBe(KEY_A)
  })

  it('uses the treasury slot in treasury mode and leaves the wallet slot alone', () => {
    createTreasuryAgent({
      storage,
      network: 'testnet',
      treasury: TREASURY,
      generateKey: () => KEY_A
    })
    expect(selectAgentKey({ storage, ...args, treasury })).toBe(KEY_A)
    expect(storage.getItem(WALLET_SLOT)).toBe(KEY_B)
  })

  it('returns null in treasury mode without a stored treasury agent', () => {
    const empty = memoryStorage()
    expect(selectAgentKey({ storage: empty, ...args, treasury })).toBeNull()
    expect(empty.data.size).toBe(0)
  })

  it('falls back to the wallet slot for a treasury on the other network', () => {
    createTreasuryAgent({
      storage,
      network: 'mainnet',
      treasury: TREASURY,
      generateKey: () => KEY_A
    })
    expect(
      selectAgentKey({ storage, ...args, treasury: { address: TREASURY, network: 'mainnet' } })
    ).toBe(KEY_B)
  })

  it('returns undefined before a wallet is known', () => {
    expect(
      selectAgentKey({ storage, ...args, walletAddress: zeroAddress, treasury })
    ).toBeUndefined()
  })
})
