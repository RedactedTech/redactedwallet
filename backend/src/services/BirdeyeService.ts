import axios from 'axios';

/**
 * Birdeye API Service
 * Handles fetching token data from Birdeye API
 */

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || '';
const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';

export interface BirdeyeToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  liquidity: number;
  price: number;
  priceChange24h: number;
  volume24h: number;
  volume24hChangePercent: number;
  marketCap: number;
  holders?: number;
  fdv?: number;
}

export interface BirdeyeTopToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  icon?: string;
  liquidity: number;
  price: number;
  v24hChangePercent: number;
  v24hUSD: number;
  mc: number;
  holder?: number;
}

export class BirdeyeService {
  /**
   * Get top tokens on Solana by volume
   */
  static async getTopTokens(limit: number = 10): Promise<BirdeyeToken[]> {
    try {
      if (!BIRDEYE_API_KEY) {
        throw new Error('Birdeye API key not configured');
      }

      const response = await axios.get(`${BIRDEYE_BASE_URL}/defi/v3/token/trending`, {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY,
        },
        params: {
          sort_by: 'v24hUSD',
          sort_type: 'desc',
          offset: 0,
          limit: limit,
        },
      });

      if (!response.data || !response.data.data) {
        console.error('Birdeye API returned unexpected format:', response.data);
        return [];
      }

      const tokens: BirdeyeToken[] = response.data.data.tokens.map((token: BirdeyeTopToken) => ({
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.icon,
        liquidity: token.liquidity || 0,
        price: token.price || 0,
        priceChange24h: token.v24hChangePercent || 0,
        volume24h: token.v24hUSD || 0,
        volume24hChangePercent: token.v24hChangePercent || 0,
        marketCap: token.mc || 0,
        holders: token.holder,
      }));

      return tokens;
    } catch (error: any) {
      console.error('Error fetching top tokens from Birdeye:', error.message);
      if (error.response) {
        console.error('Birdeye API response:', error.response.data);
      }
      throw new Error('Failed to fetch top tokens from Birdeye');
    }
  }

  /**
   * Get token price from Birdeye
   */
  static async getTokenPrice(tokenAddress: string): Promise<number | null> {
    try {
      if (!BIRDEYE_API_KEY) {
        throw new Error('Birdeye API key not configured');
      }

      const response = await axios.get(`${BIRDEYE_BASE_URL}/defi/price`, {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY,
        },
        params: {
          address: tokenAddress,
        },
      });

      return response.data?.data?.value || null;
    } catch (error: any) {
      console.error(`Error fetching price for ${tokenAddress}:`, error.message);
      return null;
    }
  }

  /**
   * Get token metadata from Birdeye
   */
  static async getTokenMetadata(tokenAddress: string): Promise<any> {
    try {
      if (!BIRDEYE_API_KEY) {
        throw new Error('Birdeye API key not configured');
      }

      const response = await axios.get(`${BIRDEYE_BASE_URL}/defi/v3/token/meta-data/single`, {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY,
        },
        params: {
          address: tokenAddress,
        },
      });

      return response.data?.data || null;
    } catch (error: any) {
      console.error(`Error fetching metadata for ${tokenAddress}:`, error.message);
      return null;
    }
  }
}
