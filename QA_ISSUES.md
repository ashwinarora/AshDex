# AshDex — QA Findings

Manual QA pass on the AshDex frontend against **Hyperliquid testnet**, run on 2026-09-08 / 2026-09-09 from a wallet with ~$210 USDC spot on testnet.

Each issue has a stable ID (`BUG-XXX`) so you can point at a specific one later ("fix BUG-014") and I can re-open Chrome DevTools to reproduce it with fresh context.

Screenshots referenced below were captured during the original QA session and live in `qa-screenshots/` **locally only** (gitignored — 19 MB of archival PNGs, many of which no longer match the current UI after fixes). Re-capture via Chrome MCP if needed.

---

## Contents

- [Severity legend](#severity-legend)
- [How to use this document with Claude](#how-to-use-this-document-with-claude)
- [Areas tested / not tested](#areas-tested--not-tested)
- Findings
  - [Trading correctness (numerical / financial)](#trading-correctness-numerical--financial)
  - [Order lifecycle (place / cancel / close)](#order-lifecycle-place--cancel--close)
  - [Order form UX](#order-form-ux)
  - [TP/SL](#tpsl)
  - [Markets / asset selector](#markets--asset-selector)
  - [Spot page](#spot-page)
  - [Order book](#order-book)
  - [Portfolio](#portfolio)
  - [Transfer (spot ⇄ perps)](#transfer-spot--perps)
  - [Chart (TradingView)](#chart-tradingview)
  - [Error handling / feedback](#error-handling--feedback)
  - [Console noise, config, and code hygiene](#console-noise-config-and-code-hygiene)
  - [Accessibility / hydration](#accessibility--hydration)
  - [Minor polish](#minor-polish)

---

## Severity legend

- **BLOCKER** — user-visible incorrect financial number, unusable core flow (place / cancel / close), or data-integrity issue.
- **MAJOR** — flow works but misleads the user, silently swallows an error, or shows the wrong data prominently.
- **MINOR** — usability / UX gap, layout, copy, or edge-case handling.
- **POLISH** — visual polish, dev noise, code hygiene.

## Needs discussion before we can write tests

Twenty-two bugs are **paused** — no tests will be written against them until we agree on the expected behavior, because the observed behavior might be legitimate, the fix is a product decision, or the fix requires infra we haven't built yet:

- **BUG-004** — Chart title `undefined · Hyperliquid, 1h`. Fires as a TradingView `SymbolInfo` validation warning inside the TV iframe. Stubbed Playwright environment doesn't load the TradingView script, so the warning can't be reproduced deterministically — we'd need to load the TV widget in tests before writing a real regression guard.
- **BUG-005** — Chart tz `Etc/GMT+4` unsupported. Same TradingView-inside-iframe path as BUG-004; blocked on the same fixture extension.
- **BUG-006** — 24h Change header vs chart legend disagree. Different windows (24h absolute vs current bar) can legitimately disagree, or the header label is misleading.
- **BUG-013** — Default slippage 8% isn't in the preset row so no radio shows a "checked" state. Fix requires a design call: (a) add a "Custom" indicator, (b) add 8% to the presets, (c) accept the current UX as-is.
- **BUG-017** — Isolated margin has no visible margin input. Requires product decision on whether to expose it (adds real UI/state) or leave implicit (`size × price / leverage`).
- **BUG-024** — Sortable columns. Investigation showed sorting is already implemented (`enableSorting: true` on every column, `onClick` handler on TableHead). Original QA observation was wrong. Verify visually before deleting.
- **BUG-027** — Spot chart blank on first render. Race between TradingView widget mount and datafeed readiness. Needs timing-controlled WS fixture + iframe-content assertions; current fixture sends all frames instantly, which is the opposite of the race condition.
- **BUG-028** — Spot orderbook shows spread in mid-price slot on cold render. Same category as 027 — state-transition race on `allMids['@N']`. Needs timing control.
- **BUG-034** — Portfolio Performance chart is empty. Could be "no data yet" (correct) or a broken feed.
- **BUG-042** — Reown project ID not configured. Requires `NEXT_PUBLIC_REOWN_PROJECT_ID` env var or gating the Reown SDK init on presence of the var. Stub doesn't exercise Reown init, so no regression test possible.
- **BUG-043** — AppKit SDK outdated. `@reown/appkit` is a transitive-of-transitive dep; forcing an upgrade cascades to wagmi/viem bumps that break the app (attempted and reverted). Wait for upstream wagmi to bump.
- **BUG-044** — `unload is not allowed`. Fires from Reown/wagmi internals only when they actually init. Same repro-limitation category as 042.
- **BUG-047** — 400/403 network responses. 403 is Reown remote-config (correlated with 042). 400 unclassified. Both require Reown init to reproduce.
- **BUG-018** — Feature request: add "expected fill price" preview for market orders. Product/UX decision on what to display.
- **BUG-036** — Feature request: add tooltip explaining locked/available balance. Product/UX decision.
- **BUG-038** — Feature request: cancel + timeout for in-progress transfer. Also needs wallet-reject detection (signing infra).
- **BUG-040** — Position line cleanup on TradingView chart. Same iframe-locked category as BUG-004/005.
- **BUG-055** — Feature request: prefill Report Bug link with URL/wallet/version. External Google Form; can't test its response.
- **BUG-056** — Layout: two overlapping equity blocks in right sidebar. Design/redesign call.
- **BUG-048** — Hydration mismatch on `/` and `/spot`. Only reproduces when wagmi restores a previously-connected wallet state on client that the server didn't have. Current stub keeps wagmi disconnected on both sides — no mismatch triggers. Fix requires stub to auto-connect wagmi from the injected ethereum provider.
- **BUG-050** — Radix aria-hidden on focused ancestor warning. Fires only in a specific dialog-open-with-focus-in-hidden-ancestor scenario that our current interactions don't reliably reach. Needs interaction scripting to reproduce.
- **BUG-052** — Cross Account Leverage shows `0.10x` while the only position is Isolated. Might be a legitimate "notional / equity ratio regardless of margin mode" or double-counting.

Each is tagged inline with `⏸ NEEDS-DISCUSSION`.

## Groups (Stage 6 sequencing)

Bugs are tackled in **groups** in Stage 6 of the testing project, not one-at-a-time. Grouping is by shared _fix surface + test surface_ — bugs in a group share code paths, share a Playwright fixture story, and are usually cheaper to fix together. Every bug appears in exactly one group.

| Group | Theme                                                                     | Bugs                                                                                                                                              | Layer(s)             | Blocked on infra?                                          |
| ----- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------- |
| **A** | Pre-order preview math — everything the PlaceOrderBox shows before submit | 011, 012 now; 001 + 014 deferred to after wallet-connect infra                                                                                    | unit + e2e           | Partial — 001, 014 need `isTradingEnabled=true` in fixture |
| **B** | Order lifecycle / silent failures — place, cancel, toast                  | 007, 008, 009, 010, 016 (rollup: 041)                                                                                                             | unit + e2e           | **Yes — needs viem signing extension**                     |
| **C** | Market list / meta filtering — asset selector                             | 002 + 003 collapsed into whitelist-removal cleanup; 022 remains; 024 → J                                                                          | unit + e2e           | No                                                         |
| **D** | Price formatting consistency — sig-figs, tick-size, display               | 023 (partial fix landed), 030, 035, 053                                                                                                           | unit only            | No                                                         |
| **E** | TP/SL — pre-order and post-position                                       | 019, 020, 021                                                                                                                                     | unit + e2e           | **Yes — needs open position → needs signing**              |
| **F** | Spot page — spot-specific                                                 | 025, 026, 029 + spot empty-search follow-up (from C); 027, 028 → J                                                                                | unit + e2e           | No                                                         |
| **G** | Console noise, config, dev hygiene                                        | Fixed source-hygiene: 045, 046. Reset + rest → J: 042, 043, 044, 047 — need Reown init to reproduce.                                              | source hygiene       | 042/043/044/047 blocked on Reown init                      |
| **H** | Accessibility / hydration / labels                                        | H1 done: 031, 032, 049 (partial), 051, 054 + 015 (closed with 029). H2 → J: 004 (dup: 039), 005, 048, 050 — cannot reproduce under current stubs. | unit (one) + e2e axe | H2 blocked on stub infra                                   |
| **I** | Transfer + feature requests + misc                                        | Fixed: 033, 037. → J: 018, 036, 038, 040, 055, 056 (feature requests / design calls / iframe-locked / signing infra).                             | mixed; mostly manual | Feature-request bulk paused                                |
| **J** | ⏸ Paused — awaiting product decisions or infra                           | 004, 005, 006, 013, 017, 018, 024, 027, 028, 034, 036, 038, 040, 042, 043, 044, 047, 048, 050, 052, 055, 056                                      | —                    | See "Needs discussion" above                               |

Total 54 live bugs mapped (56 IDs; 039 duplicates 004; 041 is a rollup of 007+008).

**Recommended Stage 6 execution order** (rationale: build 6 groups of test/fix experience with the existing fixtures before extending `window.ethereum` for signing, so we know exactly what shape the signing helper needs):

1. **A** (011+012 only) → 2. **C** → 3. **D** → 4. **F** → 5. **H** → 6. **G** → 7. Extend fixture: fake wagmi connection + agent-approval + viem signing → 8. **A remainder** (001+014) → 9. **E** → 10. **B** → 11. **I** (individually, mostly manual/feature).

Group **J** stays paused.

## Progress

Living status table — kept in sync as each fix lands. Legend: ✅ fixed · ⏳ in progress · ⏸ paused (see "Needs discussion") · ⬜ open · 🔁 duplicate.

| ID      | Status            | Notes                                                                                                                                                                         |
| ------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BUG-001 | ⏳ partial        | 3 unit regression guards landed (Stage 3). E2e deferred to post-wallet-connect infra step.                                                                                    |
| BUG-002 | ✅ fixed          | Group C — `derivePerpsMarketList` filters `!isDelisted`.                                                                                                                      |
| BUG-003 | ✅ fixed          | Group C — whitelist deleted; full universe now shown.                                                                                                                         |
| BUG-004 | ⏸ paused         | J — needs TradingView-loaded fixture to reproduce                                                                                                                             |
| BUG-005 | ⏸ paused         | J — needs TradingView-loaded fixture to reproduce                                                                                                                             |
| BUG-006 | ⏸ paused         | J — needs discussion                                                                                                                                                          |
| BUG-007 | ⬜ open           | Group B — needs signing infra                                                                                                                                                 |
| BUG-008 | ⬜ open           | Group B — needs signing infra                                                                                                                                                 |
| BUG-009 | ⬜ open           | Group B (feature request)                                                                                                                                                     |
| BUG-010 | ⬜ open           | Group B (feature request)                                                                                                                                                     |
| BUG-011 | ✅ fixed          | Group A — `onBlur` clamp in LeverageMargin.                                                                                                                                   |
| BUG-012 | ✅ fixed          | Group A — `onBlur` clamp in MarketOrder slippage input.                                                                                                                       |
| BUG-013 | ⏸ paused         | J — needs discussion                                                                                                                                                          |
| BUG-014 | ⏳ deferred       | Group A remainder — after wallet-connect infra                                                                                                                                |
| BUG-015 | ✅ fixed          | Closed alongside BUG-029 — `Fees` is shared between perps and spot.                                                                                                           |
| BUG-016 | ⬜ open           | Group B                                                                                                                                                                       |
| BUG-017 | ⏸ paused         | J — needs discussion                                                                                                                                                          |
| BUG-018 | ⏸ paused         | J — feature request (expected fill preview)                                                                                                                                   |
| BUG-019 | ⬜ open           | Group E — needs signing infra                                                                                                                                                 |
| BUG-020 | ⬜ open           | Group E — needs signing infra                                                                                                                                                 |
| BUG-021 | ⬜ open           | Group E — needs signing infra                                                                                                                                                 |
| BUG-022 | ✅ fixed          | Group C — empty state added to PerpsTable. Follow-up: SpotTable in Group F.                                                                                                   |
| BUG-023 | ✅ fixed          | Stage 3 — `getFormattedPrice` delegates to `formatPrice`.                                                                                                                     |
| BUG-024 | ⏸ paused         | J — already implemented; verify visually                                                                                                                                      |
| BUG-025 | ✅ fixed          | Group F — SpotSelector contract link now branches on `isTestnet`.                                                                                                             |
| BUG-026 | ✅ fixed          | Group F — Positions tab hidden on spot page in UserData tabs array.                                                                                                           |
| BUG-027 | ⏸ paused         | J — needs timing-controlled WS fixture                                                                                                                                        |
| BUG-028 | ⏸ paused         | J — needs timing-controlled WS fixture                                                                                                                                        |
| BUG-029 | ✅ fixed          | Group F — Fees line now labels `Taker X% · Maker Y%`.                                                                                                                         |
| BUG-030 | ✅ fixed          | Group D — Amount cell now uses `ReactiveText precision={4}` matching Total column.                                                                                            |
| BUG-031 | ✅ fixed          | Group H1 — `aria-label="Group size"` on precision dropdown button.                                                                                                            |
| BUG-032 | ✅ fixed          | Group H1 — `aria-label` per layout radio (`Full order book` / `Buys only` / `Sells only`).                                                                                    |
| BUG-033 | ✅ fixed          | Group I — `computeMaxDrawdownPercent` in `portfolioStats.ts` uses peak-to-trough, skips leading zeros, returns null → renders `—` on degenerate series.                       |
| BUG-034 | ⏸ paused         | J — needs discussion                                                                                                                                                          |
| BUG-035 | ✅ fixed          | Group D — `formatTimestamp` in `format.ts`, 4 callers migrated, ISO `YYYY-MM-DD HH:mm:ss UTC`.                                                                                |
| BUG-036 | ⏸ paused         | J — feature request (tooltip)                                                                                                                                                 |
| BUG-037 | ✅ fixed          | Group I — trading-page OverviewBox passes `defaultToPerp={true}`; testids on both direction indicators.                                                                       |
| BUG-038 | ⏸ paused         | J — feature request; also needs wallet-reject detection (signing infra)                                                                                                       |
| BUG-039 | 🔁 dup of BUG-004 | —                                                                                                                                                                             |
| BUG-040 | ⏸ paused         | J — iframe-locked (same category as BUG-004/005)                                                                                                                              |
| BUG-041 | 🔁 rollup 007+008 | —                                                                                                                                                                             |
| BUG-042 | ⏸ paused         | J — needs Reown init to reproduce                                                                                                                                             |
| BUG-043 | ⏸ paused         | J — transitive dep upgrade cascade too risky; wait for upstream wagmi bump                                                                                                    |
| BUG-044 | ⏸ paused         | J — needs Reown/wagmi init to reproduce                                                                                                                                       |
| BUG-045 | ✅ fixed          | Group G — renamed `data-isVisible` → `data-is-visible` in Trading.tsx (attribute + CSS selector).                                                                             |
| BUG-046 | ✅ fixed          | Group G — 22 debug `console.log` calls removed across 16 files (source-hygiene sweep).                                                                                        |
| BUG-047 | ⏸ paused         | J — 403 correlated with BUG-042; 400 unclassified. Both need Reown init.                                                                                                      |
| BUG-048 | ⏸ paused         | J — needs wagmi auto-connect fixture to reproduce                                                                                                                             |
| BUG-049 | ⏳ partial        | Group H1 — Slippage popover now has `aria-describedby`. Remaining dialogs (TP/SL, Market Close, Transfer) still to do.                                                        |
| BUG-050 | ⏸ paused         | J — needs specific interaction script to reproduce                                                                                                                            |
| BUG-051 | ✅ fixed          | Group H1 — all 3 perps+spot form fields (leverage, size, percent) have `id` + `aria-label` + `<label for>` association. sr-only label used where visible label would clutter. |
| BUG-052 | ⏸ paused         | J — needs discussion                                                                                                                                                          |
| BUG-053 | ✅ fixed          | Group D — `trimDecimals` extracted to `format.ts`; missing initial-mount trim fixed in Market + Limit close modals.                                                           |
| BUG-054 | ✅ fixed          | Group H1 — Coming-Soon nav item now `<a role="link" aria-disabled="true">`.                                                                                                   |
| BUG-055 | ⏸ paused         | J — feature request; external form, can't test                                                                                                                                |
| BUG-056 | ⏸ paused         | J — layout redesign, design call                                                                                                                                              |

**Rollup totals:** 21 fixed · 2 partial · 1 deferred · 22 paused · 2 dup/rollup · 8 open (of 56 IDs, 54 live).

## How to use this document with Claude

1. Pick a bug ID from the tables below (e.g. `BUG-004`).
2. Prompt: _"Reproduce and fix BUG-004 from `QA_ISSUES.md`."_
3. The instructions in each bug include a **Reproduce** section that lets a fresh Claude Code session drive Chrome via the `chrome-devtools` MCP to reach the same state I did. Every bug also lists a **Suspected file(s)** starting point — grep from there.

Wallet on the browser is Rabby, already connected, builder fee + agent already approved. Testnet USDC is unlimited — the user is fine losing testnet funds during reproduction.

---

## Areas tested / not tested

### ✅ Tested

- Perps futures page (default `/` → BTC-USD, then `/SOL`)
- Asset selector: search, empty-state, switch to `SOL-USD`
- Market list rendered vs. actual Hyperliquid testnet universe
- Perps order form: Limit vs Market, Long/Short, Cross vs Isolated, leverage slider + text input, % presets, Reduce Only visibility, Post Only visibility, Slippage popover, TP/SL popover
- **Placed a live market order** (Long 0.1 SOL, 10x Isolated) — filled successfully
- **Placed a live limit order** (Buy 0.15 SOL @ $90) — resting, still open at end of session
- Tried to **cancel** the limit order (via the row action) — **fails**
- **Closed the open position** via Position row → "Close on Market" — succeeded
- Attempted to **place a $9 order** — rejected server-side, no UI feedback
- **Transferred 100 USDC spot → perps** — succeeded (wallet signature via Rabby popup, user signed manually)
- Spot trading page (`/spot`, default HYPE/USDC) — form + orderbook only, no live order placed
- Portfolio page (`/portfolio`) — data, tabs, deposits table
- Header stats vs. Hyperliquid API (mark, oracle, funding, OI, 24h volume for SOL) — cross-checked, live and accurate
- Console errors, network activity, DOM validity

### ⚠️ NOT tested (worth a second pass)

- **Perps ⇄ spot transfer in the other direction** (perps → spot)
- Send flow (button in balances table + "Send" in right column)
- Deposit / Withdraw / Bridge / EVM ⇄ Spot flows — user asked me to skip
- Spot trading — did NOT actually place a spot order, only inspected the form
- Sell side on perps (Short) — only tested Long
- Cross margin — only tested Isolated (all live orders on this session)
- Cross-margin liquidation math
- **Multiple concurrent positions** (same account, different assets)
- **Position adjustment**: adding to an open position, editing leverage on open position, editing isolated margin
- TP/SL on an actual placed order (couldn't reach it since form calc was broken)
- **Reduce Only** and **Post Only** toggles actually taking effect on the wire
- Favorites (star icon in asset row)
- The three orderbook layout radios (grouped-book / vertical / horizontal / snap options — I don't know what they mean)
- Trade History / Orders History tabs on both pages
- Mobile / small viewport
- Reconnect behavior (kill wifi, refresh mid-order, etc.)
- Session persistence after page refresh (does the connected wallet + agent survive?)
- The BTC-USD default page vs `/SOL` route — did my full form testing on SOL only
- **Deep URL states** (bookmarking a specific asset+side+leverage)

---

## Trading correctness (numerical / financial)

### BUG-001 — Pre-order Liquidation Price on Market orders is wrong (looks like short-formula applied to long) — **BLOCKER**

**Where:** Right column of the perps trading form, "Liquidation Price" row, when order type = **Market**.

**What I saw:** SOL Long, 10x Isolated, size 0.1, mark ≈ $102.55.

- Form displayed **Liquidation Price: $104.52**.
- After the order actually filled, the _Position row_ showed the correct **Liq. Price: $97.17** (matches Hyperliquid API — MM≈5% → 102.54 × 0.9525 ≈ $97.68).
- $104.52 is above entry, which is impossible for a long. Value looks like the mirrored short-side calc.
- Repro'd twice at 25% preset (2.44 SOL → liq $104.56) and 0.1 SOL (→ liq $104.52).

**Why it matters:** A user reads the form and thinks "I get liquidated if SOL goes UP $2" and either won't place the trade or will place way over-sized because they think the buffer is small. This is a financial-decision-blocker misdisplay.

**Contrast:** In **Limit** mode with limit price 90 and same 10x Isolated, size 0.15, form correctly showed liq $85.00. So it's the **market-mode branch** that's wrong.

**Reproduce:**

1. Go to `http://localhost:3000/SOL`, wallet already connected with USDC in perps.
2. Ensure Order Type = **Market**, Direction = **Long**, Margin = **Isolated**, Leverage = **10x**.
3. Click **25%** preset (or type a size ≥ min $10 notional).
4. Look at "Liquidation Price" — it will be **above** current mark. That's the bug.
5. To see the correct value: switch to **Limit**, put a limit price ≈ mark, same size — value flips to the correct sub-entry number.

**Suspected file(s):** `src/components/Trading/PlaceOrder/*` — likely `MarketOrder.tsx` (or wherever `computeLiquidationPrice` is called). Grep `Liquidation Price` and check the sign / side passed for market vs. limit branches. Screenshot: `qa-screenshots/10-order-placed.png` (form + position visible together, showing the mismatch).

---

### BUG-002 — Delisted assets shown as "$0.00" with "-100.00%" 24h change — **MAJOR** — ✅ FIXED

**Where:** Asset selector dialog on `/` (perps).

**What I saw:** `IP-USD` and `ZEC-USD` both render:

- Price `$0.00`, 24h change `$-0.31 (-100.00%)` / `$-138.65 (-100.00%)`
- Volume `$0`, Open Interest `$0`

**Why:** Hyperliquid `meta.universe` marks them `isDelisted: true` (verified via `curl POST https://api.hyperliquid-testnet.xyz/info -d '{"type":"meta"}'`). App renders them anyway, computes 24h change as `(0 - prevDayPx) / prevDayPx × 100 = -100%`.

**Fix direction:** Filter `universe.filter(u => !u.isDelisted)` at whatever store selector populates the market list. Also, defensively, if `markPx` (or the equivalent) is 0 or missing, skip the row or show `—`.

**Reproduce:** Click asset button "BTC-USD" at the top of the trading page, scroll to bottom of the asset list — see `IP-USD` and `ZEC-USD` with `$0.00`. Screenshot: `qa-screenshots/02-asset-selector.png`.

**Suspected file(s):** wherever the perps market list is built from the Hyperliquid store — check `src/store/HyperliquidStore.ts` for a `universe` / `assetCtxs` selector.

---

### BUG-003 — Asset list only shows 9 markets; testnet has 158 active markets — **MAJOR** — ✅ FIXED

**Where:** Asset selector on `/` (perps).

**What I saw:** Only `SOL, BTC, ETH, SUI, HYPE, FARTCOIN, IP, PUMP, ZEC`. Search for `DOGE`, `ADA`, `AVAX`, `ARB` — no results.

**Ground truth:** Hyperliquid testnet has **158 non-delisted markets**, **150 with 24h volume**. Top-by-volume assets absent from AshDex include ADA ($181k vol), ARB ($86k), AVAX ($74k), DOGE ($43k), INJ, WLD, AAVE, ONDO.

**Verified via:**

```bash
curl -s -X POST https://api.hyperliquid-testnet.xyz/info \
  -H 'Content-Type: application/json' \
  -d '{"type":"metaAndAssetCtxs"}'
```

**Fix direction:** The market list is almost certainly a hardcoded / curated array. Replace with `universe.filter(!isDelisted)` and let the user filter/sort/favorite.

**Suspected file(s):** grep for `SOL` and `HYPE` string literals appearing together — likely a `FEATURED_MARKETS` const somewhere in `src/config/` or `src/store/`.

---

### BUG-004 — Chart page title reads "undefined · Hyperliquid, 1h" — **MINOR** — ⏸ NEEDS-DISCUSSION

**Where:** Inside the TradingView iframe on `/SOL`, chart region title bar.

Screenshot: `qa-screenshots/10-order-placed.png`. Look at the chart heading — it shows `undefined · Hyperliquid, 1h` instead of `SOL/USD · Hyperliquid, 1h`.

**Root cause hint:** Also visible in console: `SymbolInfo validation for SOL: name must be non-empty string`. The `SymbolInfo.name` passed to TradingView is empty. Check whatever wires `SymbolInfo` in `src/components/Trading/Chart/*`. Same warning appears for `@1035` on spot.

---

### BUG-005 — TradingView `SymbolInfo` "unsupported timezone `Etc/GMT+4`" warning — **MINOR** — ⏸ NEEDS-DISCUSSION

Same code path as BUG-004. Console log per navigation:
`SymbolInfo validation for SOL: unsupported timezone "Etc/GMT+4"`.

TradingView expects IANA tz names like `America/New_York`. `Etc/GMT+4` is technically POSIX-flipped-sign syntax. Fix the tz string in the SymbolInfo builder.

---

### BUG-006 — Header `24h Change` disagrees with the TradingView chart's price-change line — **MINOR** — ⏸ NEEDS-DISCUSSION

**Where:** `/spot` HYPE/USDC page.

**What I saw:**

- Header stat: `24h Change: +$2.06 (+5.11%)`
- Chart legend (current bar): `−1.90 (−4.05%)`

Different windows (24h absolute vs the currently-focused 1h bar) can legitimately disagree, but the _direction_ flip and _magnitude_ delta will confuse users. Either label the header more precisely ("Last 24h") or reconcile.

Screenshot: `qa-screenshots/17-spot-page.png`.

---

## Order lifecycle (place / cancel / close)

### BUG-007 — Cancelling a resting limit order fails silently with "Asset index not found" — **BLOCKER**

**Where:** Perps `Open Orders` tab → row-level `Cancel` button.

**Repro I ran:**

1. Placed a Limit Long 0.15 SOL @ $90 (Isolated 10x) — succeeded, appears in `(1) Open Orders`.
2. Clicked the row `Cancel` button — nothing happens visually.
3. Console: `Error cancelling order: Error: Asset index not found` (fires every time I click Cancel; tried twice, order still open).

There is **no toast** and no visible error in the UI. The order remains open. As of end of session my order at $90 is still resting on my testnet account.

**Fix direction:** The cancel path is looking up the asset by _name_ → _asset index_ and getting `undefined`. Likely the `assetIndex` from meta isn't in the store selector used by the cancel action, or it's using the display symbol (e.g. `SOL-USD`) instead of the raw meta name (`SOL`). Grep for `Asset index not found` in `src/`.

**Reproduce:**

1. `http://localhost:3000/SOL` with USDC in perps.
2. Place a resting Limit Long (any size ≥ $10 notional, price well below current mark).
3. Click `Cancel` on the row.
4. Open DevTools console — see `Error cancelling order: Error: Asset index not found`. Order remains.

Screenshots: `qa-screenshots/14-open-orders.png`, `qa-screenshots/15-cancel-attempt.png`.

---

### BUG-008 — Order below $10 min notional fails silently (server rejects, no UI feedback) — **MAJOR**

**Where:** Any order form (repro'd on perps Limit).

**Repro:**

1. Perps Limit Long 0.1 SOL @ $90 → Order Value = $9.00 → click Long.
2. Nothing happens in UI. No toast. Button re-enables. Position/Orders tabs unchanged.
3. Console: `Error placing Perp order: ApiRequestError: order 0: Order must have minimum value of $10. asset=0`.

The successful order path _does_ toast `Order Placed Successfully` (see BUG-016) — so error handling is missing from the failure path only.

Two fixes together:

- **Client-side guard**: disable the order button (or add helper text) when `orderValue < $10`.
- **Surface the server error**: catch the `ApiRequestError` and render its message as an error toast — right now it's `console.error` only.

**Suspected file(s):** `src/hooks/*` around the order-place mutation, and `src/components/Trading/PlaceOrder/OrderButton.tsx`.

---

### BUG-009 — No "Cancel all" for open orders on the trading page — **MINOR**

The Open Orders tab has only a per-row `Cancel`. On mainnet users often have dozens of resting orders and want a `Cancel all` (or "Cancel all for this asset"). Add a bulk-cancel button when more than one order is present.

---

### BUG-010 — No confirm/summary dialog before placing a market order — **MINOR** (design call)

Clicking `Long` (Market, non-reduce) fires the order immediately. Some competing UIs pop a confirm with expected fill price + expected slippage. Consider a settings toggle "confirm before trade" — especially since the current form is missing an _expected fill_ field entirely (see BUG-018).

---

## Order form UX

### BUG-011 — Leverage input accepts arbitrary out-of-range values — **MAJOR** — ✅ FIXED

**Where:** Leverage numeric input above the 1x/10x/…/40x preset row.

**Repro:** On BTC-USD I typed `999` into the leverage box. The slider clamped to `40` and no preset button was highlighted, but the **input kept the string "999"** after tab-blur. No clamp, no validation styling, no helper text.

The subsequent order button was still enabled (before I had a position size). Whether the wire request sends `999` or `40` I didn't test end-to-end, but the state is inconsistent between input, slider, and preset row → this will bite someone.

Fix: clamp `onBlur` (and on Enter), sync with the slider always.

---

### BUG-012 — Slippage numeric input accepts values above `max=100` — **MINOR** — ✅ FIXED

The slippage popover has an `<input type="number" min="0.1" max="100">`. Typing `200` sticks; the slider stays at max but the number is `200`. Need `onBlur` clamp so the state matches the visible input.

Extra: the slider `min` is `"0.10000000149011612"` in the DOM — a `Number` was force-cast from a `Float32` somewhere and now leaks into ARIA attributes. Not user-visible but shows up in the a11y tree. Grep for `0.1` near the slippage slider and fix the source-of-truth type.

Screenshot: `qa-screenshots/06-slippage-dialog.png`.

---

### BUG-013 — Default slippage `8%` isn't one of the presets (1/2/5/10/20) — **MINOR** — ⏸ NEEDS-DISCUSSION

Nothing looks selected in the preset row when the slippage dialog opens. Either seed default to one of the presets (e.g. `5%`) or highlight "custom" state.

---

### BUG-014 — Liquidation Price = "0" (not "—" or "N/A") when order size is 0 — **MINOR**

Empty-state polish. When Position Size is 0, the row reads `Liquidation Price 0`, `Margin Required $0.00`, `Order Value $0.00`. `$0.00` is fine for currency, but `Liquidation Price 0` reads like a real liq at $0. Show `—` or `N/A`. Similar behaviour on the Limit form path _does_ show `N/A` — so both branches disagree.

---

### BUG-015 — Fees line reads `0.045% / 0.015%` (perps) / `0.070% / 0.040%` (spot) with no maker/taker labels — **MINOR** — ✅ FIXED (closed alongside BUG-029)

Beginners have no idea which number is which side. Label: `Taker 0.045% · Maker 0.015%` (verify order — I'd guess taker first, but check).

Extra: this row doesn't show the effective fee for _this specific order_ (it's always the base rate, regardless of the user's builder-fee tier). At minimum add a tooltip.

---

### BUG-016 — Successful order toast says "Order Placed Successfully" but no order ID / no undo — **POLISH**

The toast fires, which is good (see BUG-008 for the failure-path miss), but it's a bare string. Include the asset, side, size, and order ID, e.g. _"Long 0.15 SOL @ $90 · order #12345"_, so the user can find it if they need to.

---

### BUG-017 — Isolated margin has no visible margin input — **MINOR** — ⏸ NEEDS-DISCUSSION

When I selected `Isolated`, the form didn't gain any per-position "margin" input — leverage + size fully determined the isolated collateral. Hyperliquid's own UI has an explicit isolated-margin field. Either verify this is intentional (and OK — since size × price / leverage = margin) or expose it.

---

### BUG-018 — No "Expected fill price" or "Slippage impact" preview for market orders — **MINOR** — ⏸ NEEDS-DISCUSSION

The Market form shows Order Value, Margin, Fees, Liq — but nothing about the expected fill. On a thin market like PUMP/HYPE this can be a big surprise. Show something like `Est. fill: $102.58 (0.05% slippage)` from the top-of-book walk.

---

## TP/SL

### BUG-019 — TP/SL popover (in the pre-order form) shows an error on the button ("TP must be above entry price") — **MINOR** (bad placement)

**Repro:** Click `TP/SL` in the order form → type `50` into `TP Value` → the Set TP/SL button turns disabled with label `TP must be above entry price`.

Using the primary CTA to communicate validation errors is a smell — the error should be near the input as helper text, and the CTA should stay named "Set TP/SL" (just disabled).

Also, the fact that we're validating against "entry price" _before there is an order_ is confusing — presumably the form is treating current mark as entry. Say so.

Screenshot: `qa-screenshots/05-tpsl-popover.png`.

---

### BUG-020 — TP/SL popover fields have no unit / no auto-sync between $ and % — **MAJOR**

Fields are labelled `TP Value / TP % / SL Value / SL %` with placeholder `0.00`. **"Value" in what unit** — $ price? $ PnL? Add `$` prefix or "USD price".

Also typing into TP Value doesn't recompute TP %, and vice versa. Financial forms in every competitor sync these both ways.

---

### BUG-021 — Position-level TP/SL dialog shows `Mark Price: NaN` — **BLOCKER** (broken feature)

**Repro:**

1. Open a position (Market Long 0.1 SOL @ 10x Isolated).
2. Position row → `More` → `Set TP/SL`.
3. Dialog opens with:
   - Position: 0.1 SOL ✓
   - Entry Price: 102.54 ✓
   - **Mark Price: NaN** ✗
   - TP Price / SL Value spinbuttons have `min=0 max=0` (unusable via arrows)
   - `Configure Amount` slider has `valuemax="0.10000000149011612"` — again the Float32 leak (see BUG-012)

This dialog is effectively unusable — the % / expected-profit rows read `0.00` and the button is disabled behind the "must be above entry" check that's fed by NaN.

Screenshot: `qa-screenshots/12-tpsl-position-dialog.png`.

**Fix direction:** grep `NaN` and `mark` together in the TP/SL dialog component. Likely a prop wired to a store value that's undefined for isolated positions (and the fallback `Number(undefined)` = NaN gets rendered).

---

## Markets / asset selector

### BUG-022 — Empty search state has no "no results" message — **MINOR** — ✅ FIXED

Type `DOGE` in the asset selector — the table just becomes empty. Add a `No markets match "DOGE"` row.

Screenshot: `qa-screenshots/03-search-doge-empty.png`.

---

### BUG-023 — Precision drift between subsequent snapshots ($102.50 vs $102.505 vs $102.51) — **POLISH** — ✅ FIXED

Rendering the same SOL price at different decimal counts across renders (visible in the asset dropdown between snapshots). Probably `.toFixed(2)` vs `.toString()` inconsistency in different cells. Standardize on `formatPrice(px, szDecimals)` everywhere.

---

### BUG-024 — Asset row shows no sort indicators or clickable column headers — **MINOR** — ⏸ NEEDS-DISCUSSION

Columns `Market / Price / 24h Change / Volume / Open Interest` are static. Should be sortable.

---

## Spot page

### BUG-025 — Contract link uses **mainnet** explorer while on testnet — **MAJOR** — ✅ FIXED

**Where:** `/spot` header, next to `Contract 0x7317...e7ab`, the link goes to `https://app.hyperliquid.xyz/explorer/token/0x7317beb7cceed72ef0b346074cc8e7ab` — **mainnet** URL — even though the app is configured for testnet (chain 998).

Should conditionally use `app.hyperliquid-testnet.xyz` when `NEXT_PUBLIC_HYPERLIQUID_NETWORK !== 'mainnet'`. Grep `app.hyperliquid.xyz/explorer` in `src/`.

---

### BUG-026 — Spot page shows a `(0) Positions` tab that shouldn't exist — **MINOR** — ✅ FIXED

Spot has no positions (only balances). The `Positions` tab always shows `(0)` on `/spot`. Either hide it on spot or repurpose (e.g. `(0) Holdings`).

---

### BUG-027 — Spot chart blank on first render for HYPE/USDC — **MAJOR** — ⏸ NEEDS-DISCUSSION

On my first navigation to `/spot`, the TradingView chart area was entirely empty (see `qa-screenshots/17-spot-page.png`). On a subsequent interaction it started rendering (see `qa-screenshots/18-spot-buy-form.png`). Could be a race between the SDK/store hydration and the chart mount. Reproduce by hard-refreshing `/spot`.

---

### BUG-028 — Spot orderbook "mid price + spread" cell showed `$5.429` at one point — **MAJOR** — ⏸ NEEDS-DISCUSSION

Initial snapshot of the HYPE/USDC orderbook mid-row read `$5.429 - %`. Actual top-of-book was ask ~$45.000 / bid ~$39.571 → real mid ~ $42.28, spread $5.429. So the _spread number_ was in the _price slot_, and the mid price didn't render. On subsequent refresh the same widget showed `$42.3855 5.408 -%` correctly. Race / undefined-initial-state bug.

Reproduce by hard-refreshing `/spot` and watching that middle row before the WS subscription is fully seeded.

---

### BUG-029 — Fee display for spot (0.070% / 0.040%) — **MINOR** — ✅ FIXED (also applied to perps)

Same critique as BUG-015 — no maker/taker label. Extra: the spot fee is 0.07 / 0.04 vs. perp 0.045 / 0.015 — worth a tooltip explaining why.

---

## Order book

### BUG-030 — Two `Amount (BTC)` header inconsistencies and total precision — **MINOR** — ✅ FIXED

`Amount (SOL)` / `Total (SOL)` — but individual rows format the number to varying decimal counts (0.001 vs 0.25025 vs 0.00095). Fix to a consistent 2-4 sig-figs, or `.toFixed(szDecimals)` for the asset.

---

### BUG-031 — Group-size selector says "1" on BTC-USD then "0.01" on SOL-USD — no label — **MINOR** — ✅ FIXED

The little `1 ▼` / `0.01 ▼` selector above the orderbook that changes tick-grouping has no visible label. Hovering it should show "Group size" or similar.

---

### BUG-032 — Three unlabelled radios for orderbook layout — **MINOR** — ✅ FIXED

`<group>` with 3 unnamed `radio` buttons at the top-right of the orderbook. From the snapshot they have no accessible names. Users can't tell what each does without clicking. Add labels/tooltips.

---

## Portfolio

### BUG-033 — Max Drawdown shows `-100.00%` on a new account with negligible activity — **MAJOR** — ✅ FIXED

`/portfolio` right-side stats: `Max Drawdown -100.00%` while PnL is `$-0.02` on $209.98 total equity. Almost certainly a default when the equity-time-series is one point long. Show `—` if there isn't at least one high→low leg, or compute over the actual available series.

Screenshot: `qa-screenshots/19-portfolio.png`.

---

### BUG-034 — Performance chart is empty — **MAJOR** — ⏸ NEEDS-DISCUSSION

The big `Performance` panel at the top of `/portfolio` is blank — no line, only an x-axis date. Not sure whether it's "no data yet" (I've only had the account for one transfer + one round trip) or a broken data feed. Repro on a fresh account.

---

### BUG-035 — Deposits and Withdrawals timestamp uses locale format `9/9/2026, 3:13:30 AM` — **MINOR** — ✅ FIXED

`9/9/2026` is US-locale and reads as Sept 9 or Sept 9 depending on region. Prefer `2026-09-09 03:13:30 UTC` or a locale-aware date-fns format with timezone. Same issue on the Open Orders row `9/9/2026, 3:18:12 AM`.

---

### BUG-036 — Balances table shows `USDC (Perps): 99.98 Total / 98.63 Available` but `USDC Value: $99.98` — **MINOR** — ⏸ NEEDS-DISCUSSION

Displayed correctly, but no hover/tooltip explains why 1.35 USDC is locked (it's the isolated margin of my open $90 limit order that I can't cancel because of BUG-007). Add a tooltip on `Available Balance` linking to the open orders holding the collateral.

---

## Transfer (spot ⇄ perps)

### BUG-037 — Transfer dialog opens with the _wrong_ default direction — **MINOR** — ✅ FIXED

The `Perps ⇄ Spot` button opens the dialog with **Perps → Spot** direction pre-selected. In practice a user starting with only spot funds (like me) will always need to flip it. Default to the direction the user has funds in, or pick spot→perps first on a page where the primary action is trading perps.

Screenshot: `qa-screenshots/07-transfer-initial.png`.

---

### BUG-038 — Transfer "in progress" message has no timeout / retry / cancel — **MINOR** — ⏸ NEEDS-DISCUSSION

Dialog reads _"Transfer in progress… You will need to sign this transaction in your wallet"_. If the user closes the Rabby popup without signing, the dialog sits forever. Add:

- A `Cancel` button while awaiting signature
- A timeout with a retry
- Detect wallet `user rejected` and reset the dialog

Screenshot: `qa-screenshots/09-waiting-signature.png`.

---

## Chart (TradingView)

### BUG-039 — Chart symbol text is `undefined · Hyperliquid, 1h` — **MINOR**

Same as BUG-004. Empty `SymbolInfo.name` from the datafeed adapter.

---

### BUG-040 — Position line on chart doesn't clean up when position closes — **VERIFY** — ⏸ NEEDS-DISCUSSION

After placing the Market Long, an `Undo create Horizontal Line` button showed up in the chart toolbar (i.e. our code drew a horizontal line for entry). After closing the position, the toolbar changed to `Undo remove Horizontal Line` — so the line was removed, good. But I didn't verify visually that the line disappeared. Worth a spot-check.

---

## Error handling / feedback

### BUG-041 — Silent failures across three flows — **BLOCKER** (rolled up)

Consolidating: three places I found where an error hits the console but no UI:

- **Order rejected server-side** (min $10) — BUG-008
- **Cancel order fails** ("Asset index not found") — BUG-007
- **Multiple `[log] [object Object]` messages** left in console during transfer and order flows (see BUG-046)

Common fix: wrap the SDK mutations in a shared `try/catch → toast(error.message)` helper. Then remove the individual `console.error/log` scattered around the flows.

---

## Console noise, config, and code hygiene

### BUG-042 — `No project ID is configured` (Reown/WalletConnect) — **MAJOR** — ⏸ NEEDS-DISCUSSION

Every load: `[error] No project ID is configured. You can create and configure a project ID at https://dashboard.reown.com` followed by `[Reown Config] Failed to fetch remote project configuration. Using local/default values. Error: HTTP status code: 403`.

WalletConnect will not work for real users without a valid `NEXT_PUBLIC_REOWN_PROJECT_ID` (or equivalent). Set one and thread it through `src/config/wagmi.ts`.

---

### BUG-043 — `AppKit SDK version 1.8.7 is outdated. Latest version is 1.8.23.` — **MINOR** — ⏸ NEEDS-DISCUSSION

Update `@reown/appkit`. Read the changelog for breaking changes.

---

### BUG-044 — `Permissions policy violation: unload is not allowed in this document.` — **POLISH** — ⏸ NEEDS-DISCUSSION

Fires on every page load. Something is registering an `unload` event listener (probably an analytics/wallet SDK). Modern Chrome disallows `unload`; use `pagehide` or `beforeunload` instead.

---

### BUG-045 — `React does not recognize the `%s` prop on a DOM element. …data-isVisible data-isvisible` — **POLISH** — ✅ FIXED

A component is spreading a camelCase `data-` attribute onto a DOM element. React insists on lowercase for `data-*`. Grep `data-isVisible` in `src/` and rename to `data-isvisible` (or move it out of the DOM entirely).

---

### BUG-046 — Debug `console.log` statements left in production paths — **POLISH** — ✅ FIXED

Seen in console during a normal session:

- `[log] currentFeeApproval 100`
- `[log] TradingView chart ready`
- `[log] Transfer response: [object Object]`
- `[log] pushing position [object Object]`
- `[log] pushing open orders [array Array]`
- Several bare `[log] [object Object]`

None useful for end users; some might leak account state. Strip them or gate behind `process.env.NODE_ENV === 'development'`.

---

### BUG-047 — 400 & 403 responses among network requests — **VERIFY** — ⏸ NEEDS-DISCUSSION

Console shows `Failed to load resource: the server responded with a status of 400 ()` and `Failed to load resource: the server responded with a status of 403 ()`. The 403 is the Reown remote-config (BUG-042). The 400 I didn't trace — reproduce by opening DevTools → Network and filtering by status.

---

## Accessibility / hydration

### BUG-048 — Hydration mismatch on initial `/` and `/spot` load — **MAJOR** — ⏸ NEEDS-DISCUSSION

First-load console error:

```
Hydration failed because the server rendered HTML didn't match the client.
… OrderButton isBuy={true} selectedAsset="" limitPrice="NaN" assetAmount="" leverage={1} …
```

The difference is a `<svg>` (wallet icon) that renders only on the client. React will regenerate the tree; user just sees a flash. Fix by rendering the icon in a Client Component or a `useEffect(() => setMounted(true))` gate, or by using `next/dynamic({ ssr: false })` around the wallet-icon slot.

Note that the error also reveals `selectedAsset=""` and `limitPrice="NaN"` in the initial props — hinting at other empty-state bugs elsewhere.

---

### BUG-049 — DialogContent components missing accessible `Description` — **MINOR** — ⏳ PARTIAL (Slippage only; TP/SL, Market Close, Transfer remaining)

Multiple warnings: `Missing Description or aria-describedby={undefined} for {DialogContent}`. Radix expects each Dialog to declare a description. Add a `<Dialog.Description>` (visually hidden if you don't want copy) to each dialog: Slippage, TP/SL, Market Close, Transfer.

---

### BUG-050 — `aria-hidden` set on ancestor of the focused element — **MINOR** — ⏸ NEEDS-DISCUSSION

Radix warns:

```
Blocked aria-hidden on an element because its descendant retained focus.
… <div.hidden xl:flex flex-col gap-1 p-1 mb-8 h-[130vh] w-full>
```

When you close a Dialog, focus is returning to a button inside a container that's now `aria-hidden`. Use `inert` instead, or restore focus to a location outside the hidden container.

---

### BUG-051 — Form fields missing `<label>` / `id` — **MINOR** — ✅ FIXED

Chrome DevTools issue reports:

- `No label associated with a form field`
- `A form field element should have an id or name attribute` (×3)

Not user-visible but hurts a11y and password-manager auto-fill on the wallet-address field.

---

## Minor polish

### BUG-052 — Cross Account Leverage renders as `0.10x` while Perps balance shows `$100.00` and an isolated position exists — ⏸ NEEDS-DISCUSSION

After my 0.1 SOL / $10.25 notional isolated position, Perps Overview showed `Cross Account Leverage: 0.10x`. Since the position is _Isolated_, it shouldn't contribute to cross leverage. Confirm — this might be a legit "notional / equity" ratio regardless of margin mode, or it might be double-counting.

---

### BUG-053 — Market Close dialog `Size` field shows raw float `0.10000000149011612` — **POLISH** — ✅ FIXED

Same Float32 leak as BUG-012. Format to `szDecimals`.

Screenshot: `qa-screenshots/16-market-close-dialog.png`.

---

### BUG-054 — "Stocks · Coming Soon" header slot is a `StaticText`, not a link — **POLISH** — ✅ FIXED

Non-actionable but positioned like a nav link. Add a `disabled` visual state or a tooltip so users don't try clicking.

---

### BUG-055 — `Report Bug` link goes to a Google Form — **POLISH** — ⏸ NEEDS-DISCUSSION

Works, but users' bug reports would be _much_ more useful if the form pre-filled the current URL, wallet address, and app version. If we can't customize the form, at least prompt the user to include those.

---

### BUG-056 — Total funds top-of-page double-shows `Spot / Perps` — **POLISH** — ⏸ NEEDS-DISCUSSION

Right sidebar has:

1. `Account Equity → Spot $110 · Perps $99.98`
2. `Perps Overview → Balance $99.98 · Unrealized PnL $0 · …`

The two blocks overlap in meaning. A consolidated `Total Equity + breakdown` would read cleaner.

---

## Notable non-issues (verified correct)

- SOL Mark, Oracle, Funding, OI, 24h Volume in the header all match Hyperliquid API `metaAndAssetCtxs` for `SOL` within the WS update cadence. Live updates work.
- Max leverage per asset (BTC 40x, ETH 25x, SOL 10x, SUI 10x, HYPE 10x, PUMP 10x, IP 3x, ZEC 3x) matches `meta.universe[].maxLeverage`.
- Position row's `Liq. Price` reads the server-side value correctly (only the _pre-order form_ is wrong — BUG-001).
- Post-fill balance math (`$100 - $0.02 fee = $99.98`, `Available = Total - 1.35 locked in open limit`) is correct.
- Successful order fires an `Order Placed Successfully` toast (only the failure path is missing feedback — BUG-008).
- 100 USDC spot→perps transfer fully worked end-to-end, including recording in the Deposits and Withdrawals table with the correct source/destination.

---

## Cleanup left on my account

I could not cancel my resting limit order due to BUG-007. As of session end there is one open order on the wallet (0xc6C0...1424 on testnet):

- **SOL** · **Buy Limit** · size **0.15** · price **$90** · isolated margin locked **$1.35**

Please cancel it via the official Hyperliquid testnet UI (or once BUG-007 is fixed here) — otherwise it'll fill if SOL crashes to $90.
