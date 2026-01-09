import { PublicKey } from '@solana/web3.js';
import { pool } from '../config/database';
import SolanaService from './SolanaService';
import { createJupiterApiClient } from '@jup-ag/api';
import { NotFoundError } from '../types';

// ============================================================
// PORTFOLIO SERVICE
// ============================================================

interface TokenHolding {
  mint: string;
  symbol: string | null;
  name: string | null;
  balance: number;
  decimals: number;
  uiAmount: number;
  currentPrice: number | null;
  currentValueUsd: number | null;
  averageEntryPrice: number | null;
  totalInvestedUsd: number | null;
  pnlUsd: number | null;
  pnlPercentage: number | null;
  imageUri: string | null;
}

interface WalletPortfolio {
  walletId: string;
  walletAddress: string;
  walletIndex: number;
  holdings: TokenHolding[];
  totalValueUsd: number;
  totalPnlUsd: number;
}

class PortfolioService {
  private static jupiterApi = createJupiterApiClient();

  /**
   * Get current price for a token from Jupiter
   */
  private static async getTokenPrice(tokenMint: string): Promise<number | null> {
    try {
      // Use Jupiter price API
      const SOL_MINT = 'So11111111111111111111111111111111111111112';
      
      // Get quote for 1 token to SOL
      const quote = await this.jupiterApi.quoteGet({
        inputMint: tokenMint,
        outputMint: SOL_MINT,
        amount: 1000000, // 1 token with 6 decimals (adjust based on actual decimals)
        slippageBps: 50,
      });

      if (!quote || !quote.outAmount) {
        return null;
      }

      // Convert to USD (assuming SOL price, you may want to fetch this separately)
      const solPriceUsd = await this.getSolPrice();
      const tokenPriceInSol = Number(quote.outAmount) / 1e9; // SOL has 9 decimals
      const tokenPriceUsd = tokenPriceInSol * solPriceUsd;

      return tokenPriceUsd;
    } catch (error) {
      console.error(`Failed to get price for token ${tokenMint}:`, error);
      return null;
    }
  }

  /**
   * Get current SOL price in USD
   */
  private static async getSolPrice(): Promise<number> {
    try {
      // You can use Jupiter, CoinGecko, or another price feed
      // For now, using a placeholder - integrate with your preferred price API
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      return data.solana?.usd || 100; // Fallback to $100 if API fails
    } catch (error) {
      console.error('Failed to get SOL price:', error);
      return 100; // Fallback price
    }
  }

  /**
   * Calculate average entry price and total invested for a token
   */
  private static async getTokenTradeHistory(
    userId: string,
    walletId: string,
    tokenMint: string
  ): Promise<{ averageEntryPrice: number | null; totalInvestedUsd: number | null }> {
    try {
      const result = await pool.query(
        `SELECT 
          entry_price_usd,
          entry_amount_sol,
          token_amount_received,
          exit_price_usd,
          exit_amount_sol
        FROM trades
        WHERE user_id = $1 
          AND ghost_wallet_id = $2 
          AND token_address = $3
          AND status IN ('open', 'closed')
        ORDER BY created_at ASC`,
        [userId, walletId, tokenMint]
      );

      if (result.rows.length === 0) {
        return { averageEntryPrice: null, totalInvestedUsd: null };
      }

      let totalTokens = 0;
      let totalInvestedUsd = 0;

      for (const trade of result.rows) {
        // Add tokens from entry
        if (trade.token_amount_received) {
          totalTokens += parseFloat(trade.token_amount_received);
          totalInvestedUsd += parseFloat(trade.entry_price_usd || '0');
        }

        // Subtract tokens from exit (if closed)
        if (trade.exit_amount_sol) {
          // Calculate how many tokens were sold based on exit amount
          // This is an approximation - you may need to store actual token amounts sold
          const tokensSold = parseFloat(trade.token_amount_received || '0');
          totalTokens -= tokensSold;
        }
      }

      const averageEntryPrice = totalTokens > 0 ? totalInvestedUsd / totalTokens : null;

      return {
        averageEntryPrice,
        totalInvestedUsd: totalTokens > 0 ? totalInvestedUsd : null,
      };
    } catch (error) {
      console.error('Error getting token trade history:', error);
      return { averageEntryPrice: null, totalInvestedUsd: null };
    }
  }

  /**
   * Get token metadata from database or fetch from chain
   */
  private static async getTokenMetadata(tokenMint: string): Promise<{
    symbol: string | null;
    name: string | null;
    imageUri: string | null;
  }> {
    try {
      // First check monitored_tokens table
      const result = await pool.query(
        `SELECT token_symbol, token_name, metadata
        FROM monitored_tokens
        WHERE token_address = $1
        LIMIT 1`,
        [tokenMint]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          symbol: row.token_symbol,
          name: row.token_name,
          imageUri: row.metadata?.image_uri || null,
        };
      }

      // If not in database, fetch from DexScreener/PumpPortal via our API
      console.log(`Token ${tokenMint} not in database, fetching metadata...`);
      
      try {
        const axios = require('axios');
        const apiUrl = process.env.API_URL || 'http://localhost:3001';
        const response = await axios.get(
          `${apiUrl}/api/pumpfun/metadata/${tokenMint}`,
          {
            timeout: 5000,
          }
        );

        if (response.data?.success && response.data?.data) {
          const metadata = response.data.data;
          console.log(`✅ Fetched metadata for ${tokenMint}: ${metadata.symbol} (${metadata.name})`);
          
          // Optionally store in database for future use
          try {
            await pool.query(
              `INSERT INTO monitored_tokens (token_address, token_symbol, token_name, source, metadata)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (token_address) DO NOTHING`,
              [
                tokenMint,
                metadata.symbol,
                metadata.name,
                'manual',
                JSON.stringify({ image_uri: metadata.image_uri })
              ]
            );
          } catch (insertError) {
            // Ignore insert errors, metadata is still returned
            console.log(`Could not cache metadata for ${tokenMint}:`, insertError);
          }

          return {
            symbol: metadata.symbol || null,
            name: metadata.name || null,
            imageUri: metadata.image_uri || null,
          };
        }
      } catch (fetchError: any) {
        console.log(`Failed to fetch metadata for ${tokenMint}:`, fetchError.message);
      }

      // If fetch fails, return null values
      return { symbol: null, name: null, imageUri: null };
    } catch (error) {
      console.error('Error getting token metadata:', error);
      return { symbol: null, name: null, imageUri: null };
    }
  }

  /**
   * Get portfolio for a specific wallet
   */
  static async getWalletPortfolio(walletId: string, userId: string): Promise<WalletPortfolio> {
    try {
      // Get wallet details
      const walletResult = await pool.query(
        `SELECT id, public_key, wallet_index
        FROM ghost_wallets
        WHERE id = $1 AND user_id = $2 AND status = 'active'`,
        [walletId, userId]
      );

      if (walletResult.rows.length === 0) {
        throw new NotFoundError('Wallet not found');
      }

      const wallet = walletResult.rows[0];
      const walletPubkey = new PublicKey(wallet.public_key);

      // Get all token accounts for this wallet
      const tokenAccounts = await SolanaService.getTokenAccounts(walletPubkey);

      // Build holdings with PnL data
      const holdings: TokenHolding[] = [];
      let totalValueUsd = 0;
      let totalPnlUsd = 0;

      for (const account of tokenAccounts) {
        // Skip if balance is 0
        if (account.uiAmount === 0) continue;

        // Get token metadata
        const metadata = await this.getTokenMetadata(account.mint);

        // Get current price
        const currentPrice = await this.getTokenPrice(account.mint);

        // Get trade history for PnL calculation
        const { averageEntryPrice, totalInvestedUsd } = await this.getTokenTradeHistory(
          userId,
          walletId,
          account.mint
        );

        // Calculate current value
        const currentValueUsd = currentPrice ? account.uiAmount * currentPrice : null;

        // Calculate PnL
        let pnlUsd: number | null = null;
        let pnlPercentage: number | null = null;

        if (currentValueUsd !== null && totalInvestedUsd !== null && totalInvestedUsd > 0) {
          pnlUsd = currentValueUsd - totalInvestedUsd;
          pnlPercentage = (pnlUsd / totalInvestedUsd) * 100;
        }

        holdings.push({
          mint: account.mint,
          symbol: metadata.symbol,
          name: metadata.name,
          balance: account.balance,
          decimals: account.decimals,
          uiAmount: account.uiAmount,
          currentPrice,
          currentValueUsd,
          averageEntryPrice,
          totalInvestedUsd,
          pnlUsd,
          pnlPercentage,
          imageUri: metadata.imageUri,
        });

        if (currentValueUsd) totalValueUsd += currentValueUsd;
        if (pnlUsd) totalPnlUsd += pnlUsd;
      }

      return {
        walletId: wallet.id,
        walletAddress: wallet.public_key,
        walletIndex: wallet.wallet_index,
        holdings,
        totalValueUsd,
        totalPnlUsd,
      };
    } catch (error) {
      console.error('Error getting wallet portfolio:', error);
      throw error;
    }
  }

  /**
   * Get portfolio across all user wallets
   */
  static async getAllUserPortfolios(userId: string): Promise<WalletPortfolio[]> {
    try {
      // Get all active wallets for user
      const walletsResult = await pool.query(
        `SELECT id
        FROM ghost_wallets
        WHERE user_id = $1 AND status = 'active'
        ORDER BY wallet_index ASC`,
        [userId]
      );

      const portfolios: WalletPortfolio[] = [];

      for (const wallet of walletsResult.rows) {
        const portfolio = await this.getWalletPortfolio(wallet.id, userId);
        // Only include wallets with holdings
        if (portfolio.holdings.length > 0) {
          portfolios.push(portfolio);
        }
      }

      return portfolios;
    } catch (error) {
      console.error('Error getting all user portfolios:', error);
      throw error;
    }
  }
}

export default PortfolioService;
