import { expect, test, installAgentApproval } from './fixtures/withStubs'

// The `useAutoReferral` hook is opt-in via NEXT_PUBLIC_ASHDEX_REFERRAL_CODE. It
// silently posts `setReferrer` via the agent wallet after agent approval
// lands — but only when the eligibility guards allow it. These specs verify
// the guards short-circuit for the two cases where the hook must NOT fire:
//
//   1. The wallet already has a `referredBy` set.
//   2. The wallet's referrerState.stage is `needToCreateCode`.
//
// The "does fire" happy path depends on the env var being non-empty at build
// time and is exercised by the pure predicate unit tests in
// src/hooks/useAutoReferral.helpers.test.ts + a manual Chrome MCP QA run.

const referralReferred = {
  referredBy: {
    referrer: '0x1111111111111111111111111111111111111111',
    code: 'SOMEONE_ELSE'
  },
  cumVlm: '0.0',
  unclaimedRewards: '0.0',
  claimedRewards: '0.0',
  builderRewards: '0.0',
  referrerState: {
    stage: 'ready',
    data: { code: 'MINE', nReferrals: 0, referralStates: [] }
  },
  rewardHistory: []
}

const referralNeedToCreateCode = {
  referredBy: null,
  cumVlm: '0.0',
  unclaimedRewards: '0.0',
  claimedRewards: '0.0',
  builderRewards: '0.0',
  referrerState: { stage: 'needToCreateCode' },
  rewardHistory: []
}

async function stubReferral(page: import('@playwright/test').Page, body: unknown) {
  await page.route(/api\.hyperliquid(-testnet)?\.xyz\/info/, async (route) => {
    const req = route.request().postDataJSON() as { type?: string } | null
    if (req?.type === 'referral') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body)
      })
      return
    }
    await route.fallback()
  })
}

test.describe('useAutoReferral guards (no setReferrer fires)', () => {
  test('short-circuits when the wallet already has a referrer', async ({ page }) => {
    await installAgentApproval(page)
    await stubReferral(page, referralReferred)

    // Capture every /exchange POST — none should carry `setReferrer`.
    const exchangeActions: string[] = []
    page.on('request', (req) => {
      if (!/\/exchange$/.test(req.url())) return
      try {
        const body = req.postDataJSON() as { action?: { type?: string } } | null
        if (body?.action?.type) exchangeActions.push(body.action.type)
      } catch {
        // ignore
      }
    })

    await page.goto('/BTC')
    // Anchor on a signal that means the hook has had a chance to observe the
    // referral response: the order book renders after WS + info responses land.
    await expect(page.getByTestId('order-book-rows')).toBeVisible({ timeout: 15_000 })

    expect(exchangeActions).not.toContain('setReferrer')
  })

  test('short-circuits when referrerState.stage is needToCreateCode', async ({ page }) => {
    await installAgentApproval(page)
    await stubReferral(page, referralNeedToCreateCode)

    const exchangeActions: string[] = []
    page.on('request', (req) => {
      if (!/\/exchange$/.test(req.url())) return
      try {
        const body = req.postDataJSON() as { action?: { type?: string } } | null
        if (body?.action?.type) exchangeActions.push(body.action.type)
      } catch {
        // ignore
      }
    })

    await page.goto('/BTC')
    await expect(page.getByTestId('order-book-rows')).toBeVisible({ timeout: 15_000 })

    expect(exchangeActions).not.toContain('setReferrer')
  })
})
