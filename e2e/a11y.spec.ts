import { expect, test } from './fixtures/withStubs'

test.describe('Accessibility — Group H1', () => {
  test('BUG-031: orderbook group-size button has an accessible name beyond its value', async ({
    page
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('order-book-rows')).toBeVisible({ timeout: 15_000 })
    // The button currently exposes its own value ("1", "0.01", etc.) as its
    // accessible name — a screen-reader user has no idea what "1" means.
    // Fix: add aria-label describing the control ("Group size", "Precision", etc.).
    await expect(
      page.getByRole('button', { name: /group size|precision|tick size/i })
    ).toBeVisible()
  })

  test('BUG-032: three orderbook layout radios all have non-empty accessible names', async ({
    page
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('order-book-rows')).toBeVisible({ timeout: 15_000 })
    const orderBook = page.getByTestId('order-book')
    // The layout ToggleGroup is the only radiogroup inside the order book.
    const allRadios = orderBook.getByRole('radio')
    const namedRadios = orderBook.getByRole('radio', { name: /.+/ })
    await expect(allRadios).toHaveCount(3)
    // Currently zero of the three have names — accessible name defaults to
    // the icon-only content. Fix: add aria-label per item.
    await expect(namedRadios).toHaveCount(3)
  })

  test('BUG-049: Slippage popover dialog references a description via aria-describedby', async ({
    page
  }) => {
    await page.goto('/')
    await expect(page.getByTestId('order-book-rows')).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Slippage' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    // Radix warns "Missing Description for DialogContent" when the dialog has
    // no aria-describedby. Fix: wrap the "Max slippage only affects…" copy in
    // <PopoverDescription> / <DialogDescription>.
    await expect(dialog).toHaveAttribute('aria-describedby', /.+/)
  })

  for (const path of ['/', '/spot']) {
    test(`BUG-051: form fields on ${path} have both a label affordance and an id/name`, async ({
      page
    }) => {
      await page.goto(path)
      // Balances tab renders reliably on both / and /spot as a hydration signal.
      await expect(page.getByRole('radio', { name: /Balances/ })).toBeVisible({ timeout: 15_000 })
      // Chrome DevTools flags two distinct rules:
      //  (a) "No label associated with a form field" — satisfied by aria-label,
      //      aria-labelledby, or an associated <label>.
      //  (b) "A form field element should have an id or name attribute" —
      //      strictly wants an id or name attribute (for autofill, password
      //      manager grouping, and form submission).
      // Both rules matter for accessibility + user-agent integration.
      const results = await page.evaluate(() => {
        const skipTypes = new Set(['hidden', 'submit', 'button', 'reset', 'image', 'file'])
        const fields = document.querySelectorAll('input, textarea, select')
        const noLabel: string[] = []
        const noIdOrName: string[] = []
        fields.forEach((f) => {
          const type = f.getAttribute('type') || 'text'
          if (skipTypes.has(type)) return
          const snippet = (f as HTMLElement).outerHTML.slice(0, 120)
          // Label check
          let hasLabel = false
          if (f.getAttribute('aria-label')) hasLabel = true
          if (f.getAttribute('aria-labelledby')) hasLabel = true
          if (f.id && document.querySelector(`label[for="${f.id}"]`)) hasLabel = true
          let p = f.parentElement
          while (p && p !== document.body && !hasLabel) {
            if (p.tagName === 'LABEL') hasLabel = true
            p = p.parentElement
          }
          if (!hasLabel) noLabel.push(snippet)
          // id/name check
          if (!f.id && !f.getAttribute('name')) noIdOrName.push(snippet)
        })
        return { noLabel, noIdOrName }
      })
      expect(
        results.noLabel,
        `unlabeled inputs on ${path}:\n${results.noLabel.join('\n')}`
      ).toEqual([])
      expect(
        results.noIdOrName,
        `inputs on ${path} missing id or name:\n${results.noIdOrName.join('\n')}`
      ).toEqual([])
    })
  }
})
