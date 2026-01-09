'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left side - Nav buttons */}
          <div className="flex gap-4">
            <a
              href="https://x.com/RedactedWallet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#ffffff'
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-sm font-medium">Follow us</span>
            </a>

            <Link
              href="/whitepaper"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#ffffff'
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">White Paper</span>
            </Link>

            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#ffffff'
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              <span className="text-sm font-medium">Roadmap</span>
            </Link>
          </div>

          {/* Right side - $Redacted button */}
          <a
            href="https://pump.fun/coin/HGoUj3YVj6EqG5iYkAf95jLh7KjGH84MuhadENb3pump"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
              color: '#000000',
              boxShadow: '0 3px 0 #888888, 0 4px 8px rgba(0, 0, 0, 0.3)',
              transform: 'translateY(0)',
              fontWeight: '600'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(1.5px)';
              e.currentTarget.style.boxShadow = '0 1.5px 0 #888888, 0 3px 6px rgba(0, 0, 0, 0.25)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 3px 0 #888888, 0 4px 8px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 3px 0 #888888, 0 4px 8px rgba(0, 0, 0, 0.3)';
            }}
          >
            <span className="relative z-10 text-sm font-bold">$Redacted</span>
            <svg className="w-3 h-3 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.1) 100%)'
              }}
            />
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen relative z-10 px-6 py-20">
        <div className="text-center max-w-6xl mx-auto">
          {/* Logo with glow effect */}
          <div className="inline-flex items-center justify-center w-40 h-40 mb-10 relative">
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                filter: 'blur(40px)',
                transform: 'scale(1.2)'
              }}
            />
            <Image
              src="/transparentlogo.png"
              alt="redacted"
              width={160}
              height={160}
              priority
              className="object-contain relative z-10 drop-shadow-2xl"
            />
          </div>

          {/* Heading with gradient */}
          <h1
            className="text-7xl md:text-9xl font-bold tracking-tighter mb-8"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #888888 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 24px rgba(255, 255, 255, 0.1))'
            }}
          >
            Redacted
          </h1>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl mb-6 font-medium" style={{ color: '#d1d5db', letterSpacing: '-0.02em' }}>
            1 Wallet. A thousand masks.
          </p>

          {/* Live Stats Ticker */}
          <div className="flex flex-wrap gap-6 justify-center mb-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium text-cyan-300">Live</span>
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

          {/* Description */}
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-lg md:text-xl leading-relaxed" style={{ color: '#9ca3af' }}>
              Trade high-frequency memecoins without ever revealing your identity.
              <br className="hidden md:block" />
              Become <span className="font-semibold" style={{ color: '#ffffff' }}>mathematically invisible</span> to copy-traders and MEV bots.
            </p>
          </div>

          {/* Security Badges */}
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-green-300">Non-Custodial</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-blue-300">Open Source</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-purple-300">BIP39/44 Standard</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              href="/auth/register"
              className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-semibold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: '#ffffff',
                color: '#000000',
                boxShadow: '0 0 40px rgba(255, 255, 255, 0.25), 0 8px 16px rgba(0, 0, 0, 0.3)',
                letterSpacing: '-0.01em',
                minWidth: '200px'
              }}
            >
              <span className="relative z-10">Get started</span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)'
                }}
              />
            </Link>

            <Link
              href="/auth/login"
              className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                border: '1.5px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                letterSpacing: '-0.01em',
                minWidth: '200px'
              }}
            >
              <span className="relative z-10">Sign in</span>
            </Link>
          </div>

          {/* How It Works - Simple 3 Steps */}
          <div className="mb-20 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">1</div>
                <h3 className="text-white font-medium mb-2">Create Account</h3>
                <p className="text-sm text-gray-400">Your master seed is encrypted with your password. Only you have access.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">2</div>
                <h3 className="text-white font-medium mb-2">Generate Ghost Wallets</h3>
                <p className="text-sm text-gray-400">Each trade uses a fresh wallet derived from your seed. No links.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">3</div>
                <h3 className="text-white font-medium mb-2">Trade Anonymously</h3>
                <p className="text-sm text-gray-400">MEV protection via Jito bundles. Auto-rotation keeps you invisible.</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Privacy First */}
            <div
              className="group p-10 rounded-3xl transition-all duration-500 hover:-translate-y-2 cursor-default"
              style={{
                background: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-4 text-xl tracking-tight">Privacy First</h3>
              <p className="text-base leading-relaxed" style={{ color: '#9ca3af' }}>
                Break on-chain links with cross-chain relay pools. Your history vanishes.
              </p>
            </div>

            {/* MEV Protected */}
            <div
              className="group p-10 rounded-3xl transition-all duration-500 hover:-translate-y-2 cursor-default"
              style={{
                background: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-4 text-xl tracking-tight">MEV Protected</h3>
              <p className="text-base leading-relaxed" style={{ color: '#9ca3af' }}>
                Jito bundles prevent frontrunning and sandwich attacks. Trade without fear.
              </p>
            </div>

            {/* Auto Rotation */}
            <div
              className="group p-10 rounded-3xl transition-all duration-500 hover:-translate-y-2 cursor-default"
              style={{
                background: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-4 text-xl tracking-tight">Auto Rotation</h3>
              <p className="text-base leading-relaxed" style={{ color: '#9ca3af' }}>
                Fresh wallet for every trade. Zero address clustering. Total anonymity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
