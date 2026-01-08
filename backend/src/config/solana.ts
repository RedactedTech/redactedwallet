import { Connection, ConnectionConfig, Commitment } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================
// SOLANA RPC CONFIGURATION
// ============================================================

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const SOLANA_COMMITMENT: Commitment = (process.env.SOLANA_COMMITMENT as Commitment) || 'confirmed';

const connectionConfig: ConnectionConfig = {
  commitment: SOLANA_COMMITMENT,
  confirmTransactionInitialTimeout: 60000, // 60 seconds
};

// ============================================================
// SOLANA CONNECTION INSTANCE
// ============================================================

let connection: Connection | null = null;

export const getSolanaConnection = (): Connection => {
  if (!connection) {
    connection = new Connection(SOLANA_RPC_URL, connectionConfig);
    console.log(`✅ Solana RPC connected: ${SOLANA_RPC_URL} (${SOLANA_COMMITMENT})`);
  }
  return connection;
};

// ============================================================
// CONNECTION HEALTH CHECK
// ============================================================

export const testSolanaConnection = async (): Promise<boolean> => {
  try {
    const conn = getSolanaConnection();
    const version = await conn.getVersion();
    console.log(`✅ Solana cluster version: ${version['solana-core']}`);

    const slot = await conn.getSlot();
    console.log(`✅ Current slot: ${slot}`);

    return true;
  } catch (error) {
    console.error('❌ Solana connection failed:', error);
    return false;
  }
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export const getSolanaRpcUrl = (): string => SOLANA_RPC_URL;
export const getSolanaCommitment = (): Commitment => SOLANA_COMMITMENT;

export default {
  getSolanaConnection,
  testSolanaConnection,
  getSolanaRpcUrl,
  getSolanaCommitment
};
