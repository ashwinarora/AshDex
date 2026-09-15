/**
 * One-shot capture of Hyperliquid testnet responses used to make e2e specs
 * hermetic. Run manually when snapshots need refreshing:
 *
 *     bun run e2e/fixtures/capture.ts
 *
 * Field names in the resulting JSON files come from real captured responses,
 * not from memory — this is the whole point. Do not hand-edit these files;
 * re-capture instead.
 */
import * as hl from '@nktkas/hyperliquid'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = dirname(fileURLToPath(import.meta.url))

// The zero address is fine for meta/spotMeta/l2Book — those don't need a user.
// clearinghouseState / spotClearinghouseState return an empty account for the
// zero address, which is precisely the shape we want to stub against for the
// baseline "no wallet connected" e2e path.
const FIXTURE_USER = '0x0000000000000000000000000000000000000000'

const httpTransport = new hl.HttpTransport({ isTestnet: true })
const info = new hl.InfoClient({ transport: httpTransport })

async function captureRest() {
  const jobs: Array<[string, () => Promise<unknown>]> = [
    ['rest.meta.json', () => info.meta()],
    ['rest.spotMeta.json', () => info.spotMeta()],
    ['rest.metaAndAssetCtxs.json', () => info.metaAndAssetCtxs()],
    ['rest.spotMetaAndAssetCtxs.json', () => info.spotMetaAndAssetCtxs()],
    ['rest.clearinghouseState.json', () => info.clearinghouseState({ user: FIXTURE_USER })],
    ['rest.spotClearinghouseState.json', () => info.spotClearinghouseState({ user: FIXTURE_USER })],
    ['rest.l2Book.BTC.json', () => info.l2Book({ coin: 'BTC' })]
  ]

  for (const [file, fn] of jobs) {
    process.stdout.write(`  ${file} ... `)
    const data = await fn()
    writeFileSync(join(OUT_DIR, file), JSON.stringify(data, null, 2))
    console.log('ok')
  }
}

async function captureWs() {
  const wsTransport = new hl.WebSocketTransport({
    url: 'wss://api.hyperliquid-testnet.xyz/ws'
  })
  const sub = new hl.SubscriptionClient({ transport: wsTransport })

  const captured: Record<string, unknown> = {}
  let allMidsSeen = false
  let l2BookSeen = false

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('WS capture timed out after 20s waiting for snapshots')),
      20_000
    )
    const done = () => {
      if (allMidsSeen && l2BookSeen) {
        clearTimeout(timeout)
        resolve()
      }
    }

    // The SDK's SubscriptionClient callbacks receive the parsed `data` payload,
    // not the raw `{ channel, data }` frame. We wrap them back into the raw
    // frame shape so the WS replay in the Playwright fixture can send them
    // verbatim.
    sub
      .allMids((data) => {
        if (!allMidsSeen) {
          captured['allMids'] = { channel: 'allMids', data }
          allMidsSeen = true
          done()
        }
      })
      .catch(reject)

    sub
      .l2Book({ coin: 'BTC' }, (data) => {
        if (!l2BookSeen) {
          captured['l2Book.BTC'] = { channel: 'l2Book', data }
          l2BookSeen = true
          done()
        }
      })
      .catch(reject)
  })

  writeFileSync(join(OUT_DIR, 'ws.snapshots.json'), JSON.stringify(captured, null, 2))
  console.log('  ws.snapshots.json ok')
  await wsTransport.close()
}

console.log('Capturing REST fixtures...')
await captureRest()
console.log('Capturing WS snapshots...')
await captureWs()
console.log('Done.')
