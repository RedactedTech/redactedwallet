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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto py-20">
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
        <p className="text-2xl md:text-3xl mb-10 font-medium" style={{ color: '#d1d5db', letterSpacing: '-0.02em' }}>
          1 Wallet. A thousand masks.
        </p>

        {/* Description */}
        <div className="max-w-3xl mx-auto mb-16">
          <p className="text-lg md:text-xl leading-relaxed" style={{ color: '#9ca3af' }}>
            Trade high-frequency memecoins without ever revealing your identity.
            <br className="hidden md:block" />
            Become <span className="font-semibold" style={{ color: '#ffffff' }}>mathematically invisible</span> to copy-traders and MEV bots.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-28">
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
  );
}
