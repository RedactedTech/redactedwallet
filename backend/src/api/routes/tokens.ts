import express, { Response } from 'express';
import { TokenService, MonitoredToken } from '../../services/TokenService';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';
import { AuthRequest, ApiResponse } from '../../types';

const router = express.Router();

// ============================================================
// TOKEN ROUTES
// ============================================================

/**
 * GET /api/tokens
 * Get all monitored tokens
 */
router.get('/', optionalAuthenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { source, trending, limit, offset } = req.query;

    const tokens = await TokenService.getMonitoredTokens({
      source: source as string,
      isTrending: trending === 'true',
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    const response: ApiResponse<MonitoredToken[]> = {
      success: true,
      data: tokens,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching tokens:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tokens/trending
 * Get trending tokens
 */
router.get('/trending', async (req: AuthRequest, res: Response) => {
  try {
    const { limit } = req.query;

    const tokens = await TokenService.getTrendingTokens(
      limit ? parseInt(limit as string) : 10
    );

    const response: ApiResponse<MonitoredToken[]> = {
      success: true,
      data: tokens,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching trending tokens:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tokens/search
 * Search tokens by symbol, name, or address
 */
router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    const { q, limit } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
      });
    }

    const tokens = await TokenService.searchTokens(
      q as string,
      limit ? parseInt(limit as string) : 10
    );

    const response: ApiResponse<MonitoredToken[]> = {
      success: true,
      data: tokens,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error searching tokens:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tokens/filter
 * Filter tokens by criteria
 */
router.get('/filter', async (req: AuthRequest, res: Response) => {
  try {
    const { minLiquidity, maxRiskScore, minMomentumScore, source, limit } = req.query;

    const tokens = await TokenService.filterTokens({
      minLiquidity: minLiquidity ? parseFloat(minLiquidity as string) : undefined,
      maxRiskScore: maxRiskScore ? parseFloat(maxRiskScore as string) : undefined,
      minMomentumScore: minMomentumScore
        ? parseFloat(minMomentumScore as string)
        : undefined,
      source: source as string,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    const response: ApiResponse<MonitoredToken[]> = {
      success: true,
      data: tokens,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error filtering tokens:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tokens/watch
 * Add a token to watchlist
 */
router.post('/watch', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { tokenAddress, source = 'manual', metadata } = req.body;

    if (!tokenAddress) {
      return res.status(400).json({
        success: false,
        error: 'tokenAddress is required',
      });
    }

    // Validate source
    const validSources = ['pump_fun', 'raydium', 'jupiter', 'manual'];
    if (!validSources.includes(source)) {
      return res.status(400).json({
        success: false,
        error: `Invalid source. Must be one of: ${validSources.join(', ')}`,
      });
    }

    const token = await TokenService.addMonitoredToken(tokenAddress, source, metadata);

    const response: ApiResponse<MonitoredToken> = {
      success: true,
      data: token,
      message: 'Token added to watchlist',
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error adding token to watchlist:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/tokens/:address
 * Remove token from watchlist
 */
router.delete('/:address', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { address } = req.params;

    await TokenService.removeMonitoredToken(address);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Token removed from watchlist',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error removing token from watchlist:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tokens/:address
 * Get token details
 */
router.get('/:address', async (req: AuthRequest, res: Response) => {
  try {
    const { address } = req.params;

    const token = await TokenService.getTokenByAddress(address);

    const response: ApiResponse<MonitoredToken> = {
      success: true,
      data: token,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching token details:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tokens/:address/history
 * Get price history for a token
 */
router.get('/:address/history', async (req: AuthRequest, res: Response) => {
  try {
    const { address } = req.params;
    const { hours } = req.query;

    const history = await TokenService.getPriceHistory(
      address,
      hours ? parseInt(hours as string) : 24
    );

    const response: ApiResponse<typeof history> = {
      success: true,
      data: history,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching price history:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tokens/:address/update
 * Force update token metrics
 */
router.post('/:address/update', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { address } = req.params;

    await TokenService.updateTokenMetrics(address);

    const token = await TokenService.getTokenByAddress(address);

    const response: ApiResponse<MonitoredToken> = {
      success: true,
      data: token,
      message: 'Token metrics updated',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error updating token metrics:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tokens/update-all
 * Update metrics for all monitored tokens
 */
router.post('/update-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const updatedCount = await TokenService.updateAllTokenMetrics();

    const response: ApiResponse<{ updated: number }> = {
      success: true,
      data: { updated: updatedCount },
      message: `Updated ${updatedCount} tokens`,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error updating all tokens:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tokens/discover/pumpfun
 * Discover new tokens from Pump.fun
 */
router.post('/discover/pumpfun', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { limit } = req.body;

    const tokenAddresses = await TokenService.discoverPumpFunTokens(limit || 10);

    // Add discovered tokens to monitoring
    const addedTokens: MonitoredToken[] = [];
    for (const address of tokenAddresses) {
      try {
        const token = await TokenService.addMonitoredToken(address, 'pump_fun');
        addedTokens.push(token);
      } catch (error: any) {
        console.error(`Failed to add ${address}:`, error.message);
      }
    }

    const response: ApiResponse<MonitoredToken[]> = {
      success: true,
      data: addedTokens,
      message: `Discovered ${addedTokens.length} new tokens`,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error discovering Pump.fun tokens:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tokens/discover/raydium
 * Discover new tokens from Raydium
 */
router.post('/discover/raydium', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { limit } = req.body;

    const tokenAddresses = await TokenService.discoverRaydiumTokens(limit || 10);

    // Add discovered tokens to monitoring
    const addedTokens: MonitoredToken[] = [];
    for (const address of tokenAddresses) {
      try {
        const token = await TokenService.addMonitoredToken(address, 'raydium');
        addedTokens.push(token);
      } catch (error: any) {
        console.error(`Failed to add ${address}:`, error.message);
      }
    }

    const response: ApiResponse<MonitoredToken[]> = {
      success: true,
      data: addedTokens,
      message: `Discovered ${addedTokens.length} new tokens`,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error discovering Raydium tokens:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
