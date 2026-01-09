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
    // Note: ed25519-hd-key only supports hardened derivation
    // So we use all hardened levels
    const path = `m/44'/501'/${walletIndex}'`;

    console.log('🔀 Deriving from path:', {
      path,
      seedLength: masterSeed.length,
      seedHexLength: masterSeed.toString('hex').length,
      walletIndex
    });

    try {
      const derivedSeed = derivePath(path, masterSeed.toString('hex')).key;
      const keypair = Keypair.fromSeed(derivedSeed);

      console.log('✅ Derivation successful:', {
        publicKey: keypair.publicKey.toString()
      });

      return keypair;
    } catch (error: any) {
      console.error('❌ Derivation failed:', {
        path,
        seedLength: masterSeed.length,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Decrypts user's master seed and derives keypair at specific index
   */
  static async deriveUserKeypair(
    userId: string,
    walletIndex: number,
    userPassword: string
  ): Promise<Keypair> {
    console.log('🔑 Deriving keypair:', {
      userId,
      walletIndex,
      hasPassword: !!userPassword,
      passwordLength: userPassword?.length || 0
    });

    // Fetch user's encrypted master seed
    const userResult = await pool.query(
      'SELECT master_seed_encrypted, encryption_salt FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const { master_seed_encrypted, encryption_salt } = userResult.rows[0];

    console.log('🔒 Encryption data:', {
      seedLength: master_seed_encrypted?.length || 0,
      seedPreview: master_seed_encrypted?.substring(0, 50) + '...',
      saltLength: encryption_salt?.length || 0,
      hasSeparator: master_seed_encrypted?.includes(':'),
      separatorCount: (master_seed_encrypted?.match(/:/g) || []).length
    });

    // Decrypt master seed (handle both packed and unpacked formats for backward compatibility)
    let masterSeedHex: string;

    try {
      // Try new packed format first (salt:iv:authTag:encrypted)
      const unpackedSeed = EncryptionService.unpackEncrypted(master_seed_encrypted);
      masterSeedHex = EncryptionService.decrypt(
        unpackedSeed.encrypted,
        userPassword,
        unpackedSeed.salt,
        unpackedSeed.iv,
        unpackedSeed.authTag
      );
    } catch (unpackError: any) {
      console.error('Failed to decrypt master seed:', {
        userId,
        error: unpackError.message,
        seedFormat: master_seed_encrypted?.substring(0, 50) + '...',
        hasSalt: !!encryption_salt
      });
      throw new Error(`Failed to decrypt master seed: ${unpackError.message}. Please try logging out and back in, or contact support if the issue persists.`);
    }

    const entropyBuffer = Buffer.from(masterSeedHex, 'hex');

    console.log('🌱 Entropy info:', {
      hexLength: masterSeedHex.length,
      bufferLength: entropyBuffer.length,
      isValidHex: /^[0-9a-fA-F]+$/.test(masterSeedHex),
      preview: masterSeedHex.substring(0, 32) + '...'
    });

    // Convert 32-byte entropy to BIP39 mnemonic, then to 64-byte seed
    // This is required for ed25519-hd-key derivation
    const mnemonic = bip39.entropyToMnemonic(entropyBuffer);
    const seed = await bip39.mnemonicToSeed(mnemonic);

    console.log('🌱 Final seed info:', {
      seedLength: seed.length,
      mnemonicWords: mnemonic.split(' ').length
    });

    // Derive keypair at index
    return this.deriveKeypairFromSeed(seed, walletIndex);
  }

  // ============================================================
  // GHOST WALLET CREATION
  // ============================================================

  /**
   * Creates a new ghost wallet for a user
   */
  static async createGhostWallet(input: SpawnWalletInput, userPassword: string): Promise<GhostWallet> {
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

    // Derive the actual keypair from the user's master seed
    const derivedKeypair = await this.deriveUserKeypair(userId, nextIndex, userPassword);

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
        derivedKeypair.publicKey.toString(),
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
    userPassword: string,
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
    return await this.createGhostWallet({ userId, strategyId }, userPassword);
  }

  // ============================================================
  // WALLET TRANSFERS
  // ============================================================

  /**
   * Transfer funds from a ghost wallet to a destination address
   * Supports both SOL and SPL token transfers
   */
  static async transferFunds(
    walletId: string,
    userId: string,
    destinationAddress: string,
    amount: number,
    userPassword: string,
    tokenMint?: string
  ): Promise<{
    signature: string;
    amount: number;
    tokenMint?: string;
    fee: number;
  }> {
    // Verify wallet belongs to user
    const wallet = await this.getWalletById(walletId, userId);

    if (wallet.status !== 'active') {
      throw new ValidationError('Can only transfer from active wallets');
    }

    // Validate destination address
    let destinationPubkey: PublicKey;
    try {
      destinationPubkey = new PublicKey(destinationAddress);
    } catch (error) {
      throw new ValidationError('Invalid destination address');
    }

    // Derive keypair from master seed
    const walletKeypair = await this.deriveUserKeypair(
      userId,
      wallet.wallet_index,
      userPassword
    );

    const connection = getSolanaConnection();
    const walletPubkey = walletKeypair.publicKey;

    try {
      if (tokenMint) {
        // SPL Token Transfer
        const tokenMintPubkey = new PublicKey(tokenMint);
        
        // Get token balance
        const tokenBalance = await SolanaService.getTokenBalance(walletPubkey, tokenMintPubkey);
        
        if (tokenBalance.balance === 0) {
          throw new ValidationError('No tokens to transfer');
        }

        if (amount > tokenBalance.uiAmount) {
          throw new ValidationError(`Insufficient token balance. Available: ${tokenBalance.uiAmount}`);
        }

        // Convert UI amount to raw amount
        const rawAmount = Math.floor(amount * Math.pow(10, tokenBalance.decimals));

        // Get source and destination token accounts
        const sourceTokenAccount = await getAssociatedTokenAddress(
          tokenMintPubkey,
          walletPubkey
        );
        const destTokenAccount = await getAssociatedTokenAddress(
          tokenMintPubkey,
          destinationPubkey
        );

        // Build transfer instruction
        const transferInstruction = createTransferInstruction(
          sourceTokenAccount,
          destTokenAccount,
          walletPubkey,
          rawAmount,
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
        const result = await SolanaService.sendAndConfirmTransaction(transaction, {
          commitment: 'confirmed',
        });

        // Log audit event
        await pool.query(
          `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            'ghost_wallet_transfer',
            'ghost_wallet',
            walletId,
            JSON.stringify({
              destination: destinationAddress,
              amount,
              token_mint: tokenMint,
              signature: result.signature,
            }),
          ]
        );

        return {
          signature: result.signature,
          amount,
          tokenMint,
          fee: 0.000005, // Approximate SPL transfer fee
        };
      } else {
        // SOL Transfer
        const balance = await connection.getBalance(walletPubkey);
        const solBalance = balance / LAMPORTS_PER_SOL;

        if (solBalance === 0) {
          throw new ValidationError('No SOL to transfer');
        }

        // Estimate fee (5000 lamports = 0.000005 SOL)
        const estimatedFee = 5000;
        const maxTransferable = (balance - estimatedFee) / LAMPORTS_PER_SOL;

        if (amount > maxTransferable) {
          throw new ValidationError(
            `Insufficient balance. Available: ${maxTransferable.toFixed(6)} SOL (after fees)`
          );
        }

        const lamportsToTransfer = Math.floor(amount * LAMPORTS_PER_SOL);

        // Create transaction
        const transaction = new Transaction();
        const { blockhash } = await SolanaService.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = walletPubkey;

        transaction.add(
          SystemProgram.transfer({
            fromPubkey: walletPubkey,
            toPubkey: destinationPubkey,
            lamports: lamportsToTransfer,
          })
        );

        transaction.sign(walletKeypair);
        const result = await SolanaService.sendAndConfirmTransaction(transaction, {
          commitment: 'confirmed',
        });

        // Log audit event
        await pool.query(
          `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            'ghost_wallet_transfer',
            'ghost_wallet',
            walletId,
            JSON.stringify({
              destination: destinationAddress,
              amount,
              signature: result.signature,
            }),
          ]
        );

        return {
          signature: result.signature,
          amount,
          fee: estimatedFee / LAMPORTS_PER_SOL,
        };
      }
    } catch (error: any) {
      console.error('Error transferring funds:', error);
      throw new Error(`Failed to transfer funds: ${error.message}`);
    }
  }

  // ============================================================
  // PORTFOLIO
  // ============================================================

  /**
   * Get portfolio overview with holdings across all wallets
   */
  static async getPortfolio(userId: string): Promise<
    Array<{
      walletId: string;
      walletAddress: string;
      walletIndex: number;
      holdings: Array<{
        mint: string;
        symbol: string | null;
        name: string | null;
        balance: number;
        decimals: number;
        uiAmount: number;
        currentPrice: number | null;
        currentValueUsd: number | null;
        averageEntryPrice: number | null;
        totalInvestedUsd: number | null;
        pnlUsd: number | null;
        pnlPercentage: number | null;
        imageUri: string | null;
      }>;
      totalValueUsd: number;
      totalPnlUsd: number;
    }>
  > {
    // Get all active wallets for the user
    const wallets = await this.getActiveWallets(userId);
    console.log(`📊 Found ${wallets.length} active wallet(s) for user ${userId}`);
    const portfolios = [];

    // Import TokenService dynamically to avoid circular dependency
    const { TokenService } = await import('./TokenService');

    for (const wallet of wallets) {
      try {
        console.log(`🔍 Processing wallet ${wallet.public_key.slice(0, 8)}...`);
        const walletPubkey = new PublicKey(wallet.public_key);

        // Get all token accounts for this wallet
        const tokenAccounts = await SolanaService.getTokenAccounts(walletPubkey);
        console.log(`  Found ${tokenAccounts.length} token account(s)`);

        // Log each token account details
        tokenAccounts.forEach((acc, idx) => {
          console.log(`    Token ${idx + 1}: ${acc.mint.slice(0, 8)}... Balance: ${acc.balance}, uiAmount: ${acc.uiAmount}, Decimals: ${acc.decimals}`);
        });

        // Filter out zero balances
        const nonZeroAccounts = tokenAccounts.filter(acc => acc.uiAmount > 0);
        console.log(`  ${nonZeroAccounts.length} account(s) with non-zero balance`);

        if (nonZeroAccounts.length === 0) {
          continue; // Skip wallets with no holdings
        }

        const holdings = [];
        let totalValueUsd = 0;
        let totalPnlUsd = 0;

        for (const tokenAccount of nonZeroAccounts) {
          try {
            // Fetch token metadata and price
            const [metadata, metrics] = await Promise.all([
              TokenService.fetchTokenMetadata(tokenAccount.mint),
              TokenService.fetchTokenMetrics(tokenAccount.mint)
            ]);

            const currentPrice = metrics?.price_usd || null;
            const currentValueUsd = currentPrice ? tokenAccount.uiAmount * currentPrice : null;

            // Calculate average entry price and total invested from trades
            const tradesResult = await pool.query(
              `SELECT
                AVG(entry_price_usd) as avg_entry_price,
                SUM(entry_amount_sol) as total_sol_invested
               FROM trades
               WHERE ghost_wallet_id = $1
                 AND token_address = $2
                 AND status = 'open'
                 AND entry_price_usd IS NOT NULL`,
              [wallet.id, tokenAccount.mint]
            );

            const avgEntryPrice = tradesResult.rows[0]?.avg_entry_price
              ? parseFloat(tradesResult.rows[0].avg_entry_price)
              : null;

            const totalSolInvested = tradesResult.rows[0]?.total_sol_invested
              ? parseFloat(tradesResult.rows[0].total_sol_invested)
              : null;

            // Estimate USD invested (using rough SOL price of $20 if we don't have exact)
            // TODO: Store SOL price at entry time for more accuracy
            const totalInvestedUsd = totalSolInvested ? totalSolInvested * 20 : null;

            // Calculate P&L
            let pnlUsd = null;
            let pnlPercentage = null;

            if (currentValueUsd !== null && totalInvestedUsd !== null && totalInvestedUsd > 0) {
              pnlUsd = currentValueUsd - totalInvestedUsd;
              pnlPercentage = (pnlUsd / totalInvestedUsd) * 100;
            }

            // Get image URI from metadata
            const imageUri = (metadata as any).image_uri || null;

            holdings.push({
              mint: tokenAccount.mint,
              symbol: metadata.symbol,
              name: metadata.name,
              balance: tokenAccount.balance,
              decimals: tokenAccount.decimals,
              uiAmount: tokenAccount.uiAmount,
              currentPrice,
              currentValueUsd,
              averageEntryPrice: avgEntryPrice,
              totalInvestedUsd,
              pnlUsd,
              pnlPercentage,
              imageUri
            });

            if (currentValueUsd) totalValueUsd += currentValueUsd;
            if (pnlUsd) totalPnlUsd += pnlUsd;

          } catch (error: any) {
            console.error(`Error fetching data for token ${tokenAccount.mint}:`, error.message);
            // Still include the token but with null prices
            holdings.push({
              mint: tokenAccount.mint,
              symbol: null,
              name: null,
              balance: tokenAccount.balance,
              decimals: tokenAccount.decimals,
              uiAmount: tokenAccount.uiAmount,
              currentPrice: null,
              currentValueUsd: null,
              averageEntryPrice: null,
              totalInvestedUsd: null,
              pnlUsd: null,
              pnlPercentage: null,
              imageUri: null
            });
          }
        }

        if (holdings.length > 0) {
          portfolios.push({
            walletId: wallet.id,
            walletAddress: wallet.public_key,
            walletIndex: wallet.wallet_index,
            holdings,
            totalValueUsd,
            totalPnlUsd
          });
        }
      } catch (error: any) {
        console.error(`Error processing wallet ${wallet.id}:`, error.message);
        // Continue with other wallets even if one fails
      }
    }

    console.log(`✅ Returning ${portfolios.length} portfolio(s) with holdings`);
    return portfolios;
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
