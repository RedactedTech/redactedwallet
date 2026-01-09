'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

// Phase data structure
const roadmapPhases = [
  {
    id: 1,
    title: "Phase 1 - Foundation",
    timeline: "Q1 2026 (Current)",
    status: "completed",
    description: "Core privacy infrastructure for anonymous trading",
    features: [
      { name: "Ghost wallet infrastructure", completed: true },
      { name: "Jupiter V6 integration", completed: true },
      { name: "Auto-exit monitoring system", completed: true },
      { name: "BIP39 HD wallet derivation", completed: true },
      { name: "Session-based encryption", completed: true }
    ],
    glow: "rgba(16, 185, 129, 0.15)"
  },
  {
    id: 2,
    title: "Phase 2 - Enhanced Privacy",
    timeline: "Q2 2026",
    status: "in_progress",
    description: "Advanced privacy layers and anonymization",
    features: [
      { name: "Cross-chain relay pools", completed: false },
      { name: "ZK-SNARK transaction proofs", completed: false },
      { name: "Multi-hop routing system", completed: false },
      { name: "Privacy score dashboard", completed: false },
      { name: "Decoy transaction generation", completed: false }
    ],
    glow: "rgba(59, 130, 246, 0.15)"
  },
  {
    id: 3,
    title: "Phase 3 - Wallet Extension",
    timeline: "Q3 2026",
    status: "upcoming",
    description: "Browser extension for seamless private trading",
    features: [
      { name: "Chrome/Firefox extension", completed: false },
      { name: "One-click ghost wallet generation", completed: false },
      { name: "Hardware wallet integration (Ledger/Trezor)", completed: false },
      { name: "Cross-chain bridge integration", completed: false },
      { name: "Mobile app (iOS/Android)", completed: false }
    ],
    glow: "rgba(255, 255, 255, 0.05)"
  },
  {
    id: 4,
    title: "Phase 4 - Decentralized Network",
    timeline: "Q4 2026",
    status: "future",
    description: "Fully decentralized privacy infrastructure",
    features: [
      { name: "Decentralized relay node network", completed: false },
      { name: "ZK-rollup settlement layer", completed: false },
      { name: "Private lending/borrowing protocol", completed: false },
      { name: "DAO governance for privacy standards", completed: false },
      { name: "Privacy-preserving analytics", completed: false }
    ],
    glow: "rgba(255, 255, 255, 0.03)"
  }
];

// Feature Item Component
const FeatureItem = ({ name, completed }: { name: string; completed: boolean }) => (
  <li className="flex items-center gap-3">
    {completed ? (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#10b981"
        strokeWidth={2}
        style={{
          animation: 'checkPulse 2s ease-in-out infinite'
        }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ) : (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#6b7280"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )}
    <span className={completed ? 'text-gray-custom-400' : 'text-gray-custom-500'}>{name}</span>
  </li>
);

// Phase Card Component
const PhaseCard = ({ phase, index }: { phase: typeof roadmapPhases[0]; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative mb-16"
      style={{
        opacity: 0,
        animation: 'fadeInUp 0.6s ease-out forwards',
        animationDelay: `${index * 0.15}s`
      }}
    >
      {/* Timeline dot */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-2 w-6 h-6 rounded-full z-10"
        style={{
          background: phase.status === 'completed'
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : phase.status === 'in_progress'
            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
            : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          border: '3px solid #000000',
          boxShadow: `0 0 20px ${phase.glow}`
        }}
      />

      {/* Card */}
      <div
        className="group p-8 md:p-10 rounded-3xl transition-all duration-500 cursor-default"
        style={{
          background: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderTop: '2px solid rgba(255, 255, 255, 0.15)',
          boxShadow: isHovered
            ? `0 12px 40px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset, 0 0 80px ${phase.glow}`
            : `0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset, 0 0 60px ${phase.glow}`,
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Status Badge and Timeline */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide"
            style={{
              background: phase.status === 'completed'
                ? 'rgba(16, 185, 129, 0.15)'
                : phase.status === 'in_progress'
                ? 'rgba(59, 130, 246, 0.15)'
                : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${phase.status === 'completed'
                ? 'rgba(16, 185, 129, 0.3)'
                : phase.status === 'in_progress'
                ? 'rgba(59, 130, 246, 0.3)'
                : 'rgba(255, 255, 255, 0.1)'}`,
              color: phase.status === 'completed'
                ? '#10b981'
                : phase.status === 'in_progress'
                ? '#3b82f6'
                : '#9ca3af'
            }}
          >
            {phase.status === 'completed' ? '✓ Completed' :
             phase.status === 'in_progress' ? '◐ In Progress' :
             'Upcoming'}
          </span>
          <span className="text-sm font-medium text-gray-custom-500">{phase.timeline}</span>
        </div>

        {/* Title */}
        <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
          {phase.title}
        </h3>

        {/* Description */}
        <p className="text-base md:text-lg mb-6 text-gray-custom-500">
          {phase.description}
        </p>

        {/* Features List */}
        <ul className="space-y-3">
          {phase.features.map((feature, idx) => (
            <FeatureItem key={idx} {...feature} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default function Roadmap() {
  return (
    <div className="min-h-screen">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes drawLine {
          from {
            height: 0;
          }
          to {
            height: 100%;
          }
        }

        @keyframes checkPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        .timeline-line {
          animation: drawLine 1.5s ease-out forwards;
        }
      `}</style>

      {/* Hero Section */}
      <div className="px-6 py-20 max-w-7xl mx-auto text-center">
        <h1
          className="text-6xl md:text-8xl font-bold mb-6 tracking-tight"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #888888 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Roadmap
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-custom-500">
          The future of privacy-first trading
        </p>
      </div>

      {/* Timeline Section */}
      <div className="px-6 py-12 max-w-5xl mx-auto relative">
        {/* Central vertical timeline line */}
        <div
          className="timeline-line absolute left-1/2 -translate-x-1/2 top-0 w-0.5"
          style={{
            height: '100%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)',
            zIndex: 0
          }}
        />

        {/* Phase Cards */}
        <div className="relative z-10">
          {roadmapPhases.map((phase, index) => (
            <PhaseCard key={phase.id} phase={phase} index={index} />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div
        className="px-6 py-20 max-w-4xl mx-auto text-center mb-12 rounded-3xl"
        style={{
          background: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderTop: '2px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5)'
        }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Start Trading Privately
        </h2>
        <p className="text-lg mb-8 text-gray-custom-500">
          Join us in building the future of anonymous trading
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105"
            style={{
              background: '#ffffff',
              color: '#000000',
              fontWeight: '600'
            }}
          >
            <span>Get started</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <a
            href="https://x.com/redactedtrade"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontWeight: '600'
            }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Follow us</span>
          </a>
        </div>
      </div>
    </div>
  );
}
