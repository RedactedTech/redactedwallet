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
  isExecuting?: boolean;
}

export default function TransactionPreview({ formData, onCancel, onConfirm, isExecuting = false }: TransactionPreviewProps) {
  const [walletInfo, setWalletInfo] = useState<any>(null);

  useEffect(() => {
    if (formData.walletSelection === 'manual' && formData.selectedWalletId) {
      fetchWalletInfo();
    }
  }, []);

  const fetchWalletInfo = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/api/wallets`, {
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
            onClick={onConfirm}
            disabled={isExecuting}
            className="flex-1"
          >
            {isExecuting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Executing Trade...
              </span>
            ) : (
              'Confirm Trade'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
