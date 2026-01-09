'use client';

import Link from 'next/link';

export default function OpenSource() {
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
            Open Source
          </h1>
          <p className="text-xl mb-8 text-gray-custom-500">
            Built on the shoulders of giants
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-16">
          {/* Philosophy */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Our Philosophy</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                Redacted is built on the foundation of open source software. We believe in transparency, community
                collaboration, and giving back to the ecosystems that make our work possible.
              </p>
              <p>
                While our core application code is proprietary to protect our users' privacy infrastructure, we rely
                heavily on open source libraries and tools. This page acknowledges those projects and their licenses.
              </p>
            </div>
          </section>

          {/* Frontend Dependencies */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Frontend Technologies</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>Our frontend is powered by modern web technologies:</p>

              <div className="space-y-6 mt-8">
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    React & Next.js
                    <span className="text-sm font-normal text-gray-custom-500 ml-3">MIT License</span>
                  </h3>
                  <p className="text-base mb-2">
                    The foundation of our user interface. React provides the component architecture, while Next.js 16
                    delivers server-side rendering, App Router, and optimized performance.
                  </p>
                  <a
                    href="https://github.com/vercel/next.js"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-custom-300 hover:text-white transition-colors text-sm"
                  >
                    github.com/vercel/next.js →
                  </a>
                </div>

                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    TailwindCSS
                    <span className="text-sm font-normal text-gray-custom-500 ml-3">MIT License</span>
                  </h3>
                  <p className="text-base mb-2">
                    Utility-first CSS framework that powers our sleek, responsive design system. TailwindCSS 4 enables
                    rapid UI development with consistent styling.
                  </p>
                  <a
                    href="https://github.com/tailwindlabs/tailwindcss"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-custom-300 hover:text-white transition-colors text-sm"
                  >
                    github.com/tailwindlabs/tailwindcss →
                  </a>
                </div>

                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    TypeScript
                    <span className="text-sm font-normal text-gray-custom-500 ml-3">Apache 2.0 License</span>
                  </h3>
                  <p className="text-base mb-2">
                    Strongly typed JavaScript that catches errors at compile time and improves code quality across
                    the entire application.
                  </p>
                  <a
                    href="https://github.com/microsoft/TypeScript"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-custom-300 hover:text-white transition-colors text-sm"
                  >
                    github.com/microsoft/TypeScript →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Backend Dependencies */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Backend Technologies</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>Our backend services are built with robust, battle-tested frameworks:</p>

              <div className="space-y-6 mt-8">
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Express.js
                    <span className="text-sm font-normal text-gray-custom-500 ml-3">MIT License</span>
                  </h3>
                  <p className="text-base mb-2">
                    Minimalist web framework for Node.js that powers our REST API. Express handles routing,
                    middleware, and request processing with simplicity and flexibility.
                  </p>
                  <a
                    href="https://github.com/expressjs/express"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-custom-300 hover:text-white transition-colors text-sm"
                  >
                    github.com/expressjs/express →
                  </a>
                </div>

                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    PostgreSQL
                    <span className="text-sm font-normal text-gray-custom-500 ml-3">PostgreSQL License</span>
                  </h3>
                  <p className="text-base mb-2">
                    Advanced open source relational database. We use PostgreSQL for secure storage of encrypted user
                    data with ACID compliance and robust transaction support.
                  </p>
                  <a
                    href="https://www.postgresql.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-custom-300 hover:text-white transition-colors text-sm"
                  >
                    postgresql.org →
                  </a>
                </div>

                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Node.js
                    <span className="text-sm font-normal text-gray-custom-500 ml-3">MIT License</span>
                  </h3>
                  <p className="text-base mb-2">
                    JavaScript runtime built on Chrome's V8 engine. Node.js enables our backend to handle concurrent
                    connections efficiently with its event-driven architecture.
                  </p>
                  <a
                    href="https://github.com/nodejs/node"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-custom-300 hover:text-white transition-colors text-sm"
                  >
                    github.com/nodejs/node →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Blockchain */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Blockchain & Cryptography</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>Our privacy and blockchain integrations depend on:</p>

              <div className="space-y-6 mt-8">
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Solana Web3.js
                    <span className="text-sm font-normal text-gray-custom-500 ml-3">MIT License</span>
                  </h3>
                  <p className="text-base mb-2">
                    JavaScript SDK for interacting with the Solana blockchain. Handles transaction building, account
                    management, and RPC communication.
                  </p>
                  <a
                    href="https://github.com/solana-labs/solana-web3.js"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-custom-300 hover:text-white transition-colors text-sm"
                  >
                    github.com/solana-labs/solana-web3.js →
                  </a>
                </div>

                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    BIP39 & ED25519-HD-Key
                    <span className="text-sm font-normal text-gray-custom-500 ml-3">ISC & MIT Licenses</span>
                  </h3>
                  <p className="text-base mb-2">
                    Hierarchical deterministic wallet generation libraries. Enable us to derive unlimited ghost wallets
                    from a single master seed using BIP39/44 standards.
                  </p>
                  <a
                    href="https://github.com/bitcoinjs/bip39"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-custom-300 hover:text-white transition-colors text-sm"
                  >
                    github.com/bitcoinjs/bip39 →
                  </a>
                </div>

                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    bcryptjs
                    <span className="text-sm font-normal text-gray-custom-500 ml-3">MIT License</span>
                  </h3>
                  <p className="text-base mb-2">
                    Password hashing library implementing the bcrypt algorithm. Secures user passwords with adaptive
                    hashing that remains resistant to brute-force attacks.
                  </p>
                  <a
                    href="https://github.com/dcodeIO/bcrypt.js"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-custom-300 hover:text-white transition-colors text-sm"
                  >
                    github.com/dcodeIO/bcrypt.js →
                  </a>
                </div>

                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(30, 30, 30, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Node.js Crypto
                    <span className="text-sm font-normal text-gray-custom-500 ml-3">MIT License</span>
                  </h3>
                  <p className="text-base mb-2">
                    Built-in cryptographic library for Node.js. Provides AES-256 encryption for securing master seeds
                    and session passwords in our database.
                  </p>
                  <a
                    href="https://nodejs.org/api/crypto.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-custom-300 hover:text-white transition-colors text-sm"
                  >
                    nodejs.org/api/crypto →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Libraries */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Additional Libraries</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>We also rely on these fantastic open source tools:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-xl" style={{ background: 'rgba(30, 30, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-semibold text-white mb-1">Zod</h4>
                  <p className="text-sm text-gray-custom-500">Schema validation for TypeScript</p>
                  <span className="text-xs text-gray-custom-600">MIT License</span>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'rgba(30, 30, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-semibold text-white mb-1">jsonwebtoken</h4>
                  <p className="text-sm text-gray-custom-500">JWT authentication tokens</p>
                  <span className="text-xs text-gray-custom-600">MIT License</span>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'rgba(30, 30, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-semibold text-white mb-1">tsx</h4>
                  <p className="text-sm text-gray-custom-500">TypeScript execution runtime</p>
                  <span className="text-xs text-gray-custom-600">MIT License</span>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'rgba(30, 30, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-semibold text-white mb-1">dotenv</h4>
                  <p className="text-sm text-gray-custom-500">Environment variable management</p>
                  <span className="text-xs text-gray-custom-600">BSD License</span>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'rgba(30, 30, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-semibold text-white mb-1">cors</h4>
                  <p className="text-sm text-gray-custom-500">Cross-origin resource sharing</p>
                  <span className="text-xs text-gray-custom-600">MIT License</span>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'rgba(30, 30, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h4 className="font-semibold text-white mb-1">bs58</h4>
                  <p className="text-sm text-gray-custom-500">Base58 encoding for Solana addresses</p>
                  <span className="text-xs text-gray-custom-600">MIT License</span>
                </div>
              </div>
            </div>
          </section>

          {/* License Compliance */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">License Compliance</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                We respect and comply with all open source licenses. Each library mentioned above is used in
                accordance with its respective license terms.
              </p>
              <p>
                For a complete list of all dependencies and their licenses, you can run:
              </p>
              <div
                className="p-4 rounded-xl mt-4 font-mono text-sm"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#10b981'
                }}
              >
                npm list --depth=0
              </div>
            </div>
          </section>

          {/* Gratitude */}
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
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Thank You</h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-custom-400">
              <p>
                We extend our deepest gratitude to all open source maintainers and contributors. Your work enables
                projects like Redacted to exist and thrive.
              </p>
              <p>
                If you notice any attribution errors or have questions about our use of open source software,
                please contact us.
              </p>
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
