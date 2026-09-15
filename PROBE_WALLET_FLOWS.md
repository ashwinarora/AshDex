# Wallet-Flow Probe — 2026-09-13

Manual end-to-end probe of every AshDex flow that requires a wallet signature. Run via Chrome DevTools MCP driving Brave + Rabby on Hyperliquid **testnet** (chain 998). Master account: `0x7B67…496E`. Starting funds: $208 USDC Spot, $0 Perps.

Screenshots: `qa-screenshots/probe-2026-09-13/`.

## TL;DR

Every wallet-signing flow I exercised worked end-to-end. No transaction failed. Two functional bugs and a handful of UX gaps found — details below.

| #   | Flow                                      | Signatures                      | Result                     |
| --- | ----------------------------------------- | ------------------------------- | -------------------------- |
| 1   | Approve Agent (`ApproveAgent`)            | 1× typed-data                   | ✅ Success toast           |
| 2   | Approve Builder Fee (`ApproveBuilderFee`) | 1× typed-data                   | ✅ Success toast           |
| 3   | Spot→Perps transfer (`UsdClassTransfer`)  | 1× typed-data                   | ✅ Balances moved          |
| 4   | Place limit order (agent-signed)          | 0                               | ✅ Order landed, no popup  |
| 5   | Cancel order (agent-signed)               | 0                               | ✅ Order removed, no popup |
| 6   | Deposit dialog (chain switch)             | 1× wallet_switchChain           | ⚠ See B1                  |
| 7   | Send dialog surface                       | not exercised (funds preserved) | ✅ Dialog loads correctly  |
| 8   | Disconnect + reconnect                    | 1× connect                      | ⚠ See B2                  |

Final state at end of probe: Spot $158, Perps $50, 0 open orders, 0 open positions, agent still valid.

## Flow-by-flow findings

### 1. Enable Trading

- `Enable Trading` button opens a dialog titled **"Establish Connection"** with copy: _"This signature is gas-free. It opens a decentralized channel for instant and gasless deposits."_ (Copy is slightly misleading — this covers **agent approval + builder-fee approval**, not deposits.)
- Click 1 → Rabby popup shows `HyperliquidTransaction:ApproveAgent`, agent address `0x3a457f6a…5c2c8`, agent name `ashdex_agent`, `hyperliquidChain: "Testnet"`. Sign → toast: **"Agent approved successfully"**.
- Dialog auto-advances to a second click labeled `Approve Fee`. Click → Rabby shows `HyperliquidTransaction:ApproveBuilderFee`, `maxFeeRate: "0.1%"`, builder `0x3250cf7f…f659cf`. Sign → toast: **"Fee approved successfully"**. Dialog auto-closes.
- The order-side CTA switches from `Enable Trading` to `Long` (still disabled because Perps balance is $0 and size is empty).
- Screenshots: `01-initial-BTC.png`, `02-agent-approved-fee-step.png`.

**Verdict**: ✅ End-to-end pass.

### 2. Spot → Perps transfer

- Sidebar button labeled `Perps Spot` opens a dialog "Transfer between Perp and Spot" with direction toggle (default Spot→Perp), amount input, `Available to transfer: 208.00 USDC`.
- Entered 50 → `Transfer` → Rabby popup `HyperliquidTransaction:UsdClassTransfer`, `amount: "50"`, `toPerp: true`. Sign → toast: **"Transfer successful"**.
- Balances updated instantly: Spot $208→$158, Perps $0→$50, Balances tab count went 1→2.
- Screenshot: `03-transfer-dialog.png`.

**Verdict**: ✅ End-to-end pass.

### 3. Place + cancel limit order (agent-signed)

- Switched to Limit, set price $70,000 (well below market $77,157), size 0.0005 BTC ($35 value, $1.75 margin @ 20x). `Long` button became enabled.
- Click `Long` → **no Rabby popup** (agent-signed), order value $35, Open Orders count 0→1. Order visible in table with correct fields (2026-09-13 15:25:09 UTC, BTC, Limit, Buy, $70,000, 0.0005/0.0005, $35, Reduce Only No).
- Click `Cancel` on the order row → **no Rabby popup**, Open Orders count 1→0, "No Open Orders Found" empty state renders.
- Screenshot: `04-order-placed.png`.

**Verdict**: ✅ Both actions clean, agent path works. See UX-1 below (no toast).

### 4. Deposit dialog

- Sidebar `Deposit` opens "Deposit to AshDex" — "Deposit USDC from Arbitrum to AshDex", `Use Max: (0 USDC)`, `Switch to Arbitrum` primary CTA.
- Click `Switch to Arbitrum` → Rabby popup "Add Custom Network to Rabby" with `Arbitrum Sepolia`, chain 421614, RPC `https://sepolia-rollup.arbitrum.io/rpc`. Cancelled to keep the wallet chain untouched.
- App reacts to the cancel with a toast: **"Failed to switch to Arbitrum network."** — good, no silent failure.
- Screenshot: `05-deposit-dialog.png`.

**Verdict**: ✅ Surface + wallet-switch call are wired correctly. Not exercised past that (no Arbitrum Sepolia USDC in the test wallet).

### 5. Send dialog

- Sidebar `Send` opens "Send Tokens" — destination address input, source-account selector (default `Perps Account`), amount with `Use Max (50.0000 USDC)`, USDC picker, `Send` disabled until filled.
- Not exercised end-to-end (would burn testnet funds without adding signal — the signing path is identical to `UsdClassTransfer` already validated in flow 2). Surface loads correctly.
- Screenshot: `06-send-dialog.png`.

**Verdict**: ✅ Surface loads. End-to-end sign not exercised.

### 6. Disconnect + reconnect

- Header address dropdown offers: Copy Address, Switch Wallet, Withdraw, Disconnect. Click Disconnect → header becomes `Connect Wallet`, order form shows `Connect Wallet` primary CTA, main pane shows _"Your Wallet is Disconnected"_ empty state.
- Click `Connect Wallet` → modal lists wallets → Rabby → Rabby's "Select a Wallet" popup ("Rabby Wallet" vs "Brave Wallet") → Rabby connect approval → toast-less success dialog "Wallet connected!" / "Let's Go!".
- Header re-populates with `0x7B67…496E`. **Enable Trading is not re-prompted** — the previously-approved agent + fee are persisted (localStorage) and the flow resumes as fully enabled.
- Screenshot: `07-wallet-modal.png`.

**Verdict**: ✅ Round-trip works. See B2 below for stale sidebar issue.

## Bugs found

### B1 — Deposit CTA can't switch to Arbitrum Sepolia because Rabby has never seen the chain

The `Switch to Arbitrum` button issues a plain `wallet_switchEthereumChain`. Rabby doesn't have Arbitrum Sepolia (421614) configured out of the box, so it falls back to "Add Custom Network" with the RPC pre-filled. Cancel closes the popup and the app surfaces "Failed to switch to Arbitrum network."

Fix: use `wallet_addEthereumChain` (which upserts) instead of, or before, `wallet_switchEthereumChain`. That's a single-signature UX vs the current cancel-then-retry.

### B2 — Sidebar shows stale wallet state after disconnect

After clicking Disconnect: the header + order form correctly show a disconnected state, **but the right-hand sidebar continues to render the previously-signed-in wallet's data**:

- `Account Equity: Spot $158.00 / Perps $50.00`
- `Perps Overview: Balance $50.00`
- `Balances` tab count `(2)`
- `Send`, `Perps Spot`, `Deposit` buttons remain enabled and clickable

Expected: on disconnect, the sidebar collapses to a placeholder or zeroes out and disables those action buttons.

## UX gaps (non-bugs)

- **UX-1 — No toast on place/cancel order**: Approve Agent, Approve Fee, and Transfer each fire a success toast. Place-order and cancel-order do not — the only feedback is the Open Orders count changing. Consider a toast (or the same one Hyperliquid's own UI uses: "Order placed"/"Order cancelled") for consistency.
- **UX-2 — "Establish Connection" dialog copy**: The subheading mentions "instant and gasless deposits", but the two signatures actually enable _trading_ (agent) and _builder fees_ — not deposits. Rewording as "Enable trading" would match what's happening.
- **UX-3 — "Perps Spot" button label reads as one word**: The sidebar toggle for the transfer dialog is labeled `Perps Spot`. Reads like "Perps Spot" (one thing) rather than a Perps ↔ Spot swap. `Perps ↔ Spot` or `Transfer` would be clearer.
- **UX-4 — Wallet modal labels are duplicated**: Buttons in the Connect Wallet modal read `Metamask Metamask`, `Rabby Wallet Rabby Wallet`, etc. (Icon `alt` + visible text both included as accessible name.)

## Pre-existing console noise (not from this probe)

Captured on initial navigation to `/BTC`:

- **Hydration mismatch** in `OrderButton` (wallet icon SVG rendered on server but not client). Wagmi/SSR issue on the Connect button.
- **Reown Project ID missing / 403** — `[Reown Config] Failed to fetch remote project configuration. Using local/default values.` and `AppKit SDK version 1.8.7 is outdated. Latest version is 1.8.23.` from `@reown/appkit`.
- `ERR_BLOCKED_BY_CLIENT` on one resource — likely Brave shields.

None of these blocked any flow; noting for hygiene.
