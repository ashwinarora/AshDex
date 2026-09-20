/**
 * Capture the HIP-4 outcome-market fixtures used by e2e/outcomes.spec.ts:
 *
 *     bun run e2e/fixtures/capture-outcomes.ts
 *
 * Kept separate from capture.ts so refreshing outcome data never rewrites the
 * perps/spot snapshots the older specs pin their expectations on. Same rule
 * as capture.ts: never hand-edit the JSON, re-capture instead.
 *
 * Files:
 *   rest.outcomeMeta.json                – live outcomes + questions (testnet)
 *   rest.outcomeTemplates.json           – template display text
 *   rest.l2Book.outcome.json             – book for the most-traded outcome side
 *   rest.candleSnapshot.outcome.json     – 1h candles for that side (may be [])
 *   rest.settledOutcome.json             – one settled outcome
 *   rest.spotClearinghouseState.outcomes.json – a real account holding outcome shares
 */
import * as hl from '@nktkas/hyperliquid'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = dirname(fileURLToPath(import.meta.url))
const httpTransport = new hl.HttpTransport({ isTestnet: true })
const info = new hl.InfoClient({ transport: httpTransport })

const write = (file: string, data: unknown) => {
  writeFileSync(join(OUT_DIR, file), JSON.stringify(data, null, 2))
  console.log(`  ${file} ok`)
}

console.log('Capturing outcome fixtures (testnet)...')
const meta = await info.outcomeMeta()
write('rest.outcomeMeta.json', meta)
write('rest.outcomeTemplates.json', await info.outcomeTemplates())

// Most-traded outcome side by 24h notional, so the book/candle fixtures have rows.
const [, ctxs] = await info.spotMetaAndAssetCtxs()
const top = ctxs
  .filter((c) => c.coin.startsWith('#'))
  .sort((a, b) => Number(b.dayNtlVlm) - Number(a.dayNtlVlm))[0]
if (!top) throw new Error('no outcome asset ctxs on testnet')
console.log(`  most traded outcome side: ${top.coin}`)
write('rest.l2Book.outcome.json', await info.l2Book({ coin: top.coin }))
const endTime = Date.now()
write(
  'rest.candleSnapshot.outcome.json',
  await info.candleSnapshot({
    coin: top.coin,
    interval: '1h',
    startTime: endTime - 7 * 86_400_000,
    endTime
  })
)

// A settled outcome: walk down from the lowest live id until settledOutcome answers.
const minLive = Math.min(...meta.outcomes.map((o) => o.outcome))
let settled: unknown = null
for (let id = minLive - 1; id > minLive - 2000 && settled === null; id--) {
  settled = await info.settledOutcome({ outcome: id })
}
if (settled === null) throw new Error('could not find a settled outcome below the live range')
write('rest.settledOutcome.json', settled)

// A real account holding shares of `top.coin` AND enough free USDC to place a
// $10+ order / split in the stubbed specs: scan counterparties of recent trades
// on the busiest outcome sides.
const busiest = ctxs
  .filter((c) => c.coin.startsWith('#'))
  .sort((a, b) => Number(b.dayNtlVlm) - Number(a.dayNtlVlm))
  .slice(0, 6)
const users = new Set<string>()
for (const c of busiest) {
  const trades = await info.recentTrades({ coin: c.coin })
  trades.forEach((t) => t.users.forEach((u) => users.add(u)))
}
let holder: string | null = null
for (const u of users) {
  const state = await info.spotClearinghouseState({ user: u as `0x${string}` })
  const usdc = state.balances.find((b) => b.coin === 'USDC')
  const free = usdc ? Number(usdc.total) - Number(usdc.hold) : 0
  const holds = state.balances.some((b) => b.coin.startsWith('+') && Number(b.total) > 0)
  if (holds && free >= 15) {
    write('rest.spotClearinghouseState.outcomes.json', state)
    holder = u
    break
  }
}
if (!holder)
  throw new Error('no recent trader holds outcome shares with free USDC; try again later')
console.log(`  holder: ${holder}`)
console.log('Done.')
