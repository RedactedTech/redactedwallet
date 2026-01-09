import {
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  getAccount
} from '@solana/spl-token';
import { derivePath } from 'ed25519-hd-key';
import * as bip39 from 'bip39';
import { pool } from '../config/database';
import { GhostWallet, SpawnWalletInput } from '../types';
import { EncryptionService } from './EncryptionService';
import { getSolanaConnection } from '../config/solana';
import { NotFoundError, ValidationError } from '../types';
import { SolanaService } from './SolanaService';

// ============================================================
// WALLET SERVICE
// ============================================================

export class WalletService {

  // ============================================================
  // HD WALLET DERIVATION
  // ============================================================

  /**
   * Derives a Solana keypair from master seed using BIP44 path
   * Path: m/44'/501'/0'/0/{index}
   * 501 is Solana's coin type
   */
  private static deriveKeypairFromSeed(
    masterSeed: Buffer,
    walletIndex: number
  ): Keypair {
    // BIP44 derivation path for Solana
    // m/44'/501'/account'/change/index
    const path = `m/44'/501'/0'/0/${walletIndex}`;

    const derivedSeed = derivePath(path, masterSeed.toString('hex')).key;
    const keypair = Keypair.fromSeed(derivedSeed);

    return keypair;
  }

  /**
   * Decrypts user's master seed and derives keypair at specific index
   */
  static async deriveUserKeypair(
    userId: string,
    walletIndex: number,
    userPassword: string
  ): Promise<Keypair> {
    // Fetch user's encrypted master seed
    const userResult = await pool.query(
      'SELECT master_seed_encrypted, encryption_salt FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const { master_seed_encrypted, encryption_salt } = userResult.rows[0];

    // Decrypt master seed
    const masterSeedHex = EncryptionService.decrypt(
      master_seed_encrypted,
      userPassword,
      encryption_salt
    );

    const masterSeed = Buffer.from(masterSeedHex, 'hex');

    // Derive keypair at index
    return this.deriveKeypairFromSeed(masterSeed, walletIndex);
  }

  // ============================================================
  // GHOST WALLET CREATION
  // ============================================================

  /**
   * Creates a new ghost wallet for a user
   */
  static async createGhostWallet(input: SpawnWalletInput): Promise<GhostWallet> {
    const { userId, fundAmount, strategyId } = input;

    // Get next wallet index for this user
    const userResult = await pool.query(
      'SELECT wallet_index_counter FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const currentIndex = userResult.rows[0].wallet_index_counter || 0;
    const nextIndex = currentIndex + 1;

    // Update user's wallet index counter
    await pool.query(
      'UPDATE users SET wallet_index_counter = $1 WHERE id = $2',
      [nextIndex, userId]
    );

    // Generate derivation path
    const derivationPath = `m/44'/501'/0'/0/${nextIndex}`;

    // NOTE: We don't store the private key - it's derived on-demand from master seed
    // For now, generate a temporary keypair just to get the public key
    // In production, you'd decrypt master seed here
    const tempKeypair = Keypair.generate(); // PLACEHOLDER - Replace with actual derivation

    // Create ghost wallet record
    const result = await pool.query(
      `INSERT INTO ghost_wallets (
        user_id,
        public_key,
        derivation_path,
        wallet_index,
        status,
        max_trades_per_wallet,
        max_lifetime_hours,
        funded_from_relay_pool
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        userId,
        tempKeypair.publicKey.toString(),
        derivationPath,
        nextIndex,
        'active',
        50, // Default max trades per wallet
        168, // Default 7 days (168 hours)
        fundAmount ? false : true // If manually funded, not from relay
      ]
    );

    const wallet = result.rows[0];

    // Log audit event
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        'ghost_wallet_created',
        'ghost_wallet',
        wallet.id,
        JSON.stringify({ wallet_index: nextIndex, derivation_path: derivationPath })
      ]
    );

    return wallet;
  }

  // ============================================================
  // WALLET RETRIEVAL
  // ============================================================

  /**
   * Get all wallets for a user
   */
  static async getUserWallets(userId: string): Promise<GhostWallet[]> {
    const result = await pool.query(
      `SELECT * FROM ghost_wallets
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Get specific wallet by ID
   */
  static async getWalletById(walletId: string, userId: string): Promise<GhostWallet> {
    const result = await pool.query(
      `SELECT * FROM ghost_wallets
       WHERE id = $1 AND user_id = $2`,
      [walletId, userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Wallet not found');
    }

    return result.rows[0];
  }

  /**
   * Get active wallets for a user
   */
  static async getActiveWallets(userId: string): Promise<GhostWallet[]> {
    const result = await pool.query(
      `SELECT * FROM ghost_wallets
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  // ============================================================
  // WALLET BALANCE
  // ============================================================

  /**
   * Get SOL balance for a wallet
   */
  static async getWalletBalance(walletId: string, userId: string): Promise<{
    sol: number;
    lamports: number;
  }> {
    const wallet = await this.getWalletById(walletId, userId);

    const connection = getSolanaConnection();
    const publicKey = new PublicKey(wallet.public_key);

    const lamports = await connection.getBalance(publicKey);
    const sol = lamports / LAMPORTS_PER_SOL;

    return {
      sol,
      lamports
    };
  }

  // ============================================================
  // WALLET LIFECYCLE
  // ============================================================

  /**
   * Recycle a wallet (mark for cleanup)
   */
  static async recycleWallet(walletId: string, userId: string): Promise<GhostWallet> {
    // Verify wallet belongs to user
    const wallet = await this.getWalletById(walletId, userId);

    if (wallet.status === 'recycled') {
      throw new ValidationError('Wallet is already recycled');
    }

    // Update status to recycled
    const result = await pool.query(
      `UPDATE ghost_wallets
       SET status = 'recycled', recycled_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [walletId]
    );

    // Log audit event
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'ghost_wallet_recycled', 'ghost_wallet', walletId]
    );

    return result.rows[0];
  }

  /**
   * Check if wallet should be auto-recycled based on metrics
   */
  static async shouldRecycleWallet(wallet: GhostWallet): Promise<boolean> {
    // Check trade count
    if (wallet.total_trades >= wallet.max_trades_per_wallet) {
      return true;
    }

    // Check lifetime
    const createdAt = new Date(wallet.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation >= wallet.max_lifetime_hours) {
      return true;
    }

    return false;
  }

  /**
   * Auto-recycle wallets that meet criteria
   */
  static async autoRecycleWallets(userId: string): Promise<number> {
    const activeWallets = await this.getActiveWallets(userId);
    let recycledCount = 0;

    for (const wallet of activeWallets) {
      if (await this.shouldRecycleWallet(wallet)) {
        await this.recycleWallet(wallet.id, userId);
        recycledCount++;
      }
    }

    return recycledCount;
  }

  // ============================================================
  // WALLET STATISTICS
  // ============================================================

  /**
   * Get wallet statistics for user
   */
  static async getWalletStats(userId: string): Promise<{
    total: number;
    active: number;
    recycled: number;
    totalVolume: number;
    totalPnL: number;
  }> {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'recycled') as recycled,
        COALESCE(SUM(total_volume_usd), 0) as total_volume,
        COALESCE(SUM(profit_loss_usd), 0) as total_pnl
       FROM ghost_wallets
       WHERE user_id = $1`,
      [userId]
    );

    const stats = result.rows[0];

    return {
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      recycled: parseInt(stats.recycled),
      totalVolume: parseFloat(stats.total_volume),
      totalPnL: parseFloat(stats.total_pnl)
    };
  }

  // ============================================================
  // WALLET ROTATION
  // ============================================================

  /**
   * Get or create a wallet for trading
   * Implements wallet rotation logic
   */
  static async getOrCreateTradingWallet(
    userId: string,
    strategyId?: string
  ): Promise<GhostWallet> {
    // First, check if there's an active wallet with capacity
    const activeWallets = await this.getActiveWallets(userId);

    for (const wallet of activeWallets) {
      // Check if wallet has capacity for more trades
      if (wallet.total_trades < wallet.max_trades_per_wallet) {
        // Check if wallet is still within lifetime
        const createdAt = new Date(wallet.created_at);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceCreation < wallet.max_lifetime_hours) {
          return wallet;
        }
      }
    }

    // No suitable wallet found, create new one
    return await this.createGhostWallet({ userId, strategyId });
  }

  // ============================================================
  // WALLET DRAINING
  // ============================================================

  /**
   * Drain all funds from a ghost wallet to a destination address
   * Transfers SOL and all SPL tokens, then marks wallet as recycled
   */
  static async drainWallet(
    walletId: string,
    userId: string,
    destinationAddress: string,
    userPassword: string
  ): Promise<{
    solSignature?: string;
    tokenSignatures: Array<{ mint: string; signature: string }>;
    solAmount: number;
    tokenAmounts: Array<{ mint: string; amount: number }>;
  }> {
    // Verify wallet belongs to user
    const wallet = await this.getWalletById(walletId, userId);

    if (wallet.status === 'recycled') {
      throw new ValidationError('Wallet is already recycled');
    }

    // Derive keypair from master seed
    const walletKeypair = await this.deriveUserKeypair(
      userId,
      wallet.wallet_index,
      userPassword
    );

    const connection = getSolanaConnection();
    const destinationPubkey = new PublicKey(destinationAddress);
    const walletPubkey = walletKeypair.publicKey;

    const result = {
      solSignature: undefined as string | undefined,
      tokenSignatures: [] as Array<{ mint: string; signature: string }>,
      solAmount: 0,
      tokenAmounts: [] as Array<{ mint: string; amount: number }>,
    };

    try {
      // 1. Transfer all SPL tokens first
      const tokenAccounts = await SolanaService.getTokenAccounts(walletPubkey);

      for (const tokenAccount of tokenAccounts) {
        if (tokenAccount.balance > 0) {
          try {
            // Get source and destination token accounts
            const tokenMint = new PublicKey(tokenAccount.mint);
            const sourceTokenAccount = await getAssociatedTokenAddress(
              tokenMint,
              walletPubkey
            );
            const destTokenAccount = await getAssociatedTokenAddress(
              tokenMint,
              destinationPubkey
            );

            // Build transfer instruction
            const transferInstruction = createTransferInstruction(
              sourceTokenAccount,
              destTokenAccount,
              walletPubkey,
              tokenAccount.balance,
              [],
              TOKEN_PROGRAM_ID
            );

            // Create transaction
            const transaction = new Transaction();
            const { blockhash } = await SolanaService.getRecentBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = walletPubkey;
            transaction.add(transferInstruction);

            // Sign and send
            transaction.sign(walletKeypair);
            const signature = await SolanaService.sendAndConfirmTransaction(transaction, {
              commitment: 'confirmed',
            });

            result.tokenSignatures.push({
              mint: tokenAccount.mint,
              signature: signature.signature,
            });
            result.tokenAmounts.push({
              mint: tokenAccount.mint,
              amount: tokenAccount.uiAmount,
            });

            console.log(`✅ Transferred ${tokenAccount.uiAmount} tokens (${tokenAccount.mint})`);
          } catch (error: any) {
            console.error(`❌ Failed to transfer token ${tokenAccount.mint}:`, error.message);
            // Continue with other tokens even if one fails
          }
        }
      }

      // 2. Transfer SOL (leave enough for rent exemption and transaction fee)
      const balance = await connection.getBalance(walletPubkey);
      const minRentExemption = await SolanaService.getMinimumBalanceForRentExemption(0);
      const txFee = 5000; // 0.000005 SOL fee estimate
      const amountToTransfer = balance - minRentExemption - txFee;

      if (amountToTransfer > 0) {
        const transaction = new Transaction();
        const { blockhash } = await SolanaService.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = walletPubkey;

        transaction.add(
          SystemProgram.transfer({
            fromPubkey: walletPubkey,
            toPubkey: destinationPubkey,
            lamports: amountToTransfer,
          })
        );

        transaction.sign(walletKeypair);
        const signature = await SolanaService.sendAndConfirmTransaction(transaction, {
          commitment: 'confirmed',
        });

        result.solSignature = signature.signature;
        result.solAmount = amountToTransfer / LAMPORTS_PER_SOL;

        console.log(`✅ Transferred ${result.solAmount} SOL`);
      } else {
        console.log(`⚠️ Insufficient balance to transfer SOL (balance: ${balance} lamports)`);
      }

      // 3. Mark wallet as recycled
      await this.recycleWallet(walletId, userId);

      // Log audit event
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          'ghost_wallet_drained',
          'ghost_wallet',
          walletId,
          JSON.stringify({
            destination: destinationAddress,
            sol_amount: result.solAmount,
            token_count: result.tokenSignatures.length,
          }),
        ]
      );

      return result;
    } catch (error: any) {
      console.error('Error draining wallet:', error);
      throw new Error(`Failed to drain wallet: ${error.message}`);
    }
  }
}

export default WalletService;
