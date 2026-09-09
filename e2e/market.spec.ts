import { expect, test } from './fixtures/withStubs'

test.describe('Market page (perps)', () => {
  test('renders the order book with live data', async ({ page }) => {
    await page.goto('/')

    // Heading present as soon as the component mounts.
    await expect(page.getByRole('heading', { name: 'Order Book' })).toBeVisible()

    // Container of the entire order book UI (skeleton OR loaded).
    await expect(page.getByTestId('order-book')).toBeVisible()

    // Container of the loaded rows — only renders once WS data arrives.
    // With stubs the WS snapshot ships as soon as the app subscribes, so this
    // usually resolves in <1s. 15s is a generous ceiling for cold-boot cases.
    await expect(page.getByTestId('order-book-rows')).toBeVisible({ timeout: 15_000 })
  })

  test('BUG-030: orderbook Amount column formats sizes to at most 4 decimals', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('order-book-rows')).toBeVisible({ timeout: 15_000 })

    // Every rendered Amount cell must have at most 4 decimals (matching the
    // Total column's precision={4}). The bug: raw sell.sz strings from
    // Hyperliquid can be up to 5+ decimals (e.g. "0.25025", "0.00478"),
    // producing visible inconsistency with the adjacent Total cell.
    const amountCells = page.getByTestId('orderbook-amount')
    await expect(amountCells.first()).toBeVisible()
    const count = await amountCells.count()
    expect(count).toBeGreaterThan(0)

    // Assert on the full rendered list, not just the first row — the bug
    // shows up specifically on order sizes with fine-grained decimals, which
    // may not be in row 0. /^\d+(?:\.\d{1,4})?$/ = optional decimal part, ≤4 digits.
    for (let i = 0; i < count; i++) {
      const text = (await amountCells.nth(i).textContent())?.trim() ?? ''
      expect(text, `row ${i} amount "${text}"`).toMatch(/^\d+(?:\.\d{1,4})?$/)
    }
  })

  test('BUG-022: asset selector shows a "no results" message on unmatched search', async ({
    page
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('order-book-rows')).toBeVisible({ timeout: 15_000 })

    // Open the asset selector dialog. The trigger button is labeled with the
    // current asset (e.g. "BTC-USD"); its haspopup="dialog" makes it the only
    // dialog-opening button on the page named after a market.
    await page.getByTestId('asset-selector-trigger').click()

    const search = page.getByPlaceholder('Search for an asset')
    await expect(search).toBeVisible()

    // Type a query that can't match any real ticker.
    await search.fill('ZZZZZZZZZZZ')

    // The empty state must be visible. We assert on the testid so the copy is
    // free to change without breaking the test.
    await expect(page.getByTestId('market-list-empty-state')).toBeVisible()
  })
})
