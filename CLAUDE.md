# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Redacted is a privacy-focused Solana trading platform with ephemeral "ghost wallets" for anonymous trading. The architecture consists of:
- **Next.js frontend** (port 3500) - React 19 with App Router
- **Express backend** (port 3001) - REST API with PostgreSQL
- **Trade Monitor Worker** - Background service for automatic trade exits

**Tagline**: "1 Wallet. A thousand masks"

## Development Commands

### Running the Application

```bash
# Full stack (frontend + backend + worker)
npm run dev

# Individual services
npm run dev:frontend    # Next.js on port 3500
npm run dev:backend     # Express API on port 3001
npm run dev:worker      # Trade monitor worker

# Clear Next.js cache (if having stale UI issues)
npm run clear-cache
```

**Important**: Both frontend and backend servers are usually already running. Do NOT start/stop them without explicit user permission.

### Build & Deploy

```bash
# Build Next.js for production
npm run build

# Production mode
npm start                # Next.js frontend
npm run start:backend    # Express backend
npm run start:worker     # Trade monitor
```

### Linting & Testing

```bash
# ESLint
npm run lint

# Playwright tests (auto-run per user preferences)
# Tests are automatically executed when triggered
```

### Database

Database connection string (PostgreSQL on Railway):
```
postgresql://postgres:NajctWeCLYaSywSNHKxkWElcSbTsDSPc@caboose.proxy.rlwy.net:58182/railway
```

Migrations are auto-run on backend startup via `runMigrations()` in `server.ts`.

### Deployment

**Railway**: Automatic deployment on `git push` to master branch. Do NOT manually run `railway up` after pushing - it triggers duplicate deploys.

**Frontend**: Deployed via Railway, configured in `railway.toml`
**Backend/Worker**: Deployed separately (configuration details in Railway dashboard)

## Architecture

### Backend Structure (`backend/src/`)

```
api/
  routes/           # Express route definitions
    auth.ts         # Authentication (login, register, refresh token)
    wallets.ts      # Ghost wallet CRUD operations
    trades.ts       # Trade execution and monitoring
    tokens.ts       # Token metadata and price feeds

services/           # Business logic layer
  AuthService.ts          # JWT auth, password hashing
  WalletService.ts        # Derivation, encryption, lifecycle
  TradeService.ts         # Entry/exit execution, P&L tracking
  SolanaService.ts        # Jupiter integration, transaction building
  TokenService.ts         # DexScreener API, token metadata
  EncryptionService.ts    # AES-256 encryption for seeds/passwords

config/
  database.ts       # PostgreSQL connection pool
  solana.ts         # Solana web3.js connection

db/
  schema.sql        # Full database schema
  migrations/       # Version-controlled migrations
  migrate.ts        # Migration runner

workers/
  tradeMonitor.ts   # Auto-exit monitoring (30s interval)
  README.md         # Comprehensive worker documentation

middleware/
  errorHandler.ts   # Global error handling
```

### Frontend Structure (`app/`)

```
app/
  auth/
    login/page.tsx
    register/page.tsx
  dashboard/
    page.tsx              # Main dashboard
    tokens/page.tsx       # Token browser
  components/             # Reusable UI components
  layout.tsx              # Root layout with metadata
  page.tsx                # Landing page
  globals.css             # TailwindCSS styles
```

### Database Schema

**Core Tables**:
- `users` - User accounts with encrypted master seed
- `ghost_wallets` - Ephemeral trading wallets (HD derivation)
- `trades` - Open/closed positions with exit conditions
- `relay_pools` - Privacy-enhanced funding pools
- `tokens` - Token metadata cache
- `audit_logs` - Security event tracking

**Key Concepts**:
- Master seed stored encrypted with user password
- Ghost wallets derived via BIP39/44 (m/44'/501'/0'/0'/N)
- Session passwords stored encrypted for background trade exits
- Exit conditions: take profit, stop loss, trailing stop, timeout

## Security Model

### Encryption Layers

1. **Master Seed**: Encrypted with AES-256-CBC using user password + salt
2. **Session Password**: Encrypted with JWT_SECRET + userId for worker access
3. **Database**: PostgreSQL with pgcrypto extension
4. **API**: JWT bearer tokens (15m access, 7d refresh)

### Password Flow

**Registration**:
```
User Password → bcrypt → password_hash
User Password + Salt → AES-256 → Encrypted Master Seed
```

**Trade Execution**:
```
Session Password (plaintext in request) → Encrypted → Stored in trade record
Worker → Decrypt session password → Derive wallet → Execute transaction
```

**Important**: Session passwords enable fully automated exits but are stored encrypted in the database.

## Key Implementation Details

### Ghost Wallet Derivation

```typescript
// Path: m/44'/501'/0'/0'/N (where N = wallet_index)
const mnemonic = decryptMasterSeed(user.master_seed_encrypted, password);
const seed = await mnemonicToSeed(mnemonic);
const derivedSeed = derivePath(`m/44'/501'/0'/0'/${index}`, seed.toString('hex')).key;
const keypair = Keypair.fromSeed(derivedSeed);
```

### Trade Monitor Worker

- **Interval**: 30 seconds (configurable in `tradeMonitor.ts`)
- **Exit Conditions**: Checked via `TradeService.checkExitConditions()`
- **Automatic Closure**: Uses stored encrypted session password
- **Error Handling**: Failed closes logged to audit_logs, trade remains open

See `backend/src/workers/README.md` for comprehensive worker documentation.

### Solana Integration

- **RPC**: Helius API (mainnet) with API key in `.env`
- **Swap Aggregator**: Jupiter V6 API
- **Commitment**: `confirmed` for balance reliability
- **Token Metadata**: DexScreener API for prices

### Frontend Routing

- **Authentication**: `/auth/login`, `/auth/register`
- **Dashboard**: `/dashboard` (main), `/dashboard/tokens` (token browser)
- **Public**: `/` (landing), `/whitepaper` (docs)

## Common Patterns

### API Request Flow

```typescript
// Frontend → Backend
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(payload)
});
```

### Service Error Handling

```typescript
// Services throw AppError with status codes
throw new AppError('Resource not found', 404);

// Caught by errorHandler middleware
// Returns: { success: false, error: 'Resource not found' }
```

### Database Queries

```typescript
// Use pool.query() from config/database.ts
const result = await pool.query(
  'SELECT * FROM ghost_wallets WHERE user_id = $1',
  [userId]
);
```

## Environment Variables

Critical env vars (`.env`):
- `DATABASE_URL` - PostgreSQL connection string (Railway)
- `JWT_SECRET`, `REFRESH_TOKEN_SECRET` - Auth tokens
- `HELIUS_API_KEY` - Solana RPC authentication
- `SOLANA_RPC_URL` - Helius mainnet endpoint
- `PORT` - Backend port (default: 3001)
- `FRONTEND_URL` - CORS origin (default: http://localhost:3500)
- `NEXT_PUBLIC_API_URL` - Frontend API endpoint (default: http://localhost:3001)

## Git Workflow

- **Branch**: `master` (main branch for PRs)
- **Deployment**: Auto-deploy on push to master via Railway
- **Commit Style**: Use conventional commits without AI attribution
  - Examples: `Fix AES-256 encryption key length bug`, `Add social links to landing page`

**Important**: Commits and documentation should not reveal heavy AI assistance. Maintain a natural, developer-written style.

## Technology Stack

- **Frontend**: Next.js 16.1, React 19.2, TailwindCSS 4
- **Backend**: Express 5.2, TypeScript, tsx runtime
- **Database**: PostgreSQL (Railway hosted)
- **Blockchain**: Solana web3.js, Jupiter API
- **Auth**: JWT, bcryptjs
- **Encryption**: crypto (AES-256-CBC), bip39, ed25519-hd-key
- **Validation**: Zod

## Troubleshooting

### Frontend not updating
```bash
npm run clear-cache  # Clear Next.js build cache
# Kill dev server and restart
```

### Database connection issues
```bash
# Test connection (backend startup logs)
✅ Connected to PostgreSQL database
```

### Worker not closing trades
```sql
-- Check if session passwords are stored
SELECT id, token_address, session_password_encrypted IS NOT NULL
FROM trades WHERE status = 'open';

-- Check exit conditions configured
SELECT id, take_profit_pct, stop_loss_pct, max_hold_time_minutes
FROM trades WHERE status = 'open';
```

### Solana RPC errors
```bash
# Check Helius API key and rate limits
# Verify SOLANA_RPC_URL in .env
# Check commitment level (should be 'confirmed')
```
