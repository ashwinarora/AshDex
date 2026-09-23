import { expect, test, installConnectedWallet, installDripResponse } from './fixtures/withStubs'

test.describe('Testnet faucet', () => {
  test('claims successfully and always links to hltools.tech', async ({ page }) => {
    await installConnectedWallet(page)
    await installDripResponse(page, '')
    await page.goto('/')

    await page.getByTestId('faucet-button').click()

    const modal = page.getByTestId('faucet-modal')
    await expect(modal).toBeVisible()
    // The link is part of the modal chrome, not the result state — it must be
    // there before any claim is attempted.
    const promo = page.getByTestId('faucet-hltools-link')
    await expect(promo).toHaveAttribute('href', 'https://hltools.tech')
    await expect(promo).toContainText('Open hl-tools')

    await page.getByTestId('faucet-claim').click()
    await expect(page.getByTestId('faucet-success')).toContainText('1,000 mock USDC')
    await expect(page.getByTestId('faucet-hltools-link')).toBeVisible()
  })

  test('shows the once-per-address refusal', async ({ page }) => {
    await installConnectedWallet(page)
    await installDripResponse(page, 'Drip already claimed')
    await page.goto('/')

    await page.getByTestId('faucet-button').click()
    await page.getByTestId('faucet-claim').click()

    await expect(page.getByTestId('faucet-error')).toContainText('already claimed')
    await expect(page.getByTestId('faucet-error')).toContainText('one-time per address')
  })

  test('shows the missing-mainnet-account refusal', async ({ page }) => {
    await installConnectedWallet(page)
    await installDripResponse(
      page,
      'Cannot claim drip because user 0x1111111111111111111111111111111111111111 does not exist on mainnet.'
    )
    await page.goto('/')

    await page.getByTestId('faucet-button').click()
    await page.getByTestId('faucet-claim').click()

    await expect(page.getByTestId('faucet-error')).toContainText('Deposit on mainnet')
  })
})
