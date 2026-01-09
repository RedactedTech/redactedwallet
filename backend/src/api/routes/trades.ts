import express, { Response } from 'express';
import { TradeService, CreateTradeInput } from '../../services/TradeService';
import { authenticate } from '../../middleware/auth';
import { AuthRequest, ApiResponse, Trade } from '../../types';

const router = express.Router();

// ============================================================
// TRADE ROUTES
// ============================================================

/**
 * POST /api/trades/create
 * Create and execute a new trade
 */
router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      strategyId,
      ghostWalletId,
      tokenAddress,
      entryAmountSol,
      maxSlippageBps,
      takeProfitPct,
      stopLossPct,
      trailingStopPct,
      useJitoBundle,
      sessionPassword,
    } = req.body;

    // Validation
    if (!ghostWalletId || !tokenAddress || !entryAmountSol) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: ghostWalletId, tokenAddress, entryAmountSol',
      });
    }

    if (!sessionPassword) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionPassword - please login again',
      });
    }

    if (entryAmountSol <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Entry amount must be greater than 0',
      });
    }

    const input: CreateTradeInput = {
      userId,
      strategyId,
      ghostWalletId,
      tokenAddress,
      entryAmountSol,
      maxSlippageBps,
      takeProfitPct,
      stopLossPct,
      trailingStopPct,
      useJitoBundle,
      sessionPassword,
    };

    const trade = await TradeService.createTrade(input);

    const response: ApiResponse<Trade> = {
      success: true,
      data: trade,
      message: 'Trade executed successfully',
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating trade:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/trades
 * Get all trades for authenticated user
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status, limit, offset } = req.query;

    const trades = await TradeService.getUserTrades(userId, {
      status: status as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    const response: ApiResponse<Trade[]> = {
      success: true,
      data: trades,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching trades:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/trades/stats
 * Get trade statistics for user
 */
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const stats = await TradeService.getTradeStats(userId);

    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching trade stats:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/trades/:id
 * Get specific trade details
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const trade = await TradeService.getTradeById(id, userId);

    const response: ApiResponse<Trade> = {
      success: true,
      data: trade,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching trade:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/trades/:id/close
 * Close an open trade
 */
router.post('/:id/close', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { exitReason = 'manual', sessionPassword } = req.body;

    // Validate session password
    if (!sessionPassword) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionPassword - please login again',
      });
    }

    // Validate exit reason
    const validExitReasons = ['take_profit', 'stop_loss', 'trailing_stop', 'manual', 'timeout'];
    if (!validExitReasons.includes(exitReason)) {
      return res.status(400).json({
        success: false,
        error: `Invalid exit reason. Must be one of: ${validExitReasons.join(', ')}`,
      });
    }

    const trade = await TradeService.closeTrade(id, userId, sessionPassword, exitReason);

    const response: ApiResponse<Trade> = {
      success: true,
      data: trade,
      message: 'Trade closed successfully',
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error closing trade:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/trades/:id/exit-conditions
 * Check if trade should be closed based on exit conditions
 */
router.get('/:id/exit-conditions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const trade = await TradeService.getTradeById(id, userId);
    const exitCheck = await TradeService.checkExitConditions(trade);

    const response: ApiResponse<typeof exitCheck> = {
      success: true,
      data: exitCheck,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error checking exit conditions:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/trades/close-by-token
 * Close all open trades for a specific token in a wallet
 */
router.post('/close-by-token', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { ghostWalletId, tokenAddress, sessionPassword } = req.body;

    // Validation
    if (!ghostWalletId || !tokenAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: ghostWalletId, tokenAddress',
      });
    }

    if (!sessionPassword) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionPassword - please login again',
      });
    }

    const result = await TradeService.closeTradesByToken(
      userId,
      ghostWalletId,
      tokenAddress,
      sessionPassword
    );

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: `Successfully closed ${result.closedCount} trade(s)`,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error closing trades by token:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
