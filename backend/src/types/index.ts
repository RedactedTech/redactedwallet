import { Request } from 'express';

// ============================================================
// USER TYPES
// ============================================================

export interface User {
  id: string;
  email: string;
  password_hash: string;
  master_seed_encrypted: string;
  encryption_salt: string;
  created_at: Date;
  last_login: Date | null;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  is_active: boolean;
  wallet_index_counter: number;
}

export interface UserPublic {
  id: string;
  email: string;
  created_at: Date;
  last_login: Date | null;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  is_active: boolean;
}

export interface CreateUserInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ============================================================
// JWT TYPES
// ============================================================

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  sessionPassword?: string; // Encrypted password for wallet derivation
}

// ============================================================
// GHOST WALLET TYPES
// ============================================================

export interface GhostWallet {
  id: string;
  user_id: string;
  public_key: string;
  derivation_path: string;
  wallet_index: number;
  status: 'active' | 'draining' | 'recycled' | 'burned';
  created_at: Date;
  first_funded_at: Date | null;
  last_trade_at: Date | null;
  recycled_at: Date | null;
  total_trades: number;
  total_volume_usd: number;
  profit_loss_usd: number;
  max_trades_per_wallet: number;
  max_lifetime_hours: number;
  funded_from_relay_pool: boolean;
  relay_pool_id: string | null;
}

export interface SpawnWalletInput {
  userId: string;
  fundAmount?: number;
  strategyId?: string;
}

// ============================================================
// STRATEGY TYPES
// ============================================================

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  target_source: 'pump_fun' | 'raydium' | 'jupiter' | 'manual';
  min_liquidity_usd: number | null;
  max_market_cap_usd: number | null;
  token_address: string | null;
  entry_amount_sol: number;
  max_slippage_bps: number;
  take_profit_pct: number | null;
  stop_loss_pct: number | null;
  trailing_stop_pct: number | null;
  max_hold_time_minutes: number | null;
  use_jito_bundle: boolean;
  jito_tip_lamports: bigint;
  rotate_wallet_per_trade: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStrategyInput {
  name: string;
  target_source: 'pump_fun' | 'raydium' | 'jupiter' | 'manual';
  min_liquidity_usd?: number;
  max_market_cap_usd?: number;
  token_address?: string;
  entry_amount_sol: number;
  max_slippage_bps?: number;
  take_profit_pct?: number;
  stop_loss_pct?: number;
  trailing_stop_pct?: number;
  max_hold_time_minutes?: number;
  use_jito_bundle?: boolean;
  jito_tip_lamports?: bigint;
  rotate_wallet_per_trade?: boolean;
}

// ============================================================
// TRADE TYPES
// ============================================================

export interface Trade {
  id: string;
  user_id: string;
  strategy_id: string | null;
  ghost_wallet_id: string;
  token_address: string;
  token_symbol: string | null;
  token_name: string | null;
  entry_tx_hash: string | null;
  entry_timestamp: Date | null;
  entry_price_usd: number | null;
  entry_amount_sol: number | null;
  entry_amount_tokens: number | null;
  entry_slippage_bps: number | null;
  take_profit_pct: number | null;
  stop_loss_pct: number | null;
  trailing_stop_pct: number | null;
  max_hold_time_minutes: number | null;
  exit_tx_hash: string | null;
  exit_timestamp: Date | null;
  exit_price_usd: number | null;
  exit_amount_sol: number | null;
  exit_reason: 'take_profit' | 'stop_loss' | 'trailing_stop' | 'manual' | 'timeout' | 'error' | null;
  profit_loss_sol: number | null;
  profit_loss_usd: number | null;
  profit_loss_pct: number | null;
  hold_time_seconds: number | null;
  used_jito_bundle: boolean;
  jito_bundle_id: string | null;
  detected_frontrun: boolean;
  status: 'pending' | 'open' | 'closed' | 'failed';
  session_password_encrypted: string | null;
  created_at: Date;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================
// ERROR TYPES
// ============================================================

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}
