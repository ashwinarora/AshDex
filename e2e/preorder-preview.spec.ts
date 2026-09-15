import { expect, test } from './fixtures/withStubs'

/**
 * Group A — pre-order preview math.
 *
 * BUG-001 and BUG-014 are NOT tested here; they require an isTradingEnabled=true
 * fixture state that this stub setup doesn't provide (wagmi not connected, agent
 * not approved). They'll land after the mid-sequence "extend fixture: connected
 * + agent-approved + signing" step. See QA_ISSUES.md § Groups.
 */
test.describe('Pre-order preview (perps) — Group A', () => {
  test('BUG-011: leverage input clamps to maxLeverage on blur', async ({ page }) => {
    await page.goto('/')

    // Wait for the order book to load so meta is present (needed for maxLeverage).
    await expect(page.getByTestId('order-book-rows')).toBeVisible({ timeout: 15_000 })

    const leverage = page.getByTestId('preorder-leverage-input')
    await expect(leverage).toBeVisible()

    // BTC maxLeverage in the fixture is 40 (verified against meta capture).
    // Typing 999 should NOT leave "999" in the input after blur.
    await leverage.fill('999')
    await page.keyboard.press('Tab')

    // Fix must clamp the input (either snap to max=40 or revert to last valid).
    // The bug is specifically that "999" persists visibly after blur.
    await expect(leverage).not.toHaveValue('999')
    const settled = await leverage.inputValue()
    const asNumber = Number(settled)
    expect(Number.isFinite(asNumber)).toBe(true)
    expect(asNumber).toBeGreaterThanOrEqual(1)
    expect(asNumber).toBeLessThanOrEqual(40)
  })

  test('R2-B4: leverage input clamps on change, not just on blur', async ({ page }) => {
    // If the clamp only fires on blur, a user who types "999" and immediately
    // clicks Long sends the raw 999 downstream. This spec asserts the value
    // is clamped *while* it sits in the input, before any blur.
    await page.goto('/')
    await expect(page.getByTestId('order-book-rows')).toBeVisible({ timeout: 15_000 })

    const leverage = page.getByTestId('preorder-leverage-input')
    await leverage.fill('999')
    // No blur.
    const midType = await leverage.inputValue()
    expect(Number(midType)).toBeLessThanOrEqual(40)
    expect(Number(midType)).toBeGreaterThanOrEqual(1)
  })

  test('R2-B4: leverage input rejects non-digit input on change', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('order-book-rows')).toBeVisible({ timeout: 15_000 })

    const leverage = page.getByTestId('preorder-leverage-input')
    // Strip alpha before it ever renders.
    await leverage.fill('abc')
    await expect(leverage).not.toHaveValue('abc')
    // Negative sign stripped.
    await leverage.fill('-5')
    await expect(leverage).not.toHaveValue('-5')
    // Decimal stripped (integer-only leverage).
    await leverage.fill('3.5')
    await expect(leverage).toHaveValue('3')
  })

  test('BUG-012: slippage input clamps to max=100 on blur', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('order-book-rows')).toBeVisible({ timeout: 15_000 })

    // Open the slippage popover.
    await page.getByRole('button', { name: 'Slippage' }).click()

    // Only one spinbutton is rendered while the slippage popover is open.
    const slippage = page.getByRole('spinbutton')
    await expect(slippage).toBeVisible()

    await slippage.fill('200')
    await page.keyboard.press('Tab')

    await expect(slippage).not.toHaveValue('200')
    const settled = await slippage.inputValue()
    const asNumber = Number(settled)
    expect(Number.isFinite(asNumber)).toBe(true)
    expect(asNumber).toBeGreaterThanOrEqual(0.1)
    expect(asNumber).toBeLessThanOrEqual(100)
  })

  test('R2-B16: slippage input clamps on change, not just on blur', async ({ page }) => {
    // Same reasoning as R2-B4 for leverage: if the clamp is only on blur,
    // the raw 200 is what any immediate submit uses.
    await page.goto('/')
    await expect(page.getByTestId('order-book-rows')).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: 'Slippage' }).click()
    const slippage = page.getByRole('spinbutton')
    await slippage.fill('200')
    // No blur.
    const midType = await slippage.inputValue()
    expect(Number(midType)).toBeLessThanOrEqual(100)
    expect(Number(midType)).toBeGreaterThanOrEqual(0.1)
  })
})
