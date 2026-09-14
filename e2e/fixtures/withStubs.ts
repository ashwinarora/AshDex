/**
 * Playwright fixture that makes specs hermetic against Hyperliquid.
 *
 * Import from this file instead of '@playwright/test':
 *   import { test, expect } from '../fixtures/withStubs'
 *
 * Every test that uses `page` from this fixture gets:
 *   1. REST /info intercepted -> replayed from rest.*.json (or overridden per-test)
 *   2. REST /exchange intercepted -> default ok response, override per-test via
 *      `exchangeStub`
 *   3. WebSocket /ws intercepted -> replayed from ws.snapshots.json
 *   4. window.ethereum shimmed so wagmi thinks an injected wallet exists;
 *      signing methods return a deterministic 65-byte hex — the server is
 *      stubbed so no signature is actually verified
 *
 * Opt-in helpers for order-lifecycle specs:
 *   - `installAgentApproval(page)` seeds a known agent private key in
 *     localStorage and swaps in stub responses for `extraAgents` /
 *     `maxBuilderFee` so `useAgentApproval()` returns true.
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
const EXCHANGE_URL_PATTERN = /api\.hyperliquid(-testnet)?\.xyz\/exchange/
const WS_URL_PATTERN = /wss:\/\/api\.hyperliquid(-testnet)?\.xyz\/ws/

// --- Exchange stub types ----------------------------------------------------

/**
 * Body shape the Hyperliquid SDK POSTs to /exchange. We only look at
 * `action.type` — the rest is signature + timestamp we don't need to verify.
 */
export type ExchangeBody = {
  action?: { type?: string } & Record<string, unknown>
  nonce?: number
  signature?: unknown
}

/**
 * Per-spec override for how /exchange should respond. Return either a full
 * fulfil descriptor (status + body) or shorthand `null` to fall back to the
 * default success reply.
 */
export type ExchangeStub = (
  body: ExchangeBody
) =>
  | { status?: number; body: unknown; headers?: Record<string, string> }
  | Promise<{ status?: number; body: unknown; headers?: Record<string, string> }>
  | null

// Default: mimic a successful order fill (resting order at oid 42), or a
// successful cancel/withdraw/transfer/etc. depending on the action type.
const defaultExchangeReply = (body: ExchangeBody) => {
  const type = body.action?.type
  if (type === 'order') {
    return {
      status: 'ok',
      response: {
        type: 'order',
        data: { statuses: [{ resting: { oid: 42 } }] }
      }
    }
  }
  if (type === 'cancel') {
    return {
      status: 'ok',
      response: { type: 'cancel', data: { statuses: ['success'] } }
    }
  }
  if (type === 'usdClassTransfer' || type === 'usdSend' || type === 'spotSend' || type === 'withdraw3') {
    return { status: 'ok', response: { type: 'default' } }
  }
  if (type === 'approveAgent' || type === 'approveBuilderFee') {
    return { status: 'ok', response: { type: 'default' } }
  }
  // Fall through: reply generic ok. Spec-specific behaviour should override.
  return { status: 'ok', response: { type: 'default' } }
}

async function installStubs(page: Page, exchangeStub?: ExchangeStub): Promise<void> {
  // ---- REST /info -----------------------------------------------------------
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

  // ---- REST /exchange -------------------------------------------------------
  // The SDK POSTs signed actions here. We don't verify the signature (the
  // window.ethereum shim below returns a canned one). Default: reply success
  // matching the action type. Specs override by passing `exchangeStub`.
  await page.route(EXCHANGE_URL_PATTERN, async (route) => {
    const body = (route.request().postDataJSON() ?? {}) as ExchangeBody
    const override = await Promise.resolve(exchangeStub?.(body) ?? null)
    const reply = override ?? { status: 200 as number | undefined, body: defaultExchangeReply(body) }
    await route.fulfill({
      status: reply.status ?? 200,
      contentType: 'application/json',
      headers: reply.headers,
      body: typeof reply.body === 'string' ? reply.body : JSON.stringify(reply.body)
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
  // Signing methods return a deterministic 65-byte hex — the /exchange stub
  // above doesn't verify signatures. Fixed address matches capture.ts's
  // FIXTURE_USER (the zero address), so clearinghouseState fixtures line up.
  await page.addInitScript(() => {
    const account = '0x0000000000000000000000000000000000000000'
    // 65 bytes: r (32) || s (32) || v (1). Any deterministic value works since
    // the /exchange stub doesn't verify. Recovery byte 27 = valid ECDSA v.
    const stubSignature =
      '0x' + '11'.repeat(32) + '22'.repeat(32) + '1b'
    const listeners = new Map<string, Array<(...args: unknown[]) => void>>()
    const provider = {
      isMetaMask: false,
      request: async ({ method }: { method: string; params?: unknown }) => {
        if (method === 'eth_chainId') return '0x3e6' // 998 = Hyperliquid testnet
        if (method === 'eth_accounts' || method === 'eth_requestAccounts') return [account]
        if (method === 'wallet_switchEthereumChain') return null
        if (method === 'wallet_addEthereumChain') return null
        if (method === 'eth_signTypedData_v4' || method === 'eth_sign' || method === 'personal_sign') {
          return stubSignature
        }
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

// --- Opt-in: seed agent-approval state --------------------------------------

/**
 * Fixed agent private key used across all e2e specs that opt into
 * `installAgentApproval`. Its public key (below) is what the extraAgents
 * stub returns so `useAgentApproval()` sees a match.
 *
 * NEVER put a real key here — this is for a stubbed HL server that verifies
 * nothing.
 */
const STUB_AGENT_PRIVATE_KEY =
  '0x1111111111111111111111111111111111111111111111111111111111111111'
// Derived from the private key above via viem privateKeyToAccount, hardcoded
// so this fixture doesn't need to import viem.
const STUB_AGENT_PUBLIC_ADDRESS = '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A'
const STUB_USER_ADDRESS = '0x0000000000000000000000000000000000000000'

/**
 * Preload agent-approval state and info-endpoint stubs so the app renders
 * as if the user has already gone through the Establish Connection flow.
 *
 * Call this at the top of any spec that needs to place, cancel, close, or
 * TP/SL an order:
 *
 *     import { test, installAgentApproval } from './fixtures/withStubs'
 *     test('places an order', async ({ page }) => {
 *       await installAgentApproval(page)
 *       await page.goto('/')
 *       ...
 *     })
 *
 * Adds routes that return `extraAgents` = [our stub agent] and
 * `maxBuilderFee` = 0.1 (matching the app's BUILDER_FEE constant), and seeds
 * the stored agent key so HyperliquidStore reuses it on hydration.
 */
export async function installAgentApproval(page: Page): Promise<void> {
  await page.addInitScript(
    ({ userAddr, key }) => {
      // Store constant: `agentPrivateKey_<userAddress>` — see src/utils/constants.ts.
      window.localStorage.setItem(`agentPrivateKey_${userAddr}`, key)
    },
    { userAddr: STUB_USER_ADDRESS, key: STUB_AGENT_PRIVATE_KEY }
  )

  // Layer the approval responses on top of the base /info route. Playwright
  // resolves the most-recently-added handler first, so this shadows the
  // default file-based handler for these two request types only.
  await page.route(/api\.hyperliquid(-testnet)?\.xyz\/info/, async (route) => {
    const body = route.request().postDataJSON() as { type?: string } | null
    const type = body?.type
    if (type === 'extraAgents') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { address: STUB_AGENT_PUBLIC_ADDRESS, name: 'ashdex_agent', validUntil: 4000000000000 }
        ])
      })
      return
    }
    if (type === 'maxBuilderFee') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '10' // basis points; anything > 0 passes the app's `currentFeeApproval > 0` guard
      })
      return
    }
    await route.fallback()
  })
}

/**
 * Extend the base `test` so every spec that imports from here gets a `page`
 * with the stubs already installed. Downstream:
 *
 *   import { test, expect } from '../fixtures/withStubs'
 *   test('...', async ({ page }) => { await page.goto('/') })
 *
 * Specs that need /exchange to reply with specific errors (e.g. min-notional
 * rejection) can declare a per-test fixture:
 *
 *   test.use({ exchangeStub: (body) => ({ status: 200, body: { status: 'err', response: 'Order must have minimum value of $10' } }) })
 */
type StubsFixtures = {
  exchangeStub?: ExchangeStub
}

export const test = base.extend<StubsFixtures>({
  exchangeStub: [undefined, { option: true }],
  page: async ({ page, exchangeStub }, use) => {
    await installStubs(page, exchangeStub)
    await use(page)
  }
})
export { expect }
