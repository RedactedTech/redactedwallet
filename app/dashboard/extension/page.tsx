'use client';

import React from 'react';
import { Card } from '../../components/Card';

export default function ExtensionPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2">
          Chrome Extension
        </h1>
        <p className="text-gray-400">
          Trade privately from any website with one-click access to your ghost wallets
        </p>
      </div>

      {/* Coming Soon Badge */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-sm font-medium text-yellow-400">Coming Soon</span>
        </div>
      </div>

      {/* Extension Overview */}
      <div className="max-w-7xl mx-auto mb-8">
        <Card className="group relative overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.03) 0%, transparent 70%)'
          }} />
          <div className="relative">
            <div className="flex items-start gap-5 mb-6">
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
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Privacy-First Trading, Everywhere
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  The Redacted Chrome Extension brings ghost wallet trading directly to your browser. Swap tokens, monitor positions, and manage your privacy from any website without leaving the page.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Key Features */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature 1: One-Click Trading */}
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
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-white">One-Click Trading</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Execute trades instantly from any page. Highlight a token address and trade directly from the context menu without switching tabs.
                </p>
              </div>
            </div>
          </Card>

          {/* Feature 2: Wallet Switcher */}
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
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-white">Quick Wallet Switcher</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Seamlessly switch between your ghost wallets without returning to the dashboard. View balances and recent activity at a glance.
                </p>
              </div>
            </div>
          </Card>

          {/* Feature 3: Real-Time Monitoring */}
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
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-white">Real-Time Position Tracking</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Monitor your open trades with live PnL updates. Get instant notifications when positions hit your take profit or stop loss targets.
                </p>
              </div>
            </div>
          </Card>

          {/* Feature 4: Privacy Mode */}
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
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-white">Enhanced Privacy Mode</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Zero wallet connection signatures. All transactions are executed through ephemeral ghost wallets with automatic cleanup after trades.
                </p>
              </div>
            </div>
          </Card>

          {/* Feature 5: Token Sniper */}
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
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-white">Token Sniper</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Discover new tokens while browsing. Get instant risk assessments, liquidity checks, and holder analysis before executing trades.
                </p>
              </div>
            </div>
          </Card>

          {/* Feature 6: Portfolio Overlay */}
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
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-white">Portfolio Overlay</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Pin your portfolio to any page with a minimalist overlay. Track total value, daily PnL, and individual positions without switching contexts.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">How It Works</h2>
        <Card className="group relative overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.03) 0%, transparent 70%)'
          }} />
          <div className="relative space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                1
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Install the Extension</h3>
                <p className="text-gray-400 text-sm">
                  Download from the Chrome Web Store and log in with your Redacted account. Your existing ghost wallets are instantly available.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                2
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Browse Freely</h3>
                <p className="text-gray-400 text-sm">
                  Visit any Solana-related website, Twitter, or DEX. The extension detects token addresses and displays quick action buttons.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                3
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Trade Instantly</h3>
                <p className="text-gray-400 text-sm">
                  Click the Redacted icon, select your ghost wallet, set your trade parameters, and execute. Your wallet address stays private throughout the entire flow.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                4
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Auto-Exit Protection</h3>
                <p className="text-gray-400 text-sm">
                  Set your take profit and stop loss targets right from the extension. Our backend worker monitors and executes exits automatically, even when the extension is closed.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Security & Privacy */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">Security & Privacy</h2>
        <Card className="group relative overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.03) 0%, transparent 70%)'
          }} />
          <div className="relative space-y-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-300 text-sm">
                <span className="font-medium text-white">Zero-Knowledge Architecture:</span> Private keys never leave our secure backend. The extension communicates via encrypted API calls.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-300 text-sm">
                <span className="font-medium text-white">No Tracking:</span> We don't track your browsing history or inject analytics. The extension only activates when you interact with token addresses.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-300 text-sm">
                <span className="font-medium text-white">Minimal Permissions:</span> Only requests clipboard access for token addresses and network requests to our API. No site access or data collection.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-300 text-sm">
                <span className="font-medium text-white">Open Source:</span> Full extension source code available on GitHub for community audits and transparency.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <div className="max-w-7xl mx-auto">
        <Card className="group relative overflow-hidden border-2 border-yellow-400/20">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
            background: 'radial-gradient(circle at top right, rgba(234,179,8,0.05) 0%, transparent 70%)'
          }} />
          <div className="relative text-center py-8">
            <div className="w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Launching Soon</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              We're putting the finishing touches on the Chrome Extension. Sign up for early access to be notified the moment it's available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Expected release: Q1 2026</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
