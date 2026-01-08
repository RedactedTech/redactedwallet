import 'dotenv/config';
import { pool } from '../config/database';
import { TradeService } from '../services/TradeService';
import { Trade } from '../types';

/**
 * Trade Monitor Worker
 *
 * Runs continuously to check exit conditions on open trades
 * and automatically close them when conditions are met.
 */

const MONITOR_INTERVAL_MS = 30 * 1000; // Check every 30 seconds
let isShuttingDown = false;
let monitorInterval: NodeJS.Timeout | null = null;

/**
 * Main monitoring function
 * Checks all open trades and closes them if exit conditions are met
 */
async function monitorTrades(): Promise<void> {
  try {
    console.log('🔍 Checking open trades for exit conditions...');

    // Fetch all open trades
    const result = await pool.query<Trade>(
      `SELECT * FROM trades
       WHERE status = 'open'
       ORDER BY entry_timestamp ASC`
    );

    const openTrades = result.rows;

    if (openTrades.length === 0) {
      console.log('📭 No open trades to monitor');
      return;
    }

    console.log(`📊 Found ${openTrades.length} open trade(s) to check`);

    let closedCount = 0;
    let errorCount = 0;

    // Check exit conditions for each trade
    for (const trade of openTrades) {
      try {
        const exitCheck = await TradeService.checkExitConditions(trade);

        if (exitCheck.shouldExit && exitCheck.reason) {
          console.log(`🎯 Exit condition met for trade ${trade.id}`);
          console.log(`   Reason: ${exitCheck.reason}`);
          console.log(`   Current Price: $${exitCheck.currentPrice?.toFixed(8)}`);
          console.log(`   P&L: ${exitCheck.plPct?.toFixed(2)}%`);

          try {
            // Close trade using stored session password
            const closedTrade = await TradeService.closeTradeAutomatically(
              trade.id,
              exitCheck.reason
            );

            console.log(`✅ Successfully closed trade ${trade.id}`);
            console.log(`   Exit Price: $${closedTrade.exit_price_usd || 'N/A'}`);
            console.log(`   Final P&L: ${closedTrade.profit_loss_pct?.toFixed(2) || 'N/A'}%`);

            closedCount++;
          } catch (closeError: any) {
            console.error(`❌ Failed to close trade ${trade.id}:`, closeError.message);

            // Log the exit signal for manual review
            await pool.query(
              `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                trade.user_id,
                'auto_close_failed',
                'trade',
                trade.id,
                JSON.stringify({
                  reason: exitCheck.reason,
                  current_price: exitCheck.currentPrice,
                  pl_pct: exitCheck.plPct,
                  error: closeError.message,
                  timestamp: new Date().toISOString(),
                }),
              ]
            );

            errorCount++;
          }
        }
      } catch (error: any) {
        console.error(`❌ Error checking trade ${trade.id}:`, error.message);
        errorCount++;
      }
    }

    if (closedCount > 0) {
      console.log(`✅ Closed ${closedCount} trade(s)`);
    }

    if (errorCount > 0) {
      console.log(`⚠️ ${errorCount} error(s) occurred`);
    }
  } catch (error: any) {
    console.error('❌ Error in trade monitoring loop:', error.message);
  }
}

/**
 * Start the monitoring loop
 */
function startMonitoring(): void {
  console.log('🚀 Starting trade monitor...');
  console.log(`⏱️  Check interval: ${MONITOR_INTERVAL_MS / 1000} seconds`);

  // Run immediately on start
  monitorTrades();

  // Then run on interval
  monitorInterval = setInterval(() => {
    if (!isShuttingDown) {
      monitorTrades();
    }
  }, MONITOR_INTERVAL_MS);

  console.log('✅ Trade monitor started');
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  isShuttingDown = true;

  // Stop the monitoring interval
  if (monitorInterval) {
    clearInterval(monitorInterval);
    console.log('✅ Stopped monitoring interval');
  }

  // Close database connection
  try {
    await pool.end();
    console.log('✅ Database connection closed');
  } catch (error: any) {
    console.error('❌ Error closing database:', error.message);
  }

  console.log('👋 Trade monitor shut down successfully');
  process.exit(0);
}

/**
 * Register shutdown handlers
 */
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

/**
 * Start the worker
 */
console.log('\n💀 Redacted - Trade Monitor Worker');
console.log('===================================\n');

startMonitoring();
