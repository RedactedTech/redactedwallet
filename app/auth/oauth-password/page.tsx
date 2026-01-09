'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

function OAuthPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const password = searchParams.get('password');

  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!password) {
      router.push('/dashboard');
    }
  }, [password, router]);

  const handleCopy = async () => {
    if (password) {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContinue = () => {
    if (!confirmed) {
      alert('Please confirm that you have saved your password securely.');
      return;
    }
    router.push('/dashboard');
  };

  if (!password) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Background styling */}
      <div className="absolute inset-0 radial-glow" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-full mb-4">
                <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Save Your Password
              </h2>
              <p className="text-gray-400 text-sm">
                This password encrypts your trading wallet. You'll need it to execute trades.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <p className="text-yellow-500 text-xs font-medium mb-2">
                CRITICAL: Save this password securely!
              </p>
              <ul className="text-yellow-500/80 text-xs space-y-1">
                <li>• This password will ONLY be shown once</li>
                <li>• You need it to execute trades</li>
                <li>• We cannot recover it if lost</li>
                <li>• Store it in a password manager</li>
              </ul>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-400">
                Your Generated Password
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={password}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white font-mono text-sm pr-24"
                />
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs font-medium transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-700 bg-gray-900/50 text-white focus:ring-white/20"
                />
                <span className="text-sm text-gray-300">
                  I have saved this password securely and understand that{' '}
                  <span className="text-white font-medium">it cannot be recovered</span> if lost.
                </span>
              </label>
            </div>

            <Button
              variant="primary"
              size="large"
              onClick={handleContinue}
              disabled={!confirmed}
              className="w-full"
            >
              Continue to Dashboard
            </Button>

            <div className="text-center">
              <p className="text-gray-500 text-xs">
                Tip: Save this in a password manager like 1Password or Bitwarden
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function OAuthPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    }>
      <OAuthPasswordContent />
    </Suspense>
  );
}
