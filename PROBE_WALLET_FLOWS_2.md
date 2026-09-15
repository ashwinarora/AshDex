# Wallet-Flow Probe #2 (Adversarial) — 2026-09-13

Follow-up to `PROBE_WALLET_FLOWS.md`. Round 1 walked the happy path. This round pokes at every input the way a distracted or malicious user might. State at start = state at end of round 1 (Spot $158, Perps $50, agent enabled).

Screenshots: `qa-screenshots/probe2-2026-09-13/`.

## TL;DR — 9 bugs, 4 UX gaps

Almost every numeric input in the app is loose: leverage, transfer amount, withdraw amount, and send address can all be filled with values that pass client validation but shouldn't. The order form is stricter (empty and 0 are caught) but the percent field displays >100%, and error surfaces are generic ("Something went wrong, check the console"). Silent-cancel on wallet rejection is app-wide.

## Bugs (functional)

### B3 — Percent-of-max textbox shows values >100% instead of clamping

Set order size to `10` BTC (max is 0.01429 BTC). The Long button is correctly disabled (good) but the "Order size percent of max" field displays **`70000.00`**. The slider correctly pegs at 100%, but the text field is unbounded.

`qa-screenshots/probe2-2026-09-13/01-size-oversize-pct-70000.png`

### B4 — Leverage textbox has no validation

Typed into the Leverage number input directly:

| Input | Accepted?                                     |
| ----- | --------------------------------------------- |
| `999` | ✅ accepted (max is 40x for BTC)              |
| `41`  | ✅ accepted (1 over max)                      |
| `0`   | ✅ accepted (nonsense)                        |
| `-5`  | ✅ accepted (negative)                        |
| `abc` | ✅ accepted (letters — value stored as "abc") |
| `3.5` | truncated to `3` (integer-only silently)      |

The slider is properly clamped 1–40, but the text field is not. Downstream the leverage is sent as-is to HL's `updateLeverage` call.

### B5 — Transfer dialog accepts negative and over-max amounts

Available balance is $158 Spot. In the transfer-to-Perp dialog:

| Amount                | Transfer button |
| --------------------- | --------------- |
| `0`                   | disabled ✅     |
| `-10`                 | **enabled** ❌  |
| `500` (over $158 max) | **enabled** ❌  |
| `999999999`           | **enabled** ❌  |

Clicking through would send an invalid signed payload to HL which will reject it — but the user gets prompted to sign nonsense, and if they don't read Rabby carefully they might approve a $999M "transfer" that fails on the server side. Cheap fix: gate the button on `0 < amt <= availableBalance`.

### B6 — Send dialog does no address validation

Any string in the destination field enables the Send button as long as an amount is present:

| Destination                      | Send button              |
| -------------------------------- | ------------------------ |
| empty                            | disabled ✅              |
| `0x1234` (4 hex chars)           | **enabled** ❌           |
| `0xZZZZgggg…` (40 non-hex chars) | **enabled** ❌           |
| valid `0x…dEaD`                  | enabled ✅               |
| own address (self-send)          | enabled — **no warning** |

Amount validation _is_ enforced here (over-max and negative are both blocked, unlike Transfer — inconsistent) but address is completely unchecked. Hyperliquid `usdSend` will reject a malformed address, but again: user signs first, learns second. And self-send with no warning is a common way to accidentally lose funds if the user typed their own address thinking it was a friend's.

### B7 — Withdraw dialog accepts any amount, primary button never disables

`Withdraw to Wallet` copy says "A $1 USDC fee will be deducted". The input accepts `0`, `-1`, `99999`, and `0.5` (net-negative after the $1 fee); the primary button (`Switch to Arbitrum`) stays enabled in all cases. The button doesn't even change label based on validity.

### B8 — Post-Only order returns generic error, not the actual reason

With Post-Only pressed and a limit price above the ask (marketable buy), clicking Long triggers HL to reject with something like _"Post only order would have immediately matched"_. The toast shown is instead:

> **"Something went wrong, check the console or contact support"**

This is one of the most common Post-Only mistakes and should surface HL's specific message. Same generic toast likely fires for other rejection classes (min notional, tick size, insufficient margin) — user has no way to self-diagnose. `qa-screenshots/probe2-2026-09-13/02-postonly-generic-error.png`

### B9 — No warning when a limit price will fill immediately as taker

Setting a limit **buy** at $80,000 (ask ~$77,130) shows no warning at all — the form just displays Order Value $40 and Long is enabled. If the user clicks, this fills as taker at whatever price the book gives, potentially far worse than the $80k they typed. Every mature order form (Hyperliquid's own, dYdX, GMX) shows a "This limit will execute immediately" hint.

### B10 — `/UNKNOWN` asset routes render a broken shell with `$NaN` and `Infinity`

Navigated to `http://localhost:3000/NOTACOIN`:

- Header: `NOTACOIN-USD`
- Order book: empty
- Price ticker row: missing
- Leverage slider: pegged with `valuemin=1 valuemax=1` and **two "1x" radios both `checked`**
- `Position Size Max = Infinity NOTACOIN`
- `Margin Required: $NaN`
- Order form is fully interactive; Long button is (thankfully) disabled

Expected: 404 or redirect to `/BTC`. `qa-screenshots/probe2-2026-09-13/03-notacoin-nan.png`

### B11 — Wallet-rejected signature = silent failure, no toast

Round 1 already noted place/cancel don't toast on success. Round 2 confirms the same for the _failure_ path: clicked Transfer → Rabby popup opened → clicked Cancel in Rabby → dialog closes with **no toast, no error surface**. The Round 1 pattern of "Failed to switch to Arbitrum network." (which _does_ show on rejection) is the outlier; the transfer path silently swallows the rejection.

### B12 — Long button not disabled during pending submit

Rapid-clicked the Long button 5× via `element.click()` synchronously. All 5 clicks fired (no `disabled` between them). Zero orders ended up placed (probably HL nonce-dedupes or React re-renders quickly enough to disable _before_ the second sync click on a real user's mouse), but the button gives no visual "submitting…" state either — no spinner, no disable, no toast — so a user with a slow network will legitimately double-tap and either see nothing happen or land two positions.

## UX gaps (non-bugs)

- **UX-6 — TP/SL dialog has no Cancel/Close button.** Only a `Set TP/SL` button. Escape works, but there's no visible way out except to submit or press Esc — bad accessibility.
- **UX-7 — No inline "insufficient margin" text when order size exceeds max.** With size=10 BTC, the Long button greys out silently. First-time users won't know why.
- **UX-8 — Send/Transfer dialogs let you type spaces around numbers ("`0.0005`") and silently reject them.** No hint that the value was dropped. (Both Send/Transfer amount and order size behave this way.)
- **UX-9 — Withdraw dialog doesn't preview net amount received.** Copy says "$1 USDC fee will be deducted from the withdrawal amount" but there's no "You'll receive: $X" line. Combined with B7, a user could withdraw $0.50 and receive -$0.50.

## Not bugs, worth noting

- Order size input **does** reject: letters (`abc`), scientific notation (`1e-5`), multiple dots, commas, values below step size (`0.0000001`), and negative sign. Numeric filter is solid on the _order form_ — it just breaks down on Leverage, Transfer, Withdraw.
- Amount validation in the Send dialog **does** clamp negative and over-max — inconsistent with Transfer, which doesn't. Whichever validator that is, port it to Transfer + Withdraw.
- `Size=0` correctly disables Long. `Size=""` correctly disables Long. Only `Size=10` (over max) leaves the button in a disabled state without an error message; that's UX-7.

## State at end of probe

Spot $158, Perps $50, 0 open orders, 0 open positions, agent still valid. No funds burned during this round either.
