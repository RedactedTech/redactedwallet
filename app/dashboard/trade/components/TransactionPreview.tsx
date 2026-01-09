'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { getTokenImageUrl } from '../../../utils/pumpfun';

interface TradeFormData {
  token: any;
  amountSol: string;
  walletSelection: 'auto' | 'manual';
  selectedWalletId?: string;
  takeProfitPct: string;
  stopLossPct: string;
  trailingStopPct: string;
  maxSlippageBps: string;
  useJitoBundle: boolean;
}

interface TransactionPreviewProps {
  formData: TradeFormData;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function TransactionPreview({ formData, onCancel, onConfirm }: TransactionPreviewProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (formData.walletSelection === 'manual' && formData.selectedWalletId) {
      fetchWalletInfo();
    }
  }, []);

  const fetchWalletInfo = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/api/ghost-wallets/list`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        const wallet = data.data.find((w: any) => w.id === formData.selectedWalletId);
        setWalletInfo(wallet);
      }
    } catch (error) {
      console.error('Error fetching wallet info:', error);
    }
  };

  const handleConfirm = async () => {
    setIsExecuting(true);
    setError('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      const sessionPassword = localStorage.getItem('sessionPassword');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      if (!sessionPassword) {
        throw new Error('Session password not found. Please log in again.');
      }

      // First, get the wallet to use
      let ghostWalletId = formData.selectedWalletId;

      if (formData.walletSelection === 'auto') {
        // Request a trading wallet
        const walletResponse = await fetch(`${apiUrl}/api/wallets/trading-wallet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ strategyId: null })
        });

        const walletData = await walletResponse.json();

        if (!walletResponse.ok) {
          throw new Error(walletData.error || 'Failed to get trading wallet');
        }

        ghostWalletId = walletData.wallet.id;
      }

      // Execute the trade
      const tradeResponse = await fetch(`${apiUrl}/api/trades/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          ghostWalletId,
          tokenAddress: formData.token.mint,
          entryAmountSol: parseFloat(formData.amountSol),
          maxSlippageBps: parseInt(formData.maxSlippageBps),
          takeProfitPct: parseFloat(formData.takeProfitPct),
          stopLossPct: parseFloat(formData.stopLossPct),
          trailingStopPct: parseFloat(formData.trailingStopPct),
          useJitoBundle: formData.useJitoBundle,
          sessionPassword
        })
      });

      const tradeData = await tradeResponse.json();

      if (!tradeResponse.ok) {
        throw new Error(tradeData.error || 'Failed to execute trade');
      }

      // Success! Show success message and redirect
      alert(`Trade executed successfully!\n\nTransaction: ${tradeData.txHash}\n\nView on Solscan: https://solscan.io/tx/${tradeData.txHash}`);

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Trade execution error:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute trade');
      setIsExecuting(false);
    }
  };

  const slippagePercent = (parseInt(formData.maxSlippageBps) / 100).toFixed(2);

  return (
    <Card>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white">Transaction Preview</h2>

        {/* Token Info */}
        <div className="p-4 rounded-lg" style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <p className="text-gray-400 text-sm mb-2">Token</p>
          <div className="flex items-center gap-3">
            <img
              src={getTokenImageUrl(formData.token.image_uri, formData.token.symbol)}
              alt={formData.token.symbol}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="text-white font-semibold text-lg">{formData.token.symbol}</p>
              <p className="text-gray-400 text-sm">{formData.token.name}</p>
            </div>
          </div>
        </div>

        {/* Trade Amount */}
        <div className="p-4 rounded-lg" style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <p className="text-gray-400 text-sm mb-2">Amount</p>
          <p className="text-white text-2xl font-semibold">{formData.amountSol} SOL</p>
        </div>

        {/* Wallet */}
        <div className="p-4 rounded-lg" style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <p className="text-gray-400 text-sm mb-2">Wallet</p>
          <p className="text-white font-medium">
            {formData.walletSelection === 'auto' ? (
              'Auto-selected (System will choose best wallet)'
            ) : walletInfo ? (
              <>
                {walletInfo.publicKey.substring(0, 8)}...{walletInfo.publicKey.substring(walletInfo.publicKey.length - 6)}
                <span className="text-gray-400 text-sm ml-2">
                  (Balance: {walletInfo.balance.toFixed(4)} SOL)
                </span>
              </>
            ) : (
              'Loading wallet info...'
            )}
          </p>
        </div>

        {/* Exit Strategy */}
        <div className="p-4 rounded-lg" style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <p className="text-gray-400 text-sm mb-3">Exit Strategy</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Take Profit:</span>
              <span className="text-green-400 font-medium">+{formData.takeProfitPct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Stop Loss:</span>
              <span className="text-red-400 font-medium">-{formData.stopLossPct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trailing Stop:</span>
              <span className="text-yellow-400 font-medium">{formData.trailingStopPct}%</span>
            </div>
          </div>
        </div>

        {/* Trade Settings */}
        <div className="p-4 rounded-lg" style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <p className="text-gray-400 text-sm mb-3">Trade Settings</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Max Slippage:</span>
              <span className="text-white font-medium">{slippagePercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Jito MEV Protection:</span>
              <span className={`font-medium ${formData.useJitoBundle ? 'text-green-400' : 'text-gray-400'}`}>
                {formData.useJitoBundle ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isExecuting}
            className="flex-1"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isExecuting}
            className="flex-1"
          >
            {isExecuting ? 'Executing Trade...' : 'Confirm Trade'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
