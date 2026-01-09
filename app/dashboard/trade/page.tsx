'use client';

import React, { useState, useEffect } from 'react';
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

export default function TradePage() {
  const searchParams = useSearchParams();
  const [selectedToken, setSelectedToken] = useState<SelectedToken | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
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
    setShowPreview(true);
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
  };

  const handleConfirmTrade = async () => {
    // Trade execution will be implemented in next phase
    console.log('Execute trade:', formData);
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
          <TransactionPreview
            formData={formData}
            onCancel={handleCancelPreview}
            onConfirm={handleConfirmTrade}
          />
        )}
      </div>
    </div>
  );
}
