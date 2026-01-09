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
      console.error('❌ Jupiter quote error:', {
        message: error.message,
        name: error.name,
        response: error.response?.data,
        status: error.response?.status,
        inputMint,
        outputMint,
        amount,
        slippageBps,
      });
      throw new Error(`Failed to get Jupiter quote: ${error.message}`);
    }
  }

  /**
   * Retry wrapper for Jupiter API calls with exponential backoff
   */
  private static async retryJupiterCall<T>(
    fn: () => Promise<T>,
    operation: string,
    maxRetries: number = 3
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        // Check for network errors (timeout, gateway errors, connection issues)
        const statusCode = error.response?.status || error.status;
        const isNetworkError =
          statusCode === 504 ||
          statusCode === 503 ||
          statusCode === 502 ||
          error.message?.includes('timeout') ||
          error.message?.includes('Gateway Time-out') ||
          error.message?.includes('ECONNRESET') ||
          error.message?.includes('ETIMEDOUT') ||
          error.name === 'ResponseError';

        if (isNetworkError && attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          console.log(`⏳ ${operation} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Not a network error or last attempt, throw
        throw error;
      }
    }

    throw new Error(`${operation} failed after ${maxRetries} attempts`);
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

    try {
      // Get quote with retry logic
      console.log(`🔍 Getting Jupiter quote: ${inputMint} -> ${outputMint}, amount: ${amount}, slippage: ${slippageBps}bps`);
      const quote = await this.retryJupiterCall(
        () => this.getQuote(inputMint, outputMint, amount, slippageBps),
        'Get quote'
      );
      console.log(`✅ Quote received: ${quote.inAmount} -> ${quote.outAmount}`);

      // Get swap transaction with retry logic
      console.log(`🔄 Requesting swap transaction for wallet: ${walletKeypair.publicKey.toBase58()}`);
      const swapResult = await this.retryJupiterCall(
        () => this.jupiterApi.swapPost({
          swapRequest: {
            quoteResponse: quote,
            userPublicKey: walletKeypair.publicKey.toBase58(),
            wrapAndUnwrapSol: true,
            dynamicComputeUnitLimit: true,
            prioritizationFeeLamports: {
              priorityLevelWithMaxLamports: {
                priorityLevel: 'high',
                maxLamports: 100000, // Cap at 0.0001 SOL
                global: false, // Use local fee market for better accuracy
              },
            },
          },
        }),
        'Get swap transaction'
      );
      console.log(`✅ Swap transaction received`);

      // Deserialize transaction
      const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      // Sign transaction
      transaction.sign([walletKeypair]);
      console.log(`✅ Transaction signed`);

      // Send and confirm transaction
      console.log(`📤 Sending transaction to Solana...`);
      const result = await SolanaService.sendAndConfirmTransaction(transaction, {
        commitment: 'confirmed',
        maxRetries: 3,
      });
      console.log(`✅ Transaction confirmed: ${result.signature}`);

      return {
        signature: result.signature,
        inputAmount: parseInt(quote.inAmount),
        outputAmount: parseInt(quote.outAmount),
      };
    } catch (error: any) {
      console.error('❌ Jupiter swap error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
        inputMint,
        outputMint,
        amount,
        slippageBps,
      });

      // Detect specific error patterns and provide user-friendly messages
      const errorMessage = error.message || '';
      const statusCode = error.response?.status || error.status;

      if (statusCode === 504 || statusCode === 503 || statusCode === 502 || error.name === 'ResponseError') {
        throw new Error(
          'Jupiter API is temporarily unavailable. This is a network issue with the swap provider. Please try again in a few moments.'
        );
      }

      if (errorMessage.includes('Attempt to debit an account but found no record of a prior credit')) {
        throw new Error(
          'Insufficient funds: The wallet does not have enough SOL to complete this transaction. Please fund the wallet and try again.'
        );
      }

      if (errorMessage.includes('Transaction simulation failed')) {
        throw new Error(
          `Transaction simulation failed: ${errorMessage}. This usually indicates insufficient funds or an issue with the token. Please check your wallet balance.`
        );
      }

      if (errorMessage.includes('No quote available') || errorMessage.includes('No routes found')) {
        throw new Error(
          'Unable to find a trading route for this token. The token may have insufficient liquidity or may not be tradeable at this time.'
        );
      }

      throw error;
    }
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

    // Check wallet balance before attempting trade
    const balance = await SolanaService.getSOLBalance(walletKeypair.publicKey);
    const requiredLamports = amountLamports + 50000; // Add buffer for transaction fees (~0.00005 SOL)
    
    if (balance.lamports < requiredLamports) {
      const requiredSol = requiredLamports / 1e9;
      throw new Error(
        `Insufficient funds: Wallet has ${balance.sol.toFixed(6)} SOL but needs ${requiredSol.toFixed(6)} SOL (${entryAmountSol} SOL for trade + ~0.00005 SOL for fees). Please fund the wallet first.`
      );
    }

    console.log(`✅ Wallet balance check passed: ${balance.sol.toFixed(6)} SOL available`);

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
      // Execute sell swap (Token -> SOL) with retry logic for slippage
      let swapResult;
      const slippageLevels = [300, 500, 1000, 2000]; // 3%, 5%, 10%, 20%
      let lastError;

      for (const slippageBps of slippageLevels) {
        try {
          console.log(`🔄 Attempting sell with ${slippageBps / 100}% slippage...`);
          swapResult = await this.executeSwap({
            walletKeypair,
            inputMint: trade.token_address,
            outputMint: SOL_MINT,
            amount: parseInt(trade.entry_amount_tokens),
            slippageBps,
          });
          console.log(`✅ Sell successful with ${slippageBps / 100}% slippage`);
          break; // Success, exit retry loop
        } catch (error: any) {
          lastError = error;
          console.log(`❌ Sell failed with ${slippageBps / 100}% slippage: ${error.message}`);

          // Only retry if it's a slippage error (0x1788 = 6024)
          if (error.message?.includes('0x1788') || error.message?.includes('slippage')) {
            continue; // Try next slippage level
          } else {
            // For non-slippage errors, throw immediately
            throw error;
          }
        }
      }

      if (!swapResult) {
        throw new Error(`Failed to execute sell after trying multiple slippage levels: ${lastError?.message}`);
      }

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

  /**
   * Close all open trades for a specific token in a wallet
   */
  static async closeTradesByToken(
    userId: string,
    ghostWalletId: string,
    tokenAddress: string,
    sessionPassword: string
  ): Promise<{
    closedCount: number;
    failedCount: number;
    totalSolReceived: number;
    trades: Trade[];
  }> {
    // Find all open trades for this token and wallet
    const tradesResult = await pool.query(
      `SELECT * FROM trades
       WHERE user_id = $1
         AND ghost_wallet_id = $2
         AND token_address = $3
         AND status = 'open'
       ORDER BY entry_timestamp ASC`,
      [userId, ghostWalletId, tokenAddress]
    );

    const trades = tradesResult.rows;

    if (trades.length === 0) {
      throw new ValidationError('No open trades found for this token');
    }

    const results = {
      closedCount: 0,
      failedCount: 0,
      totalSolReceived: 0,
      trades: [] as Trade[],
    };

    // Close each trade
    for (const trade of trades) {
      try {
        const closedTrade = await this.closeTrade(
          trade.id,
          userId,
          sessionPassword,
          'manual'
        );

        results.closedCount++;
        results.totalSolReceived += parseFloat(closedTrade.exit_amount_sol || '0');
        results.trades.push(closedTrade);

        console.log(`✅ Closed trade ${trade.id} for token ${tokenAddress}`);
      } catch (error: any) {
        console.error(`❌ Failed to close trade ${trade.id}:`, error.message);
        results.failedCount++;
      }
    }

    return results;
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

  /**
   * Close all open trades for a specific token in a wallet.
   * Uses on-chain balance as source of truth, not trade records.
   */
  static async closeTradesByToken(
    userId: string,
    ghostWalletId: string,
    tokenAddress: string,
    sessionPassword: string
  ): Promise<Trade[]> {
    try {
      // Step 1: Get wallet
      const wallet = await WalletService.getWalletById(ghostWalletId, userId);

      // Step 2: Derive wallet keypair from master seed
      const userPassword = AuthService.decryptPasswordFromSession(sessionPassword, userId);
      const walletKeypair = await WalletService.deriveUserKeypair(
        userId,
        wallet.wallet_index,
        userPassword
      );

      // Step 3: Get ACTUAL on-chain balance (source of truth)
      console.log(`🔍 Querying on-chain balance for token ${tokenAddress}...`);
      const tokenAccounts = await SolanaService.getTokenAccounts(walletKeypair.publicKey);
      const tokenAccount = tokenAccounts.find(acc => acc.mint === tokenAddress);

      // Step 4: Validate balance exists and is non-zero
      if (!tokenAccount || tokenAccount.balance === 0) {
        throw new ValidationError(
          'No tokens found in wallet. Balance may have been sold or transferred out.'
        );
      }

      console.log(`✅ On-chain balance verified: ${tokenAccount.uiAmount} tokens (${tokenAccount.balance} raw)`);

      // Step 5: Execute swap with ACTUAL balance (not from trade records)
      const SOL_MINT = 'So11111111111111111111111111111111111111112';
      let swapResult;
      const slippageLevels = [300, 500, 1000, 2000]; // 3%, 5%, 10%, 20%
      let lastError;

      for (const slippageBps of slippageLevels) {
        try {
          console.log(`🔄 Attempting sell with ${slippageBps / 100}% slippage...`);
          swapResult = await this.executeSwap({
            walletKeypair,
            inputMint: tokenAddress,
            outputMint: SOL_MINT,
            amount: tokenAccount.balance, // ✅ Use on-chain balance
            slippageBps,
          });
          console.log(`✅ Sell successful with ${slippageBps / 100}% slippage: ${swapResult.signature}`);
          break; // Success, exit retry loop
        } catch (error: any) {
          lastError = error;
          console.log(`❌ Sell failed with ${slippageBps / 100}% slippage: ${error.message}`);

          // Only retry if it's a slippage error (0x1788 = 6024)
          if (error.message?.includes('0x1788') || error.message?.includes('slippage')) {
            continue; // Try next slippage level
          } else {
            // For non-slippage errors, throw immediately
            throw error;
          }
        }
      }

      if (!swapResult) {
        throw new Error(`Failed to execute sell after trying multiple slippage levels: ${lastError?.message}`);
      }

      const exitAmountSol = swapResult.outputAmount / 1e9;

      // Step 6: Query trade records AFTER successful swap
      const openTradesResult = await pool.query(
        `SELECT * FROM trades
         WHERE user_id = $1
           AND ghost_wallet_id = $2
           AND token_address = $3
           AND status = 'open'
         ORDER BY created_at ASC`,
        [userId, ghostWalletId, tokenAddress]
      );
      const openTrades = openTradesResult.rows;

      console.log(`📊 Found ${openTrades.length} open trade record(s)`);

      // Step 7: Handle trade records
      const closedTrades: Trade[] = [];

      if (openTrades.length > 0) {
        // Calculate total recorded tokens for mismatch detection
        const totalRecordedTokens = openTrades.reduce(
          (sum, t) => sum + parseFloat(t.entry_amount_tokens || '0'),
          0
        );

        // Log mismatch if detected
        if (Math.abs(totalRecordedTokens - tokenAccount.uiAmount) > 0.01) {
          console.warn(`⚠️ Balance mismatch: Records=${totalRecordedTokens.toFixed(4)}, Actual=${tokenAccount.uiAmount.toFixed(4)}`);
          await pool.query(
            `INSERT INTO audit_logs (user_id, action, resource_type, metadata)
             VALUES ($1, $2, $3, $4)`,
            [
              userId,
              'balance_mismatch_detected',
              'trade',
              JSON.stringify({
                token_address: tokenAddress,
                ghost_wallet_id: ghostWalletId,
                recorded_tokens: totalRecordedTokens,
                actual_tokens: tokenAccount.uiAmount,
                difference: Math.abs(totalRecordedTokens - tokenAccount.uiAmount),
              }),
            ]
          );
        }

        // Close all open trades
        for (const trade of openTrades) {
          try {
            const profitLossSol = exitAmountSol - parseFloat(trade.entry_amount_sol || '0');
            const profitLossPct = parseFloat(trade.entry_amount_sol || '0') > 0
              ? (profitLossSol / parseFloat(trade.entry_amount_sol || '1')) * 100
              : 0;
            const holdTimeSeconds = Math.floor(
              (Date.now() - new Date(trade.entry_timestamp || trade.created_at).getTime()) / 1000
            );

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
              [swapResult.signature, exitAmountSol, 'manual', profitLossSol, profitLossPct, holdTimeSeconds, trade.id]
            );

            closedTrades.push(result.rows[0]);

            // Update wallet P&L
            await pool.query(
              `UPDATE ghost_wallets
               SET profit_loss_usd = profit_loss_usd + $1,
                   total_volume_usd = total_volume_usd + $2
               WHERE id = $3`,
              [profitLossSol, parseFloat(trade.entry_amount_sol || '0') + exitAmountSol, ghostWalletId]
            );

            console.log(`✅ Closed trade ${trade.id}: P&L = ${profitLossSol.toFixed(4)} SOL (${profitLossPct.toFixed(2)}%)`);
          } catch (error: any) {
            console.error(`Failed to close trade ${trade.id}:`, error.message);
            // Continue with other trades even if one fails
          }
        }

        // Log audit event for normal close
        await pool.query(
          `INSERT INTO audit_logs (user_id, action, resource_type, metadata)
           VALUES ($1, $2, $3, $4)`,
          [
            userId,
            'trades_closed_by_token',
            'trade',
            JSON.stringify({
              token_address: tokenAddress,
              ghost_wallet_id: ghostWalletId,
              trades_closed: closedTrades.length,
              exit_amount_sol: exitAmountSol,
              signature: swapResult.signature,
            }),
          ]
        );
      } else {
        // No open trades - create reconciliation record
        console.log(`🔄 No open trades found, creating reconciliation record`);

        const reconciliationTrade = await this.createReconciliationTrade(
          userId,
          ghostWalletId,
          tokenAddress,
          swapResult.signature,
          exitAmountSol,
          tokenAccount.balance,
          tokenAccount.decimals
        );

        closedTrades.push(reconciliationTrade);
      }

      if (closedTrades.length === 0) {
        throw new Error('Swap succeeded but failed to update any trade records');
      }

      console.log(`✅ Successfully closed ${closedTrades.length} trade(s) for ${exitAmountSol.toFixed(4)} SOL`);
      return closedTrades;
    } catch (error: any) {
      console.error('Error closing trades by token:', error);
      throw error;
    }
  }

  /**
   * Create a trade record for tokens sold without corresponding buy records.
   * Used when selling tokens that were transferred in or have missing trade data.
   */
  private static async createReconciliationTrade(
    userId: string,
    ghostWalletId: string,
    tokenAddress: string,
    exitTxHash: string,
    exitAmountSol: number,
    exitAmountTokensRaw: number,
    tokenDecimals: number
  ): Promise<Trade> {
    try {
      const exitAmountTokens = exitAmountTokensRaw / Math.pow(10, tokenDecimals);

      const result = await pool.query(
        `INSERT INTO trades (
          user_id,
          ghost_wallet_id,
          token_address,
          exit_tx_hash,
          exit_timestamp,
          exit_amount_sol,
          exit_reason,
          entry_amount_tokens,
          status,
          created_at
        ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, NOW())
        RETURNING *`,
        [
          userId,
          ghostWalletId,
          tokenAddress,
          exitTxHash,
          exitAmountSol,
          'balance_reconciliation',
          exitAmountTokens,
          'closed',
        ]
      );

      const trade = result.rows[0];

      // Log audit event
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          'balance_reconciliation',
          'trade',
          trade.id,
          JSON.stringify({
            token_address: tokenAddress,
            ghost_wallet_id: ghostWalletId,
            exit_amount_sol: exitAmountSol,
            exit_amount_tokens: exitAmountTokens,
            signature: exitTxHash,
            reason: 'Sold tokens without corresponding buy record',
          }),
        ]
      );

      console.log(`✅ Created reconciliation trade record: ${trade.id}`);
      return trade;
    } catch (error: any) {
      console.error('Failed to create reconciliation trade:', error);
      throw new Error(`Failed to create reconciliation record: ${error.message}`);
    }
  }
}

export default TradeService;
