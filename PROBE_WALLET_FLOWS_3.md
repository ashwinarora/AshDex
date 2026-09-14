# Wallet-Flow Probe #3 (Deep Dive) — 2026-09-14

Third round. Focus: cross-check UI data against Hyperliquid REST + WebSocket, open a real position and manage it end-to-end, exercise every remaining UI surface, and verify the smells surfaced by a codebase-exploration agent.

Screenshots and scratch: `qa-screenshots/probe3-2026-09-14/`.

## Preamble — codebase map

Ran an `Explore` agent over `src/**`. It surfaced (verbatim, trimmed):

- **Routes**: `/`, `/[asset]`, `/portfolio`, `/spot`, `/spot/[asset]` — all render the same `Trading` component; no guard on invalid asset (confirmed: `/NOTACOIN` renders broken shell, Round 2 B10).
- **Every write path swallows SDK errors** into `"Something went wrong, check the console or contact support"`:
  - `src/components/Trading/PlaceOrderBox/components/placePerpOrder.ts:144`
  - `src/components/Trading/PlaceOrderBox/components/placeSpotOrder.ts` (end)
  - `src/components/UserData/component/SendModal.tsx:91,109`
  - `src/components/DepositWithdraw/WithdrawModal.tsx:77`
  - `src/components/UserData/component/transfers/spot-to-perp.tsx:70`
- **TODO comments** (`placePerpOrder.ts:144`, `Scale.tsx:198`, `ScaleSpot.tsx:155`) all say "handle status of all orders" — only `statuses[0]` is processed. Multi-leg orders (main + TP/SL, or Scale) drop partial status info.
- **`parseFloat(amount) === 0` disable guards** in `WithdrawModal.tsx:155` and `spot-to-perp.tsx:176` don't check `Number.isFinite`, so `"abc"` → `NaN` → `NaN === 0` is false → button enabled. **Verified in browser below (B13).**
- **Slippage input** in `MarketOrder.tsx:288` accepts out-of-range while typing (clamp is on blur only). **Verified below (B16).**
- **WebSocket reconnect logic** flips `isWebSocketConnected` on message arrival but never on connection state change (`HyperliquidStore.ts:226,250,307,315,323`). If the socket drops silently and no messages arrive, the app UI shows "Online" indefinitely. Confirms Round 1 comment: no explicit reconnect/backoff.
- **`Number()` / `parseFloat()` without `isFinite` checks** in `LimitOrder.tsx:89,159`, `MarketOrder.tsx:285,288`, `AmountInput.tsx:87,96`.
- **`as any` casts** in `Chart.tsx:142,317,320`, `Header.tsx:76`, `DepositsWithdrawals.tsx:177`.

## Data cross-check — REST + WS

Verified the wallet address by reading `window.ethereum.selectedAddress` from the browser (the "0x7B67…496E" header truncation collides with several possible addresses — I had it wrong at first). Real address: `0x7b676e8794d69c2e92656daa0c6b4b4bd9c3496e`.

Fetched HL testnet REST directly:

| Field | HL API | UI |
| --- | --- | --- |
| Perps `accountValue` | `49.98943` | `$49.99` ✅ |
| Perps `withdrawable` | `48.44071` | `$48.44` (Balances → Available Balance) ✅ |
| Perps `totalMarginUsed` | `0.77436` | `$0.77` on the position row ✅ |
| Spot USDC total | `158.0` | `$158.00` ✅ |
| Position `szi` | `0.0002 BTC` | `0.0002 BTC` ✅ |
| Position `entryPx` | `77454.0` | `$77,454.00` ✅ |
| Position `unrealizedPnl` | `-0.002` | `-$0.00` (rounded) ⚠️ (see UX below) |
| Fee tier `userCrossRate` | `0.00045` | `0.045%` ✅ |
| Fee tier `userAddRate` | `0.00015` | `0.015%` ✅ |
| SOL `markPx` | `101.13` | favorites bar showed `SOL 0.01%` (24h) ✅ |

**Verdict**: every displayed number I could sample matches the source of truth. No calculation drift. UI reads `withdrawable` from HL rather than deriving `accountValue - marginUsed` — that's correct because HL applies a maintenance-margin buffer.

## Full position lifecycle (real money)

Placed a **live 0.0002 BTC market long at 20x cross** (`$15.49` notional, `$0.77` margin). Toast: `"0.0002 BTC long at average price of 77454.0"`. HL confirmed the fill immediately.

- Position row: value, size, entry, mark, funding, unrealized PnL, liq price, margin — all live-updating over the WS `webData2` stream. Perps balance dropped $50 → $49.99 for taker fee.
- Opened the position's **Set TP/SL** dialog (this one *does* have a Close button — the pre-order TP/SL dialog does not, confirms UX-6 from Round 2). See B14 below for a validation bug.
- Reduce Only + Long direction with an existing long position: **button stays enabled** — see B15.
- Closed via **More → Close on Market**. Modal showed `"Estimated closed PnL (without fees): $-0.02"`, Confirm. Toast: `"Position Closed Successfully"`. Final balance `$49.97` — the $0.02 total slippage + fees, matches the estimate.
- Note: `place-order` still emits **no toast** on success (Round 2 UX-1), but `close-position` does. Inconsistent.

## Bugs (functional)

### B13 — Transfer/Withdraw amount input has no NaN guard

Confirms the Explore agent's `parseFloat("abc") === 0` smell. Live browser test on the transfer-to-Perp dialog:

| Input | Accepted? | Transfer button |
| --- | --- | --- |
| `abc` | ✅ | **enabled** ❌ |
| `NaN` | ✅ | **enabled** ❌ |
| `Infinity` | ✅ | **enabled** ❌ |
| `1e5` | ✅ | **enabled** ❌ (`1e5` = 100k, way over max) |
| `.` | ✅ | **enabled** ❌ |
| `0.` | ✅ | disabled ✅ |
| `.0` | ✅ | disabled ✅ |

Fix: change `parseFloat(amount) === 0` to `!Number.isFinite(parseFloat(amount)) || parseFloat(amount) <= 0 || parseFloat(amount) > max`.

### B14 — Set-TP/SL for a position allows inverted stop/take values

For a live 0.0002 BTC **long** at entry $77,454, opened Set-TP/SL and set:

- **TP Price = 1** (should be > entry for a long)
- **SL Price = 200000** (should be < entry for a long)

Dialog computed and displayed:
- `Expected profit: -15.49` (i.e., a $15.49 **loss**)
- `Expected loss: -24.51` (i.e., a $24.51 **profit**)

**Confirm button was ENABLED.** The math is done correctly (negative-signed), but there's no gate on submit. If a user confirms this by accident, HL will trigger both immediately at market — TP@1 fills instantly at market price (partial loss, then the SL keeps the rest running until price hits 200k which never happens, effectively closing the position at a total loss due to the "TP" trigger).

Fix: require `tp > entry > sl` for longs and inverse for shorts before enabling Confirm; or at least surface a red warning "Expected profit is negative — this will close at a loss."

### B15 — Reduce-Only + same-direction-as-position enables Long button

With an open **long** position, toggled **Reduce Only** + kept direction on **Long**. Set size 0.0001, Long button is **enabled** with Margin `$0.39` Order Value `$7.74`. Clicking would submit a reduce-only buy that HL will reject (can't reduce a long by buying more).

Expected: with a long position, reduce-only should only allow **Short** direction (and vice-versa). Either hide the invalid direction or disable the button with a hint.

### B16 — Slippage popover accepts >100 and negative

Direct value writes into the slippage number input:

| Input | Accepted? |
| --- | --- |
| `99` | ✅ |
| `100` | ✅ |
| `200` | ✅ (bug: slippage cap is 100%) |
| `-5` | ✅ (bug) |
| `0` | ✅ |
| `abc` | rejected, reset to `0` |

The Explore agent flagged `Math.min(100, …)` runs only on blur, not on change. In the interim, submitting a market order carries the raw string as slippage.

### B17 — Spot amount input aria-label is `"Order size in @1035"`

`@1035` is Hyperliquid's internal token index for HYPE. The visible dropdown shows `HYPE` correctly, but the input's `aria-label` uses the raw token id, breaking screen readers. Presumably a template like `\`Order size in ${symbolOrIndex}\`` where the fallback symbol is the internal id.

## Non-bug observations

- **WS resilience**: during the run the browser console recorded `WebSocket connection to 'wss://api.hyperliquid-testnet.xyz/ws' failed × 80` plus `ERR_INTERNET_DISCONNECTED` (the MCP-controlled Brave hit a network blip). The app kept updating prices once the network returned; final numbers were exact. Auto-recovery works even though there's no explicit reconnect UI.
- **Cross Margin Ratio staleness**: right after close, the sidebar briefly showed `Cross Margin Ratio 0.39%` while everything else showed `0.00`. Self-corrected within one WS tick. Minor cosmetic race.
- **Asset selector search** is case-insensitive, trims whitespace, and does not evaluate `<script>` — good.
- **Chart timeframes** (1m/5m/15m/1h/4h/1d/1w) all switch without visible error.
- **Bridge** dialog opens with a LI.FI widget embed. Not exercised past load (needs cross-chain funds).
- **Portfolio page** numbers all match HL: `Total Equity $207.99` = `$49.99 Perps + $158 Spot`, `30 Day Volume $15.49` = my single fill, `Max Drawdown -0.02%` reflects the position's peak-to-trough.
- **PortfolioStats** subscribes to the full `sdkInfoClient` (per the Explore agent) without `useShallow`; noted for perf review but I didn't measure re-render count.
- **Rounding artifact**: `-$0.002` PnL displays as `-$0.00` on the position row. The negative sign on a `.00` is jarring. Consider `Math.abs(pnl) < 0.005 ? "$0.00" : formatted`.

## Confirmed Round-2 findings under new tests

- **B4 (Leverage unclamped)** — re-verified live: `999`, `41`, `-5`, `abc` all accepted in the leverage textbox.
- **B8 (Generic error toast)** — architecture confirms `catch (e) { toast.error("Something went wrong…") }` at 6 sites. Fix is a single toast helper that surfaces `e?.response?.data` or the SDK's error message.
- **B12 (No submit-lock on Long)** — architecture confirms `OrderButton` gates only on `isInvalid || isError`, no `isPending`.
- **UX-6 (TP/SL modal lacks Close)** — the *pre-order* TP/SL dialog still has no Cancel button; the *from-position* Set TP/SL dialog does. Fix is trivial (add the Close button to the pre-order variant).

## Suggested priorities

Ranked by user harm × fix cost:

1. **B13 + B5 + B6 + B7** (amount/address gates): one shared validator helper covers Transfer, Send, Withdraw. High-harm, low-cost.
2. **B8** (generic error toast): swap the swallow for `toast.error(e?.data?.msg ?? e.message ?? "…")` at all 6 sites.
3. **B14** (inverted TP/SL): add sign check; block Confirm.
4. **B15** (reduce-only mismatch): disable direction that can't reduce.
5. **B4** (leverage clamp): 1-liner `Math.min(maxLev, Math.max(1, parseInt(x) || 1))` on input.
6. **B16** (slippage clamp on change, not blur).
7. **B9 + B10 + B17** (limit-taker warning, /UNKNOWN 404, aria-label fix): polish.

## Final state

Position closed. Spot `$158`, Perps `$49.97` (2¢ spent on fees + tiny slippage across a single open/close). SOL still in favorites bar. Agent still valid. No open orders. Round 3 spent about $0.03 total.
