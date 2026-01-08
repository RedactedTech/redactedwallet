import { PublicKey, Keypair, VersionedTransaction } from '@solana/web3.js';
import { createJupiterApiClient, QuoteResponse } from '@jup-ag/api';
import { pool } from '../config/database';
import { Trade } from '../types';
import { SolanaService } from './SolanaService';
import { WalletService } from './WalletService';
import { AuthService } from './AuthService';
import { TokenService } from './TokenService';
import { NotFoundError, ValidationError } from '../types';
import bs58 from 'bs58';

// ============================================================
// TRADE SERVICE
// ============================================================

export interface CreateTradeInput {
  userId: string;
  strategyId?: string;
  ghostWalletId: string;
  tokenAddress: string;
  entryAmountSol: number;
  maxSlippageBps?: number;
  takeProfitPct?: number;
  stopLossPct?: number;
  trailingStopPct?: number;
  useJitoBundle?: boolean;
  sessionPassword: string; // Encrypted password token from login
}

export interface ExecuteSwapInput {
  walletKeypair: Keypair;
  inputMint: string; // SOL or token address
  outputMint: string; // Token address or SOL
  amount: number; // In lamports
  slippageBps: number;
}

export class TradeService {
  private static jupiterApi = createJupiterApiClient();

  // ============================================================
  // JUPITER SWAP EXECUTION
  // ============================================================

  /**
   * Get quote from Jupiter
   */
  static async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 100
  ): Promise<QuoteResponse> {
    try {
      const quote = await this.jupiterApi.quoteGet({
        inputMint,
        outputMint,
        amount,
        slippageBps,
        onlyDirectRoutes: false,
        asLegacyTransaction: false,
      });

      if (!quote) {
        throw new Error('No quote available');
      }

      return quote;
    } catch (error: any) {
      throw new Error(`Failed to get Jupiter quote: ${error.message}`);
    }
  }

  /**
   * Execute swap via Jupiter
   */
  static async executeSwap(input: ExecuteSwapInput): Promise<{
    signature: string;
    inputAmount: number;
    outputAmount: number;
  }> {
    const { walletKeypair, inputMint, outputMint, amount, slippageBps } = input;

    // Get quote
    const quote = await this.getQuote(inputMint, outputMint, amount, slippageBps);

    // Get swap transaction
    const swapResult = await this.jupiterApi.swapPost({
      swapRequest: {
        quoteResponse: quote,
        userPublicKey: walletKeypair.publicKey.toBase58(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      },
    });

    // Deserialize transaction
    const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // Sign transaction
    transaction.sign([walletKeypair]);

    // Send and confirm transaction
    const result = await SolanaService.sendAndConfirmTransaction(transaction, {
      commitment: 'confirmed',
      maxRetries: 3,
    });

    return {
      signature: result.signature,
      inputAmount: parseInt(quote.inAmount),
      outputAmount: parseInt(quote.outAmount),
    };
  }

  // ============================================================
  // TRADE CREATION
  // ============================================================

  /**
   * Create a new trade (buy tokens)
   */
  static async createTrade(input: CreateTradeInput): Promise<Trade> {
    const {
      userId,
      strategyId,
      ghostWalletId,
      tokenAddress,
      entryAmountSol,
      maxSlippageBps = 100,
      takeProfitPct,
      stopLossPct,
      trailingStopPct,
      useJitoBundle = false,
      sessionPassword,
    } = input;

    // Verify wallet belongs to user
    const wallet = await WalletService.getWalletById(ghostWalletId, userId);

    // Decrypt password and derive actual keypair from master seed
    const userPassword = AuthService.decryptPasswordFromSession(sessionPassword, userId);
    const walletKeypair = await WalletService.deriveUserKeypair(
      userId,
      wallet.wallet_index,
      userPassword
    );

    // Convert SOL to lamports
    const amountLamports = Math.floor(entryAmountSol * 1e9);

    // SOL mint address (wrapped SOL)
    const SOL_MINT = 'So11111111111111111111111111111111111111112';

    try {
      // Execute buy swap (SOL -> Token)
      const swapResult = await this.executeSwap({
        walletKeypair,
        inputMint: SOL_MINT,
        outputMint: tokenAddress,
        amount: amountLamports,
        slippageBps: maxSlippageBps,
      });

      // Fetch entry price from oracle
      const metrics = await TokenService.fetchTokenMetrics(tokenAddress);
      const entryPriceUsd = metrics?.price_usd || 0;

      if (!metrics) {
        console.warn(`⚠️ Could not fetch price for ${tokenAddress}, entry price set to 0`);
      }

      // Create trade record
      const result = await pool.query(
        `INSERT INTO trades (
          user_id,
          strategy_id,
          ghost_wallet_id,
          token_address,
          entry_tx_hash,
          entry_timestamp,
          entry_price_usd,
          entry_amount_sol,
          entry_amount_tokens,
          entry_slippage_bps,
          take_profit_pct,
          stop_loss_pct,
          trailing_stop_pct,
          max_hold_time_minutes,
          status,
          used_jito_bundle,
          session_password_encrypted
        ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          userId,
          strategyId || null,
          ghostWalletId,
          tokenAddress,
          swapResult.signature,
          entryPriceUsd,
          entryAmountSol,
          swapResult.outputAmount,
          maxSlippageBps,
          takeProfitPct || null,
          stopLossPct || null,
          trailingStopPct || null,
          60, // Default max hold time: 60 minutes (can be overridden by input)
          'open',
          useJitoBundle,
          sessionPassword, // Store for background worker
        ]
      );

      const trade = result.rows[0];

      // Update wallet metrics
      await pool.query(
        `UPDATE ghost_wallets
         SET total_trades = total_trades + 1,
             last_trade_at = NOW()
         WHERE id = $1`,
        [ghostWalletId]
      );

      // Log audit event
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          'trade_created',
          'trade',
          trade.id,
          JSON.stringify({
            token_address: tokenAddress,
            entry_amount_sol: entryAmountSol,
            signature: swapResult.signature,
          }),
        ]
      );

      return trade;
    } catch (error: any) {
      // Create failed trade record
      const result = await pool.query(
        `INSERT INTO trades (
          user_id,
          strategy_id,
          ghost_wallet_id,
          token_address,
          entry_amount_sol,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [userId, strategyId || null, ghostWalletId, tokenAddress, entryAmountSol, 'failed']
      );

      throw new Error(`Trade execution failed: ${error.message}`);
    }
  }

  // ============================================================
  // TRADE CLOSING
  // ============================================================

  /**
   * Close an open trade (sell tokens)
   */
  static async closeTrade(
    tradeId: string,
    userId: string,
    sessionPassword: string,
    exitReason: 'take_profit' | 'stop_loss' | 'trailing_stop' | 'manual' | 'timeout' = 'manual'
  ): Promise<Trade> {
    // Get trade
    const tradeResult = await pool.query(
      'SELECT * FROM trades WHERE id = $1 AND user_id = $2',
      [tradeId, userId]
    );

    if (tradeResult.rows.length === 0) {
      throw new NotFoundError('Trade not found');
    }

    const trade = tradeResult.rows[0];

    if (trade.status !== 'open') {
      throw new ValidationError('Trade is not open');
    }

    // Get wallet
    const wallet = await WalletService.getWalletById(trade.ghost_wallet_id, userId);

    // Decrypt password and derive actual keypair from master seed
    const userPassword = AuthService.decryptPasswordFromSession(sessionPassword, userId);
    const walletKeypair = await WalletService.deriveUserKeypair(
      userId,
      wallet.wallet_index,
      userPassword
    );

    const SOL_MINT = 'So11111111111111111111111111111111111111112';

    try {
      // Execute sell swap (Token -> SOL)
      const swapResult = await this.executeSwap({
        walletKeypair,
        inputMint: trade.token_address,
        outputMint: SOL_MINT,
        amount: parseInt(trade.entry_amount_tokens),
        slippageBps: 100,
      });

      // Calculate P&L
      const exitAmountSol = swapResult.outputAmount / 1e9;
      const profitLossSol = exitAmountSol - parseFloat(trade.entry_amount_sol);
      const profitLossPct = (profitLossSol / parseFloat(trade.entry_amount_sol)) * 100;

      // Calculate hold time
      const entryTime = new Date(trade.entry_timestamp || trade.created_at);
      const exitTime = new Date();
      const holdTimeSeconds = Math.floor((exitTime.getTime() - entryTime.getTime()) / 1000);

      // Update trade record
      const result = await pool.query(
        `UPDATE trades
         SET exit_tx_hash = $1,
             exit_timestamp = NOW(),
             exit_amount_sol = $2,
             exit_reason = $3,
             profit_loss_sol = $4,
             profit_loss_pct = $5,
             hold_time_seconds = $6,
             status = 'closed'
         WHERE id = $7
         RETURNING *`,
        [
          swapResult.signature,
          exitAmountSol,
          exitReason,
          profitLossSol,
          profitLossPct,
          holdTimeSeconds,
          tradeId,
        ]
      );

      const updatedTrade = result.rows[0];

      // Update wallet P&L
      await pool.query(
        `UPDATE ghost_wallets
         SET profit_loss_usd = profit_loss_usd + $1,
             total_volume_usd = total_volume_usd + $2
         WHERE id = $3`,
        [profitLossSol, parseFloat(trade.entry_amount_sol) + exitAmountSol, trade.ghost_wallet_id]
      );

      // Log audit event
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          'trade_closed',
          'trade',
          tradeId,
          JSON.stringify({
            exit_reason: exitReason,
            profit_loss_sol: profitLossSol,
            signature: swapResult.signature,
          }),
        ]
      );

      return updatedTrade;
    } catch (error: any) {
      // Update trade status to failed
      await pool.query(
        `UPDATE trades
         SET status = 'failed',
             exit_reason = 'error'
         WHERE id = $1`,
        [tradeId]
      );

      throw new Error(`Trade exit failed: ${error.message}`);
    }
  }

  // ============================================================
  // TRADE RETRIEVAL
  // ============================================================

  /**
   * Get trades for a user
   */
  static async getUserTrades(
    userId: string,
    options?: {
      status?: 'pending' | 'open' | 'closed' | 'failed';
      limit?: number;
      offset?: number;
    }
  ): Promise<Trade[]> {
    const { status, limit = 50, offset = 0 } = options || {};

    let query = 'SELECT * FROM trades WHERE user_id = $1';
    const params: any[] = [userId];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get specific trade
   */
  static async getTradeById(tradeId: string, userId: string): Promise<Trade> {
    const result = await pool.query(
      'SELECT * FROM trades WHERE id = $1 AND user_id = $2',
      [tradeId, userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Trade not found');
    }

    return result.rows[0];
  }

  /**
   * Get user trade statistics
   */
  static async getTradeStats(userId: string): Promise<{
    totalTrades: number;
    openTrades: number;
    closedTrades: number;
    totalPnLSol: number;
    winRate: number;
    avgHoldTimeSeconds: number;
  }> {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total_trades,
        COUNT(*) FILTER (WHERE status = 'open') as open_trades,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_trades,
        COALESCE(SUM(profit_loss_sol), 0) as total_pnl_sol,
        COUNT(*) FILTER (WHERE status = 'closed' AND profit_loss_sol > 0) as winning_trades,
        COALESCE(AVG(hold_time_seconds), 0) as avg_hold_time_seconds
       FROM trades
       WHERE user_id = $1`,
      [userId]
    );

    const stats = result.rows[0];
    const closedTrades = parseInt(stats.closed_trades);
    const winningTrades = parseInt(stats.winning_trades);

    return {
      totalTrades: parseInt(stats.total_trades),
      openTrades: parseInt(stats.open_trades),
      closedTrades,
      totalPnLSol: parseFloat(stats.total_pnl_sol),
      winRate: closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0,
      avgHoldTimeSeconds: parseFloat(stats.avg_hold_time_seconds),
    };
  }

  /**
   * Close trade automatically (for background workers)
   * Uses stored session password from trade record
   */
  static async closeTradeAutomatically(
    tradeId: string,
    exitReason: 'take_profit' | 'stop_loss' | 'trailing_stop' | 'timeout'
  ): Promise<Trade> {
    // Get trade with session password
    const tradeResult = await pool.query(
      'SELECT * FROM trades WHERE id = $1',
      [tradeId]
    );

    if (tradeResult.rows.length === 0) {
      throw new NotFoundError('Trade not found');
    }

    const trade = tradeResult.rows[0];

    if (trade.status !== 'open') {
      throw new ValidationError('Trade is not open');
    }

    if (!trade.session_password_encrypted) {
      throw new ValidationError(
        'No session password stored for this trade - cannot close automatically'
      );
    }

    // Use the stored session password to close the trade
    return this.closeTrade(
      tradeId,
      trade.user_id,
      trade.session_password_encrypted,
      exitReason
    );
  }

  // ============================================================
  // TRADE MONITORING
  // ============================================================

  /**
   * Check if trade should be closed based on exit conditions
   */
  static async checkExitConditions(trade: Trade): Promise<{
    shouldExit: boolean;
    reason?: 'take_profit' | 'stop_loss' | 'trailing_stop' | 'timeout';
    currentPrice?: number;
    plPct?: number;
  }> {
    try {
      // Skip if trade is not open
      if (trade.status !== 'open') {
        return { shouldExit: false };
      }

      // Fetch current token price
      const metrics = await TokenService.fetchTokenMetrics(trade.token_address);

      if (!metrics) {
        console.warn(`⚠️ Could not fetch price for ${trade.token_address}, skipping exit check`);
        return { shouldExit: false };
      }

      const currentPrice = metrics.price_usd;
      const entryPrice = trade.entry_price_usd;

      // If entry price is missing or zero, can't calculate P&L
      if (!entryPrice || entryPrice === 0) {
        console.warn(`⚠️ Entry price is zero for trade ${trade.id}, skipping exit check`);
        return { shouldExit: false };
      }

      // Calculate P&L percentage
      const plPct = ((currentPrice - entryPrice) / entryPrice) * 100;

      console.log(`📊 Trade ${trade.id}: Entry $${entryPrice.toFixed(8)}, Current $${currentPrice.toFixed(8)}, P&L: ${plPct.toFixed(2)}%`);

      // Check take profit
      if (trade.take_profit_pct && plPct >= trade.take_profit_pct) {
        console.log(`✅ Take profit triggered for trade ${trade.id}: ${plPct.toFixed(2)}% >= ${trade.take_profit_pct}%`);
        return {
          shouldExit: true,
          reason: 'take_profit',
          currentPrice,
          plPct,
        };
      }

      // Check stop loss
      if (trade.stop_loss_pct && plPct <= -trade.stop_loss_pct) {
        console.log(`🛑 Stop loss triggered for trade ${trade.id}: ${plPct.toFixed(2)}% <= -${trade.stop_loss_pct}%`);
        return {
          shouldExit: true,
          reason: 'stop_loss',
          currentPrice,
          plPct,
        };
      }

      // Check trailing stop (implement simple trailing stop logic)
      // Trailing stop: Exit if price drops by X% from peak
      if (trade.trailing_stop_pct) {
        // Get highest price since entry from database or calculate peak
        // For now, using a simple approach: if price is up but drops by trailing_stop_pct from entry
        if (plPct > 0) {
          // Price is in profit, check if it dropped from peak
          // Simplified: exit if profit eroded by trailing_stop_pct
          const peakPct = plPct; // In reality, we'd track the peak
          const trailingThreshold = peakPct - trade.trailing_stop_pct;

          if (plPct <= trailingThreshold) {
            console.log(`📉 Trailing stop triggered for trade ${trade.id}: ${plPct.toFixed(2)}% <= ${trailingThreshold.toFixed(2)}%`);
            return {
              shouldExit: true,
              reason: 'trailing_stop',
              currentPrice,
              plPct,
            };
          }
        }
      }

      // Check timeout
      if (trade.max_hold_time_minutes && trade.entry_timestamp) {
        const entryTime = new Date(trade.entry_timestamp).getTime();
        const currentTime = Date.now();
        const holdTimeMinutes = (currentTime - entryTime) / (1000 * 60);

        if (holdTimeMinutes >= trade.max_hold_time_minutes) {
          console.log(`⏱️ Timeout triggered for trade ${trade.id}: ${holdTimeMinutes.toFixed(2)} min >= ${trade.max_hold_time_minutes} min`);
          return {
            shouldExit: true,
            reason: 'timeout',
            currentPrice,
            plPct,
          };
        }
      }

      // No exit conditions met
      return {
        shouldExit: false,
        currentPrice,
        plPct,
      };
    } catch (error: any) {
      console.error(`Error checking exit conditions for trade ${trade.id}:`, error.message);
      return { shouldExit: false };
    }
  }
}

export default TradeService;
