import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Page } from '@playwright/test'
import {
  expect,
  expectWalletConnected,
  installAgentApproval,
  installConnectedWallet,
  installOutcomeBalances,
  installVenueAcknowledged,
  test,
  type ExchangeBody
} from './fixtures/withStubs'

/**
 * HIP-4 outcome markets. Fixtures come from e2e/fixtures/capture-outcomes.ts
 * (testnet). Ids are read from the captured catalog rather than hard-coded so
 * a re-capture never silently invalidates the spec.
 */
type Meta = {
  outcomes: { outcome: number; name: string; description: string; venue?: string | null }[]
  questions: { question: number; namedOutcomes: number[]; fallbackOutcome: number }[]
}
const meta = JSON.parse(
  readFileSync(join(process.cwd(), 'e2e', 'fixtures', 'rest.outcomeMeta.json'), 'utf-8')
) as Meta
const balances = JSON.parse(
  readFileSync(
    join(process.cwd(), 'e2e', 'fixtures', 'rest.spotClearinghouseState.outcomes.json'),
    'utf-8'
  )
) as { balances: { coin: string; total: string; entryNtl: string }[] }

const questionChildIds = new Set(
  meta.questions.flatMap((q) => [...q.namedOutcomes, q.fallbackOutcome])
)
const nativeBinary = meta.outcomes.find((o) => o.description.startsWith('class:priceBinary'))!
const venueStandalone = meta.outcomes.find(
  (o) => o.name.startsWith('template:') && o.venue && !questionChildIds.has(o.outcome)
)!
const bucketQuestion = meta.questions.find((q) =>
  meta.outcomes.some((o) => o.outcome === q.namedOutcomes[0] && o.description === 'index:0')
)
const heldBalance = balances.balances.find((b) => b.coin.startsWith('+') && Number(b.total) > 0)!
const heldEnc = Number(heldBalance.coin.slice(1))
const heldOutcomeId = Math.floor(heldEnc / 10)
const heldSide = heldEnc % 10
const heldVenue = meta.outcomes.find((o) => o.outcome === heldOutcomeId)?.venue ?? null
/** Held market may be venue-deployed: pre-accept its disclaimer so clicks reach the order box. */
const installHeldMarket = async (page: Page) => {
  await installOutcomeBalances(page)
  await installConnectedWallet(page)
  if (heldVenue) await installVenueAcknowledged(page, [heldVenue])
}

test.describe('Outcomes landing', () => {
  test('renders cards grouped by category with rendered template titles and venue badges', async ({
    page
  }) => {
    await page.goto('/outcomes')
    await expect(page.getByTestId('outcomes-grid').first()).toBeVisible({ timeout: 15_000 })
    // Header nav highlights the new section.
    await expect(page.getByRole('link', { name: 'Outcomes' })).toBeVisible()
    // A venue-deployed standalone market shows a rendered (not "template:…") title and its badge.
    const card = page.getByTestId(`outcome-card-o:${venueStandalone.outcome}`)
    await expect(card).toBeVisible()
    await expect(card).not.toContainText('template:')
    await expect(card.getByTestId('outcome-venue-badge')).toHaveText(venueStandalone.venue!)
    // Native recurring binary: no venue badge.
    const native = page.getByTestId(`outcome-card-o:${nativeBinary.outcome}`)
    await expect(native).toBeVisible()
    await expect(native.getByTestId('outcome-venue-badge')).toHaveCount(0)
    // Fallback outcomes never get a card.
    for (const q of meta.questions.slice(0, 5)) {
      await expect(page.getByTestId(`outcome-card-o:${q.fallbackOutcome}`)).toHaveCount(0)
    }
  })

  test('deployer filter narrows to one venue; search finds a market; empty state on nonsense', async ({
    page
  }) => {
    await page.goto('/outcomes')
    await expect(page.getByTestId('outcomes-grid').first()).toBeVisible({ timeout: 15_000 })
    await page.getByTestId('outcomes-venue-trigger').click()
    await page.getByTestId(`outcomes-venue-${venueStandalone.venue}`).click()
    const badges = page.getByTestId('outcome-venue-badge')
    await expect(badges.first()).toBeVisible()
    const n = await badges.count()
    for (let i = 0; i < n; i++) await expect(badges.nth(i)).toHaveText(venueStandalone.venue!)
    await expect(page.getByTestId(`outcome-card-o:${nativeBinary.outcome}`)).toHaveCount(0)

    await page.getByTestId('outcomes-search').fill('zzzzzzzzzzzz')
    await expect(page.getByTestId('outcomes-empty-state')).toBeVisible()
  })

  test('question cards list one row per named outcome with an "Outcomes (n)" footer', async ({
    page
  }) => {
    test.skip(!bucketQuestion, 'no native price-bucket question in the captured catalog')
    await page.goto('/outcomes')
    const card = page.getByTestId(`outcome-card-q:${bucketQuestion!.question}`)
    await expect(card).toBeVisible({ timeout: 15_000 })
    await expect(card).toContainText(`Outcomes (${bucketQuestion!.namedOutcomes.length})`)
    await expect(card).toContainText('Below')
    await expect(card).toContainText('Above')
  })
})

test.describe('Outcome trade page', () => {
  test('native market: header, book keyed on the #enc coin, order box with Yes/No, no disclaimer', async ({
    page
  }) => {
    await page.goto(`/outcomes/${nativeBinary.outcome}/yes`)
    await expect(page.getByTestId('outcome-header')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('outcome-header')).not.toContainText('template:')
    await expect(page.getByTestId('deployer-disclaimer')).toHaveCount(0)
    await expect(page.getByTestId('outcome-venue-banner')).toHaveCount(0)
    await expect(page.getByTestId('order-book')).toBeVisible()
    await expect(page.getByTestId('outcome-order-box')).toBeVisible()
    await expect(page.getByTestId('outcome-side-0')).toContainText('Yes')
    await expect(page.getByTestId('outcome-side-1')).toContainText('No')
    // Outcome routes swap Positions/TWAP for Outcomes + Settled Outcomes.
    await expect(page.getByRole('radio', { name: /Outcomes/ }).first()).toBeVisible()
    await expect(page.getByRole('radio', { name: /Settled Outcomes/ })).toBeVisible()
    await expect(page.getByRole('radio', { name: /TWAP/ })).toHaveCount(0)
    await expect(page.getByRole('radio', { name: /Positions/ })).toHaveCount(0)
  })

  test('venue market: disclaimer once per venue, then banner stays', async ({ page }) => {
    await page.goto(`/outcomes/${venueStandalone.outcome}/yes`)
    const modal = page.getByTestId('deployer-disclaimer')
    await expect(modal).toBeVisible({ timeout: 15_000 })
    await expect(modal).toContainText(venueStandalone.venue!)
    await expect(page.getByTestId('deployer-disclaimer-confirm')).toBeDisabled()
    await page.getByTestId('deployer-disclaimer-check').click()
    await page.getByTestId('deployer-disclaimer-confirm').click()
    await expect(modal).toHaveCount(0)
    await expect(page.getByTestId('outcome-venue-banner')).toContainText(venueStandalone.venue!)
    // Acknowledgement persists across reloads.
    await page.reload()
    await expect(page.getByTestId('outcome-header')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('deployer-disclaimer')).toHaveCount(0)
  })

  test('unknown outcome id redirects back to the grid', async ({ page }) => {
    await page.goto('/outcomes/999999999/yes')
    await expect(page).toHaveURL(/\/outcomes$/, { timeout: 15_000 })
  })

  test('Outcomes positions tab derives size, avg price and payout from +enc balances', async ({
    page
  }) => {
    await installHeldMarket(page)
    await page.goto(`/outcomes/${heldOutcomeId}/${heldSide === 0 ? 'yes' : 'no'}`)
    await expectWalletConnected(page)
    const row = page.getByTestId(`outcome-position-${heldEnc}`)
    await expect(row).toBeVisible({ timeout: 15_000 })
    const size = Number(heldBalance.total)
    const avg = Number(heldBalance.entryNtl) / size
    await expect(row).toContainText(size.toLocaleString('en-US', { maximumFractionDigits: 2 }))
    await expect(row).toContainText(avg.toFixed(5))
    // Payout if wins = 1 quote per share.
    await expect(row).toContainText(
      `$${size.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    )
  })
})

/** Collect every /exchange POST body the page sends (the stub replies ok). */
const captureExchange = (page: Page): ExchangeBody[] => {
  const captured: ExchangeBody[] = []
  page.on('request', (req) => {
    if (!/\/exchange$/.test(req.url())) return
    try {
      const body = req.postDataJSON() as ExchangeBody | null
      if (body?.action?.type) captured.push(body)
    } catch {
      // not JSON
    }
  })
  return captured
}

test.describe('Outcome order submission', () => {
  test('limit buy posts asset 100_000_000+enc, whole-share size, grouping na, no TP/SL', async ({
    page
  }) => {
    await installAgentApproval(page)
    await installHeldMarket(page)
    const captured = captureExchange(page)
    await page.goto(`/outcomes/${heldOutcomeId}/yes`)
    await expect(page.getByTestId('outcome-order-box')).toBeVisible({ timeout: 15_000 })
    await expectWalletConnected(page)
    await page.getByTestId('outcome-order-type-trigger').click()
    await page.getByTestId('outcome-order-type-LIMIT').click()
    await page.getByTestId('outcome-price-input').fill('0.25')
    await page.getByTestId('outcome-size-input').fill('60')
    await expect(page.getByTestId('outcome-payout')).toContainText('$60.00')
    const submit = page.getByTestId('outcome-submit')
    await expect(submit).toBeEnabled()
    await submit.click()
    await expect.poll(() => captured.some((b) => b.action?.type === 'order')).toBe(true)
    const order = captured.find((b) => b.action?.type === 'order')!.action as {
      grouping: string
      orders: { a: number; b: boolean; p: string; s: string; r: boolean; t: unknown }[]
    }
    expect(order.grouping).toBe('na')
    expect(order.orders).toHaveLength(1)
    expect(order.orders[0]).toMatchObject({
      a: 100_000_000 + heldOutcomeId * 10,
      b: true,
      p: '0.25',
      s: '60',
      r: false,
      t: { limit: { tif: 'Gtc' } }
    })
  })

  test('below the $10 minimum the submit button is disabled with a reason', async ({ page }) => {
    await installAgentApproval(page)
    await installHeldMarket(page)
    await page.goto(`/outcomes/${heldOutcomeId}/yes`)
    await expect(page.getByTestId('outcome-order-box')).toBeVisible({ timeout: 15_000 })
    await expectWalletConnected(page)
    await page.getByTestId('outcome-order-type-trigger').click()
    await page.getByTestId('outcome-order-type-LIMIT').click()
    await page.getByTestId('outcome-price-input').fill('0.25')
    await page.getByTestId('outcome-size-input').fill('3')
    await expect(page.getByTestId('outcome-submit')).toBeDisabled()
    await expect(page.getByTestId('outcome-order-reason')).toContainText(
      'Minimum order value is $10'
    )
  })

  test('split posts a userOutcome action for the outcome', async ({ page }) => {
    await installAgentApproval(page)
    await installHeldMarket(page)
    const captured = captureExchange(page)
    await page.goto(`/outcomes/${heldOutcomeId}/yes`)
    await expect(page.getByTestId('outcome-order-box')).toBeVisible({ timeout: 15_000 })
    await expectWalletConnected(page)
    await page.getByTestId('outcome-order-type-trigger').click()
    await page.getByTestId('outcome-order-type-CONVERT').click()
    await expect(page.getByTestId('convert-outcomes')).toBeVisible()
    await page.getByTestId('convert-mode-split').click()
    await page.getByTestId('convert-amount').fill('2')
    await expect(page.getByTestId('convert-into')).toContainText('2 Yes + 2 No')
    await page.getByTestId('convert-submit').click()
    await expect.poll(() => captured.some((b) => b.action?.type === 'userOutcome')).toBe(true)
    const action = captured.find((b) => b.action?.type === 'userOutcome')!.action as {
      splitOutcome?: { outcome: number; amount: string }
    }
    expect(action.splitOutcome).toEqual({ outcome: heldOutcomeId, amount: '2' })
  })
})
