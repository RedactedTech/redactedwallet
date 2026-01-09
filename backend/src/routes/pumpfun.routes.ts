import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import axios from 'axios';

const router = Router();

/**
 * Get token metadata using DexScreener API
 * Returns pump.fun compatible format
 */
router.get('/metadata/:tokenAddress', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { tokenAddress } = req.params;

    // Validate token address format (Solana addresses are base58, ~44 chars)
    if (!tokenAddress || tokenAddress.length < 32) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token address'
      });
    }

    console.log(`🔍 Fetching metadata for ${tokenAddress} via DexScreener`);

    // Fetch from DexScreener API
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.data?.pairs || response.data.pairs.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Token not found'
      });
    }

    // Find Solana pair with highest liquidity
    const solanaPairs = response.data.pairs.filter((pair: any) => pair.chainId === 'solana');

    if (solanaPairs.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No Solana pairs found for this token'
      });
    }

    const bestPair = solanaPairs.sort((a: any, b: any) => {
      const liquidityA = parseFloat(a.liquidity?.usd || '0');
      const liquidityB = parseFloat(b.liquidity?.usd || '0');
      return liquidityB - liquidityA;
    })[0];

    // Extract token info
    const baseToken = bestPair.baseToken;
    const info = bestPair.info || {};

    // Format as pump.fun compatible response
    const metadata = {
      mint: tokenAddress,
      name: baseToken?.name || 'Unknown',
      symbol: baseToken?.symbol || 'UNKNOWN',
      description: info.description || '',
      image_uri: info.imageUrl || '',
      twitter: info.socials?.find((s: any) => s.type === 'twitter')?.url || '',
      telegram: info.socials?.find((s: any) => s.type === 'telegram')?.url || '',
      website: info.websites?.[0]?.url || ''
    };

    console.log(`✅ Found metadata: ${metadata.symbol} (${metadata.name})`);

    res.json({
      success: true,
      data: metadata
    });
  } catch (error: any) {
    console.error('Token metadata fetch error:', error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Token not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch token metadata'
    });
  }
});

/**
 * Search tokens using DexScreener API
 * Supports both contract address lookup and text search
 */
router.get('/search', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter required'
      });
    }

    console.log(`🔍 Searching for tokens: ${q}`);

    // Try searching by exact address first if it looks like a Solana address
    if (q.length >= 32) {
      try {
        const addressResponse = await axios.get(
          `https://api.dexscreener.com/latest/dex/tokens/${q}`,
          {
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );

        if (addressResponse.data?.pairs && addressResponse.data.pairs.length > 0) {
          const solanaPairs = addressResponse.data.pairs.filter((pair: any) => pair.chainId === 'solana');

          if (solanaPairs.length > 0) {
            const results = solanaPairs.slice(0, 10).map((pair: any) => ({
              mint: pair.baseToken.address,
              name: pair.baseToken.name,
              symbol: pair.baseToken.symbol,
              image_uri: pair.info?.imageUrl || '',
              market_cap: parseFloat(pair.fdv || '0'),
              created_timestamp: pair.pairCreatedAt
            }));

            return res.json({
              success: true,
              data: results
            });
          }
        }
      } catch (err) {
        // If address search fails, continue to text search
        console.log('Not a valid address or not found, trying text search...');
      }
    }

    // Fallback to DexScreener search endpoint
    const searchResponse = await axios.get(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`,
      {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!searchResponse.data?.pairs || searchResponse.data.pairs.length === 0) {
      console.log(`No results found for: ${q}`);
      return res.json({
        success: true,
        data: []
      });
    }

    // Filter to Solana pairs only
    const solanaPairs = searchResponse.data.pairs.filter((pair: any) => pair.chainId === 'solana');

    const results = solanaPairs.slice(0, 10).map((pair: any) => ({
      mint: pair.baseToken.address,
      name: pair.baseToken.name,
      symbol: pair.baseToken.symbol,
      image_uri: pair.info?.imageUrl || '',
      market_cap: parseFloat(pair.fdv || '0'),
      created_timestamp: pair.pairCreatedAt
    }));

    console.log(`✅ Found ${results.length} results for: ${q}`);

    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    console.error('Token search error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to search tokens'
    });
  }
});

export default router;
