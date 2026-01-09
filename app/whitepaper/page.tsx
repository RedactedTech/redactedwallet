'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '../components/Navbar';

export default function WhitePaper() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Title Section with $Redacted Button */}
        <div className="text-center mb-20">
          <h1
            className="text-6xl md:text-7xl font-bold tracking-tight mb-4"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #888888 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 24px rgba(255, 255, 255, 0.1))'
            }}
          >
            White Paper
          </h1>
          <p className="text-xl mb-8" style={{ color: '#9ca3af' }}>
            Understanding Privacy-First Trading
          </p>

          {/* 3D $Redacted Button */}
          <div className="inline-block mt-4">
            <button
              className="group relative px-8 py-4 text-xl font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                color: '#000000',
                boxShadow: '0 8px 0 #888888, 0 12px 20px rgba(0, 0, 0, 0.4)',
                transform: 'translateY(0)',
                letterSpacing: '0.02em'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(4px)';
                e.currentTarget.style.boxShadow = '0 4px 0 #888888, 0 8px 15px rgba(0, 0, 0, 0.3)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 0 #888888, 0 12px 20px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 0 #888888, 0 12px 20px rgba(0, 0, 0, 0.4)';
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>$Redacted</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.1) 100%)'
                }}
              />
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-16">
          {/* Introduction */}
          <section
            className="p-8 md:p-10 rounded-3xl"
            style={{
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '2px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
            }}
          >
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">The Problem</h2>
            <div className="space-y-5 text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
              <p>
                In today's crypto markets, every transaction you make is permanently recorded on the blockchain.
                This creates a significant problem: <span className="font-semibold text-white">anyone can track your trading activity</span>.
              </p>
              <p>
                Professional traders, bots, and copy-traders monitor successful wallets and replicate their strategies.
                This means:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-6" style={{ color: '#9ca3af' }}>
                <li>Your profitable trades get front-run by MEV bots</li>
                <li>Copy-traders drive up prices before you can enter positions</li>
                <li>Your trading patterns become public knowledge</li>
                <li>Competitors gain insights into your strategy</li>
              </ul>
              <p>
                For traders dealing with high-frequency memecoin trading, this transparency becomes a critical weakness.
                The moment your wallet is identified as successful, it becomes a target.
              </p>
            </div>
          </section>

          {/* The Solution */}
          <section
            className="p-8 md:p-10 rounded-3xl"
            style={{
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '2px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
            }}
          >
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">The Redacted Solution</h2>
            <div className="space-y-5 text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
              <p>
                Redacted makes you <span className="font-semibold text-white">mathematically invisible</span> on the blockchain.
                Here's how it works, explained simply:
              </p>

              <div className="space-y-6 mt-8">
                <div
                  className="p-7 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">1. One Wallet, A Thousand Masks</h3>
                  <p>
                    Instead of using one wallet for all your trades, Redacted automatically creates a fresh wallet
                    for every single transaction. Think of it like using a different phone number for every call
                    you make - no one can link your activities together.
                  </p>
                </div>

                <div
                  className="p-7 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">2. Breaking the Chain</h3>
                  <p>
                    Even with multiple wallets, someone could theoretically trace the funds back to you by following
                    the money trail. Redacted solves this by routing funds through <span className="font-semibold text-white">cross-chain relay pools</span>.
                  </p>
                  <p className="mt-3">
                    Imagine your money going through a busy marketplace where thousands of people are exchanging
                    identical bills. By the time your funds come out the other side, there's no way to trace them
                    back to you. The connection is mathematically broken.
                  </p>
                </div>

                <div
                  className="p-7 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">3. MEV Protection via Jito Bundles</h3>
                  <p>
                    MEV (Maximal Extractable Value) bots scan the blockchain for pending transactions and try to
                    front-run profitable trades. This is like someone watching you enter a store and rushing ahead
                    to buy the last item you wanted.
                  </p>
                  <p className="mt-3">
                    Redacted uses <span className="font-semibold text-white">Jito bundles</span> - a technology that packages your
                    transaction in a way that makes it invisible to MEV bots until it's already confirmed. Your trades
                    execute exactly as intended, without interference.
                  </p>
                </div>

                <div
                  className="p-7 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">4. Seamless User Experience</h3>
                  <p>
                    Despite the complex technology running behind the scenes, using Redacted is simple. You interact
                    with one master wallet, and all the wallet creation, fund routing, and transaction protection
                    happens automatically. It's like having a personal security team that works invisibly in the background.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Architecture */}
          <section
            className="p-8 md:p-10 rounded-3xl"
            style={{
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '2px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
            }}
          >
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">How It Works (Technical Overview)</h2>
            <div className="space-y-5 text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
              <p>
                For those interested in the technical details, here's what happens under the hood:
              </p>

              <div
                className="p-6 rounded-2xl mt-6 space-y-4"
                style={{
                  background: 'rgba(20, 20, 20, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div>
                  <h4 className="font-semibold text-white mb-2">Wallet Generation</h4>
                  <p className="text-base">
                    Each trading wallet is generated using BIP39 hierarchical deterministic (HD) wallet standards.
                    This means your master seed can recreate all wallets, but the wallets themselves appear completely
                    unrelated on-chain.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Cross-Chain Relay Pools</h4>
                  <p className="text-base">
                    Funds are moved through liquidity pools across multiple chains, breaking the direct link between
                    source and destination. This uses atomic swaps and cross-chain bridges to ensure security while
                    maintaining anonymity.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Jito Bundle Integration</h4>
                  <p className="text-base">
                    Transactions are submitted through Jito's MEV-protected infrastructure, which guarantees execution
                    order and prevents sandwich attacks, front-running, and other forms of MEV extraction.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Automated Rotation</h4>
                  <p className="text-base">
                    After each trade, the system automatically marks the wallet as "burned" and generates a new one.
                    Any remaining dust is swept back into the pool through the relay system, leaving no traceable balance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section
            className="p-8 md:p-10 rounded-3xl"
            style={{
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '2px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
            }}
          >
            <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">Key Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="p-6 rounded-xl transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background: 'rgba(30, 30, 30, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">Complete Privacy</h3>
                <p style={{ color: '#9ca3af' }}>
                  Your trading history cannot be linked together. Each transaction appears as an independent, unrelated event.
                </p>
              </div>

              <div
                className="p-6 rounded-xl transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background: 'rgba(30, 30, 30, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">No Copy-Traders</h3>
                <p style={{ color: '#9ca3af' }}>
                  Without a persistent wallet address to monitor, copy-traders and bots cannot follow your strategy.
                </p>
              </div>

              <div
                className="p-6 rounded-xl transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background: 'rgba(30, 30, 30, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">MEV Protection</h3>
                <p style={{ color: '#9ca3af' }}>
                  Jito bundles ensure your trades execute at the prices you expect, without front-running or sandwich attacks.
                </p>
              </div>

              <div
                className="p-6 rounded-xl transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background: 'rgba(30, 30, 30, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">Maintain Edge</h3>
                <p style={{ color: '#9ca3af' }}>
                  Keep your trading strategies confidential and maintain your competitive advantage in the market.
                </p>
              </div>

              <div
                className="p-6 rounded-xl transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background: 'rgba(30, 30, 30, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">Zero Compromise</h3>
                <p style={{ color: '#9ca3af' }}>
                  Full privacy without sacrificing speed, security, or control over your funds.
                </p>
              </div>

              <div
                className="p-6 rounded-xl transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background: 'rgba(30, 30, 30, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">Simple to Use</h3>
                <p style={{ color: '#9ca3af' }}>
                  All the complexity is automated. Trade as easily as you would with a regular wallet.
                </p>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section
            className="p-8 md:p-10 rounded-3xl"
            style={{
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '2px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
            }}
          >
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Who Benefits from Redacted?</h2>
            <div className="space-y-5 text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <span className="text-2xl">💎</span>
                  <div>
                    <span className="font-semibold text-white">Memecoin Traders:</span> Execute high-frequency trades
                    without revealing your strategy to competitors and copy-traders.
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-2xl">🏦</span>
                  <div>
                    <span className="font-semibold text-white">Whales:</span> Make large trades without signaling your
                    moves to the market and causing adverse price movements.
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <span className="font-semibold text-white">Privacy-Conscious Users:</span> Trade freely without
                    creating a permanent, public record of your financial activities.
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <span className="font-semibold text-white">Professional Traders:</span> Protect proprietary strategies
                    and maintain competitive advantages in crowded markets.
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <span className="font-semibold text-white">DeFi Power Users:</span> Interact with protocols without
                    exposing your full portfolio and strategy to on-chain analysts.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Security */}
          <section
            className="p-8 md:p-10 rounded-3xl"
            style={{
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '2px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
            }}
          >
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Security &amp; Trust</h2>
            <div className="space-y-5 text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
              <p>
                Redacted is built with security as the foundation:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>
                  <span className="font-semibold text-white">Non-custodial:</span> You always maintain control of your
                  master seed and funds. We never have access to your private keys.
                </li>
                <li>
                  <span className="font-semibold text-white">Open Design:</span> The architecture is designed to be
                  transparent and auditable by security experts.
                </li>
                <li>
                  <span className="font-semibold text-white">Battle-tested Components:</span> We use proven technologies
                  like BIP39, Jito, and established cross-chain protocols.
                </li>
                <li>
                  <span className="font-semibold text-white">No Honeypots:</span> All transactions are atomic and
                  guaranteed to execute or revert - no risk of funds getting stuck.
                </li>
              </ul>
            </div>
          </section>

          {/* Conclusion */}
          <section
            className="p-8 md:p-10 rounded-3xl"
            style={{
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '2px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
            }}
          >
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Conclusion</h2>
            <div className="space-y-5 text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
              <p>
                The blockchain's transparency is both its greatest strength and, for traders, its greatest weakness.
                Redacted solves this paradox by providing <span className="font-semibold text-white">mathematical privacy</span> without
                compromising on security, speed, or control.
              </p>
              <p>
                In a market where information is power, keeping your strategy invisible isn't just an advantage -
                it's essential for success.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 text-center">
            <div
              className="p-12 md:p-16 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(20, 20, 20, 0.7) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderTop: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 12px 40px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08) inset'
              }}
            >
              <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Ready to Trade Invisibly?</h2>
              <p className="text-lg mb-8" style={{ color: '#9ca3af' }}>
                Join traders who value their privacy and competitive edge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    boxShadow: '0 0 30px rgba(255, 255, 255, 0.2)'
                  }}
                >
                  Get Started
                </Link>
                <a
                  href="https://x.com/RedactedWallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                >
                  Follow Us
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
