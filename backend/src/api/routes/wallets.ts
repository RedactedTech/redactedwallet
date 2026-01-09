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
  const userId = req.user!.userId; // Move to outer scope so catch can access it

  try {
    const { strategyId, fundAmount, password } = req.body;

    console.log('🔍 Create wallet request:', {
      userId,
      hasPassword: !!password,
      passwordLength: password?.length || 0,
      passwordType: typeof password,
      strategyId,
      fundAmount
    });

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required to create wallet'
      });
    }

    const wallet = await WalletService.createGhostWallet({
      userId,
      strategyId,
      fundAmount
    }, password);

    const response: ApiResponse<GhostWallet> = {
      success: true,
      data: wallet,
      message: 'Ghost wallet created successfully'
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('❌ Error creating wallet:', {
      userId,
      error: error.message,
      stack: error.stack
    });

    // Return appropriate status code
    const statusCode = error.statusCode || (error.message.includes('Password') || error.message.includes('decrypt') ? 401 : 500);

    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to create wallet'
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
 * GET /api/wallets/portfolio/all
 * Get portfolio overview with all holdings across wallets
 */
router.get('/portfolio/all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const portfolio = await WalletService.getPortfolio(userId);

    const response: ApiResponse<typeof portfolio> = {
      success: true,
      data: portfolio
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
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
    const { strategyId, password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required to get or create trading wallet'
      });
    }

    const wallet = await WalletService.getOrCreateTradingWallet(userId, password, strategyId);

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

/**
 * POST /api/wallets/:id/transfer
 * Transfer SOL or tokens from a ghost wallet to a destination address
 */
router.post('/:id/transfer', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { destinationAddress, amount, tokenMint, password } = req.body;

    if (!destinationAddress) {
      return res.status(400).json({
        success: false,
        error: 'Destination address is required'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    const result = await WalletService.transferFunds(
      id,
      userId,
      destinationAddress,
      amount,
      password,
      tokenMint
    );

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: `Transfer completed successfully. Sent ${result.amount} ${tokenMint ? 'tokens' : 'SOL'}.`
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error transferring funds:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/wallets/:id/drain
 * Drain all funds from a ghost wallet to a destination address
 */
router.post('/:id/drain', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { destinationAddress, password } = req.body;

    if (!destinationAddress) {
      return res.status(400).json({
        success: false,
        error: 'Destination address is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    const result = await WalletService.drainWallet(
      id,
      userId,
      destinationAddress,
      password
    );

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: `Wallet drained successfully. Transferred ${result.solAmount} SOL and ${result.tokenSignatures.length} token types.`
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error draining wallet:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
