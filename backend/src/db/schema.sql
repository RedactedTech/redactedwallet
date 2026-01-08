-- redacted Database Schema
-- "1 Wallet. A thousand masks"

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS & AUTHENTICATION
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    master_seed_encrypted TEXT NOT NULL,
    encryption_salt TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    wallet_index_counter INTEGER DEFAULT 0
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================================
-- GHOST WALLETS (Ephemeral Trading Wallets)
-- ============================================================

CREATE TABLE ghost_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Wallet identity
    public_key VARCHAR(44) UNIQUE NOT NULL,
    derivation_path VARCHAR(50) NOT NULL,
    wallet_index INTEGER NOT NULL,

    -- Lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    first_funded_at TIMESTAMP,
    last_trade_at TIMESTAMP,
    recycled_at TIMESTAMP,

    -- Metrics
    total_trades INTEGER DEFAULT 0,
    total_volume_usd DECIMAL(20, 2) DEFAULT 0,
    profit_loss_usd DECIMAL(20, 2) DEFAULT 0,

    -- Cleanup tracking
    max_trades_per_wallet INTEGER DEFAULT 50,
    max_lifetime_hours INTEGER DEFAULT 168,

    -- Privacy
    funded_from_relay_pool BOOLEAN DEFAULT true,
    relay_pool_id UUID,

    UNIQUE(user_id, wallet_index),
    CHECK (status IN ('active', 'draining', 'recycled', 'burned'))
);

CREATE INDEX idx_ghost_wallets_user ON ghost_wallets(user_id);
CREATE INDEX idx_ghost_wallets_status ON ghost_wallets(status);
CREATE INDEX idx_ghost_wallets_pubkey ON ghost_wallets(public_key);
CREATE INDEX idx_ghost_wallets_created ON ghost_wallets(created_at DESC);

-- ============================================================
-- PRIVACY RELAY POOLS (Cross-chain funding mechanism)
-- ============================================================

CREATE TABLE relay_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Relay wallet (intermediate address)
    relay_address VARCHAR(100) NOT NULL,
    relay_address_encrypted TEXT,
    chain VARCHAR(20) NOT NULL,

    -- Balance tracking
    deposited_amount_usd DECIMAL(20, 2) DEFAULT 0,
    allocated_amount_usd DECIMAL(20, 2) DEFAULT 0,
    available_amount_usd DECIMAL(20, 2) DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    last_funded_at TIMESTAMP,

    -- Bridge tracking
    bridge_hops JSONB,
    last_bridge_tx_hash VARCHAR(100),

    CHECK (chain IN ('base', 'arbitrum', 'solana')),
    CHECK (status IN ('pending', 'active', 'depleted', 'closed'))
);

CREATE INDEX idx_relay_pools_user ON relay_pools(user_id);
CREATE INDEX idx_relay_pools_status ON relay_pools(status);
CREATE INDEX idx_relay_pools_chain ON relay_pools(chain);

-- ============================================================
-- TRADING STRATEGIES (User-configured sniping rules)
-- ============================================================

CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Strategy config
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,

    -- Entry conditions
    target_source VARCHAR(50),
    min_liquidity_usd DECIMAL(20, 2),
    max_market_cap_usd DECIMAL(20, 2),
    token_address VARCHAR(44),

    -- Position sizing
    entry_amount_sol DECIMAL(10, 4),
    max_slippage_bps INTEGER DEFAULT 100,

    -- Exit rules
    take_profit_pct DECIMAL(5, 2),
    stop_loss_pct DECIMAL(5, 2),
    trailing_stop_pct DECIMAL(5, 2),
    max_hold_time_minutes INTEGER,

    -- MEV protection
    use_jito_bundle BOOLEAN DEFAULT true,
    jito_tip_lamports BIGINT DEFAULT 10000,

    -- Wallet rotation
    rotate_wallet_per_trade BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CHECK (target_source IN ('pump_fun', 'raydium', 'jupiter', 'manual'))
);

CREATE INDEX idx_strategies_user ON strategies(user_id);
CREATE INDEX idx_strategies_active ON strategies(is_active);
CREATE INDEX idx_strategies_updated ON strategies(updated_at DESC);

-- ============================================================
-- TRADES (Transaction history)
-- ============================================================

CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
    ghost_wallet_id UUID NOT NULL REFERENCES ghost_wallets(id),

    -- Trade details
    token_address VARCHAR(44) NOT NULL,
    token_symbol VARCHAR(20),
    token_name VARCHAR(100),

    -- Entry
    entry_tx_hash VARCHAR(100),
    entry_timestamp TIMESTAMP,
    entry_price_usd DECIMAL(20, 8),
    entry_amount_sol DECIMAL(10, 4),
    entry_amount_tokens DECIMAL(30, 8),
    entry_slippage_bps INTEGER,

    -- Exit conditions
    take_profit_pct DECIMAL(5, 2),
    stop_loss_pct DECIMAL(5, 2),
    trailing_stop_pct DECIMAL(5, 2),
    max_hold_time_minutes INTEGER,

    -- Exit
    exit_tx_hash VARCHAR(100),
    exit_timestamp TIMESTAMP,
    exit_price_usd DECIMAL(20, 8),
    exit_amount_sol DECIMAL(10, 4),
    exit_reason VARCHAR(50),

    -- Performance
    profit_loss_sol DECIMAL(10, 4),
    profit_loss_usd DECIMAL(20, 2),
    profit_loss_pct DECIMAL(10, 2),
    hold_time_seconds INTEGER,

    -- MEV tracking
    used_jito_bundle BOOLEAN DEFAULT false,
    jito_bundle_id VARCHAR(100),
    detected_frontrun BOOLEAN DEFAULT false,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    -- Background job authentication
    session_password_encrypted TEXT,

    created_at TIMESTAMP DEFAULT NOW(),

    CHECK (status IN ('pending', 'open', 'closed', 'failed')),
    CHECK (exit_reason IN ('take_profit', 'stop_loss', 'trailing_stop', 'manual', 'timeout', 'error') OR exit_reason IS NULL)
);

CREATE INDEX idx_trades_user ON trades(user_id);
CREATE INDEX idx_trades_wallet ON trades(ghost_wallet_id);
CREATE INDEX idx_trades_strategy ON trades(strategy_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_token ON trades(token_address);
CREATE INDEX idx_trades_timestamp ON trades(entry_timestamp DESC);
CREATE INDEX idx_trades_created ON trades(created_at DESC);

-- ============================================================
-- MONITORED TOKENS (Token watchlist & signals)
-- ============================================================

CREATE TABLE monitored_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Token identity
    token_address VARCHAR(44) UNIQUE NOT NULL,
    token_symbol VARCHAR(20),
    token_name VARCHAR(100),

    -- Discovery
    discovered_at TIMESTAMP DEFAULT NOW(),
    source VARCHAR(50),

    -- Market data
    current_price_usd DECIMAL(20, 8),
    market_cap_usd DECIMAL(20, 2),
    liquidity_usd DECIMAL(20, 2),
    volume_24h_usd DECIMAL(20, 2),
    holder_count INTEGER,

    -- Signals
    is_trending BOOLEAN DEFAULT false,
    momentum_score DECIMAL(5, 2),
    risk_score DECIMAL(5, 2),

    -- Metadata
    metadata JSONB,
    last_updated TIMESTAMP DEFAULT NOW(),

    CHECK (source IN ('pump_fun', 'raydium', 'jupiter', 'manual'))
);

CREATE INDEX idx_monitored_tokens_address ON monitored_tokens(token_address);
CREATE INDEX idx_monitored_tokens_trending ON monitored_tokens(is_trending);
CREATE INDEX idx_monitored_tokens_discovered ON monitored_tokens(discovered_at DESC);
CREATE INDEX idx_monitored_tokens_source ON monitored_tokens(source);

-- ============================================================
-- PRICE HISTORY (For charting & analytics)
-- ============================================================

CREATE TABLE price_history (
    id BIGSERIAL PRIMARY KEY,
    token_address VARCHAR(44) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    price_usd DECIMAL(20, 8),
    volume_usd DECIMAL(20, 2),
    liquidity_usd DECIMAL(20, 2),

    UNIQUE(token_address, timestamp)
);

CREATE INDEX idx_price_history_token_time ON price_history(token_address, timestamp DESC);

-- ============================================================
-- SYSTEM JOBS (Background task tracking)
-- ============================================================

CREATE TABLE system_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payload JSONB,
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),

    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    CHECK (job_type IN ('wallet_cleanup', 'token_monitor', 'price_update', 'strategy_match', 'relay_bridge'))
);

CREATE INDEX idx_system_jobs_type_status ON system_jobs(job_type, status);
CREATE INDEX idx_system_jobs_created ON system_jobs(created_at DESC);
CREATE INDEX idx_system_jobs_status ON system_jobs(status);

-- ============================================================
-- AUDIT LOGS (Security & compliance)
-- ============================================================

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ============================================================
-- REFRESH TOKENS (For JWT refresh token rotation)
-- ============================================================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP,
    is_revoked BOOLEAN DEFAULT false
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
