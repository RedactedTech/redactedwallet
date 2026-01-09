'use client';

import Link from 'next/link';

export default function Privacy() {
  return (
    <div className="min-h-screen">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Title Section */}
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
            Privacy Policy
          </h1>
          <p className="text-xl mb-8 text-gray-custom-500">
            Last updated: January 2026
          </p>
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Our Commitment to Privacy</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                At Redacted, privacy is not just a feature—it's our core mission. This Privacy Policy explains how
                we handle your information when you use our privacy-focused trading platform.
              </p>
              <p>
                <span className="font-semibold text-white">Key principle:</span> We cannot access, view, or control
                your funds or private keys. We design our systems to minimize data collection and maximize your anonymity.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Information We Collect</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(30, 30, 30, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}
              >
                <h3 className="text-xl font-semibold text-white mb-3">Account Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-custom-500">
                  <li>Username (optional, non-identifying)</li>
                  <li>Email address (for account recovery only)</li>
                  <li>Encrypted master seed (encrypted with your password, we cannot decrypt it)</li>
                  <li>Encrypted session passwords (for automated trade exits)</li>
                </ul>
              </div>

              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(30, 30, 30, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}
              >
                <h3 className="text-xl font-semibold text-white mb-3">Usage Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-custom-500">
                  <li>Wallet creation timestamps (not linked to on-chain addresses)</li>
                  <li>Trade entry/exit conditions (take profit, stop loss settings)</li>
                  <li>Basic analytics (page views, feature usage—anonymized)</li>
                  <li>Error logs (for debugging, no personal data included)</li>
                </ul>
              </div>

              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(30, 30, 30, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}
              >
                <h3 className="text-xl font-semibold text-white mb-3">What We DON'T Collect</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-custom-500">
                  <li>Your private keys or seed phrases (stored encrypted, we cannot access)</li>
                  <li>Your wallet balances or transaction history</li>
                  <li>Your trading strategies or portfolio composition</li>
                  <li>Location data, device fingerprints, or IP logs</li>
                  <li>Behavioral tracking across other websites</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">How We Use Your Information</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>We use the minimal information we collect to:</p>
              <ul className="list-disc list-inside space-y-3 ml-6 text-gray-custom-500">
                <li>Provide and maintain the Service (authentication, session management)</li>
                <li>Execute automated trade exits based on your configured conditions</li>
                <li>Recover your account in case you forget your username (via email)</li>
                <li>Improve the Service's reliability and performance</li>
                <li>Detect and prevent security threats or abuse</li>
                <li>Comply with legal obligations (only if legally required)</li>
              </ul>
              <p className="font-semibold text-white mt-4">
                We never use your data for advertising, profiling, or sale to third parties.
              </p>
            </div>
          </section>

          {/* Data Security */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Data Security</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-6 text-gray-custom-500">
                <li>
                  <span className="font-semibold text-white">AES-256 encryption:</span> Your master seed is encrypted
                  with your password using AES-256-CBC. We store only the encrypted version.
                </li>
                <li>
                  <span className="font-semibold text-white">Password hashing:</span> Passwords are hashed using bcrypt
                  with high iteration counts. We never store plaintext passwords.
                </li>
                <li>
                  <span className="font-semibold text-white">JWT authentication:</span> Short-lived access tokens
                  (15 minutes) and refresh tokens (7 days) for secure session management.
                </li>
                <li>
                  <span className="font-semibold text-white">Database encryption:</span> All sensitive data is encrypted
                  at rest in our PostgreSQL database.
                </li>
                <li>
                  <span className="font-semibold text-white">HTTPS/TLS:</span> All communication between your browser
                  and our servers is encrypted using TLS 1.3.
                </li>
              </ul>
              <p className="font-semibold text-white mt-4">
                Despite these measures, no system is 100% secure. You are responsible for keeping your credentials safe.
              </p>
            </div>
          </section>

          {/* Blockchain Privacy */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">On-Chain Privacy</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                All blockchain transactions are public and permanent. Redacted enhances your privacy by:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-6 text-gray-custom-500">
                <li>
                  Generating fresh ghost wallets for each trade (unlinkable on-chain)
                </li>
                <li>
                  Breaking transaction linkability through relay mechanisms (planned)
                </li>
                <li>
                  Using Jupiter aggregator to minimize on-chain footprints
                </li>
                <li>
                  Burning wallets after use to prevent future identification
                </li>
              </ul>
              <p className="mt-4">
                <span className="font-semibold text-white">Important:</span> While Redacted provides strong privacy
                guarantees, blockchain analysis can potentially de-anonymize transactions if combined with other data
                sources. Use the Service responsibly and understand the limits of on-chain privacy.
              </p>
            </div>
          </section>

          {/* Data Retention */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Data Retention</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>We retain your data for as long as your account is active. You can request account deletion at any time by:</p>
              <ul className="list-disc list-inside space-y-2 ml-6 text-gray-custom-500">
                <li>Contacting us via Twitter/X DM</li>
                <li>Using the account deletion feature (coming soon)</li>
              </ul>
              <p className="mt-4">
                Upon deletion, we will:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6 text-gray-custom-500">
                <li>Permanently delete your encrypted seed and all account data</li>
                <li>Remove all personal information from our databases</li>
                <li>Retain anonymized analytics for up to 90 days for service improvement</li>
              </ul>
              <p className="font-semibold text-white mt-4">
                Note: Blockchain transactions are permanent and cannot be deleted.
              </p>
            </div>
          </section>

          {/* Third-Party Services */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Third-Party Services</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                We integrate with the following third-party services:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-6 text-gray-custom-500">
                <li>
                  <span className="font-semibold text-white">Helius (Solana RPC):</span> Broadcasts transactions to the
                  Solana blockchain. Helius may log IP addresses and transaction data.
                </li>
                <li>
                  <span className="font-semibold text-white">Jupiter API:</span> Provides swap quotes and routing.
                  Jupiter receives token addresses and amounts but not your identity.
                </li>
                <li>
                  <span className="font-semibold text-white">DexScreener:</span> Fetches token prices and metadata.
                  No personal data is shared.
                </li>
                <li>
                  <span className="font-semibold text-white">Railway (hosting):</span> Hosts our backend infrastructure.
                  Subject to Railway's privacy policy.
                </li>
              </ul>
              <p className="mt-4">
                We carefully select providers that respect user privacy. However, we are not responsible for their
                data practices. Review their privacy policies independently.
              </p>
            </div>
          </section>

          {/* Your Rights */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Your Privacy Rights</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                Depending on your jurisdiction, you may have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-6 text-gray-custom-500">
                <li><span className="font-semibold text-white">Access:</span> Request a copy of your personal data</li>
                <li><span className="font-semibold text-white">Correction:</span> Update inaccurate information</li>
                <li><span className="font-semibold text-white">Deletion:</span> Request account and data deletion</li>
                <li><span className="font-semibold text-white">Portability:</span> Export your data in a machine-readable format</li>
                <li><span className="font-semibold text-white">Objection:</span> Object to certain data processing activities</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us via{' '}
                <a
                  href="https://x.com/RedactedWallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-custom-300 hover:text-white transition-colors"
                >
                  @RedactedWallet
                </a>{' '}
                on Twitter/X.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Children's Privacy</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                The Service is not intended for individuals under 18 years of age. We do not knowingly collect
                personal information from children. If you believe a child has provided us with personal data,
                please contact us immediately.
              </p>
            </div>
          </section>

          {/* Changes */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Changes to This Policy</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                We may update this Privacy Policy periodically. Material changes will be notified through the Service
                or via email. The "Last updated" date at the top indicates when this policy was last revised.
              </p>
              <p>
                Your continued use of the Service after changes take effect constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* Contact */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Contact Us</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                If you have questions or concerns about this Privacy Policy:
              </p>
              <ul className="space-y-2 ml-4">
                <li>
                  <span className="font-semibold text-white">Twitter/X:</span>{' '}
                  <a
                    href="https://x.com/RedactedWallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-custom-300 hover:text-white transition-colors"
                  >
                    @RedactedWallet
                  </a>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff'
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
