# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
bun dev          # Start development server with Turbopack
bun build        # Production build
bun start        # Start production server
bun lint         # Run Prettier + ESLint
bun tsc          # Type-check without emitting
```

## Architecture Overview

AshDex is a pure client-side trading frontend for Hyperliquid (decentralized derivatives exchange), built with Next.js 15 App Router. There is no backend: the app talks to Hyperliquid directly over HTTP + WebSockets and signs transactions with a Wagmi/Viem-connected wallet.

### Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **State**: Zustand stores + React Query
- **Wallets**: Wagmi/Viem (traditional wallets only — MetaMask, Phantom, Coinbase, WalletConnect, Trust, Rabby)
- **Trading**: @nktkas/hyperliquid SDK with WebSocket subscriptions
- **UI**: TailwindCSS 4 + Radix UI components

### Key Directories

- `src/app/` - Next.js App Router pages (no `/api` — the app is client-only)
- `src/store/` - Zustand stores (HyperliquidStore, userStore, FavoritesStore, TradeUIStore)
- `src/components/` - React components organized by feature (Trading/, UserData/, Portfolio/, Bridge/, etc.)
- `src/hooks/` - Custom React hooks for client-side logic
- `src/context/` - React contexts (EstablishConnectionContext, WalletModalContext)

### State Management Pattern

```
Zustand Stores (global client state)
├── HyperliquidStore - Trading data, WebSocket subscriptions, agent wallet
├── userStore        - Local UI preferences (persisted)
├── FavoritesStore   - Favorite trading pairs (persisted)
└── TradeUIStore     - Order placement UI state

React Query - Client-side query cache (e.g. ERC-20 metadata, spot meta)
React Context - UI state (wallet modal, agent approval flow)
```

### Data Flow

1. User connects wallet via Wagmi → triggers HyperliquidInitializer
2. SDK initializes HTTP + WebSocket clients → subscribes to channels (allMids, webData2, candles, ledgerUpdates)
3. WebSocket updates push to Zustand store → components subscribe via selectors
4. Transactions: Sign with wallet → execute via Hyperliquid SDK

### Important Files

- `src/app/HyperliquidInitializer.tsx` - Sets up Hyperliquid SDK and subscriptions on app mount
- `src/store/HyperliquidStore.ts` - Central trading state (positions, orders, balances, WebSocket data)
- `src/config/wagmi.ts` - Wallet configuration (chains, connectors)

### Patched Dependencies

- `@nktkas/hyperliquid@0.33.3` — patched via `bun patch` (see `patches/@nktkas%2Fhyperliquid@0.33.3.patch`) to raise the `twapOrder.m` valibot cap from `1440` (24 h) to `10080` (7 d), matching what Hyperliquid's server accepts. The SDK schema was more restrictive than the server, so TWAPs longer than 24 h were being rejected client-side with no user-facing hint. `bun install` re-applies the patch automatically via `patchedDependencies`. Upstream fix (removes the need for this patch) is a follow-up.

### Hyperliquid Network

The app supports both mainnet and testnet, configured via `NEXT_PUBLIC_HYPERLIQUID_NETWORK` env var.

- Mainnet chain ID: 999
- Testnet chain ID: 998

### Path Aliases

Use `@/*` to import from `src/*` (configured in tsconfig.json).

## Testing

This project has a test suite. **Always run `bun run verify` before declaring any task complete.** It runs (in order, fail-fast):

1. `bun run tsc` — TypeScript type check (no emit).
2. `bun run test` — Vitest unit tests against pure logic in `src/**/*.test.ts`.
3. `bun run test:e2e` — Playwright specs in `e2e/` against a stubbed Hyperliquid + injected `window.ethereum` provider.

### Rules

- **Never weaken or modify an existing assertion to make a failing test pass.** If a test fails, the code is wrong (or the test caught a genuine change in behavior worth discussing). Change source, not the assertion.
- **Never add fixed timeouts** (`page.waitForTimeout(...)`, `setTimeout` inside tests, ad-hoc sleep loops). Use Playwright's auto-retrying expectations (`expect(locator).toBeVisible()`, `.toHaveText()`, etc.) anchored on a stable post-init signal. If you need to wait for absence, anchor on a positive signal that implies the absence check is meaningful by then.
- **Never skip or comment out a test without saying so explicitly** in the user-facing response. If a test needs to be quarantined, use `test.skip('reason')` with a clear reason and flag it to the user.
- **Never commit; the user commits.** Do not run `git commit`, `git push`, or any git write operation. Report the diff instead.

### Test structure

- **Unit** (`src/**/*.test.ts`) — pure logic. Runs against Node.
- **E2e** (`e2e/*.spec.ts`) — Playwright + Chromium against `bun run dev` on port 3000, with a stubbed fixture in `e2e/fixtures/withStubs.ts` that intercepts REST (`/info`) and WebSocket (`/ws`) traffic and injects a minimal `window.ethereum` shim. Fixture files live in `e2e/fixtures/`; re-capture from live testnet with `bun run e2e/fixtures/capture.ts`.
- **QA audit** — see `QA_ISSUES.md` for the bug backlog and Progress table.

### Working with tests, in order

1. Reproduce the bug with a **failing test** first. Confirm it fails for the right reason (correct assertion, correct error).
2. Fix the source. Confirm the test now passes.
3. Run `bun run verify` to check nothing else regressed.
4. Update the Progress table in `QA_ISSUES.md` and tag the bug heading `✅ FIXED` if it's the last remaining piece.

If the bug can't be reproduced under stubs (e.g., only fires when a third-party SDK initializes fully), don't fake a passing test — mark the bug `⏸ NEEDS-DISCUSSION` in `QA_ISSUES.md` with the specific reproducibility gap, and defer.

### Manual wallet testing (Chrome DevTools MCP)

For flows automated tests can't exercise (real wallet signing, real Rabby popups), MCP is configured to launch its own Brave with Rabby installed. The profile persists at `~/.cache/chrome-devtools-mcp/chrome-profile`, and Rabby holds a testnet-only wallet.

Any `mcp__chrome-devtools__*` tool call launches the browser. Then:

- Navigate to `http://localhost:3000/BTC`; click Connect Wallet → Rabby.
- The Rabby popup appears in `list_pages` as an "Extension Page".
- **Never call `select_page` on the Rabby popup** — that steals focus and Brave auto-closes it, killing the request with `UserRejectedRequestError`. Target it by pageId in `take_snapshot` / `click` directly.
- Inside the Rabby popup: pick "Rabby Wallet" (not Brave's built-in), click "Ignore all" to dismiss the localhost "unknown site" warning, then Connect.

MCP is registered in `~/.claude.json` with `--categoryExtensions` (required to see extension popups) and `--executablePath` pointing at Brave.
