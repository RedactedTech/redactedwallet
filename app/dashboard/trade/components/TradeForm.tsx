'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';

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

interface TradeFormProps {
  formData: TradeFormData;
  onFormChange: (updates: Partial<TradeFormData>) => void;
  onPreview: () => void;
}

interface GhostWallet {
  id: string;
  publicKey: string;
  balance: number;
  status: string;
}

export default function TradeForm({ formData, onFormChange, onPreview }: TradeFormProps) {
  const [wallets, setWallets] = useState<GhostWallet[]>([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.walletSelection === 'manual') {
      fetchWallets();
    }
  }, [formData.walletSelection]);

  const fetchWallets = async () => {
    try {
      setIsLoadingWallets(true);
      const accessToken = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/api/ghost-wallets/list`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setWallets(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
    } finally {
      setIsLoadingWallets(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Amount validation
    const amount = parseFloat(formData.amountSol);
    if (!formData.amountSol || isNaN(amount) || amount < 0.01) {
      newErrors.amountSol = 'Amount must be at least 0.01 SOL';
    }

    // Wallet validation
    if (formData.walletSelection === 'manual' && !formData.selectedWalletId) {
      newErrors.wallet = 'Please select a wallet';
    }

    // Take profit validation
    const takeProfit = parseFloat(formData.takeProfitPct);
    if (isNaN(takeProfit) || takeProfit < 10 || takeProfit > 500) {
      newErrors.takeProfitPct = 'Take profit must be between 10% and 500%';
    }

    // Stop loss validation
    const stopLoss = parseFloat(formData.stopLossPct);
    if (isNaN(stopLoss) || stopLoss < 1 || stopLoss > 50) {
      newErrors.stopLossPct = 'Stop loss must be between 1% and 50%';
    }

    // Trailing stop validation
    const trailingStop = parseFloat(formData.trailingStopPct);
    if (isNaN(trailingStop) || trailingStop < 1 || trailingStop > 50) {
      newErrors.trailingStopPct = 'Trailing stop must be between 1% and 50%';
    }

    // Slippage validation
    const slippage = parseFloat(formData.maxSlippageBps);
    if (isNaN(slippage) || slippage < 100 || slippage > 1000) {
      newErrors.maxSlippageBps = 'Slippage must be between 100 and 1000 BPS';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onPreview();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount (SOL) <span className="text-red-400">*</span>
        </label>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.1"
          value={formData.amountSol}
          onChange={(e) => onFormChange({ amountSol: e.target.value })}
        />
        {errors.amountSol && (
          <p className="text-red-400 text-sm mt-1">{errors.amountSol}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">Minimum: 0.01 SOL</p>
      </div>

      {/* Wallet Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Wallet Selection
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors" style={{
            background: formData.walletSelection === 'auto' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <input
              type="radio"
              name="walletSelection"
              value="auto"
              checked={formData.walletSelection === 'auto'}
              onChange={() => onFormChange({ walletSelection: 'auto', selectedWalletId: undefined })}
              className="w-4 h-4"
            />
            <div>
              <p className="text-white font-medium">Auto-select optimal wallet</p>
              <p className="text-gray-400 text-sm">System will choose the best available wallet</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors" style={{
            background: formData.walletSelection === 'manual' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <input
              type="radio"
              name="walletSelection"
              value="manual"
              checked={formData.walletSelection === 'manual'}
              onChange={() => onFormChange({ walletSelection: 'manual' })}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <p className="text-white font-medium">Manual wallet selection</p>
              <p className="text-gray-400 text-sm">Choose a specific wallet</p>
            </div>
          </label>
        </div>

        {/* Manual Wallet Dropdown */}
        {formData.walletSelection === 'manual' && (
          <div className="mt-3">
            {isLoadingWallets ? (
              <div className="text-gray-400 text-sm">Loading wallets...</div>
            ) : wallets.length > 0 ? (
              <>
                <select
                  value={formData.selectedWalletId || ''}
                  onChange={(e) => onFormChange({ selectedWalletId: e.target.value })}
                  className="w-full p-3 rounded-lg text-white"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <option value="">Select a wallet...</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.publicKey.substring(0, 8)}...{wallet.publicKey.substring(wallet.publicKey.length - 6)} - Balance: {wallet.balance.toFixed(4)} SOL
                    </option>
                  ))}
                </select>
                {errors.wallet && (
                  <p className="text-red-400 text-sm mt-1">{errors.wallet}</p>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-sm">No wallets available</p>
            )}
          </div>
        )}
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2"
      >
        {showAdvanced ? '▼' : '▶'} Advanced Options
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 p-4 rounded-lg" style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Take Profit */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Take Profit (%)
            </label>
            <Input
              type="number"
              step="1"
              min="10"
              max="500"
              value={formData.takeProfitPct}
              onChange={(e) => onFormChange({ takeProfitPct: e.target.value })}
            />
            {errors.takeProfitPct && (
              <p className="text-red-400 text-sm mt-1">{errors.takeProfitPct}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">Range: 10% - 500%</p>
          </div>

          {/* Stop Loss */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stop Loss (%)
            </label>
            <Input
              type="number"
              step="1"
              min="1"
              max="50"
              value={formData.stopLossPct}
              onChange={(e) => onFormChange({ stopLossPct: e.target.value })}
            />
            {errors.stopLossPct && (
              <p className="text-red-400 text-sm mt-1">{errors.stopLossPct}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">Range: 1% - 50%</p>
          </div>

          {/* Trailing Stop */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trailing Stop (%)
            </label>
            <Input
              type="number"
              step="1"
              min="1"
              max="50"
              value={formData.trailingStopPct}
              onChange={(e) => onFormChange({ trailingStopPct: e.target.value })}
            />
            {errors.trailingStopPct && (
              <p className="text-red-400 text-sm mt-1">{errors.trailingStopPct}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">Range: 1% - 50%</p>
          </div>

          {/* Max Slippage */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Slippage (BPS)
            </label>
            <Input
              type="number"
              step="50"
              min="100"
              max="1000"
              value={formData.maxSlippageBps}
              onChange={(e) => onFormChange({ maxSlippageBps: e.target.value })}
            />
            {errors.maxSlippageBps && (
              <p className="text-red-400 text-sm mt-1">{errors.maxSlippageBps}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">Range: 100 - 1000 BPS (1% - 10%)</p>
          </div>

          {/* Jito Bundle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.useJitoBundle}
                onChange={(e) => onFormChange({ useJitoBundle: e.target.checked })}
                className="w-4 h-4"
              />
              <div>
                <p className="text-white font-medium">Use Jito MEV Protection</p>
                <p className="text-gray-400 text-sm">Protect your trade from MEV attacks</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full">
        Preview Trade
      </Button>
    </form>
  );
}
