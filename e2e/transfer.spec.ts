import { expect, test } from './fixtures/withStubs'

test.describe('Transfer dialog — Group I', () => {
  test('BUG-037: trading-page "Perps ⇄ Spot" opens dialog with direction Spot → Perp', async ({
    page
  }) => {
    await page.goto('/')
    // Anchor: right-sidebar Overview renders (Balances tab is a reliable signal
    // that user data area has hydrated).
    await expect(page.getByRole('radio', { name: /Balances/ })).toBeVisible({ timeout: 15_000 })

    // The trading-page transfer button is inside the Overview sidebar. Its
    // accessible name from the icon+labels reads "Perps Spot" (no separator
    // announced by AT).
    await page.getByRole('button', { name: /Perps.*Spot/ }).click()

    // The dialog shows two direction indicators: "from" on the left, "to" on
    // the right. On a trading page the sensible default is Spot → Perp so
    // users can move funds into perps to trade.
    await expect(page.getByTestId('transfer-direction-from')).toHaveText('Spot')
    await expect(page.getByTestId('transfer-direction-to')).toHaveText('Perp')
  })
})
