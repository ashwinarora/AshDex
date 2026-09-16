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
  })

  test('spot: Advanced dropdown offers only Scale', async ({ page }) => {
    await page.goto('/spot')

    await expect(page.getByRole('radio', { name: 'Limit' })).toBeVisible({ timeout: 15_000 })
    const trigger = page.getByTestId('advanced-order-trigger')
    await expect(trigger).toBeVisible()

    await trigger.click()
    const scaleItem = page.getByTestId('advanced-order-item-SCALE')
    await expect(scaleItem).toBeVisible()
    await expect(page.getByTestId('advanced-order-item-STOP_LIMIT')).toHaveCount(0)
    await expect(page.getByTestId('advanced-order-item-STOP_MARKET')).toHaveCount(0)

    // ScaleSpot panel also renders "Start Price".
    await scaleItem.click({ force: true })
    await expect(page.getByText('Start Price')).toBeVisible()
  })
})
