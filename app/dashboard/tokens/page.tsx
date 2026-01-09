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

interface TokenMetadataCache {
  [tokenAddress: string]: {
    imageUrl: string;
    name: string | null;
  };
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<MonitoredToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<MonitoredToken[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [metadataCache, setMetadataCache] = useState<TokenMetadataCache>({});

  useEffect(() => {
    fetchTrendingTokens();
  }, []);

  // Fetch metadata for tokens
  useEffect(() => {
    const fetchMetadata = async () => {
      for (const token of tokens) {
        // Skip if already cached
        if (metadataCache[token.token_address]) continue;

        // Only fetch metadata for pump_fun tokens
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
          // For non-pump.fun tokens, use fallback
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

  const fetchTrendingTokens = async () => {
    try {
      setIsLoading(true);
      setError('');

      const accessToken = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/api/tokens/trending?limit=20`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tokens');
      }

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

      const response = await fetch(`${apiUrl}/api/tokens/search?q=${encodeURIComponent(query)}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search tokens');
      }

      setFilteredTokens(data.data || []);
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

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(4)}`;
  };

  const formatVolume = (volume: number | null) => {
    if (volume === null) return 'N/A';
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen p-6 bg-black">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2">
              Monitor Tokens
            </h1>
            <p className="text-gray-400">
              Track trending tokens and trading opportunities
            </p>
          </div>
          <Link href="/dashboard">
            <button className="px-4 py-2 rounded-lg transition-colors" style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff'
            }}>
              ← Back to Dashboard
            </button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
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
      </div>

      {/* Tokens Table */}
      <div className="max-w-7xl mx-auto">
        <Card>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {searchQuery ? 'No tokens found matching your search' : 'No trending tokens available'}
              </p>
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
                  </tr>
                </thead>
                <tbody>
                  {filteredTokens.map((token) => {
                    const metadata = metadataCache[token.token_address];
                    const imageUrl = metadata?.imageUrl || getTokenImageUrl(null, token.token_symbol || undefined);
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
