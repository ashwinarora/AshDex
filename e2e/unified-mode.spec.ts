import { expect, test } from './fixtures/withStubs'

// The userAbstraction fetch runs only after a wallet connects (the API is
// user-scoped). The e2e stub shims window.ethereum but wagmi never auto-
// connects, so `useIsUnified()` stays false and the unified branch is
// unreachable from a stubbed spec. The two unified assertions below are
// parked until the wallet-connect fixture lands (same infra gap as
// BUG-Group B/E's transfer test). Unit tests in
// src/utils/hyperliquid/unifiedAccount.test.ts cover the math end-to-end;
// manual dual-mode QA on testnet covers the render branches.
test.describe('Unified account mode', () => {
  test.skip('hides spot↔perp transfer entry points on the trading page — pending wallet-connect fixture (stubs keep wagmi disconnected, so the userAbstraction fetch never fires)', async () => {})
  test.skip('hides the "Perps ⇄ Spot" button in the Portfolio header — pending wallet-connect fixture (Portfolio page renders WalletNotConnected before PortfolioHeader when disconnected)', async () => {})
})

test.describe('Standard account mode (regression)', () => {
  test('keeps the trading-page transfer button rendered', async ({ page }) => {
    // Default fixture returns "default" from userAbstraction, which the store
    // normalises to "disabled" (standard). This test guards against the
    // unified branch bleeding into the standard render path.
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Order Book' })).toBeVisible()
    await expect(page.getByTestId('overview-transfer')).toHaveCount(1)
  })
})
