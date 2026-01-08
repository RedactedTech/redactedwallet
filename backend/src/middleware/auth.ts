import { Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthRequest, AuthenticationError } from '../types';

/**
 * Authentication Middleware
 *
 * Verifies JWT token from Authorization header and attaches user info to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = AuthService.verifyAccessToken(token);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't reject if missing
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = AuthService.verifyAccessToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Ignore errors, proceed without user
    next();
  }
};

export default { authenticate, optionalAuthenticate };
