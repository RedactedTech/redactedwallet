import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { pool } from '../config/database';
import { SolanaService } from './SolanaService';
import { NotFoundError, ValidationError } from '../types';

// ============================================================
// TOKEN SERVICE
// ============================================================

export interface MonitoredToken {
  id: string;
  token_address: string;
  token_symbol: string | null;
  token_name: string | null;
  discovered_at: Date;
  source: 'pump_fun' | 'raydium' | 'jupiter' | 'manual';
  current_price_usd: number | null;
  market_cap_usd: number | null;
  liquidity_usd: number | null;
  volume_24h_usd: number | null;
  holder_count: number | null;
  is_trending: boolean;
  momentum_score: number | null;
  risk_score: number | null;
  metadata: any;
  last_updated: Date;
}

export interface TokenMetrics {
  price_usd: number;
  market_cap_usd: number;
  liquidity_usd: number;
  volume_24h_usd: number;
  holder_count: number;
  price_change_1h: number;
  price_change_24h: number;
}

export class TokenService {
  // Price cache to avoid rate limits (token_address -> { price, timestamp })
  private static priceCache: Map<string, { metrics: TokenMetrics; timestamp: number }> = new Map();
  private static readonly CACHE_TTL_MS = 30 * 1000; // 30 seconds cache

  // ============================================================
  // TOKEN DISCOVERY
  // ============================================================

  /**
   * Discover new tokens from Pump.fun
   * NOTE: This is a placeholder - integrate with actual Pump.fun API/websocket
   */
  static async discoverPumpFunTokens(limit: number = 10): Promise<string[]> {
    try {
      // TODO: Replace with actual Pump.fun API integration
      // Example: Connect to Pump.fun websocket or poll their API
      // const response = await axios.get('https://pump.fun/api/tokens/recent');

      console.log('🔍 Discovering Pump.fun tokens (placeholder)...');

      // Placeholder: Return empty array
      // In production, this would return newly discovered token addresses
      return [];
    } catch (error: any) {
      console.error('Error discovering Pump.fun tokens:', error.message);
      return [];
    }
  }

  /**
   * Discover tokens from Raydium pools
   * NOTE: This is a placeholder - integrate with Raydium SDK
   */
  static async discoverRaydiumTokens(limit: number = 10): Promise<string[]> {
    try {
      // TODO: Integrate with Raydium SDK
      console.log('🔍 Discovering Raydium tokens (placeholder)...');
      return [];
    } catch (error: any) {
      console.error('Error discovering Raydium tokens:', error.message);
      return [];
    }
  }

  // ============================================================
  // TOKEN MONITORING
  // ============================================================

  /**
   * Add token to monitoring list
   */
  static async addMonitoredToken(
    tokenAddress: string,
    source: 'pump_fun' | 'raydium' | 'jupiter' | 'manual' = 'manual',
    metadata?: any
  ): Promise<MonitoredToken> {
    try {
      // Validate token address
      new PublicKey(tokenAddress);

      // Check if already monitored
      const existing = await pool.query(
        'SELECT * FROM monitored_tokens WHERE token_address = $1',
        [tokenAddress]
      );

      if (existing.rows.length > 0) {
        return existing.rows[0];
      }

      // Fetch token metadata
      const tokenInfo = await this.fetchTokenMetadata(tokenAddress);

      // Insert into database
      const result = await pool.query(
        `INSERT INTO monitored_tokens (
          token_address,
          token_symbol,
          token_name,
          source,
          metadata
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          tokenAddress,
          tokenInfo.symbol || null,
          tokenInfo.name || null,
          source,
          JSON.stringify(metadata || {}),
        ]
      );

      const token = result.rows[0];

      // Fetch initial market data
      await this.updateTokenMetrics(tokenAddress);

      return token;
    } catch (error: any) {
      throw new Error(`Failed to add monitored token: ${error.message}`);
    }
  }

  /**
   * Remove token from monitoring
   */
  static async removeMonitoredToken(tokenAddress: string): Promise<void> {
    await pool.query('DELETE FROM monitored_tokens WHERE token_address = $1', [
      tokenAddress,
    ]);
  }

  /**
   * Get all monitored tokens
   */
  static async getMonitoredTokens(options?: {
    source?: string;
    isTrending?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<MonitoredToken[]> {
    const { source, isTrending, limit = 50, offset = 0 } = options || {};

    let query = 'SELECT * FROM monitored_tokens WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (source) {
      paramCount++;
      query += ` AND source = $${paramCount}`;
      params.push(source);
    }

    if (isTrending !== undefined) {
      paramCount++;
      query += ` AND is_trending = $${paramCount}`;
      params.push(isTrending);
    }

    query += ` ORDER BY discovered_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get token by address
   */
  static async getTokenByAddress(tokenAddress: string): Promise<MonitoredToken> {
    const result = await pool.query(
      'SELECT * FROM monitored_tokens WHERE token_address = $1',
      [tokenAddress]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Token not found');
    }

    return result.rows[0];
  }

  /**
   * Get trending tokens
   */
  static async getTrendingTokens(limit: number = 10): Promise<MonitoredToken[]> {
    const result = await pool.query(
      `SELECT * FROM monitored_tokens
       WHERE is_trending = true
       ORDER BY momentum_score DESC NULLS LAST, volume_24h_usd DESC NULLS LAST
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  // ============================================================
  // MARKET DATA
  // ============================================================

  /**
   * Fetch token metadata from chain
   * NOTE: This is simplified - integrate with token metadata services
   */
  static async fetchTokenMetadata(
    tokenAddress: string
  ): Promise<{ symbol: string | null; name: string | null; decimals: number }> {
    try {
      // TODO: Integrate with token metadata registry or on-chain data
      // Example: Use @solana/spl-token-registry or fetch from chain

      return {
        symbol: null,
        name: null,
        decimals: 9, // Default for most Solana tokens
      };
    } catch (error: any) {
      console.error('Error fetching token metadata:', error.message);
      return { symbol: null, name: null, decimals: 9 };
    }
  }

  /**
   * Fetch token metrics from DexScreener API
   */
  static async fetchTokenMetrics(tokenAddress: string): Promise<TokenMetrics | null> {
    try {
      // Check cache first
      const cached = this.priceCache.get(tokenAddress);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
        console.log(`📊 Using cached metrics for ${tokenAddress}`);
        return cached.metrics;
      }

      console.log(`📊 Fetching metrics for ${tokenAddress} from DexScreener...`);

      // Fetch from DexScreener API
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
        {
          timeout: 5000, // 5 second timeout
        }
      );

      if (!response.data || !response.data.pairs || response.data.pairs.length === 0) {
        console.log(`❌ No pairs found for token ${tokenAddress}`);
        return null;
      }

      // Find the Solana pair with highest liquidity
      const solanaPairs = response.data.pairs.filter((pair: any) => pair.chainId === 'solana');

      if (solanaPairs.length === 0) {
        console.log(`❌ No Solana pairs found for token ${tokenAddress}`);
        return null;
      }

      // Sort by liquidity (highest first)
      const bestPair = solanaPairs.sort((a: any, b: any) => {
        const liquidityA = parseFloat(a.liquidity?.usd || '0');
        const liquidityB = parseFloat(b.liquidity?.usd || '0');
        return liquidityB - liquidityA;
      })[0];

      // Parse metrics from best pair
      const metrics: TokenMetrics = {
        price_usd: parseFloat(bestPair.priceUsd || '0'),
        market_cap_usd: parseFloat(bestPair.fdv || '0'), // Fully diluted valuation
        liquidity_usd: parseFloat(bestPair.liquidity?.usd || '0'),
        volume_24h_usd: parseFloat(bestPair.volume?.h24 || '0'),
        holder_count: 0, // DexScreener doesn't provide holder count
        price_change_1h: parseFloat(bestPair.priceChange?.h1 || '0'),
        price_change_24h: parseFloat(bestPair.priceChange?.h24 || '0'),
      };

      // Cache the result
      this.priceCache.set(tokenAddress, {
        metrics,
        timestamp: Date.now(),
      });

      console.log(`✅ Fetched metrics for ${tokenAddress}: $${metrics.price_usd.toFixed(8)}`);

      return metrics;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        console.error(`⏱️ Timeout fetching metrics for ${tokenAddress}`);
      } else if (error.response?.status === 429) {
        console.error(`⚠️ Rate limited by DexScreener API`);
      } else {
        console.error(`Error fetching token metrics: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Update token metrics in database
   */
  static async updateTokenMetrics(tokenAddress: string): Promise<void> {
    try {
      const metrics = await this.fetchTokenMetrics(tokenAddress);

      if (!metrics) {
        console.log(`No metrics available for ${tokenAddress}`);
        return;
      }

      // Update monitored token
      await pool.query(
        `UPDATE monitored_tokens
         SET current_price_usd = $1,
             market_cap_usd = $2,
             liquidity_usd = $3,
             volume_24h_usd = $4,
             holder_count = $5,
             last_updated = NOW()
         WHERE token_address = $6`,
        [
          metrics.price_usd,
          metrics.market_cap_usd,
          metrics.liquidity_usd,
          metrics.volume_24h_usd,
          metrics.holder_count,
          tokenAddress,
        ]
      );

      // Store price history
      await this.storePriceHistory(tokenAddress, metrics.price_usd, metrics);

      // Calculate momentum and risk scores
      await this.updateTokenScores(tokenAddress);
    } catch (error: any) {
      console.error(`Error updating token metrics for ${tokenAddress}:`, error.message);
    }
  }

  /**
   * Update all monitored tokens' metrics
   */
  static async updateAllTokenMetrics(): Promise<number> {
    const tokens = await this.getMonitoredTokens();
    let updated = 0;

    for (const token of tokens) {
      try {
        await this.updateTokenMetrics(token.token_address);
        updated++;
      } catch (error: any) {
        console.error(`Failed to update ${token.token_address}:`, error.message);
      }
    }

    console.log(`✅ Updated metrics for ${updated}/${tokens.length} tokens`);
    return updated;
  }

  // ============================================================
  // PRICE HISTORY
  // ============================================================

  /**
   * Store price history snapshot
   */
  static async storePriceHistory(
    tokenAddress: string,
    priceUsd: number,
    metrics: TokenMetrics
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO price_history (
          token_address,
          timestamp,
          price_usd,
          volume_usd,
          liquidity_usd
        ) VALUES ($1, NOW(), $2, $3, $4)
        ON CONFLICT (token_address, timestamp) DO UPDATE
        SET price_usd = EXCLUDED.price_usd,
            volume_usd = EXCLUDED.volume_usd,
            liquidity_usd = EXCLUDED.liquidity_usd`,
        [tokenAddress, priceUsd, metrics.volume_24h_usd, metrics.liquidity_usd]
      );
    } catch (error: any) {
      console.error('Error storing price history:', error.message);
    }
  }

  /**
   * Get price history for a token
   */
  static async getPriceHistory(
    tokenAddress: string,
    hoursBack: number = 24
  ): Promise<
    Array<{
      timestamp: Date;
      price_usd: number;
      volume_usd: number;
      liquidity_usd: number;
    }>
  > {
    const result = await pool.query(
      `SELECT timestamp, price_usd, volume_usd, liquidity_usd
       FROM price_history
       WHERE token_address = $1
         AND timestamp > NOW() - INTERVAL '${hoursBack} hours'
       ORDER BY timestamp ASC`,
      [tokenAddress]
    );

    return result.rows;
  }

  // ============================================================
  // RISK SCORING
  // ============================================================

  /**
   * Calculate risk score for a token
   * Factors: liquidity, holder distribution, volume, age
   * Score: 0-100 (0 = lowest risk, 100 = highest risk)
   */
  static async calculateRiskScore(tokenAddress: string): Promise<number> {
    try {
      const token = await this.getTokenByAddress(tokenAddress);
      let riskScore = 0;

      // Liquidity risk (30 points)
      const liquidityUsd = token.liquidity_usd || 0;
      if (liquidityUsd < 1000) {
        riskScore += 30;
      } else if (liquidityUsd < 10000) {
        riskScore += 20;
      } else if (liquidityUsd < 50000) {
        riskScore += 10;
      }

      // Holder concentration risk (30 points)
      const holderCount = token.holder_count || 0;
      if (holderCount < 10) {
        riskScore += 30;
      } else if (holderCount < 50) {
        riskScore += 20;
      } else if (holderCount < 100) {
        riskScore += 10;
      }

      // Volume risk (20 points)
      const volume24h = token.volume_24h_usd || 0;
      if (volume24h < 1000) {
        riskScore += 20;
      } else if (volume24h < 10000) {
        riskScore += 10;
      }

      // Age risk (20 points) - newer tokens are riskier
      const ageHours =
        (Date.now() - new Date(token.discovered_at).getTime()) / (1000 * 60 * 60);
      if (ageHours < 1) {
        riskScore += 20;
      } else if (ageHours < 24) {
        riskScore += 15;
      } else if (ageHours < 168) {
        // 7 days
        riskScore += 10;
      }

      return Math.min(riskScore, 100);
    } catch (error: any) {
      console.error('Error calculating risk score:', error.message);
      return 100; // Return max risk on error
    }
  }

  /**
   * Calculate momentum score for a token
   * Based on price action and volume trends
   * Score: 0-100 (higher = stronger momentum)
   */
  static async calculateMomentumScore(tokenAddress: string): Promise<number> {
    try {
      // Get price history
      const history = await this.getPriceHistory(tokenAddress, 24);

      if (history.length < 2) {
        return 0;
      }

      // Calculate price change
      const oldestPrice = history[0].price_usd;
      const newestPrice = history[history.length - 1].price_usd;
      const priceChange = ((newestPrice - oldestPrice) / oldestPrice) * 100;

      // Calculate volume trend
      const avgVolume =
        history.reduce((sum, h) => sum + h.volume_usd, 0) / history.length;

      let momentumScore = 0;

      // Price momentum (up to 60 points)
      if (priceChange > 100) {
        momentumScore += 60;
      } else if (priceChange > 50) {
        momentumScore += 50;
      } else if (priceChange > 20) {
        momentumScore += 40;
      } else if (priceChange > 10) {
        momentumScore += 30;
      } else if (priceChange > 0) {
        momentumScore += 20;
      }

      // Volume momentum (up to 40 points)
      const recentVolume = history.slice(-5).reduce((sum, h) => sum + h.volume_usd, 0) / 5;
      const volumeIncrease = ((recentVolume - avgVolume) / avgVolume) * 100;

      if (volumeIncrease > 100) {
        momentumScore += 40;
      } else if (volumeIncrease > 50) {
        momentumScore += 30;
      } else if (volumeIncrease > 20) {
        momentumScore += 20;
      } else if (volumeIncrease > 0) {
        momentumScore += 10;
      }

      return Math.min(momentumScore, 100);
    } catch (error: any) {
      console.error('Error calculating momentum score:', error.message);
      return 0;
    }
  }

  /**
   * Update token scores (risk and momentum)
   */
  static async updateTokenScores(tokenAddress: string): Promise<void> {
    try {
      const riskScore = await this.calculateRiskScore(tokenAddress);
      const momentumScore = await this.calculateMomentumScore(tokenAddress);

      // Mark as trending if momentum is high and risk is acceptable
      const isTrending = momentumScore > 50 && riskScore < 70;

      await pool.query(
        `UPDATE monitored_tokens
         SET risk_score = $1,
             momentum_score = $2,
             is_trending = $3,
             last_updated = NOW()
         WHERE token_address = $4`,
        [riskScore, momentumScore, isTrending, tokenAddress]
      );
    } catch (error: any) {
      console.error('Error updating token scores:', error.message);
    }
  }

  // ============================================================
  // SEARCH & FILTER
  // ============================================================

  /**
   * Search tokens by symbol or address
   */
  static async searchTokens(query: string, limit: number = 10): Promise<MonitoredToken[]> {
    const result = await pool.query(
      `SELECT * FROM monitored_tokens
       WHERE token_address ILIKE $1
          OR token_symbol ILIKE $1
          OR token_name ILIKE $1
       ORDER BY volume_24h_usd DESC NULLS LAST
       LIMIT $2`,
      [`%${query}%`, limit]
    );

    return result.rows;
  }

  /**
   * Filter tokens by criteria
   */
  static async filterTokens(criteria: {
    minLiquidity?: number;
    maxRiskScore?: number;
    minMomentumScore?: number;
    source?: string;
    limit?: number;
  }): Promise<MonitoredToken[]> {
    const {
      minLiquidity,
      maxRiskScore,
      minMomentumScore,
      source,
      limit = 50,
    } = criteria;

    let query = 'SELECT * FROM monitored_tokens WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (minLiquidity !== undefined) {
      paramCount++;
      query += ` AND liquidity_usd >= $${paramCount}`;
      params.push(minLiquidity);
    }

    if (maxRiskScore !== undefined) {
      paramCount++;
      query += ` AND risk_score <= $${paramCount}`;
      params.push(maxRiskScore);
    }

    if (minMomentumScore !== undefined) {
      paramCount++;
      query += ` AND momentum_score >= $${paramCount}`;
      params.push(minMomentumScore);
    }

    if (source) {
      paramCount++;
      query += ` AND source = $${paramCount}`;
      params.push(source);
    }

    query += ` ORDER BY momentum_score DESC NULLS LAST LIMIT $${paramCount + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  }
}

export default TokenService;
