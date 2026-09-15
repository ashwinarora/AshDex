import { expect, test } from './fixtures/withStubs'

test.describe('Spot page — Group F', () => {
  test('BUG-025: Contract link points to the testnet explorer, not mainnet', async ({ page }) => {
    await page.goto('/spot')
    // The Contract link renders once spotMeta resolves. Give it a moment.
    const link = page.getByTestId('contract-link')
    await expect(link).toBeVisible({ timeout: 15_000 })
    // The env is testnet in this project (see .env). The link href must NOT
    // point to the mainnet explorer domain.
    await expect(link).toHaveAttribute('href', /hyperliquid-testnet\.xyz\/explorer\/token\//)
    await expect(link).not.toHaveAttribute('href', /^https:\/\/app\.hyperliquid\.xyz/)
  })

  test('BUG-026: Positions tab is NOT shown on the spot page', async ({ page }) => {
    await page.goto('/spot')
    // Wait for the tab strip to render (Balances is spot's default tab).
    await expect(page.getByRole('radio', { name: /Balances/ })).toBeVisible({ timeout: 15_000 })
    // Perps has (N) Positions; spot must not.
    await expect(page.getByRole('radio', { name: /Positions/ })).toHaveCount(0)
  })

  test('BUG-029: Fees line labels maker vs taker', async ({ page }) => {
    await page.goto('/spot')
    // Anchor on the Balances tab which we've seen renders reliably.
    await expect(page.getByRole('radio', { name: /Balances/ })).toBeVisible({ timeout: 15_000 })
    // Current bug: fees shown as "0.070% / 0.040%" with no labels. Fix must
    // introduce both "Taker" and "Maker" labels somewhere in that line.
    await expect(page.getByText(/Taker/)).toBeVisible()
    await expect(page.getByText(/Maker/)).toBeVisible()
  })

  test('Spot asset selector shows a "no results" message on unmatched search', async ({ page }) => {
    await page.goto('/spot')
    // Trigger button uses the shared "asset-selector-trigger" testid across
    // perps + spot.
    await page.getByTestId('asset-selector-trigger').click()
    const search = page.getByPlaceholder('Search for an asset')
    await expect(search).toBeVisible()
    await search.fill('ZZZZZZZZZZZ')
    await expect(page.getByTestId('market-list-empty-state')).toBeVisible()
  })
})
