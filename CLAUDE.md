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

### Database Commands
```bash
bunx prisma generate     # Generate Prisma client
bunx prisma migrate dev  # Run migrations in development
bunx prisma studio       # Open database GUI
```

## Architecture Overview

Nexon is a trading platform built on Hyperliquid (decentralized derivatives exchange) using Next.js 15 App Router.

### Tech Stack
- **Framework**: Next.js 15 with Turbopack
- **State**: Zustand stores + React Query for server state
- **Database**: PostgreSQL via Prisma
- **Wallets**: Privy (email-based) + Wagmi/Viem (traditional wallets)
- **Trading**: @nktkas/hyperliquid SDK with WebSocket subscriptions
- **UI**: TailwindCSS 4 + Radix UI components
- **i18n**: Tolgee (English + Arabic with RTL support)

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/store/` - Zustand stores (HyperliquidStore, UserStore, FavoritesStore, etc.)
- `src/components/` - React components organized by feature (Trading/, UserData/, Portfolio/, etc.)
- `src/services/` - Backend managers (RewardsManager, UserManager, HLService, KmsManager)
- `src/hooks/` - Custom React hooks for data fetching and business logic
- `src/context/` - React contexts (EstablishConnectionContext, WalletModalContext)

### State Management Pattern
```
Zustand Stores (global client state)
├── HyperliquidStore - Trading data, WebSocket subscriptions, agent wallet
├── UserStore - User preferences, language settings (persisted)
├── FavoritesStore - Favorite trading pairs (persisted)
├── TradeUIStore - Order placement UI state
└── FIBStore - First Iraqi Bank integration state

React Query - Server state (user data, coin data, approvals)
React Context - UI state (wallet modal, agent approval flow)
```

### Data Flow
1. User connects wallet via Wagmi/Privy → triggers HyperliquidInitializer
2. SDK initializes HTTP + WebSocket clients → subscribes to channels (allMids, webData2, candles, ledgerUpdates)
3. WebSocket updates push to Zustand store → components subscribe via selectors
4. Transactions: Sign with wallet → execute via Hyperliquid SDK

### Important Files
- `src/app/HyperliquidInitializer.tsx` - Sets up Hyperliquid SDK and subscriptions on app mount
- `src/store/HyperliquidStore.ts` - Central trading state (positions, orders, balances, WebSocket data)
- `src/config/wagmi.config.ts` - Wallet configuration (chains, connectors)
- `src/services/hl.service.ts` - Hyperliquid API interactions
- `src/services/Rewards.manager.ts` - Referral rewards logic with KMS signing

### Hyperliquid Network
The app supports both mainnet and testnet, configured via `NEXT_PUBLIC_HYPERLIQUID_NETWORK` env var.
- Mainnet chain ID: 999
- Testnet chain ID: 998

### Path Aliases
Use `@/*` to import from `src/*` (configured in tsconfig.json).

### Database Schema (Prisma)
- `User` - Wallet addresses, usernames, referral tracking
- `Invite` - Referral codes (8-char unique codes)
- `UserRewardsClaims` - Reward claim history
- `Terms` / `UserTermsSignature` - T&C acceptance tracking
