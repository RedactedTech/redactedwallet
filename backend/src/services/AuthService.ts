import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import EncryptionService from './EncryptionService';
import {
  User,
  UserPublic,
  CreateUserInput,
  LoginInput,
  TokenPair,
  JWTPayload,
  AuthenticationError,
  ValidationError
} from '../types';
import crypto from 'crypto';
import * as bip39 from 'bip39';

/**
 * AuthService
 *
 * Handles user authentication, registration, and JWT token management.
 *
 * Security Features:
 * - Bcrypt for password hashing (10 rounds)
 * - JWT with short-lived access tokens (15min)
 * - Refresh tokens with rotation
 * - Master seed encryption with user password
 */

export class AuthService {
  private static readonly BCRYPT_ROUNDS = 10;
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';
  private static readonly JWT_REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'change_this_too';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  private static readonly REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

  /**
   * Validates email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates password strength
   * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number
   */
  private static isValidPassword(password: string): boolean {
    if (password.length < 8) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber;
  }

  /**
   * Generates a BIP39-compatible mnemonic (24 words) as master seed
   * Note: In production, use a proper BIP39 library
   */
  private static generateMasterSeed(): string {
    // For now, generate a 256-bit hex string
    // In Phase 2, we'll replace this with proper BIP39 mnemonic
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Removes password hash from user object
   */
  private static sanitizeUser(user: User): UserPublic {
    const { password_hash, master_seed_encrypted, encryption_salt, ...publicUser } = user;
    return publicUser as UserPublic;
  }

  /**
   * Encrypts password for session storage
   * This allows wallet derivation without storing plain password
   */
  private static encryptPasswordForSession(password: string, userId: string): string {
    // Use JWT secret + userId as encryption key (32 bytes for AES-256)
    const sessionKey = crypto.createHash('sha256')
      .update(this.JWT_SECRET + userId)
      .digest(); // Returns 32-byte Buffer directly

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', sessionKey, iv);

    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted password as base64
    return Buffer.concat([iv, Buffer.from(encrypted, 'hex')]).toString('base64');
  }

  /**
   * Decrypts password from session token
   */
  static decryptPasswordFromSession(encryptedToken: string, userId: string): string {
    try {
      const sessionKey = crypto.createHash('sha256')
        .update(this.JWT_SECRET + userId)
        .digest(); // Returns 32-byte Buffer directly

      const buffer = Buffer.from(encryptedToken, 'base64');
      const iv = buffer.subarray(0, 16);
      const encryptedPassword = buffer.subarray(16);

      const decipher = crypto.createDecipheriv('aes-256-cbc', sessionKey, iv);

      let decrypted = decipher.update(encryptedPassword);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      throw new AuthenticationError('Invalid session password token');
    }
  }

  /**
   * Generates JWT access token
   */
  private static generateAccessToken(userId: string, email: string): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId,
      email
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });
  }

  /**
   * Generates JWT refresh token and stores hash in database
   */
  private static async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = jwt.sign({ userId }, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_EXPIRES_IN
    });

    // Hash token for storage
    const tokenHash = EncryptionService.hash(refreshToken);

    // Calculate expiry date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store in database
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );

    return refreshToken;
  }

  /**
   * Registers a new user
   *
   * Steps:
   * 1. Validate input
   * 2. Check if user already exists
   * 3. Hash password with bcrypt
   * 4. Generate master seed
   * 5. Encrypt master seed with user password
   * 6. Store user in database
   * 7. Generate JWT tokens
   */
  static async register(input: CreateUserInput): Promise<{
    user: UserPublic;
    tokens: TokenPair;
  }> {
    const { email, password } = input;

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    if (!this.isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!this.isValidPassword(password)) {
      throw new ValidationError(
        'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number'
      );
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new ValidationError('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

    // Generate master seed (HD wallet seed)
    const masterSeed = this.generateMasterSeed();

    // Encrypt master seed with user password
    const encryptedSeed = EncryptionService.encrypt(masterSeed, password);
    const packedSeed = EncryptionService.packEncrypted(encryptedSeed);

    // Insert user into database
    const result = await pool.query<User>(
      `INSERT INTO users (email, password_hash, master_seed_encrypted, encryption_salt, wallet_index_counter)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email.toLowerCase(), passwordHash, packedSeed, encryptedSeed.salt, 0]
    );

    const user = result.rows[0];

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);
    const sessionPassword = this.encryptPasswordForSession(password, user.id);

    // Log audit event
    await this.logAuditEvent(user.id, 'user_registered', 'user', user.id);

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken,
        sessionPassword
      }
    };
  }

  /**
   * Authenticates a user and returns JWT tokens
   */
  static async login(input: LoginInput): Promise<{
    user: UserPublic;
    tokens: TokenPair;
  }> {
    const { email, password } = input;

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);
    const sessionPassword = this.encryptPasswordForSession(password, user.id);

    // Log audit event
    await this.logAuditEvent(user.id, 'user_login', 'user', user.id);

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken,
        sessionPassword
      }
    };
  }

  /**
   * Refreshes access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as { userId: string };

      // Check if refresh token is in database and not revoked
      const tokenHash = EncryptionService.hash(refreshToken);
      const result = await pool.query(
        `SELECT * FROM refresh_tokens
         WHERE token_hash = $1 AND is_revoked = false AND expires_at > NOW()`,
        [tokenHash]
      );

      if (result.rows.length === 0) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }

      // Get user
      const userResult = await pool.query<User>(
        'SELECT * FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        throw new AuthenticationError('User not found');
      }

      const user = userResult.rows[0];

      // Revoke old refresh token
      await pool.query(
        'UPDATE refresh_tokens SET is_revoked = true, revoked_at = NOW() WHERE token_hash = $1',
        [tokenHash]
      );

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user.id, user.email);
      const newRefreshToken = await this.generateRefreshToken(user.id);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  /**
   * Verifies JWT access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  /**
   * Logs out user by revoking all refresh tokens
   */
  static async logout(userId: string): Promise<void> {
    await pool.query(
      'UPDATE refresh_tokens SET is_revoked = true, revoked_at = NOW() WHERE user_id = $1 AND is_revoked = false',
      [userId]
    );

    await this.logAuditEvent(userId, 'user_logout', 'user', userId);
  }

  /**
   * Gets user by ID
   */
  static async getUserById(userId: string): Promise<UserPublic | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.sanitizeUser(result.rows[0]);
  }

  /**
   * Gets master seed phrase for backup (requires password verification)
   */
  static async getMasterSeedPhrase(userId: string, password: string): Promise<string> {
    // Fetch user with encrypted seed
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AuthenticationError('User not found');
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid password');
    }

    // Unpack and decrypt master seed
    const unpackedSeed = EncryptionService.unpackEncrypted(user.master_seed_encrypted);
    const masterSeedHex = EncryptionService.decrypt(
      unpackedSeed.encrypted,
      password,
      unpackedSeed.salt,
      unpackedSeed.iv,
      unpackedSeed.authTag
    );

    // Convert hex seed to BIP39 mnemonic for easier backup
    const seedBuffer = Buffer.from(masterSeedHex, 'hex');
    const mnemonic = bip39.entropyToMnemonic(seedBuffer);

    // Log audit event
    await this.logAuditEvent(userId, 'master_seed_viewed', 'user', userId, {
      timestamp: new Date().toISOString()
    });

    return mnemonic;
  }

  /**
   * Logs audit event
   */
  private static async logAuditEvent(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, action, resourceType, resourceId, JSON.stringify(metadata)]
      );
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit logging failure shouldn't break the main flow
    }
  }

  /**
   * Generates a cryptographically secure random password for OAuth users
   * Requirements: 32 characters, alphanumeric + symbols
   */
  private static generateSecurePassword(): string {
    const length = 32;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const bytes = crypto.randomBytes(length);
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset[bytes[i] % charset.length];
    }

    return password;
  }

  /**
   * Registers a new OAuth user
   *
   * Steps:
   * 1. Generate secure random password (32 chars)
   * 2. Hash the generated password with bcrypt
   * 3. Generate master seed
   * 4. Encrypt master seed with generated password
   * 5. Store user with oauth_provider and oauth_id
   * 6. Return tokens + generated password (shown once)
   */
  static async registerOAuthUser(profile: { id: string; email: string; name: string }): Promise<{
    user: UserPublic;
    tokens: TokenPair;
    generatedPassword: string;
  }> {
    const { id: oauthId, email } = profile;

    // Check if OAuth user already exists
    const existingOAuthUser = await pool.query(
      'SELECT id FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
      ['google', oauthId]
    );

    if (existingOAuthUser.rows.length > 0) {
      throw new ValidationError('OAuth user already exists');
    }

    // Check if email is taken by local user
    const existingEmailUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingEmailUser.rows.length > 0) {
      throw new ValidationError('Email already registered with password. Please login with your password.');
    }

    // Generate secure random password (shown once to user)
    const generatedPassword = this.generateSecurePassword();

    // Hash the generated password
    const passwordHash = await bcrypt.hash(generatedPassword, this.BCRYPT_ROUNDS);

    // Generate master seed (HD wallet seed)
    const masterSeed = this.generateMasterSeed();

    // Encrypt master seed with generated password
    const encryptedSeed = EncryptionService.encrypt(masterSeed, generatedPassword);
    const packedSeed = EncryptionService.packEncrypted(encryptedSeed);

    // Insert user into database with OAuth fields
    const result = await pool.query<User>(
      `INSERT INTO users (
        email, password_hash, master_seed_encrypted, encryption_salt,
        wallet_index_counter, oauth_provider, oauth_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        email.toLowerCase(),
        passwordHash,
        packedSeed,
        encryptedSeed.salt,
        0,
        'google',
        oauthId
      ]
    );

    const user = result.rows[0];

    // Generate tokens (use generated password for session)
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);
    const sessionPassword = this.encryptPasswordForSession(generatedPassword, user.id);

    // Log audit event
    await this.logAuditEvent(user.id, 'oauth_user_registered', 'user', user.id, {
      provider: 'google',
      oauth_id: oauthId
    });

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken,
        sessionPassword
      },
      generatedPassword // MUST be shown to user immediately
    };
  }

  /**
   * Logs in an existing OAuth user
   */
  static async loginOAuthUser(profile: { id: string; email: string }): Promise<{
    user: UserPublic;
    tokens: TokenPair;
  }> {
    const { id: oauthId } = profile;

    // Find user by OAuth ID
    const result = await pool.query<User>(
      `SELECT * FROM users
       WHERE oauth_provider = $1 AND oauth_id = $2 AND is_active = true`,
      ['google', oauthId]
    );

    if (result.rows.length === 0) {
      throw new AuthenticationError('OAuth user not found');
    }

    const user = result.rows[0];

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    // NOTE: OAuth users need to provide their generated password for trades
    // We can't generate sessionPassword here without the user's password
    // They must manually enter it when executing trades
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);

    // Log audit event
    await this.logAuditEvent(user.id, 'oauth_user_login', 'user', user.id, {
      provider: 'google'
    });

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken
        // sessionPassword is NOT included for returning OAuth users
        // They must provide their saved password when trading
      }
    };
  }

  /**
   * Gets user by OAuth provider and ID
   */
  static async getUserByOAuthId(provider: string, oauthId: string): Promise<UserPublic | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2 AND is_active = true',
      [provider, oauthId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.sanitizeUser(result.rows[0]);
  }
}

export default AuthService;
