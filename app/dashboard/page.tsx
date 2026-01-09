'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

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
  const [showDrainModal, setShowDrainModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [drainDestination, setDrainDestination] = useState('');
  const [drainPassword, setDrainPassword] = useState('');
  const [isDraining, setIsDraining] = useState(false);
  const [drainSuccess, setDrainSuccess] = useState('');
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryWallet, setRecoveryWallet] = useState<Wallet | null>(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [isLoadingBackup, setIsLoadingBackup] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');

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

  const handleOpenDrainModal = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setShowDrainModal(true);
    setDrainDestination('');
    setDrainPassword('');
    setError('');
    setDrainSuccess('');
  };

  const handleCloseDrainModal = () => {
    setShowDrainModal(false);
    setSelectedWallet(null);
    setDrainDestination('');
    setDrainPassword('');
    setError('');
    setDrainSuccess('');
  };

  const handleDrainWallet = async () => {
    if (!selectedWallet) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    setIsDraining(true);
    setError('');
    setDrainSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/wallets/${selectedWallet.id}/drain`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          destinationAddress: drainDestination,
          password: drainPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to drain wallet');
      }

      setDrainSuccess(data.message || 'Wallet drained successfully!');

      // Reload dashboard data after a short delay
      setTimeout(async () => {
        await loadDashboardData();
        handleCloseDrainModal();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to drain wallet');
    } finally {
      setIsDraining(false);
    }
  };

  const handleOpenBackupModal = () => {
    setShowBackupModal(true);
    setBackupPassword('');
    setSeedPhrase('');
    setError('');
  };

  const handleBackupSeed = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    setIsLoadingBackup(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/backup-seed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: backupPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retrieve seed phrase');
      }

      setSeedPhrase(data.data.seedPhrase);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve seed phrase');
    } finally {
      setIsLoadingBackup(false);
    }
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
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap gap-4 justify-center items-center mt-6">
          <a
            href="https://x.com/RedactedWallet"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff'
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-xs font-medium">Follow us</span>
          </a>

          <Link
            href="/whitepaper"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff'
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium">White Paper</span>
          </Link>

          <Link
            href="/roadmap"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff'
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
            <span className="text-xs font-medium">Roadmap</span>
          </Link>

          <button
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
              color: '#000000',
              boxShadow: '0 3px 0 #888888, 0 4px 8px rgba(0, 0, 0, 0.3)',
              transform: 'translateY(0)',
              fontWeight: '600'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(1.5px)';
              e.currentTarget.style.boxShadow = '0 1.5px 0 #888888, 0 3px 6px rgba(0, 0, 0, 0.25)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 3px 0 #888888, 0 4px 8px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 3px 0 #888888, 0 4px 8px rgba(0, 0, 0, 0.3)';
            }}
          >
            <span className="relative z-10 text-xs font-bold">$Redacted</span>
            <svg className="w-3 h-3 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.1) 100%)'
              }}
            />
          </button>
        </div>
      </div>

      {/* Security Info Banner */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                Your Funds Are Safe
                <button
                  onClick={() => setShowSecurityInfo(!showSecurityInfo)}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  {showSecurityInfo ? 'Hide Details' : 'Learn More'}
                </button>
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                All ghost wallets are derived from your encrypted master seed using BIP39/44 standard.
                You can always recover your funds with your password.
              </p>

              {showSecurityInfo && (
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-white">Deterministic Derivation</p>
                        <p className="text-xs text-gray-400">Each wallet uses path m/44'/501'/0'/0'/N</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-white">AES-256 Encryption</p>
                        <p className="text-xs text-gray-400">Master seed encrypted with your password</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-white">No Private Keys Stored</p>
                        <p className="text-xs text-gray-400">Keys derived on-demand from master seed</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-white">Full Recovery Available</p>
                        <p className="text-xs text-gray-400">Drain funds anytime with your password</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3">
                    <Button
                      variant="secondary"
                      onClick={handleOpenBackupModal}
                      className="w-full sm:w-auto"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Backup Seed Phrase
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
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

                  <div className="pt-4 border-t border-gray-800 space-y-2">
                    <p className="text-xs text-gray-500">
                      Created {new Date(wallet.created_at).toLocaleDateString()}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setRecoveryWallet(wallet);
                          setShowRecoveryModal(true);
                        }}
                        className="px-3 py-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white border border-gray-700 hover:border-gray-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Recovery
                      </button>
                      <Button
                        variant="secondary"
                        onClick={() => handleOpenDrainModal(wallet)}
                        className="text-xs py-2"
                      >
                        Drain
                      </Button>
                    </div>
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
          {/* Execute Trade - Active */}
          <Link href="/dashboard/trade">
            <Card className="cursor-pointer hover:border-white/20 transition-all hover:scale-105">
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
                  Trade tokens with your ghost wallets
                </p>
              </div>
            </Card>
          </Link>

          {/* Monitor Tokens - Active */}
          <Link href="/dashboard/tokens">
            <Card className="cursor-pointer hover:border-white/20 transition-all hover:scale-105">
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
                  Track trending tokens and opportunities
                </p>
              </div>
            </Card>
          </Link>

          {/* Create Strategy - Coming Soon */}
          <Card className="cursor-not-allowed opacity-60">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white">
                  Create Strategy
                </h3>
                <Badge variant="warning">Coming Soon</Badge>
              </div>
              <p className="text-sm text-gray-400">
                Automate your trading with custom strategies
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Backup Seed Phrase Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="max-w-xl w-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Backup Master Seed Phrase
                </h3>
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-400 mb-2">Critical Security Warning</p>
                    <ul className="space-y-1 text-xs text-gray-300">
                      <li>• This seed phrase controls ALL your ghost wallets</li>
                      <li>• Anyone with this phrase can steal ALL your funds</li>
                      <li>• Never share it with anyone, including Redacted support</li>
                      <li>• Store it offline in a secure location</li>
                    </ul>
                  </div>
                </div>
              </div>

              {!seedPhrase ? (
                <>
                  <p className="text-sm text-gray-300">
                    Your master seed phrase is a 24-word mnemonic that can be used to recover all your ghost wallets.
                    Write it down and store it in a safe place.
                  </p>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-red-500 text-sm">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Enter Your Password
                    </label>
                    <input
                      type="password"
                      value={backupPassword}
                      onChange={(e) => setBackupPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                      disabled={isLoadingBackup}
                      onKeyPress={(e) => e.key === 'Enter' && handleBackupSeed()}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => setShowBackupModal(false)}
                      className="flex-1"
                      disabled={isLoadingBackup}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleBackupSeed}
                      className="flex-1"
                      isLoading={isLoadingBackup}
                      disabled={!backupPassword}
                    >
                      Reveal Seed Phrase
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-lg bg-white/5 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-3 font-semibold">
                      24-Word Seed Phrase (BIP39)
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {seedPhrase.split(' ').map((word, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded bg-black/30">
                          <span className="text-xs text-gray-500 font-mono w-6">{index + 1}.</span>
                          <span className="text-sm text-white font-mono">{word}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => copyToClipboard(seedPhrase)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white border border-gray-700 hover:border-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy to Clipboard
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-xs text-yellow-200">
                      <strong>Action Required:</strong> Write down these words in order and store them securely offline.
                      This is the ONLY way to recover your wallets if you lose access.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => setShowBackupModal(false)}
                    className="w-full"
                  >
                    I&apos;ve Saved My Seed Phrase
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Recovery Info Modal */}
      {showRecoveryModal && recoveryWallet && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Wallet Recovery Info
                </h3>
                <button
                  onClick={() => setShowRecoveryModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400 font-medium mb-2">
                  Your funds in this wallet are fully recoverable
                </p>
                <p className="text-xs text-gray-300">
                  This wallet is deterministically derived from your master seed. As long as you have your password, you can always access these funds.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Wallet Index</p>
                  <p className="text-sm text-white font-mono bg-white/5 px-3 py-2 rounded border border-gray-700">
                    #{recoveryWallet.wallet_index}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Derivation Path (BIP44)</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-mono bg-white/5 px-3 py-2 rounded border border-gray-700 flex-1">
                      {recoveryWallet.derivation_path}
                    </p>
                    <button
                      onClick={() => copyToClipboard(recoveryWallet.derivation_path)}
                      className="text-gray-400 hover:text-white transition-colors p-2"
                      title="Copy derivation path"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Public Key</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-mono bg-white/5 px-3 py-2 rounded border border-gray-700 flex-1 truncate">
                      {recoveryWallet.public_key}
                    </p>
                    <button
                      onClick={() => copyToClipboard(recoveryWallet.public_key)}
                      className="text-gray-400 hover:text-white transition-colors p-2"
                      title="Copy public key"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">How Recovery Works</h4>
                <ol className="space-y-2 text-xs text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">1.</span>
                    <span>Your master seed is encrypted with your password using AES-256</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">2.</span>
                    <span>Each wallet is derived from this seed using the derivation path shown above</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">3.</span>
                    <span>To recover funds, click &quot;Drain Wallet&quot; and enter your password</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">4.</span>
                    <span>All SOL and SPL tokens will be transferred to your chosen address</span>
                  </li>
                </ol>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs text-yellow-200">
                  <strong>Important:</strong> Never share your password or master seed with anyone. Redacted support will never ask for these.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => setShowRecoveryModal(false)}
                className="w-full"
              >
                Got It
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Drain Wallet Modal */}
      {showDrainModal && selectedWallet && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Drain Wallet #{selectedWallet.wallet_index}
                </h3>
                <button
                  onClick={handleCloseDrainModal}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-gray-400">
                Transfer all SOL and SPL tokens from this wallet to another address. This will mark the wallet as recycled.
              </p>

              {drainSuccess && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-green-500 text-sm">{drainSuccess}</p>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Destination Address
                </label>
                <input
                  type="text"
                  value={drainDestination}
                  onChange={(e) => setDrainDestination(e.target.value)}
                  placeholder="Enter Solana wallet address"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                  disabled={isDraining || !!drainSuccess}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Password
                </label>
                <input
                  type="password"
                  value={drainPassword}
                  onChange={(e) => setDrainPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                  disabled={isDraining || !!drainSuccess}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required to derive the wallet&apos;s private key
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={handleCloseDrainModal}
                  className="flex-1"
                  disabled={isDraining}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDrainWallet}
                  className="flex-1"
                  isLoading={isDraining}
                  disabled={!drainDestination || !drainPassword || !!drainSuccess}
                >
                  {drainSuccess ? 'Done!' : 'Drain Wallet'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
