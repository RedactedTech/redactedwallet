'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function WhitePaper() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative z-10 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/transparentlogo.png"
              alt="Redacted"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-semibold text-white">Redacted</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Title */}
        <div className="text-center mb-16">
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #888888 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            White Paper
          </h1>
          <p className="text-xl" style={{ color: '#9ca3af' }}>
            Understanding Privacy-First Trading
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {/* Introduction */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">The Problem</h2>
            <div className="space-y-4 text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
              <p>
                In today's crypto markets, every transaction you make is permanently recorded on the blockchain.
                This creates a significant problem: <span className="font-semibold text-white">anyone can track your trading activity</span>.
              </p>
              <p>
                Professional traders, bots, and copy-traders monitor successful wallets and replicate their strategies.
                This means:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
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
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">The Redacted Solution</h2>
            <div className="space-y-4 text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
              <p>
                Redacted makes you <span className="font-semibold text-white">mathematically invisible</span> on the blockchain.
                Here's how it works, explained simply:
              </p>

              <div className="space-y-6 mt-6">
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(20, 20, 20, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
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
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(20, 20, 20, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
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
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(20, 20, 20, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
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
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(20, 20, 20, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
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
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">How It Works (Technical Overview)</h2>
            <div className="space-y-4 text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
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
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">Key Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(20, 20, 20, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">Complete Privacy</h3>
                <p style={{ color: '#9ca3af' }}>
                  Your trading history cannot be linked together. Each transaction appears as an independent, unrelated event.
                </p>
              </div>

              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(20, 20, 20, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">No Copy-Traders</h3>
                <p style={{ color: '#9ca3af' }}>
                  Without a persistent wallet address to monitor, copy-traders and bots cannot follow your strategy.
                </p>
              </div>

              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(20, 20, 20, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">MEV Protection</h3>
                <p style={{ color: '#9ca3af' }}>
                  Jito bundles ensure your trades execute at the prices you expect, without front-running or sandwich attacks.
                </p>
              </div>

              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(20, 20, 20, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">Maintain Edge</h3>
                <p style={{ color: '#9ca3af' }}>
                  Keep your trading strategies confidential and maintain your competitive advantage in the market.
                </p>
              </div>

              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(20, 20, 20, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">Zero Compromise</h3>
                <p style={{ color: '#9ca3af' }}>
                  Full privacy without sacrificing speed, security, or control over your funds.
                </p>
              </div>

              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(20, 20, 20, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
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
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">Who Benefits from Redacted?</h2>
            <div className="space-y-4 text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
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
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">Security &amp; Trust</h2>
            <div className="space-y-4 text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
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
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">Conclusion</h2>
            <div className="space-y-4 text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
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
              className="p-12 rounded-3xl"
              style={{
                background: 'rgba(20, 20, 20, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Trade Invisibly?</h2>
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
