import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, runMigrations } from './config/database';
import { testSolanaConnection } from './config/solana';
import authRoutes from './api/routes/auth';
import walletRoutes from './api/routes/wallets';
import tradeRoutes from './api/routes/trades';
import tokenRoutes from './api/routes/tokens';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS configuration
const allowedOrigins = [
  'http://localhost:3500',
  'https://redacted-production-ee5d.up.railway.app',
  'https://redactedprotocol.dev',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      headers: {
        authorization: req.headers.authorization ? 'Bearer ***' : undefined,
        'content-type': req.headers['content-type']
      }
    });
    next();
  });
}

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'redacted API is running',
    tagline: '1 Wallet. A thousand masks',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================================
// API ROUTES
// ============================================================

app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/tokens', tokenRoutes);

// TODO: Add more routes as we build features
// app.use('/api/strategies', strategyRoutes);
// app.use('/api/relay', relayRoutes);
// app.use('/api/portfolio', portfolioRoutes);

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================================
// SERVER STARTUP
// ============================================================

const startServer = async () => {
  try {
    console.log('\n🚀 Starting redacted server...\n');

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Run migrations (check if tables exist)
    await runMigrations();

    // Test Solana connection
    const solanaConnected = await testSolanaConnection();
    if (!solanaConnected) {
      console.warn('⚠️  Failed to connect to Solana RPC. Wallet features may not work.');
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log('\n✅ Server is running!');
      console.log(`📍 API: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`👻 Wallets: http://localhost:${PORT}/api/wallets`);
      console.log(`💰 Trades: http://localhost:${PORT}/api/trades`);
      console.log(`🪙 Tokens: http://localhost:${PORT}/api/tokens`);
      console.log(`\n💀 "1 Wallet. A thousand masks"\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
