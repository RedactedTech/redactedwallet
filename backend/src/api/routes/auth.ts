import { Router, Request, Response } from 'express';
import { AuthService } from '../../services/AuthService';
import { authenticate } from '../../middleware/auth';
import { AuthRequest, CreateUserInput, LoginInput, OAuthUserProfile } from '../../types';
import passport from '../../config/passport';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const input: CreateUserInput = {
      email: req.body.email,
      password: req.body.password
    };

    const result = await AuthService.register(input);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        sessionPassword: result.tokens.sessionPassword
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const input: LoginInput = {
      email: req.body.email,
      password: req.body.password
    };

    const result = await AuthService.login(input);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        sessionPassword: result.tokens.sessionPassword
      },
      message: 'Login successful'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const tokens = await AuthService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Token refresh failed'
      });
    }
  }
});

/**
 * POST /api/auth/logout
 * Logout user (revoke refresh tokens)
 */
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    await AuthService.logout(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const user = await AuthService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

/**
 * GET /api/auth/debug-encryption
 * Debug endpoint to check encryption format
 */
router.get('/debug-encryption', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const result = await AuthService.getUserById(req.user.userId);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get raw user data
    const { pool } = require('../../config/database');
    const userQuery = await pool.query(
      'SELECT master_seed_encrypted, encryption_salt FROM users WHERE id = $1',
      [req.user.userId]
    );

    const user = userQuery.rows[0];

    res.status(200).json({
      success: true,
      data: {
        seedLength: user.master_seed_encrypted?.length || 0,
        seedPreview: user.master_seed_encrypted?.substring(0, 100) || '',
        saltLength: user.encryption_salt?.length || 0,
        hasSeparator: user.master_seed_encrypted?.includes(':') || false,
        separatorCount: (user.master_seed_encrypted?.match(/:/g) || []).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check encryption format'
    });
  }
});

/**
 * POST /api/auth/backup-seed
 * Get master seed phrase for backup (requires password verification)
 */
router.post('/backup-seed', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    const seedPhrase = await AuthService.getMasterSeedPhrase(req.user.userId, password);

    res.status(200).json({
      success: true,
      data: {
        seedPhrase
      },
      message: 'Master seed retrieved successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(error.message.includes('Invalid password') ? 401 : 500).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve seed phrase'
      });
    }
  }
});

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

/**
 * GET /api/auth/google/callback
 * Google OAuth callback handler
 */
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3500'}/auth/login?error=oauth_failed`
  }),
  async (req: Request, res: Response) => {
    try {
      const profile = req.user as OAuthUserProfile;

      if (!profile || !profile.email) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/login?error=no_email`
        );
      }

      // Check for email collision
      if (profile.emailCollision) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/login?error=${encodeURIComponent('This email is already registered with a password. Please login with your password.')}`
        );
      }

      // Check if user exists
      const existingUser = await AuthService.getUserByOAuthId('google', profile.id);

      let result;
      let isNewUser = false;

      if (existingUser) {
        // Existing user - login
        result = await AuthService.loginOAuthUser(profile);
      } else {
        // New user - register
        const registerResult = await AuthService.registerOAuthUser(profile);
        result = registerResult;
        isNewUser = true;
      }

      // Encode tokens for URL transport
      const params = new URLSearchParams({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        user: JSON.stringify(result.user)
      });

      if (isNewUser && 'generatedPassword' in result) {
        params.append('generatedPassword', result.generatedPassword);
        params.append('isNewUser', 'true');
      }

      if (result.tokens.sessionPassword) {
        params.append('sessionPassword', result.tokens.sessionPassword);
      }

      // Redirect to frontend with tokens
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/oauth-callback?${params.toString()}`
      );
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/login?error=${encodeURIComponent('An error occurred during authentication. Please try again.')}`
      );
    }
  }
);

export default router;
