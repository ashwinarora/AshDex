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

### Hyperliquid Network

The app supports both mainnet and testnet, configured via `NEXT_PUBLIC_HYPERLIQUID_NETWORK` env var.

- Mainnet chain ID: 999
- Testnet chain ID: 998

### Path Aliases

Use `@/*` to import from `src/*` (configured in tsconfig.json).
