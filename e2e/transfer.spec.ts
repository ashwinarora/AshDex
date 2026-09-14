import { expect, test } from './fixtures/withStubs'

test.describe('Transfer dialog — Group I', () => {
  test.skip('BUG-037: trading-page transfer button opens dialog with direction Spot → Perp — pending wagmi auto-connect fixture (F5 disabled the button when disconnected, and the current stub keeps wagmi disconnected)', async ({
    page
  }) => {
    await page.goto('/')
    // Anchor: right-sidebar Overview renders (Balances tab is a reliable signal
    // that user data area has hydrated).
    await expect(page.getByRole('radio', { name: /Balances/ })).toBeVisible({ timeout: 15_000 })

    // F5/R1-UX3: the sidebar transfer button was renamed from "Perps [icon]
    // Spot" (which announced as "Perps Spot") to plain "Transfer".
    await page.getByTestId('overview-transfer').click()

    // The dialog shows two direction indicators: "from" on the left, "to" on
    // the right. On a trading page the sensible default is Spot → Perp so
    // users can move funds into perps to trade.
    await expect(page.getByTestId('transfer-direction-from')).toHaveText('Spot')
    await expect(page.getByTestId('transfer-direction-to')).toHaveText('Perp')
  })
})
