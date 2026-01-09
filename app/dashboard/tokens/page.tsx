'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Input } from '../../components/Input';
import { getPumpFunMetadata, getTokenImageUrl } from '../../utils/pumpfun';

interface MonitoredToken {
  id: string;
  token_address: string;
  token_symbol: string | null;
  token_name: string | null;
  discovered_at: string;
  source: 'pump_fun' | 'raydium' | 'jupiter' | 'manual';
  current_price_usd: number | null;
  market_cap_usd: number | null;
  liquidity_usd: number | null;
  volume_24h_usd: number | null;
  holder_count: number | null;
  is_trending: boolean;
  momentum_score: number | null;
  risk_score: number | null;
  metadata: any;
  last_updated: string;
}

interface BirdeyeToken {
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
}

interface TokenMetadataCache {
  [tokenAddress: string]: {
    imageUrl: string;
    name: string | null;
  };
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<MonitoredToken[]>([]);
  const [trendingTokens, setTrendingTokens] = useState<BirdeyeToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<MonitoredToken[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [addingTokens, setAddingTokens] = useState<Set<string>>(new Set());
  const [metadataCache, setMetadataCache] = useState<TokenMetadataCache>({});

  useEffect(() => {
    fetchTrendingTokens();
    fetchBirdeyeTrendingTokens();
  }, []);

  // Fetch metadata for tokens
  useEffect(() => {
    const fetchMetadata = async () => {
      for (const token of tokens) {
        // Skip if already cached
        if (metadataCache[token.token_address]) continue;

        // First, check if token has metadata in database
        const dbImageUri = token.metadata?.image_uri;
        if (dbImageUri) {
          setMetadataCache(prev => ({
            ...prev,
            [token.token_address]: {
              imageUrl: getTokenImageUrl(dbImageUri, token.token_symbol || undefined),
              name: token.token_name
            }
          }));
          continue;
        }

        // For pump_fun tokens without DB metadata, try fetching from API
        if (token.source === 'pump_fun') {
          const metadata = await getPumpFunMetadata(token.token_address);
          if (metadata) {
            setMetadataCache(prev => ({
              ...prev,
              [token.token_address]: {
                imageUrl: getTokenImageUrl(metadata.image_uri, token.token_symbol || undefined),
                name: metadata.name || token.token_name
              }
            }));
          } else {
            // Use fallback
            setMetadataCache(prev => ({
              ...prev,
              [token.token_address]: {
                imageUrl: getTokenImageUrl(null, token.token_symbol || undefined),
                name: token.token_name
              }
            }));
          }
        } else {
          // For other tokens, use fallback
          setMetadataCache(prev => ({
            ...prev,
            [token.token_address]: {
              imageUrl: getTokenImageUrl(null, token.token_symbol || undefined),
              name: token.token_name
            }
          }));
        }
      }
    };

    if (tokens.length > 0) {
      fetchMetadata();
    }
  }, [tokens]);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchTokens(searchQuery);
      } else {
        setFilteredTokens(tokens);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, tokens]);

  const fetchBirdeyeTrendingTokens = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/api/tokens/trending?limit=10`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setTrendingTokens(data.data);
        console.log('Fetched Birdeye trending tokens:', data.data);
      }
    } catch (err) {
      console.error('Error fetching Birdeye trending tokens:', err);
    }
  };

  const fetchTrendingTokens = async () => {
    try {
      setIsLoading(true);
      setError('');

      const accessToken = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Fetch ALL monitored tokens, not just trending ones
      const response = await fetch(`${apiUrl}/api/tokens?limit=50`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tokens');
      }

      console.log('Fetched tokens:', data.data); // Debug log

      setTokens(data.data || []);
      setFilteredTokens(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const searchTokens = async (query: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // First, try searching in monitored tokens
      const monitoredResponse = await fetch(`${apiUrl}/api/tokens/search?q=${encodeURIComponent(query)}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const monitoredData = await monitoredResponse.json();

      if (monitoredResponse.ok && monitoredData.data && monitoredData.data.length > 0) {
        setFilteredTokens(monitoredData.data);
        return;
      }

      // If no monitored tokens found, search all tokens via pump.fun API
      const pumpfunResponse = await fetch(`${apiUrl}/api/pumpfun/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const pumpfunData = await pumpfunResponse.json();

      if (pumpfunResponse.ok && pumpfunData.data && pumpfunData.data.length > 0) {
        // Convert pump.fun results to monitored token format
        const convertedTokens = pumpfunData.data.map((token: any) => ({
          id: token.mint,
          token_address: token.mint,
          token_symbol: token.symbol,
          token_name: token.name,
          discovered_at: new Date().toISOString(),
          source: 'manual',
          current_price_usd: null,
          market_cap_usd: token.market_cap || null,
          liquidity_usd: null,
          volume_24h_usd: null,
          holder_count: null,
          is_trending: false,
          momentum_score: null,
          risk_score: null,
          metadata: { image_uri: token.image_uri },
          last_updated: new Date().toISOString(),
          _isSearchResult: true // Flag to indicate this is a search result, not monitored
        }));
        setFilteredTokens(convertedTokens);
        return;
      }

      // If both searches fail, fall back to client-side filtering
      const filtered = tokens.filter(token =>
        token.token_symbol?.toLowerCase().includes(query.toLowerCase()) ||
        token.token_name?.toLowerCase().includes(query.toLowerCase()) ||
        token.token_address.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTokens(filtered);
    } catch (err) {
      console.error('Search error:', err);
      // If search fails, fall back to client-side filtering
      const filtered = tokens.filter(token =>
        token.token_symbol?.toLowerCase().includes(query.toLowerCase()) ||
        token.token_name?.toLowerCase().includes(query.toLowerCase()) ||
        token.token_address.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTokens(filtered);
    }
  };

  const getRiskBadge = (riskScore: number | null) => {
    if (riskScore === null) return <Badge variant="gray">Unknown</Badge>;
    if (riskScore <= 30) return <Badge variant="success">Low Risk</Badge>;
    if (riskScore <= 60) return <Badge variant="warning">Medium Risk</Badge>;
    return <Badge variant="danger">High Risk</Badge>;
  };

  const getSourceBadge = (source: string) => {
    const sourceLabels: Record<string, string> = {
      'pump_fun': 'Pump.fun',
      'raydium': 'Raydium',
      'jupiter': 'Jupiter',
      'manual': 'Manual'
    };
    return <Badge variant="info">{sourceLabels[source] || source}</Badge>;
  };

  const formatPrice = (price: number | string | null) => {
    if (price === null || price === undefined) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'N/A';
    if (numPrice < 0.01) return `$${numPrice.toFixed(6)}`;
    return `$${numPrice.toFixed(4)}`;
  };

  const formatVolume = (volume: number | string | null) => {
    if (volume === null || volume === undefined) return 'N/A';
    const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
    if (isNaN(numVolume)) return 'N/A';
    if (numVolume >= 1000000) return `$${(numVolume / 1000000).toFixed(2)}M`;
    if (numVolume >= 1000) return `$${(numVolume / 1000).toFixed(2)}K`;
    return `$${numVolume.toFixed(2)}`;
  };

  const addTokenToMonitor = async (tokenAddress: string) => {
    // Mark this token as being added
    setAddingTokens(prev => new Set(prev).add(tokenAddress));
    setError('');
    setSuccessMessage('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/api/tokens/watch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          tokenAddress,
          source: 'manual'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add token');
      }

      // Show success message
      setSuccessMessage(`Token added to monitoring successfully!`);

      // Refresh tokens list
      await fetchTrendingTokens();

      // Clear search to show all monitored tokens
      setSearchQuery('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add token to monitoring');
    } finally {
      // Remove from adding set
      setAddingTokens(prev => {
        const next = new Set(prev);
        next.delete(tokenAddress);
        return next;
      });
    }
  };

  return (
    <>
      <div className="p-8">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-semibold text-white mb-2">
            Monitor Tokens
          </h1>
          <p className="text-gray-400">
            Search and add tokens to your watchlist. Click "Trade" to execute trades.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-lg mx-auto">
          <Input
            type="text"
            placeholder="Search by symbol, name, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {successMessage && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 mb-6">
            <p className="text-green-500 text-sm">{successMessage}</p>
          </div>
        )}
      </div>

      {/* Top Trending Tokens from Birdeye */}
      {trendingTokens.length > 0 && (
        <div className="max-w-7xl mx-auto mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">
            🔥 Top Trending Tokens (Birdeye)
          </h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Rank</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Token</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Price</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">24h Change</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">24h Volume</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Market Cap</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Liquidity</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trendingTokens.map((token, index) => (
                    <tr
                      key={token.address}
                      className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4 text-white font-semibold">
                        #{index + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={token.logoURI || `https://ui-avatars.com/api/?name=${token.symbol}&background=random`}
                            alt={token.symbol}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = `https://ui-avatars.com/api/?name=${token.symbol}&background=random`;
                            }}
                          />
                          <div>
                            <p className="text-white font-semibold">
                              {token.symbol}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {token.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white">
                        {formatPrice(token.price)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-semibold ${
                          token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white">
                        {formatVolume(token.volume24h)}
                      </td>
                      <td className="py-4 px-4 text-white">
                        {formatVolume(token.marketCap)}
                      </td>
                      <td className="py-4 px-4 text-white">
                        {formatVolume(token.liquidity)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/trade?token=${token.address}`}>
                            <button
                              className="px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:scale-105"
                              style={{
                                background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(34, 211, 238, 0.1))',
                                border: '1px solid rgba(34, 211, 238, 0.5)',
                                color: '#22d3ee',
                                boxShadow: '0 0 10px rgba(34, 211, 238, 0.2)'
                              }}
                            >
                              🚀 Trade
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Monitored Tokens Table */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold text-white mb-4 text-center">
          Your Monitored Tokens
        </h2>
        <Card>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">
                {searchQuery ? 'No tokens found matching your search' : 'No monitored tokens yet'}
              </p>
              {!searchQuery && (
                <div className="text-gray-500 text-sm">
                  <p className="mb-2">Search for a token by:</p>
                  <ul className="list-disc list-inside">
                    <li>Pasting a Solana token contract address</li>
                    <li>Entering a token symbol (e.g., BONK, WIF)</li>
                  </ul>
                  <p className="mt-4">Then click "+ Add to Monitor" to add it to your watchlist</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Token</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Price</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">24h Volume</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Risk</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Source</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTokens.map((token) => {
                    const metadata = metadataCache[token.token_address];
                    // For search results, use the image_uri from metadata, otherwise use cached or fallback
                    const searchResultImage = (token as any).metadata?.image_uri;
                    const imageUrl = searchResultImage || metadata?.imageUrl || getTokenImageUrl(null, token.token_symbol || undefined);
                    const displayName = metadata?.name || token.token_name;

                    return (
                      <tr
                        key={token.id}
                        className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={imageUrl}
                              alt={token.token_symbol || 'Token'}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                // Fallback if image fails to load
                                const img = e.target as HTMLImageElement;
                                img.src = getTokenImageUrl(null, token.token_symbol || undefined);
                              }}
                            />
                            <div>
                              <p className="text-white font-semibold">
                                {token.token_symbol || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-xs">
                                {displayName || token.token_address.substring(0, 8) + '...'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white">
                          {formatPrice(token.current_price_usd)}
                        </td>
                        <td className="py-4 px-4 text-white">
                          {formatVolume(token.volume_24h_usd)}
                        </td>
                        <td className="py-4 px-4">
                          {getRiskBadge(token.risk_score)}
                        </td>
                        <td className="py-4 px-4">
                          {getSourceBadge(token.source)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {(token as any)._isSearchResult ? (
                              <button
                                onClick={() => addTokenToMonitor(token.token_address)}
                                disabled={addingTokens.has(token.token_address)}
                                className="px-3 py-1 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: 'rgba(34, 211, 238, 0.1)',
                                  border: '1px solid rgba(34, 211, 238, 0.3)',
                                  color: '#22d3ee'
                                }}
                              >
                                {addingTokens.has(token.token_address) ? (
                                  <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-cyan-400"></div>
                                    Adding...
                                  </span>
                                ) : (
                                  '+ Add to Monitor'
                                )}
                              </button>
                            ) : (
                              <>
                                <Link href={`/dashboard/trade?token=${token.token_address}`}>
                                  <button
                                    className="px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:scale-105"
                                    style={{
                                      background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(34, 211, 238, 0.1))',
                                      border: '1px solid rgba(34, 211, 238, 0.5)',
                                      color: '#22d3ee',
                                      boxShadow: '0 0 10px rgba(34, 211, 238, 0.2)'
                                    }}
                                  >
                                    🚀 Trade
                                  </button>
                                </Link>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
