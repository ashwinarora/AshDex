import { expect, test } from './fixtures/withStubs'

// Smoke coverage for the restored "Advanced" dropdown in PlaceOrderBox.
// Scope: tab-switching UI only. Order submission needs the signed-wallet
// fixture that's still gated (see memory/project_next_infra_step.md).
test.describe('Advanced order tabs', () => {
  test('perp: Advanced dropdown offers Scale, Stop Limit, Stop Market', async ({ page }) => {
    await page.goto('/')

    // Base tabs are visible; the dropdown only mounts on perp (isSpot=false).
    await expect(page.getByRole('radio', { name: 'Limit' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('radio', { name: 'Market' })).toBeVisible()
    const trigger = page.getByTestId('advanced-order-trigger')
    await expect(trigger).toBeVisible()
    await expect(trigger).toHaveText(/Advanced/)

    // Radix DropdownMenu.Content animates open (translate transitions), so the
    // menu items report "not stable" during the open frames. force:true skips
    // the stability check — we're only testing reachability, not pointer physics.
    const pickOption = async (testid: string) => {
      await trigger.click()
      const item = page.getByTestId(testid)
      await expect(item).toBeVisible()
      await item.click({ force: true })
    }

    await trigger.click()
    await expect(page.getByTestId('advanced-order-item-SCALE')).toBeVisible()
    await expect(page.getByTestId('advanced-order-item-STOP_LIMIT')).toBeVisible()
    await expect(page.getByTestId('advanced-order-item-STOP_MARKET')).toBeVisible()
    // Dismiss the dropdown before pickOption re-opens it.
    await page.keyboard.press('Escape')

    // Scale renders its own "Start Price" label — unique to that panel.
    await pickOption('advanced-order-item-SCALE')
    await expect(page.getByText('Start Price')).toBeVisible()

    // Stop Limit has both "Stop Price" and "Limit Price" (Limit Price is unique to it).
    await pickOption('advanced-order-item-STOP_LIMIT')
    await expect(page.getByText('Stop Price')).toBeVisible()
    await expect(page.getByText('Limit Price')).toBeVisible()

    // Stop Market has "Stop Price" but not "Limit Price".
    await pickOption('advanced-order-item-STOP_MARKET')
    await expect(page.getByText('Stop Price')).toBeVisible()
    await expect(page.getByText('Limit Price')).toHaveCount(0)

    // TWAP renders its own "Running Time" label, unique to that panel.
    await pickOption('advanced-order-item-TWAP')
    await expect(page.getByText(/Running Time/)).toBeVisible()
    await expect(page.getByText('Size per Suborder')).toBeVisible()
  })

  test('perp TWAP: "Connect Wallet" opens the wallet modal with a blank form (BUG-059)', async ({
    page
  }) => {
    // The stub fixture shims window.ethereum but wagmi never auto-connects, so
    // the panel renders its "Connect Wallet" state. Before the fix the click
    // handler returned early on blank inputs before reaching the connect
    // redirect, so this button did nothing — and a disconnected user cannot
    // type a size to satisfy it (the amount input waits for clearinghouse
    // state). The button must open the wallet modal unconditionally.
    await page.goto('/')
    await expect(page.getByRole('radio', { name: 'Limit' })).toBeVisible({ timeout: 15_000 })
    const trigger = page.getByTestId('advanced-order-trigger')
    await trigger.click()
    await page.getByTestId('advanced-order-item-TWAP').click({ force: true })

    const submit = page.getByTestId('twap-submit')
    await expect(submit).toHaveText(/Connect Wallet/)
    await expect(submit).toBeEnabled()
    await submit.click()
    await expect(page.getByRole('dialog', { name: 'Connect Wallet' })).toBeVisible()
  })

  test('spot: Advanced dropdown offers Scale and TWAP', async ({ page }) => {
    await page.goto('/spot')

    await expect(page.getByRole('radio', { name: 'Limit' })).toBeVisible({ timeout: 15_000 })
    const trigger = page.getByTestId('advanced-order-trigger')
    await expect(trigger).toBeVisible()

    await trigger.click()
    const scaleItem = page.getByTestId('advanced-order-item-SCALE')
    await expect(scaleItem).toBeVisible()
    // TWAP is available on spot too, but Stop Limit / Stop Market are not (spot has no positions to trigger against).
    await expect(page.getByTestId('advanced-order-item-TWAP')).toBeVisible()
    await expect(page.getByTestId('advanced-order-item-STOP_LIMIT')).toHaveCount(0)
    await expect(page.getByTestId('advanced-order-item-STOP_MARKET')).toHaveCount(0)

    // ScaleSpot panel also renders "Start Price".
    await scaleItem.click({ force: true })
    await expect(page.getByText('Start Price')).toBeVisible()
  })
})
