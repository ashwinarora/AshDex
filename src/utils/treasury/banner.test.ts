import { describe, it, expect } from 'vitest'
import { formatTimeLeft, treasuryBannerView } from './banner'
import { loadPersistedTreasury, savePersistedTreasury, TREASURY_MODE_STORAGE_KEY } from './persist'

const NOW = 1_700_000_000_000
const HOUR = 3_600_000
const DAY = 24 * HOUR
const base = { treasuryLabel: '0x1464...233e', signers: { threshold: 2, total: 3 }, now: NOW }

describe('formatTimeLeft', () => {
  it('rounds down to the largest unit', () => {
    expect(formatTimeLeft(6 * DAY + 5 * HOUR)).toBe('6 days')
    expect(formatTimeLeft(DAY)).toBe('1 day')
    expect(formatTimeLeft(5 * HOUR + 1)).toBe('5 hours')
    expect(formatTimeLeft(12 * 60_000)).toBe('12 minutes')
    expect(formatTimeLeft(1)).toBe('1 minute')
  })
})

describe('treasuryBannerView', () => {
  it('shows the treasury, signers and time left', () => {
    expect(
      treasuryBannerView({
        ...base,
        status: { status: 'ready', validUntil: NOW + 6 * DAY + HOUR, name: 'ashdex dbe6' }
      })
    ).toEqual({
      tone: 'normal',
      text: 'Trading for 0x1464...233e (2 of 3) · your API wallet expires in 6 days'
    })
  })

  it('turns amber under a day', () => {
    const view = treasuryBannerView({
      ...base,
      status: { status: 'ready', validUntil: NOW + 5 * HOUR, name: 'x' }
    })
    expect(view.tone).toBe('warn')
    expect(view.text).toMatch(/expires in 5 hours$/)
  })

  it('handles no known expiry and unknown signers', () => {
    expect(
      treasuryBannerView({
        ...base,
        signers: null,
        status: { status: 'ready', validUntil: null, name: 'x' }
      }).text
    ).toBe('Trading for 0x1464...233e · your API wallet has no set expiry')
  })

  it('stops trading in red when expired, removed, pending or keyless', () => {
    for (const status of [
      { status: 'expired' as const, validUntil: NOW - 1 },
      { status: 'removed' as const },
      { status: 'pending' as const },
      { status: 'noKey' as const }
    ]) {
      const view = treasuryBannerView({ ...base, status })
      expect(view.tone).toBe('danger')
      expect(view.text).toMatch(/stopped/)
      expect(view.action).toBeTruthy()
    }
    expect(
      treasuryBannerView({ ...base, status: { status: 'expired', validUntil: NOW - 1 } }).text
    ).toMatch(/past its expiry/)
    expect(treasuryBannerView({ ...base, status: { status: 'removed' } }).text).toMatch(/Removed/)
  })

  it('is neutral while checking', () => {
    expect(treasuryBannerView({ ...base, status: { status: 'checking' } }).tone).toBe('normal')
  })
})

describe('persisted treasury mode', () => {
  const memory = () => {
    const data = new Map<string, string>()
    return {
      data,
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k)
    }
  }

  it('round-trips and clears', () => {
    const s = memory()
    const t = {
      network: 'testnet' as const,
      address: '0x146432842836EF7381187dfc5a279edaa668233e' as const
    }
    savePersistedTreasury(s, t)
    expect(loadPersistedTreasury(s)).toEqual({
      network: 'testnet',
      address: t.address.toLowerCase()
    })
    savePersistedTreasury(s, null)
    expect(s.data.has(TREASURY_MODE_STORAGE_KEY)).toBe(false)
  })

  it('ignores malformed values', () => {
    const s = memory()
    for (const raw of [
      'nope',
      '{}',
      '{"network":"devnet","treasury":"0x"}',
      '{"network":"testnet","treasury":"0x12"}'
    ]) {
      s.setItem(TREASURY_MODE_STORAGE_KEY, raw)
      expect(loadPersistedTreasury(s)).toBeNull()
    }
  })
})
