/**
 * Playwright fixture that makes specs hermetic against Hyperliquid.
 *
 * Import from this file instead of '@playwright/test':
 *   import { test, expect } from '../fixtures/withStubs'
 *
 * Every test that uses `page` from this fixture gets:
 *   1. REST /info intercepted -> replayed from rest.*.json
 *   2. WebSocket /ws intercepted -> replayed from ws.snapshots.json
 *   3. window.ethereum shimmed so wagmi thinks an injected wallet exists
 *      (signing methods intentionally throw — add them when a spec needs them)
 */
import { expect, test as base, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Playwright loads spec/fixture files as CJS so we can't use import.meta.url.
// It always runs with cwd = project root (where playwright.config.ts lives),
// so a cwd-relative path is reliable.
const FIXTURES_DIR = join(process.cwd(), 'e2e', 'fixtures')

const loadJson = <T = unknown>(name: string): T =>
  JSON.parse(readFileSync(join(FIXTURES_DIR, name), 'utf-8')) as T

// Map POST body `type` -> fixture file. If the app calls /info with a `type`
// not listed here, the route replies 500 so the missing capture is loud.
const REST_TYPE_TO_FIXTURE: Record<string, string> = {
  meta: 'rest.meta.json',
  spotMeta: 'rest.spotMeta.json',
  metaAndAssetCtxs: 'rest.metaAndAssetCtxs.json',
  spotMetaAndAssetCtxs: 'rest.spotMetaAndAssetCtxs.json',
  clearinghouseState: 'rest.clearinghouseState.json',
  spotClearinghouseState: 'rest.spotClearinghouseState.json',
  l2Book: 'rest.l2Book.BTC.json'
}

type WsSnapshots = {
  allMids: { channel: 'allMids'; data: { mids: Record<string, string> } }
  'l2Book.BTC': { channel: 'l2Book'; data: { coin: string; time: number; levels: unknown[][] } }
}
const wsSnapshots = loadJson<WsSnapshots>('ws.snapshots.json')

// Match both mainnet + testnet REST and WS URLs so the fixture works no matter
// which network the env var points at.
const REST_URL_PATTERN = /api\.hyperliquid(-testnet)?\.xyz\/info/
const WS_URL_PATTERN = /wss:\/\/api\.hyperliquid(-testnet)?\.xyz\/ws/

async function installStubs(page: Page): Promise<void> {
  // ---- REST -----------------------------------------------------------------
  await page.route(REST_URL_PATTERN, async (route) => {
    const body = route.request().postDataJSON() as { type?: string } | null
    const type = body?.type
    const file = type ? REST_TYPE_TO_FIXTURE[type] : undefined
    if (!file) {
      console.warn(`[stubs] no REST fixture for /info type=${type ?? '<null>'}`)
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'no fixture', type })
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: readFileSync(join(FIXTURES_DIR, file), 'utf-8')
    })
  })

  // ---- WebSocket ------------------------------------------------------------
  // Docs footgun: once we attach onMessage, Playwright stops forwarding
  // frames to the real server. We WANT full mock, so we never call
  // connectToServer() — the app talks to us and only us.
  await page.routeWebSocket(WS_URL_PATTERN, (ws) => {
    ws.onMessage((message) => {
      let frame: { method?: string; subscription?: { type?: string; coin?: string } }
      try {
        frame = typeof message === 'string' ? JSON.parse(message) : {}
      } catch {
        return
      }
      if (frame.method !== 'subscribe') return
      const sub = frame.subscription
      if (sub?.type === 'allMids') {
        ws.send(JSON.stringify(wsSnapshots.allMids))
      } else if (sub?.type === 'l2Book' && sub.coin === 'BTC') {
        ws.send(JSON.stringify(wsSnapshots['l2Book.BTC']))
      } else if (sub?.type === 'assetCtxs') {
        // Reuse the REST [meta, ctxs] tuple — WS pushes the same ctxs shape.
        const [, ctxs] = loadJson<[unknown, unknown]>('rest.metaAndAssetCtxs.json')
        ws.send(JSON.stringify({ channel: 'assetCtxs', data: { ctxs } }))
      } else if (sub?.type === 'spotAssetCtxs') {
        const [, ctxs] = loadJson<[unknown, unknown]>('rest.spotMetaAndAssetCtxs.json')
        ws.send(JSON.stringify({ channel: 'spotAssetCtxs', data: ctxs }))
      } else {
        console.warn(`[stubs] no WS fixture for subscription: ${JSON.stringify(sub)}`)
      }
    })
  })

  // ---- window.ethereum ------------------------------------------------------
  // Minimal EIP-1193 shim: enough for wagmi to detect an injected wallet.
  // Signing methods intentionally throw — Stage 6 (or wherever we first need
  // to place an order in e2e) will replace this with a viem-account-backed
  // signer. Fixed address matches e2e/fixtures/capture.ts's FIXTURE_USER
  // (the zero address), so clearinghouseState fixtures line up.
  await page.addInitScript(() => {
    const account = '0x0000000000000000000000000000000000000000'
    const listeners = new Map<string, Array<(...args: unknown[]) => void>>()
    const provider = {
      isMetaMask: false,
      request: async ({ method }: { method: string; params?: unknown }) => {
        if (method === 'eth_chainId') return '0x3e6' // 998 = Hyperliquid testnet
        if (method === 'eth_accounts' || method === 'eth_requestAccounts') return [account]
        if (method === 'wallet_switchEthereumChain') return null
        throw new Error(`[stub-ethereum] unsupported method: ${method}`)
      },
      on: (event: string, fn: (...args: unknown[]) => void) => {
        const list = listeners.get(event) ?? []
        list.push(fn)
        listeners.set(event, list)
        return provider
      },
      removeListener: (event: string, fn: (...args: unknown[]) => void) => {
        const list = listeners.get(event) ?? []
        listeners.set(
          event,
          list.filter((h) => h !== fn)
        )
        return provider
      }
    }
    Object.defineProperty(window, 'ethereum', {
      value: provider,
      writable: false,
      configurable: true
    })

    // Skip the first-run onboarding modal — otherwise it renders a full-viewport
    // overlay that intercepts every click. Set before any script runs so the
    // OnboardingModal's mount-time localStorage read sees it.
    window.localStorage.setItem('onboarded', 'true')
  })
}

/**
 * Extend the base `test` so every spec that imports from here gets a `page`
 * with the stubs already installed. Downstream:
 *
 *   import { test, expect } from '../fixtures/withStubs'
 *   test('...', async ({ page }) => { await page.goto('/') })
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await installStubs(page)
    await use(page)
  }
})
export { expect }
