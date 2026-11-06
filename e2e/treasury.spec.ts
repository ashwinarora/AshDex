import { privateKeyToAccount } from 'viem/accounts'
import {
  expect,
  expectWalletConnected,
  installConnectedWallet,
  installTreasury,
  STUB_TREASURY,
  test,
  type StubExtraAgent
} from './fixtures/withStubs'

// Treasury mode: trade for a multisig through an agent key that lives in this
// browser and that the treasury's co-signers approve in hl-tools.

const SETUP_URL = `/treasury?network=testnet&treasury=${STUB_TREASURY.address}`
const DAY = 24 * 60 * 60 * 1000

// React Query re-reads on visibilitychange (its focus signal): the same thing
// a user returning from the hl-tools tab triggers.
const returnToTab = (page: import('@playwright/test').Page) =>
  page.evaluate(() => window.dispatchEvent(new Event('visibilitychange')))

test.describe('Treasury mode', () => {
  test('new key → waiting for approval → ready → trading for the treasury', async ({ page }) => {
    let listed: StubExtraAgent[] = []
    await installConnectedWallet(page)
    await installTreasury(page, () => listed)
    await page.goto(SETUP_URL)
    await expectWalletConnected(page)

    await expect(page.getByTestId('treasury-threshold')).toHaveText('2 of 3 signers')
    // The stub wallet (0x1111…) is not one of the treasury's signers.
    await expect(page.getByTestId('treasury-signer-status')).toContainText("You're not a signer")

    // a) no key in this browser
    await expect(page.getByTestId('treasury-state-noKey')).toBeVisible()
    await page.getByTestId('treasury-make-key').click()

    // b) waiting: the propose link carries the new key, its name and the days
    await expect(page.getByTestId('treasury-state-pending')).toBeVisible()
    const record = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
      `treasuryAgent_testnet_${STUB_TREASURY.address}`
    )
    expect(record.name).toBe(`ashdex ${record.address.slice(2, 6).toLowerCase()}`)
    await page.getByTestId('treasury-days').selectOption('30')
    const ask = new URL((await page.getByTestId('treasury-ask').getAttribute('href'))!)
    expect(ask.pathname).toBe('/multisig/propose')
    expect(Object.fromEntries(ask.searchParams)).toEqual({
      network: 'testnet',
      treasury: STUB_TREASURY.address,
      kind: 'approveAgent',
      agentAddress: record.address,
      agentName: record.name,
      agentDays: '30'
    })

    // The co-signers approve it in hl-tools; the trader comes back to the tab.
    listed = [
      { address: record.address, name: record.name, validUntil: Date.now() + 6 * DAY + 60_000 }
    ]
    await returnToTab(page)

    // c) ready → treasury mode on the trading screen
    await expect(page.getByTestId('treasury-state-ready')).toBeVisible()
    await page.getByTestId('treasury-start').click()
    await expect(page).toHaveURL(/\/$/)
    const banner = page.getByTestId('treasury-banner')
    await expect(banner).toHaveText(
      'Trading for 0x1464...233e (2 of 3) · your API wallet expires in 6 days'
    )
    await expect(banner).toHaveAttribute('data-tone', 'normal')
    await expect(page.getByTestId('header-treasury-chip')).toBeVisible()
    // The faucet would pay the wallet, not the treasury.
    await expect(page.getByTestId('faucet-button')).toHaveCount(0)

    // Treasury mode survives a reload.
    await page.reload()
    await expect(page.getByTestId('treasury-banner')).toContainText('expires in 6 days')

    // And the header takes the trader back to their own wallet.
    await page.getByTestId('header-wallet-button').click()
    await page.getByTestId('header-back-to-wallet').click()
    await expect(page.getByTestId('treasury-banner')).toHaveCount(0)
    await expect(page.getByTestId('faucet-button')).toBeVisible()
  })

  test('an expired key stops trading and asks for a new one', async ({ page }) => {
    // A key this browser already holds, approved earlier and now past validUntil.
    // Hyperliquid keeps listing expired agents, so expiry must come from validUntil.
    const privateKey = `0x${'22'.repeat(32)}` as const
    const address = privateKeyToAccount(privateKey).address
    const name = `ashdex ${address.slice(2, 6).toLowerCase()}`
    const expiredAt = Date.now() - 60_000
    await installConnectedWallet(page)
    await installTreasury(page, () => [{ address, name, validUntil: expiredAt }])
    await page.addInitScript(
      ({ treasury, record }) => {
        localStorage.setItem(`treasuryAgent_testnet_${treasury}`, JSON.stringify(record))
        localStorage.setItem('ashdexTreasuryMode', JSON.stringify({ network: 'testnet', treasury }))
      },
      {
        treasury: STUB_TREASURY.address,
        record: { privateKey, address, name, validUntil: expiredAt, createdAt: 1 }
      }
    )

    // Treasury mode restored from the last session: the banner stops trading.
    await page.goto('/')
    await expectWalletConnected(page)
    const banner = page.getByTestId('treasury-banner')
    await expect(banner).toHaveAttribute('data-tone', 'danger')
    await expect(banner).toContainText('past its expiry: trading is stopped here')

    // The banner leads to the setup page, which offers a new key under the same name.
    await page.getByTestId('treasury-banner-action').click()
    await expect(page.getByTestId('treasury-state-expired')).toContainText(
      'Hyperliquid may still accept it, so ask your co-signers to remove it in hl-tools'
    )
    const remove = new URL((await page.getByTestId('treasury-remove').getAttribute('href'))!)
    expect(Object.fromEntries(remove.searchParams)).toEqual({
      network: 'testnet',
      treasury: STUB_TREASURY.address,
      kind: 'removeAgent',
      agent: name
    })
    await page.getByTestId('treasury-make-key').click()
    await expect(page.getByTestId('treasury-state-pending')).toBeVisible()
    const ask = new URL((await page.getByTestId('treasury-ask').getAttribute('href'))!)
    expect(ask.searchParams.get('agentName')).toBe(name)
    expect(ask.searchParams.get('agentAddress')?.toLowerCase()).not.toBe(address.toLowerCase())
  })
})
