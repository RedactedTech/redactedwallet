import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import axios from 'axios';

const router = Router();

/**
 * Get Pump.fun token metadata
 * Proxies the request to avoid CORS issues
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

    // Fetch from Pump.fun API
    const response = await axios.get(
      `https://pumpapi.fun/api/get_metadata/${tokenAddress}`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.data) {
      return res.status(404).json({
        success: false,
        error: 'Token not found'
      });
    }

    res.json({
      success: true,
      data: response.data
    });
  } catch (error: any) {
    console.error('Pump.fun API error:', error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Token not found or not a Pump.fun token'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch token metadata'
    });
  }
});

/**
 * Search Pump.fun tokens
 * Note: PumpAPI.fun doesn't have a direct search endpoint
 * This is a placeholder for future implementation
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

    // For now, return empty results
    // In the future, could integrate with a token aggregator API
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Pump.fun search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search tokens'
    });
  }
});

export default router;
