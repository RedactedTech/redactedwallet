'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { apiGet } from '../../utils/api';
import { getTokenImageUrl } from '../../utils/pumpfun';

interface TokenHolding {
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
}

interface WalletPortfolio {
  walletId: string;
  walletAddress: string;
  walletIndex: number;
  holdings: TokenHolding[];
  totalValueUsd: number;
  totalPnlUsd: number;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<WalletPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHolding, setSelectedHolding] = useState<{
    holding: TokenHolding;
    walletId: string;
  } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [sellPassword, setSellPassword] = useState('');
  const [sellError, setSellError] = useState('');
  const [isSelling, setIsSelling] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    const checkViewMode = () => {
      setViewMode(window.innerWidth < 768 ? 'cards' : 'table');
    };
    checkViewMode();
    window.addEventListener('resize', checkViewMode);
    return () => window.removeEventListener('resize', checkViewMode);
  }, []);

  const loadPortfolios = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await apiGet('/api/wallets/portfolio/all');
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data.data || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load portfolio');
      }
    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'N/A';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(4)}`;
  };

  const formatValue = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const getTotalPortfolioValue = () => {
    return portfolios.reduce((sum, p) => sum + p.totalValueUsd, 0);
  };

  const getTotalPnL = () => {
    return portfolios.reduce((sum, p) => sum + p.totalPnlUsd, 0);
  };

  const handleSellToken = (holding: TokenHolding, walletId: string) => {
    setSelectedHolding({ holding, walletId });
    setShowPasswordModal(true);
    setSellPassword('');
    setSellError('');
  };

  const handleCancelPasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedHolding(null);
    setSellPassword('');
    setSellError('');
  };

  const handleConfirmSell = async () => {
    if (!sellPassword) {
      setSellError('Password is required');
      return;
    }

    if (!selectedHolding) {
      setSellError('No token selected');
      return;
    }

    setIsSelling(true);
    setSellError('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      const sessionPassword = localStorage.getItem('sessionPassword');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      if (!sessionPassword) {
        throw new Error('Session expired. Please log in again.');
      }

      const response = await fetch(`${apiUrl}/api/trades/close-by-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          ghostWalletId: selectedHolding.walletId,
          tokenAddress: selectedHolding.holding.mint,
          sessionPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sell token');
      }

      // Success! Close modal and refresh portfolio
      setShowPasswordModal(false);
      setSelectedHolding(null);
      setSellPassword('');

      // Show success message briefly
      setError('');
      await loadPortfolios();

    } catch (err) {
      console.error('Error selling token:', err);
      setSellError(err instanceof Error ? err.message : 'Failed to sell token');
    } finally {
      setIsSelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-t-transparent border-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">
            Portfolio
          </h1>
          <p className="text-gray-400">
            View your token holdings across all wallets with real-time PnL
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Portfolio Summary */}
        {portfolios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="group relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'radial-gradient(circle at top right, rgba(255,255,255,0.03) 0%, transparent 70%)'
              }} />
              <div className="relative flex items-start gap-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl" style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                    filter: 'blur(8px)'
                  }} />
                  <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                  }}>
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-400 tracking-wide">Total Value</p>
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {formatValue(getTotalPortfolioValue())}
                  </p>
                  <p className="text-xs text-gray-500">
                    Across {portfolios.length} wallet{portfolios.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="group relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'radial-gradient(circle at top right, rgba(255,255,255,0.03) 0%, transparent 70%)'
              }} />
              <div className="relative flex items-start gap-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl" style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                    filter: 'blur(8px)'
                  }} />
                  <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                  }}>
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-400 tracking-wide">Total P&L</p>
                  <p className={`text-3xl font-bold tracking-tight ${getTotalPnL() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {getTotalPnL() >= 0 ? '+' : ''}{formatValue(getTotalPnL())}
                  </p>
                  <p className="text-xs text-gray-500">
                    Unrealized profit/loss
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Holdings by Wallet */}
      <div className="max-w-7xl mx-auto">
        {portfolios.length === 0 ? (
          <Card className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-white/5">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No holdings yet
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Start trading to build your portfolio. Your token holdings will appear here.
            </p>
            <Link href="/dashboard/trade">
              <Button variant="primary">
                Start Trading
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-8">
            {portfolios.map((portfolio) => (
              <div key={portfolio.walletId}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Wallet #{portfolio.walletIndex}
                      </h2>
                      <p className="text-xs text-gray-500 font-mono">
                        {portfolio.walletAddress.slice(0, 8)}...{portfolio.walletAddress.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Wallet Value</p>
                    <p className="text-lg font-semibold text-white">
                      {formatValue(portfolio.totalValueUsd)}
                    </p>
                  </div>
                </div>

                {viewMode === 'table' ? (
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Token</th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Balance</th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Price</th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Value</th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Avg Entry</th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">P&L</th>
                          <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.holdings.map((holding) => (
                          <tr
                            key={holding.mint}
                            className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getTokenImageUrl(holding.imageUri, holding.symbol || undefined)}
                                  alt={holding.symbol || 'Token'}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.src = getTokenImageUrl(null, holding.symbol || undefined);
                                  }}
                                />
                                <div>
                                  <p className="text-white font-semibold">
                                    {holding.symbol || 'Unknown'}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate max-w-xs">
                                    {holding.name || holding.mint.substring(0, 8) + '...'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-white">
                              {holding.uiAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                            </td>
                            <td className="py-4 px-4 text-white">
                              {formatPrice(holding.currentPrice)}
                            </td>
                            <td className="py-4 px-4 text-white font-semibold">
                              {formatValue(holding.currentValueUsd)}
                            </td>
                            <td className="py-4 px-4 text-gray-400">
                              {formatPrice(holding.averageEntryPrice)}
                            </td>
                            <td className="py-4 px-4">
                              {holding.pnlUsd !== null && holding.pnlPercentage !== null ? (
                                <div>
                                  <p className={`font-semibold ${holding.pnlUsd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {holding.pnlUsd >= 0 ? '+' : ''}{formatValue(holding.pnlUsd)}
                                  </p>
                                  <p className={`text-xs ${holding.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {holding.pnlPercentage >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(2)}%
                                  </p>
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">N/A</p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleSellToken(holding, portfolio.walletId)}
                                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:scale-105"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
                                    border: '1px solid rgba(239, 68, 68, 0.5)',
                                    color: '#ef4444',
                                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)'
                                  }}
                                >
                                  Sell
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {portfolio.holdings.map((holding) => (
                    <Card key={holding.mint} className="p-4 sm:p-6">
                      {/* Token header with image + name + sell button */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getTokenImageUrl(holding.imageUri, holding.symbol || undefined)}
                            alt={holding.symbol || 'Token'}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = getTokenImageUrl(null, holding.symbol || undefined);
                            }}
                          />
                          <div>
                            <p className="text-white font-semibold text-lg">{holding.symbol || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {holding.name || holding.mint.substring(0, 8) + '...'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSellToken(holding, portfolio.walletId)}
                          className="px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            color: '#ef4444',
                          }}
                        >
                          Sell
                        </button>
                      </div>

                      {/* Stats grid - 2 columns */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Balance</p>
                          <p className="text-sm font-semibold text-white">
                            {holding.uiAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Price</p>
                          <p className="text-sm font-semibold text-white">{formatPrice(holding.currentPrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Value</p>
                          <p className="text-sm font-semibold text-white">{formatValue(holding.currentValueUsd)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Avg Entry</p>
                          <p className="text-sm text-gray-400">{formatPrice(holding.averageEntryPrice)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400 mb-1">P&L</p>
                          {holding.pnlUsd !== null && holding.pnlPercentage !== null ? (
                            <div className="flex items-center gap-3">
                              <p className={`text-base font-bold ${holding.pnlUsd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {holding.pnlUsd >= 0 ? '+' : ''}{formatValue(holding.pnlUsd)}
                              </p>
                              <p className={`text-sm ${holding.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ({holding.pnlPercentage >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(2)}%)
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">N/A</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && selectedHolding && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Confirm Sell
                </h3>
                <button
                  onClick={handleCancelPasswordModal}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-400 font-semibold mb-2">Selling Token</p>
                <p className="text-white font-semibold">{selectedHolding.holding.symbol || 'Unknown'}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Balance: {selectedHolding.holding.uiAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </p>
                {selectedHolding.holding.currentValueUsd && (
                  <p className="text-xs text-gray-400">
                    Value: {formatValue(selectedHolding.holding.currentValueUsd)}
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-300">
                This will sell your entire token balance from Wallet #{portfolios.find(p => p.walletId === selectedHolding.walletId)?.walletIndex}.
              </p>

              {sellError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-500 text-sm">{sellError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm with Your Password
                </label>
                <input
                  type="password"
                  value={sellPassword}
                  onChange={(e) => setSellPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-red-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleConfirmSell()}
                  autoFocus
                  disabled={isSelling}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required to execute the sell transaction
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancelPasswordModal}
                  disabled={isSelling}
                  className="flex-1 px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#ffffff'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSell}
                  disabled={!sellPassword || isSelling}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: sellPassword && !isSelling
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: sellPassword && !isSelling
                      ? '1px solid rgba(239, 68, 68, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    color: sellPassword && !isSelling ? '#ef4444' : '#888888',
                    boxShadow: sellPassword && !isSelling ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none'
                  }}
                >
                  {isSelling ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
                      Selling...
                    </span>
                  ) : (
                    'Confirm Sell'
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
