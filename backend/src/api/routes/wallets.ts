import express, { Response } from 'express';
import { WalletService } from '../../services/WalletService';
import { authenticate } from '../../middleware/auth';
import { AuthRequest, ApiResponse, GhostWallet } from '../../types';

const router = express.Router();

// ============================================================
// WALLET ROUTES
// ============================================================

/**
 * POST /api/wallets/create
 * Create a new ghost wallet
 */
router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { strategyId, fundAmount } = req.body;

    const wallet = await WalletService.createGhostWallet({
      userId,
      strategyId,
      fundAmount
    });

    const response: ApiResponse<GhostWallet> = {
      success: true,
      data: wallet,
      message: 'Ghost wallet created successfully'
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating wallet:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/wallets
 * Get all wallets for authenticated user
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    let wallets: GhostWallet[];

    if (status === 'active') {
      wallets = await WalletService.getActiveWallets(userId);
    } else {
      wallets = await WalletService.getUserWallets(userId);
    }

    const response: ApiResponse<GhostWallet[]> = {
      success: true,
      data: wallets
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching wallets:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/wallets/stats
 * Get wallet statistics for user
 */
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const stats = await WalletService.getWalletStats(userId);

    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching wallet stats:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/wallets/:id
 * Get specific wallet details
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const wallet = await WalletService.getWalletById(id, userId);

    const response: ApiResponse<GhostWallet> = {
      success: true,
      data: wallet
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching wallet:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/wallets/:id/balance
 * Get wallet SOL balance
 */
router.get('/:id/balance', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const balance = await WalletService.getWalletBalance(id, userId);

    const response: ApiResponse<typeof balance> = {
      success: true,
      data: balance
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching wallet balance:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/wallets/:id/recycle
 * Recycle a ghost wallet
 */
router.post('/:id/recycle', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const wallet = await WalletService.recycleWallet(id, userId);

    const response: ApiResponse<GhostWallet> = {
      success: true,
      data: wallet,
      message: 'Wallet recycled successfully'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error recycling wallet:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/wallets/auto-recycle
 * Auto-recycle wallets that meet criteria
 */
router.post('/auto-recycle', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const recycledCount = await WalletService.autoRecycleWallets(userId);

    const response: ApiResponse<{ recycled: number }> = {
      success: true,
      data: { recycled: recycledCount },
      message: `${recycledCount} wallet(s) recycled`
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error auto-recycling wallets:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/wallets/trading-wallet
 * Get or create a wallet for trading (implements rotation logic)
 */
router.post('/trading-wallet', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { strategyId } = req.body;

    const wallet = await WalletService.getOrCreateTradingWallet(userId, strategyId);

    const response: ApiResponse<GhostWallet> = {
      success: true,
      data: wallet,
      message: wallet.created_at === new Date() ? 'New wallet created' : 'Existing wallet returned'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error getting trading wallet:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
