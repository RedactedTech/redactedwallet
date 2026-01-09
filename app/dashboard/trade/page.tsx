'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '../../components/Card';
import TokenSearch from './components/TokenSearch';
import TradeForm from './components/TradeForm';
import TransactionPreview from './components/TransactionPreview';
import { getPumpFunMetadata } from '../../utils/pumpfun';

interface SelectedToken {
  mint: string;
  name: string;
  symbol: string;
  image_uri?: string;
}

interface TradeFormData {
  token: SelectedToken | null;
  amountSol: string;
  walletSelection: 'auto' | 'manual';
  selectedWalletId?: string;
  takeProfitPct: string;
  stopLossPct: string;
  trailingStopPct: string;
  maxSlippageBps: string;
  useJitoBundle: boolean;
}

function TradePageContent() {
  const searchParams = useSearchParams();
  const [selectedToken, setSelectedToken] = useState<SelectedToken | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [isExecutingTrade, setIsExecutingTrade] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState('');
  const [formData, setFormData] = useState<TradeFormData>({
    token: null,
    amountSol: '',
    walletSelection: 'auto',
    takeProfitPct: '50',
    stopLossPct: '10',
    trailingStopPct: '5',
    maxSlippageBps: '500',
    useJitoBundle: true
  });
  const [showPreview, setShowPreview] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [tradePassword, setTradePassword] = useState('');

  // Load token from URL parameter
  useEffect(() => {
    const loadTokenFromUrl = async () => {
      const tokenAddress = searchParams.get('token');
      if (!tokenAddress) return;

      setIsLoadingToken(true);
      try {
        const metadata = await getPumpFunMetadata(tokenAddress);
        if (metadata) {
          const token: SelectedToken = {
            mint: metadata.mint,
            name: metadata.name,
            symbol: metadata.symbol,
            image_uri: metadata.image_uri
          };
          handleTokenSelect(token);
        }
      } catch (error) {
        console.error('Failed to load token from URL:', error);
      } finally {
        setIsLoadingToken(false);
      }
    };

    loadTokenFromUrl();
  }, [searchParams]);

  const handleTokenSelect = (token: SelectedToken) => {
    setSelectedToken(token);
    setFormData(prev => ({ ...prev, token }));
  };

  const handleFormChange = (updates: Partial<TradeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handlePreview = () => {
    // Show password modal first
    setShowPasswordModal(true);
    setTradePassword('');
    setTradeError('');
  };

  const handlePasswordSubmit = () => {
    if (!tradePassword) {
      setTradeError('Password is required');
      return;
    }
    setShowPasswordModal(false);
    setShowPreview(true);
  };

  const handleCancelPasswordModal = () => {
    setShowPasswordModal(false);
    setTradePassword('');
    setTradeError('');
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
  };

  const handleConfirmTrade = async () => {
    setIsExecutingTrade(true);
    setTradeError('');
    setTradeSuccess('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      const sessionPassword = localStorage.getItem('sessionPassword');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      if (!sessionPassword) {
        throw new Error('Session expired. Please log in again.');
      }

      if (!formData.token) {
        throw new Error('No token selected');
      }

      if (!formData.selectedWalletId && formData.walletSelection === 'manual') {
        throw new Error('Please select a wallet');
      }

      // Get wallet ID
      let ghostWalletId = formData.selectedWalletId;

      if (formData.walletSelection === 'auto') {
        // Request a trading wallet from the backend
        const walletResponse = await fetch(`${apiUrl}/api/wallets/trading-wallet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            strategyId: null,
            password: tradePassword
          })
        });

        const walletData = await walletResponse.json();

        if (!walletResponse.ok) {
          throw new Error(walletData.error || 'Failed to get trading wallet');
        }

        ghostWalletId = walletData.data.id;
      }

      // Prepare trade payload
      const payload = {
        ghostWalletId,
        tokenAddress: formData.token.mint,
        entryAmountSol: parseFloat(formData.amountSol),
        maxSlippageBps: parseInt(formData.maxSlippageBps),
        takeProfitPct: formData.takeProfitPct ? parseFloat(formData.takeProfitPct) : undefined,
        stopLossPct: formData.stopLossPct ? parseFloat(formData.stopLossPct) : undefined,
        trailingStopPct: formData.trailingStopPct ? parseFloat(formData.trailingStopPct) : undefined,
        useJitoBundle: formData.useJitoBundle,
        sessionPassword
      };

      console.log('Executing trade with payload:', payload);

      const response = await fetch(`${apiUrl}/api/trades/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute trade');
      }

      // Success!
      setTradeSuccess(`Trade executed successfully! Signature: ${data.data.entry_signature?.substring(0, 8)}...`);

      // Reset form after 3 seconds and go back to form view
      setTimeout(() => {
        setShowPreview(false);
        setSelectedToken(null);
        setFormData({
          token: null,
          amountSol: '',
          walletSelection: 'auto',
          takeProfitPct: '50',
          stopLossPct: '10',
          trailingStopPct: '5',
          maxSlippageBps: '500',
          useJitoBundle: true
        });
        setTradeSuccess('');
      }, 3000);

    } catch (error: any) {
      console.error('Trade execution error:', error);
      setTradeError(error.message || 'Failed to execute trade');
    } finally {
      setIsExecutingTrade(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-black">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2">
              Execute Trade
            </h1>
            <p className="text-gray-400">
              Trade tokens with your ghost wallets
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
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {!showPreview ? (
          <Card>
            <div className="space-y-6">
              {/* Token Search */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Select Token</h2>
                {isLoadingToken ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    <p className="text-gray-400 ml-3">Loading token...</p>
                  </div>
                ) : (
                  <TokenSearch
                    selectedToken={selectedToken}
                    onTokenSelect={handleTokenSelect}
                  />
                )}
              </div>

              {/* Trade Form */}
              {selectedToken && (
                <div className="pt-6 border-t border-gray-800">
                  <h2 className="text-xl font-semibold text-white mb-4">Trade Details</h2>
                  <TradeForm
                    formData={formData}
                    onFormChange={handleFormChange}
                    onPreview={handlePreview}
                  />
                </div>
              )}
            </div>
          </Card>
        ) : (
          <>
            {/* Error/Success Messages */}
            {tradeError && (
              <div className="mb-6">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-500 text-sm">{tradeError}</p>
                </div>
              </div>
            )}
            {tradeSuccess && (
              <div className="mb-6">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-green-500 text-sm">{tradeSuccess}</p>
                </div>
              </div>
            )}

            <TransactionPreview
              formData={formData}
              onCancel={handleCancelPreview}
              onConfirm={handleConfirmTrade}
              isExecuting={isExecutingTrade}
            />
          </>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Confirm Trade
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

              <p className="text-sm text-gray-300">
                To execute this trade, we need to create or access a ghost wallet. Enter your password to continue.
              </p>

              {tradeError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-500 text-sm">{tradeError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Password
                </label>
                <input
                  type="password"
                  value={tradePassword}
                  onChange={(e) => setTradePassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required to derive wallet from your master seed
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancelPasswordModal}
                  className="flex-1 px-4 py-3 rounded-lg transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#ffffff'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!tradePassword}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: tradePassword
                      ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(34, 211, 238, 0.1))'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: tradePassword
                      ? '1px solid rgba(34, 211, 238, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    color: tradePassword ? '#22d3ee' : '#888888',
                    boxShadow: tradePassword ? '0 0 10px rgba(34, 211, 238, 0.2)' : 'none'
                  }}
                >
                  Continue to Preview
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function TradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    }>
      <TradePageContent />
    </Suspense>
  );
}
