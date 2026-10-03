// Hyperliquid's testnet faucet ("drip") is a plain unsigned /info request —
// `{ type: 'claimDrip', user }` — not an /exchange action, so it needs no
// wallet signature and can't go through the SDK's InfoClient (which has no
// schema for it). The endpoint answers 200 in every case: a JSON string body
// is the failure reason, an empty/null body means the drip went out.
import { HYPERLIQUID_API_TESTNET } from './constants'

/** What the faucet hands out, per Hyperliquid's /drip page. */
export const FAUCET_AMOUNT_USDC = 1000

export type DripFailureReason = 'alreadyClaimed' | 'noMainnetAccount' | 'unknown'

export type DripResult = { ok: true } | { ok: false; reason: DripFailureReason; message: string }

/**
 * Turn a raw /info `claimDrip` body into a result.
 *
 * The two reasons worth naming are the ones a user can act on:
 * the drip is once per address forever, and it only unlocks for addresses
 * that already exist on mainnet. Anything else passes through verbatim so a
 * new server-side message isn't swallowed.
 */
export const classifyDripResponse = (body: unknown): DripResult => {
  const message = typeof body === 'string' ? body.trim() : ''
  if (!message) return { ok: true }

  if (/already claimed/i.test(message)) {
    return {
      ok: false,
      reason: 'alreadyClaimed',
      message: 'This address has already claimed the faucet. The drip is one-time per address.'
    }
  }

  if (/does not exist on mainnet/i.test(message)) {
    return {
      ok: false,
      reason: 'noMainnetAccount',
      message:
        'This address has no Hyperliquid mainnet account. Deposit on mainnet with the same address first, then claim again.'
    }
  }

  return { ok: false, reason: 'unknown', message }
}

/**
 * Ask the testnet faucet to drip to `address`.
 *
 * Always hits the testnet host: there is no mainnet counterpart, and the
 * button that calls this only renders on the testnet deployment.
 */
export const claimTestnetDrip = async (
  address: string,
  init?: { signal?: AbortSignal }
): Promise<DripResult> => {
  const res = await fetch(`${HYPERLIQUID_API_TESTNET}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'claimDrip', user: address }),
    signal: init?.signal
  })

  const raw = (await res.text()).trim()

  if (!res.ok) {
    return {
      ok: false,
      reason: 'unknown',
      message: raw || `Faucet request failed (HTTP ${res.status}).`
    }
  }

  // Body is a bare JSON value: `""`/`null` on success, `"<reason>"` on refusal.
  let parsed: unknown = raw
  try {
    parsed = raw ? JSON.parse(raw) : ''
  } catch {
    // Not JSON — treat the text as the message rather than losing it.
  }

  return classifyDripResponse(parsed)
}
