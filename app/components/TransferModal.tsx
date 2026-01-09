'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: {
    id: string;
    public_key: string;
    wallet_index: number;
    balance?: {
      sol: number;
      lamports: number;
    };
  };
  onTransferComplete: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onTransferComplete
}) => {
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [signature, setSignature] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setDestinationAddress('');
      setAmount('');
      setPassword('');
      setError('');
      setSuccess('');
      setSignature('');
      setShowConfirmation(false);
    }
  }, [isOpen]);

  const handleMaxClick = () => {
    if (wallet.balance) {
      // Leave a small amount for fees
      const maxAmount = Math.max(0, wallet.balance.sol - 0.000006);
      setAmount(maxAmount.toFixed(6));
    }
  };

  const handleTransfer = async () => {
    setError('');
    setSuccess('');

    if (!destinationAddress) {
      setError('Please enter a destination address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Session expired. Please log in again.');
      return;
    }

    setIsTransferring(true);

    try {
      const response = await fetch(`${API_URL}/api/wallets/${wallet.id}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          destinationAddress,
          amount: parseFloat(amount),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transfer failed');
      }

      setSuccess(data.message || 'Transfer completed successfully!');
      setSignature(data.data.signature);

      // Call onTransferComplete after a short delay
      setTimeout(() => {
        onTransferComplete();
        setTimeout(() => {
          onClose();
        }, 1500);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
      setShowConfirmation(false);
    } finally {
      setIsTransferring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-md glass-card p-6 space-y-6"
        style={{
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Transfer Funds</h2>
            <p className="text-sm text-gray-400 mt-1">
              From Wallet #{wallet.wallet_index}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Wallet Info */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Available Balance</span>
            <span className="text-sm font-semibold text-white">
              {wallet.balance ? `${wallet.balance.sol.toFixed(6)} SOL` : 'Loading...'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Source Wallet</span>
            <span className="text-xs text-gray-300 font-mono">
              {wallet.public_key.slice(0, 6)}...{wallet.public_key.slice(-6)}
            </span>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-green-400 font-medium">{success}</p>
                {signature && (
                  <a
                    href={`https://solscan.io/tx/${signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-300 hover:text-green-200 underline mt-1 inline-block"
                  >
                    View on Solscan →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        {!success && (
          <div className="space-y-4">
            {/* Destination Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Destination Address
              </label>
              <input
                type="text"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="Enter Solana address"
                disabled={isTransferring}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (SOL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.000001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.000000"
                  disabled={isTransferring}
                  className="w-full px-4 py-3 pr-16 rounded-lg bg-white/5 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                />
                <button
                  onClick={handleMaxClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded transition-colors"
                  disabled={isTransferring}
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Fee Estimate */}
            {amount && parseFloat(amount) > 0 && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-300">Estimated Fee</span>
                  <span className="text-blue-200 font-medium">~0.000005 SOL</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-blue-300">You will send</span>
                  <span className="text-white font-semibold">{parseFloat(amount).toFixed(6)} SOL</span>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isTransferring}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Confirmation Warning */}
            {showConfirmation && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-yellow-300 font-medium">Confirm Transfer</p>
                    <p className="text-xs text-yellow-200/80 mt-1">
                      You are about to send {parseFloat(amount).toFixed(6)} SOL to {destinationAddress.slice(0, 8)}...{destinationAddress.slice(-8)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={showConfirmation ? () => setShowConfirmation(false) : onClose}
                className="flex-1"
                disabled={isTransferring}
              >
                {showConfirmation ? 'Back' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                onClick={handleTransfer}
                className="flex-1"
                isLoading={isTransferring}
                disabled={isTransferring || !destinationAddress || !amount || !password}
              >
                {showConfirmation ? 'Confirm Transfer' : 'Continue'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
