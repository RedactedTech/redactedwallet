import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
  TransactionSignature,
  LAMPORTS_PER_SOL,
  SendOptions,
  Commitment,
  ConfirmOptions,
  RpcResponseAndContext,
  SignatureStatus,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from '@solana/spl-token';
import { getSolanaConnection } from '../config/solana';
import { NotFoundError } from '../types';

// ============================================================
// SOLANA SERVICE
// ============================================================

export class SolanaService {
  private static connection: Connection;

  /**
   * Get connection instance
   */
  private static getConnection(): Connection {
    if (!this.connection) {
      this.connection = getSolanaConnection();
    }
    return this.connection;
  }

  // ============================================================
  // BALANCE QUERIES
  // ============================================================

  /**
   * Get SOL balance for a wallet
   */
  static async getSOLBalance(publicKey: PublicKey): Promise<{
    sol: number;
    lamports: number;
  }> {
    const connection = this.getConnection();
    const lamports = await connection.getBalance(publicKey);

    return {
      sol: lamports / LAMPORTS_PER_SOL,
      lamports,
    };
  }

  /**
   * Get SPL token balance for a wallet
   */
  static async getTokenBalance(
    walletPublicKey: PublicKey,
    tokenMintAddress: PublicKey
  ): Promise<{
    balance: number;
    decimals: number;
    uiAmount: number;
  }> {
    const connection = this.getConnection();

    try {
      // Get associated token account
      const tokenAccount = await getAssociatedTokenAddress(
        tokenMintAddress,
        walletPublicKey
      );

      // Get account info
      const accountInfo = await getAccount(connection, tokenAccount);

      return {
        balance: Number(accountInfo.amount),
        decimals: accountInfo.mint ? 0 : 9, // Will be updated with actual mint info
        uiAmount: Number(accountInfo.amount) / Math.pow(10, 9), // Placeholder decimals
      };
    } catch (error) {
      if (
        error instanceof TokenAccountNotFoundError ||
        error instanceof TokenInvalidAccountOwnerError
      ) {
        // Token account doesn't exist - balance is 0
        return {
          balance: 0,
          decimals: 0,
          uiAmount: 0,
        };
      }
      throw error;
    }
  }

  /**
   * Get all token accounts for a wallet
   */
  static async getTokenAccounts(
    walletPublicKey: PublicKey
  ): Promise<
    Array<{
      mint: string;
      balance: number;
      decimals: number;
      uiAmount: number;
    }>
  > {
    const connection = this.getConnection();

    // Fetch from both Token Program and Token-2022 Program
    const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

    const [standardTokens, token2022Accounts] = await Promise.all([
      connection.getParsedTokenAccountsByOwner(walletPublicKey, { programId: TOKEN_PROGRAM_ID }),
      connection.getParsedTokenAccountsByOwner(walletPublicKey, { programId: TOKEN_2022_PROGRAM_ID })
    ]);

    // Combine both results
    const allAccounts = [...standardTokens.value, ...token2022Accounts.value];

    return allAccounts.map((account) => {
      const parsedInfo = account.account.data.parsed.info;
      return {
        mint: parsedInfo.mint,
        balance: parsedInfo.tokenAmount.amount,
        decimals: parsedInfo.tokenAmount.decimals,
        uiAmount: parsedInfo.tokenAmount.uiAmount,
      };
    });
  }

  // ============================================================
  // TRANSACTION BUILDING & SIGNING
  // ============================================================

  /**
   * Sign a transaction with a keypair
   */
  static signTransaction(
    transaction: Transaction,
    signers: Keypair[]
  ): Transaction {
    transaction.sign(...signers);
    return transaction;
  }

  /**
   * Sign a versioned transaction
   */
  static signVersionedTransaction(
    transaction: VersionedTransaction,
    signers: Keypair[]
  ): VersionedTransaction {
    transaction.sign(signers);
    return transaction;
  }

  // ============================================================
  // TRANSACTION SUBMISSION
  // ============================================================

  /**
   * Send a signed transaction
   */
  static async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    options?: SendOptions
  ): Promise<TransactionSignature> {
    const connection = this.getConnection();

    const defaultOptions: SendOptions = {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 3,
      ...options,
    };

    let signature: TransactionSignature;

    if (transaction instanceof VersionedTransaction) {
      signature = await connection.sendTransaction(transaction, defaultOptions);
    } else {
      signature = await connection.sendRawTransaction(
        transaction.serialize(),
        defaultOptions
      );
    }

    return signature;
  }

  /**
   * Send and confirm transaction with retry logic
   */
  static async sendAndConfirmTransaction(
    transaction: Transaction | VersionedTransaction,
    options?: {
      commitment?: Commitment;
      maxRetries?: number;
      skipPreflight?: boolean;
    }
  ): Promise<{
    signature: TransactionSignature;
    slot: number;
  }> {
    const connection = this.getConnection();
    const commitment = options?.commitment || 'confirmed';
    const maxRetries = options?.maxRetries || 3;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Send transaction
        const signature = await this.sendTransaction(transaction, {
          skipPreflight: options?.skipPreflight ?? false,
          preflightCommitment: commitment,
        });

        console.log(`Transaction sent: ${signature} (attempt ${attempt + 1})`);

        // Confirm transaction
        const confirmation = await connection.confirmTransaction(
          signature,
          commitment
        );

        if (confirmation.value.err) {
          throw new Error(
            `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
          );
        }

        console.log(`Transaction confirmed: ${signature}`);

        return {
          signature,
          slot: confirmation.context.slot,
        };
      } catch (error: any) {
        lastError = error;
        console.error(
          `Transaction attempt ${attempt + 1} failed:`,
          error.message
        );

        if (attempt < maxRetries - 1) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw new Error(
      `Transaction failed after ${maxRetries} attempts: ${lastError?.message}`
    );
  }

  // ============================================================
  // TRANSACTION CONFIRMATION
  // ============================================================

  /**
   * Wait for transaction confirmation
   */
  static async confirmTransaction(
    signature: TransactionSignature,
    commitment: Commitment = 'confirmed',
    timeoutMs: number = 60000
  ): Promise<RpcResponseAndContext<SignatureStatus | null>> {
    const connection = this.getConnection();

    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const status = await connection.getSignatureStatus(signature);

      if (status?.value?.confirmationStatus === commitment) {
        return status;
      }

      if (status?.value?.err) {
        throw new Error(
          `Transaction failed: ${JSON.stringify(status.value.err)}`
        );
      }

      // Wait before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error(`Transaction confirmation timeout: ${signature}`);
  }

  /**
   * Get transaction status
   */
  static async getTransactionStatus(
    signature: TransactionSignature
  ): Promise<SignatureStatus | null> {
    const connection = this.getConnection();
    const status = await connection.getSignatureStatus(signature);
    return status.value;
  }

  // ============================================================
  // TRANSACTION HISTORY
  // ============================================================

  /**
   * Get recent transactions for a wallet
   */
  static async getRecentTransactions(
    walletPublicKey: PublicKey,
    limit: number = 10
  ): Promise<
    Array<{
      signature: string;
      slot: number;
      blockTime: number | null;
      err: any;
    }>
  > {
    const connection = this.getConnection();

    const signatures = await connection.getSignaturesForAddress(
      walletPublicKey,
      {
        limit,
      }
    );

    return signatures.map((sig) => ({
      signature: sig.signature,
      slot: sig.slot,
      blockTime: sig.blockTime,
      err: sig.err,
    }));
  }

  /**
   * Get transaction details
   */
  static async getTransaction(signature: TransactionSignature): Promise<any> {
    const connection = this.getConnection();

    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    return transaction;
  }

  // ============================================================
  // UTILITIES
  // ============================================================

  /**
   * Get recent blockhash
   */
  static async getRecentBlockhash(): Promise<{
    blockhash: string;
    lastValidBlockHeight: number;
  }> {
    const connection = this.getConnection();
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    return {
      blockhash,
      lastValidBlockHeight,
    };
  }

  /**
   * Get minimum rent exemption for account
   */
  static async getMinimumBalanceForRentExemption(
    dataLength: number
  ): Promise<number> {
    const connection = this.getConnection();
    return await connection.getMinimumBalanceForRentExemption(dataLength);
  }

  /**
   * Airdrop SOL (devnet/testnet only)
   */
  static async requestAirdrop(
    publicKey: PublicKey,
    lamports: number = LAMPORTS_PER_SOL
  ): Promise<TransactionSignature> {
    const connection = this.getConnection();

    try {
      const signature = await connection.requestAirdrop(publicKey, lamports);
      await connection.confirmTransaction(signature, 'confirmed');
      return signature;
    } catch (error: any) {
      throw new Error(`Airdrop failed: ${error.message}`);
    }
  }

  /**
   * Check if account exists
   */
  static async accountExists(publicKey: PublicKey): Promise<boolean> {
    const connection = this.getConnection();
    const accountInfo = await connection.getAccountInfo(publicKey);
    return accountInfo !== null;
  }

  /**
   * Get current slot
   */
  static async getCurrentSlot(): Promise<number> {
    const connection = this.getConnection();
    return await connection.getSlot();
  }

  /**
   * Get cluster version
   */
  static async getVersion(): Promise<any> {
    const connection = this.getConnection();
    return await connection.getVersion();
  }
}

export default SolanaService;
