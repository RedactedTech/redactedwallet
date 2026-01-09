'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from './components/Footer';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section - Split Layout */}
      <div className="min-h-screen relative z-10 px-6 py-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div className="text-left space-y-8">
              {/* 3D Chrome Heading */}
              <h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter"
                style={{
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #CCCCCC 30%, #888888 60%, #666666 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 8px 32px rgba(255, 255, 255, 0.3)) drop-shadow(0 4px 16px rgba(255, 255, 255, 0.2))',
                  textShadow: '0 1px 0 rgba(255,255,255,0.4), 0 2px 0 rgba(255,255,255,0.3), 0 3px 0 rgba(255,255,255,0.2), 0 4px 0 rgba(255,255,255,0.1)',
                  letterSpacing: '-0.04em'
                }}
              >
                REDACTED
              </h1>

              {/* Tagline */}
              <p className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-custom-400" style={{ letterSpacing: '-0.02em' }}>
                1 Wallet. A thousand masks.
              </p>

              {/* Description */}
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-custom-500 max-w-2xl">
                Trade high-frequency memecoins without ever revealing your identity.
                Become <span className="font-semibold text-white">mathematically invisible</span> to copy-traders and MEV bots.
              </p>

              {/* Live Stats Ticker */}
              <div className="flex flex-wrap gap-4">
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-lg relative"
                  style={{
                    background: 'rgba(34, 211, 238, 0.1)',
                    border: '1px solid rgba(34, 211, 238, 0.2)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Pulsing glow effect */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-50"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.4) 0%, transparent 70%)',
                      filter: 'blur(8px)',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse relative z-10" />
                  <span className="text-sm font-medium text-cyan-300 relative z-10">Live</span>
                </div>
                <div className="px-4 py-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span className="text-xs text-gray-400">Total Trades: </span>
                  <span className="text-sm font-semibold text-white">1,247</span>
                </div>
                <div className="px-4 py-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span className="text-xs text-gray-400">Volume: </span>
                  <span className="text-sm font-semibold text-white">$2.4M</span>
                </div>
              </div>

              {/* CTA Buttons - Simplified */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/auth/register"
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-semibold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    boxShadow: '0 0 40px rgba(255, 255, 255, 0.25), 0 8px 16px rgba(0, 0, 0, 0.3)',
                    letterSpacing: '-0.01em'
                  }}
                >
                  <span className="relative z-10">Launch Terminal</span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)'
                    }}
                  />
                </Link>

                <Link
                  href="/whitepaper"
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    border: '1.5px solid rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    letterSpacing: '-0.01em'
                  }}
                >
                  <span className="relative z-10">Read Docs</span>
                </Link>
              </div>

              {/* Trust Badges - Dimmed at Bottom */}
              <div className="flex flex-wrap gap-3 pt-8 opacity-50">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-gray-400">Non-Custodial</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-gray-400">Open Source</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-gray-400">BIP39/44</span>
                </div>
              </div>
            </div>

            {/* Right Side - Logo with Token Section */}
            <div className="hidden lg:flex flex-col items-center justify-start relative space-y-8">
              {/* Logo with pulsing glow */}
              <div className="relative">
                {/* Pulsing glow behind logo */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 30%, transparent 70%)',
                    filter: 'blur(60px)',
                    animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    transform: 'scale(1.3)'
                  }}
                />
                <Image
                  src="/transparentlogo.png"
                  alt="redacted"
                  width={450}
                  height={450}
                  priority
                  className="object-contain drop-shadow-2xl relative z-10"
                  style={{
                    filter: 'drop-shadow(0 0 40px rgba(255, 255, 255, 0.3)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))'
                  }}
                />
              </div>

              {/* Token Launch Section */}
              <div className="flex flex-col items-center justify-center">
                <div className="font-mono text-sm md:text-base text-cyan-400 mb-6 bg-cyan-950/30 px-6 py-3 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                  $Redacted: Coming soon
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    disabled
                    className="px-8 py-3 rounded-xl font-semibold text-white/40 bg-white/5 border border-white/10 cursor-not-allowed hover:bg-white/5 transition-colors"
                  >
                    Buy $Redacted
                  </button>
                  <button
                    disabled
                    className="px-8 py-3 rounded-xl font-semibold text-white/40 bg-white/5 border border-white/10 cursor-not-allowed hover:bg-white/5 transition-colors"
                  >
                    View Chart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Z-Pattern Feature Sections */}
      <div className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-32">
          {/* Row 1: Text Left, Visual Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Total Anonymity
              </h2>
              <p className="text-xl leading-relaxed text-gray-custom-500">
                Break on-chain links with cross-chain relay pools. Each ghost wallet is mathematically isolated from your identity. Your trading history vanishes into the void.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="px-4 py-2 rounded-lg" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}>
                  <span className="text-sm font-medium text-white">HD Derivation</span>
                </div>
                <div className="px-4 py-2 rounded-lg" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}>
                  <span className="text-sm font-medium text-white">Zero Links</span>
                </div>
              </div>
            </div>
            <div
              className="rounded-3xl p-8 flex items-center justify-center min-h-[400px]"
              style={{
                background: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.4)'
              }}
            >
              <Image
                src="/LOCK.png"
                alt="Lock"
                width={600}
                height={600}
                className="object-contain opacity-80 w-full h-full max-h-[400px]"
              />
            </div>
          </div>

          {/* Row 2: Visual Left, Text Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div
              className="rounded-3xl p-8 flex items-center justify-center min-h-[400px] order-2 lg:order-1"
              style={{
                background: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.4)'
              }}
            >
              <Image
                src="/Lightning.png"
                alt="Lightning"
                width={600}
                height={600}
                className="object-contain opacity-80 w-full h-full max-h-[400px]"
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                MEV Proof
              </h2>
              <p className="text-xl leading-relaxed text-gray-custom-500">
                Jito bundles prevent frontrunning and sandwich attacks. Every transaction is atomic and MEV-protected. Trade without fear of being exploited.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="px-4 py-2 rounded-lg" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}>
                  <span className="text-sm font-medium text-white">Jito Bundles</span>
                </div>
                <div className="px-4 py-2 rounded-lg" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}>
                  <span className="text-sm font-medium text-white">Atomic Swaps</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Text Left, Visual Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Auto-Rotation
              </h2>
              <p className="text-xl leading-relaxed text-gray-custom-500">
                Fresh wallet for every trade. Zero address clustering. Our algorithm ensures you're never linked across multiple transactions. Complete anonymity, automated.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="px-4 py-2 rounded-lg" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}>
                  <span className="text-sm font-medium text-white">BIP39/44</span>
                </div>
                <div className="px-4 py-2 rounded-lg" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}>
                  <span className="text-sm font-medium text-white">Auto-Manage</span>
                </div>
              </div>
            </div>
            <div
              className="rounded-3xl p-8 flex items-center justify-center min-h-[400px]"
              style={{
                background: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.4)'
              }}
            >
              <Image
                src="/circle.png"
                alt="Rotation"
                width={600}
                height={600}
                className="object-contain opacity-80 w-full h-full max-h-[400px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Token Buttons */}
      <Footer />
    </div>
  );
}
