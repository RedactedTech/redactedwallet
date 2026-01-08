'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface User {
  id: string;
  email: string;
  subscription_tier: string;
}

interface WalletStats {
  total: number;
  active: number;
  recycled: number;
  totalVolume: number;
  totalPnL: number;
}

interface TradeStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  totalPnLSol: number;
  winRate: number;
  avgHoldTimeSeconds: number;
}

interface Wallet {
  id: string;
  public_key: string;
  derivation_path: string;
  wallet_index: number;
  status: string;
  created_at: string;
  total_trades: number;
  profit_loss_usd: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [tradeStats, setTradeStats] = useState<TradeStats | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    await loadDashboardData();
    setIsLoading(false);
  };

  const loadDashboardData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      // Fetch wallet stats
      const walletStatsRes = await fetch(`${API_URL}/api/wallets/stats`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (walletStatsRes.ok) {
        const data = await walletStatsRes.json();
        setWalletStats(data.data);
      }

      // Fetch trade stats
      const tradeStatsRes = await fetch(`${API_URL}/api/trades/stats`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (tradeStatsRes.ok) {
        const data = await tradeStatsRes.json();
        setTradeStats(data.data);
      }

      // Fetch wallets
      const walletsRes = await fetch(`${API_URL}/api/wallets?status=active`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (walletsRes.ok) {
        const data = await walletsRes.json();
        setWallets(data.data);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    }
  };

  const handleCreateWallet = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    setIsCreatingWallet(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/wallets/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create wallet');
      }

      // Reload dashboard data
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem('accessToken');

    // Call logout API
    if (accessToken) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
      } catch (err) {
        console.error('Logout API error:', err);
      }
    }

    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-t-transparent border-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Image
                src="/transparentlogo.png"
                alt="redacted logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <h1 className="text-3xl font-semibold text-white">
                Dashboard
              </h1>
            </div>
            <p className="text-gray-400 text-sm">
              Welcome back, {user?.email}
            </p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Ghost Wallets</p>
              <p className="text-2xl font-semibold text-white">
                {walletStats?.active || 0}
              </p>
              <p className="text-xs text-gray-500">
                {walletStats?.total || 0} total
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Trades</p>
              <p className="text-2xl font-semibold text-white">
                {tradeStats?.totalTrades || 0}
              </p>
              <p className="text-xs text-gray-500">
                {tradeStats?.openTrades || 0} open
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total P&L</p>
              <p className={`text-2xl font-semibold ${(tradeStats?.totalPnLSol || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(tradeStats?.totalPnLSol || 0) >= 0 ? '+' : ''}{(tradeStats?.totalPnLSol || 0).toFixed(4)} SOL
              </p>
              <p className="text-xs text-gray-500">
                {tradeStats?.winRate?.toFixed(1) || 0}% win rate
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Volume</p>
              <p className="text-2xl font-semibold text-white">
                ${(walletStats?.totalVolume || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                Total traded
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Wallets Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Your Ghost Wallets
          </h2>
          <Button
            variant="primary"
            onClick={handleCreateWallet}
            isLoading={isCreatingWallet}
          >
            + Create Wallet
          </Button>
        </div>

        {wallets.length === 0 ? (
          <Card className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-white/5">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No wallets yet
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create your first ghost wallet to start trading anonymously on Solana.
            </p>
            <Button
              variant="primary"
              onClick={handleCreateWallet}
              isLoading={isCreatingWallet}
            >
              Create Your First Wallet
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <Card key={wallet.id}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        Wallet #{wallet.wallet_index}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      wallet.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {wallet.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Public Key</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-white font-mono truncate">
                        {wallet.public_key.slice(0, 8)}...{wallet.public_key.slice(-8)}
                      </p>
                      <button
                        onClick={() => copyToClipboard(wallet.public_key)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Trades</p>
                      <p className="text-sm font-semibold text-white">
                        {wallet.total_trades}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">P&L</p>
                      <p className={`text-sm font-semibold ${
                        parseFloat(wallet.profit_loss_usd) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${parseFloat(wallet.profit_loss_usd).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500">
                      Created {new Date(wallet.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto mt-12">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:border-white/20 transition-colors">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Execute Trade
              </h3>
              <p className="text-sm text-gray-400">
                Coming soon - Trade tokens with your ghost wallets
              </p>
            </div>
          </Card>

          <Card className="cursor-pointer hover:border-white/20 transition-colors">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Monitor Tokens
              </h3>
              <p className="text-sm text-gray-400">
                Coming soon - Track trending tokens and opportunities
              </p>
            </div>
          </Card>

          <Card className="cursor-pointer hover:border-white/20 transition-colors">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Create Strategy
              </h3>
              <p className="text-sm text-gray-400">
                Coming soon - Automate your trading with custom strategies
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
