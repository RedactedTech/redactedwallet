'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '../../../components/Input';
import { getPumpFunMetadata, getTokenImageUrl } from '../../../utils/pumpfun';

interface SelectedToken {
  mint: string;
  name: string;
  symbol: string;
  image_uri?: string;
}

interface TokenSearchProps {
  selectedToken: SelectedToken | null;
  onTokenSelect: (token: SelectedToken) => void;
}

interface SearchResult {
  mint: string;
  name: string;
  symbol: string;
  image_uri?: string;
}

export default function TokenSearch({ selectedToken, onTokenSelect }: TokenSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchTokens = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);

      try {
        // Check if input is a token address (base58 format, ~44 chars)
        if (searchQuery.length >= 32 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(searchQuery)) {
          // Search by address
          const metadata = await getPumpFunMetadata(searchQuery);
          if (metadata) {
            setSearchResults([{
              mint: metadata.mint,
              name: metadata.name,
              symbol: metadata.symbol,
              image_uri: metadata.image_uri
            }]);
          } else {
            setSearchResults([]);
          }
        } else {
          // For now, search is not implemented in pumpfun.ts
          // We'll show a placeholder message
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchTokens, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectToken = (token: SearchResult) => {
    onTokenSelect(token);
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
  };

  return (
    <div className="relative">
      {/* Selected Token Display */}
      {selectedToken && (
        <div className="mb-4 p-4 rounded-lg" style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={getTokenImageUrl(selectedToken.image_uri, selectedToken.symbol)}
                alt={selectedToken.symbol}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="text-white font-semibold text-lg">{selectedToken.symbol}</p>
                <p className="text-gray-400 text-sm">{selectedToken.name}</p>
              </div>
            </div>
            <button
              onClick={() => onTokenSelect(null as any)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      {!selectedToken && (
        <>
          <Input
            type="text"
            placeholder="Search by token symbol or paste token address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
          />

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute z-10 w-full mt-2 rounded-lg overflow-hidden" style={{
              background: 'rgba(15, 15, 15, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {isSearching ? (
                <div className="p-4 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((token) => (
                  <button
                    key={token.mint}
                    onClick={() => handleSelectToken(token)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <img
                      src={getTokenImageUrl(token.image_uri, token.symbol)}
                      alt={token.symbol}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-white font-semibold">{token.symbol}</p>
                      <p className="text-gray-400 text-sm">{token.name}</p>
                    </div>
                  </button>
                ))
              ) : searchQuery.trim() ? (
                <div className="p-4 text-center text-gray-400">
                  {searchQuery.length >= 32 ? (
                    'Token not found or not a Pump.fun token'
                  ) : (
                    'Enter a token address to search (32+ characters)'
                  )}
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
