'use client';

import Link from 'next/link';

export default function Terms() {
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
            Terms of Service
          </h1>
          <p className="text-xl mb-8 text-gray-custom-500">
            Last updated: January 2026
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-16">
          {/* Agreement */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">1. Agreement to Terms</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                By accessing or using Redacted ("the Service"), you agree to be bound by these Terms of Service
                ("Terms"). If you disagree with any part of these terms, you do not have permission to access the Service.
              </p>
              <p>
                The Service provides privacy-focused cryptocurrency trading tools on the Solana blockchain. Your use
                of the Service is subject to your acceptance of and compliance with these Terms and our Privacy Policy.
              </p>
            </div>
          </section>

          {/* Non-Custodial */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">2. Non-Custodial Service</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                Redacted is a <span className="font-semibold text-white">non-custodial platform</span>. We do not have
                access to, store, or control your private keys or funds at any time. You are solely responsible for:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-6 text-gray-custom-500">
                <li>Securely storing your master seed phrase and passwords</li>
                <li>Maintaining the security of your account credentials</li>
                <li>All transactions executed through your wallets</li>
                <li>Any losses resulting from compromised credentials or unauthorized access</li>
              </ul>
              <p className="font-semibold text-white">
                We cannot recover lost passwords, seed phrases, or funds. There is no customer support for lost credentials.
              </p>
            </div>
          </section>

          {/* Risks */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">3. Trading Risks</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                Cryptocurrency trading involves substantial risk of loss. By using the Service, you acknowledge and
                accept that:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-6 text-gray-custom-500">
                <li>Digital asset markets are highly volatile and unpredictable</li>
                <li>You may lose some or all of your invested capital</li>
                <li>Past performance does not guarantee future results</li>
                <li>Blockchain transactions are irreversible once confirmed</li>
                <li>Smart contract vulnerabilities or bugs may result in loss of funds</li>
                <li>Network congestion or failures may affect transaction execution</li>
              </ul>
              <p className="font-semibold text-white">
                You trade at your own risk. We provide tools but do not provide investment advice or guarantees.
              </p>
            </div>
          </section>

          {/* Prohibited Uses */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">4. Prohibited Uses</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-3 ml-6 text-gray-custom-500">
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Engage in money laundering, terrorist financing, or other illegal activities</li>
                <li>Manipulate markets, engage in wash trading, or create artificial trading activity</li>
                <li>Attempt to gain unauthorized access to other users' accounts or wallets</li>
                <li>Interfere with or disrupt the Service's infrastructure or security</li>
                <li>Use the Service if you are located in a sanctioned jurisdiction</li>
                <li>Circumvent any content filtering or access control measures</li>
              </ul>
              <p>
                We reserve the right to terminate access for any user violating these terms without prior notice.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">5. Intellectual Property</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                The Service and its original content, features, and functionality are owned by Redacted and are
                protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You may not copy, modify, distribute, sell, or lease any part of our Service without explicit
                written permission. Open source components are licensed under their respective licenses (see Open Source page).
              </p>
            </div>
          </section>

          {/* Disclaimer */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">6. Disclaimer of Warranties</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                The Service is provided on an <span className="font-semibold text-white">"AS IS"</span> and{' '}
                <span className="font-semibold text-white">"AS AVAILABLE"</span> basis. We make no warranties,
                expressed or implied, regarding:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-6 text-gray-custom-500">
                <li>Uninterrupted or error-free operation of the Service</li>
                <li>Accuracy, reliability, or completeness of information or data</li>
                <li>Security or freedom from viruses or harmful components</li>
                <li>Results or outcomes from using the Service</li>
                <li>Merchantability or fitness for a particular purpose</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">7. Limitation of Liability</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                To the maximum extent permitted by law, Redacted and its affiliates shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-6 text-gray-custom-500">
                <li>Loss of profits, revenue, or data</li>
                <li>Loss of cryptocurrency or digital assets</li>
                <li>Business interruption or opportunity costs</li>
                <li>Unauthorized access to or alteration of transmissions or data</li>
                <li>Third-party conduct or content on the Service</li>
              </ul>
              <p className="font-semibold text-white">
                In no event shall our total liability exceed the amount you paid to us in the past 12 months, or $100 USD,
                whichever is greater.
              </p>
            </div>
          </section>

          {/* Indemnification */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">8. Indemnification</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                You agree to indemnify, defend, and hold harmless Redacted, its affiliates, officers, directors,
                employees, and agents from any claims, liabilities, damages, losses, costs, or expenses (including
                reasonable attorney's fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-6 text-gray-custom-500">
                <li>Your use or misuse of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of third parties</li>
                <li>Your violation of applicable laws or regulations</li>
              </ul>
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">9. Changes to Terms</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                We reserve the right to modify or replace these Terms at any time at our sole discretion. Material
                changes will be notified through the Service or via email. Your continued use of the Service after
                changes become effective constitutes acceptance of the revised Terms.
              </p>
              <p>
                It is your responsibility to review these Terms periodically. The "Last updated" date at the top
                indicates when these Terms were last revised.
              </p>
            </div>
          </section>

          {/* Governing Law */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">10. Governing Law</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to
                conflict of law provisions. Any disputes arising from these Terms or the Service shall be resolved
                through binding arbitration, except where prohibited by law.
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">11. Contact Information</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                If you have questions about these Terms, please contact us:
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
