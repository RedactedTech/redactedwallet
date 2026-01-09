/**
 * Pump.fun API utilities
 * Uses PumpAPI.fun for token metadata and search
 */

export interface PumpFunTokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  image_uri?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  mint: string;
}

export interface PumpFunSearchResult {
  mint: string;
  name: string;
  symbol: string;
  image_uri?: string;
  market_cap?: number;
  created_timestamp?: number;
}

/**
 * Get token metadata from Pump.fun API via backend proxy
 */
export async function getPumpFunMetadata(
  tokenAddress: string
): Promise<PumpFunTokenMetadata | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      console.warn('No access token available for metadata fetch');
      return null;
    }

    const response = await fetch(
      `${apiUrl}/api/pumpfun/metadata/${tokenAddress}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch metadata for ${tokenAddress}`);
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error(`Error fetching Pump.fun metadata:`, error);
    return null;
  }
}

/**
 * Search tokens on Pump.fun via backend proxy
 */
export async function searchPumpFunTokens(
  query: string
): Promise<PumpFunSearchResult[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      console.warn('No access token available for search');
      return [];
    }

    const response = await fetch(
      `${apiUrl}/api/pumpfun/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      console.warn(`Failed to search tokens for query: ${query}`);
      return [];
    }

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error(`Error searching Pump.fun tokens:`, error);
    return [];
  }
}

/**
 * Get token image URL with fallback
 */
export function getTokenImageUrl(
  imageUri: string | null | undefined,
  tokenSymbol?: string
): string {
  if (imageUri) {
    // Handle IPFS URLs
    if (imageUri.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${imageUri.substring(7)}`;
    }
    return imageUri;
  }

  // Fallback to placeholder with first letter of symbol
  const letter = tokenSymbol?.charAt(0).toUpperCase() || '?';
  return `https://ui-avatars.com/api/?name=${letter}&background=random&size=128`;
}
