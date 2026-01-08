# Trade Monitor Worker

Automatic trade exit monitoring and execution worker for Redacted.

## Overview

The Trade Monitor Worker is a background service that:
- Monitors all open trades every 30 seconds
- Checks if exit conditions are met (take profit, stop loss, trailing stop, timeout)
- Automatically closes trades when conditions trigger
- Logs all actions for audit purposes

## How It Works

### 1. Monitoring Loop
- Queries all trades with `status = 'open'` from database
- For each trade, calls `TradeService.checkExitConditions()`
- Fetches current price from DexScreener API
- Calculates real-time P&L percentage

### 2. Exit Conditions
The worker checks four types of exit conditions:

**Take Profit**: Closes if `P&L% >= take_profit_pct`
- Example: If take_profit_pct = 50%, closes when profit reaches +50%

**Stop Loss**: Closes if `P&L% <= -stop_loss_pct`
- Example: If stop_loss_pct = 20%, closes when loss reaches -20%

**Trailing Stop**: Closes if profit erodes from peak
- Example: If trailing_stop_pct = 10%, closes when profit drops 10% from highest point

**Timeout**: Closes if hold time exceeds maximum
- Example: If max_hold_time_minutes = 60, closes after 60 minutes regardless of P&L

### 3. Automatic Execution
When exit conditions trigger:
1. Worker calls `TradeService.closeTradeAutomatically(tradeId, reason)`
2. Method retrieves stored `session_password_encrypted` from trade record
3. Decrypts password and derives wallet keypair
4. Executes sell transaction on Solana via Jupiter
5. Updates trade record with exit data and P&L
6. Logs success/failure in audit logs

### 4. Security Model
- **Session Password Storage**: Each trade stores an encrypted `session_password_encrypted`
- **No Plain Passwords**: Password encrypted with JWT secret + userId
- **Background Access**: Worker can derive keypairs without user interaction
- **Audit Trail**: All automatic closures logged with reason and P&L

## Running the Worker

### Development Mode
```bash
# Run worker standalone
npm run dev:worker

# Run full stack (frontend + backend + worker)
npm run dev
```

### Production Mode
```bash
# Run worker
npm run start:worker

# Or using pm2/systemd
tsx backend/src/workers/tradeMonitor.ts
```

### Graceful Shutdown
The worker handles `SIGTERM` and `SIGINT` signals:
- Stops accepting new monitoring cycles
- Completes current cycle
- Closes database connections
- Exits cleanly

## Configuration

### Environment Variables
No additional env vars required - uses same `.env` as main backend:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - For decrypting session passwords

### Tuning Parameters
In `tradeMonitor.ts`:
```typescript
const MONITOR_INTERVAL_MS = 30 * 1000; // Check every 30 seconds
```

**Recommendations**:
- **High Frequency Trading**: 15-30 seconds
- **Normal Trading**: 30-60 seconds
- **Conservative**: 60-120 seconds

**Trade-offs**:
- Faster = More responsive exits, higher API costs, more database load
- Slower = Cheaper, less load, but may miss optimal exit prices

## Monitoring & Logs

### Console Output
```
🔍 Checking open trades for exit conditions...
📊 Found 3 open trade(s) to check
📊 Trade abc123: Entry $0.00001234, Current $0.00001850, P&L: +50.00%
🎯 Exit condition met for trade abc123
   Reason: take_profit
   Current Price: $0.00001850
   P&L: +50.00%
✅ Successfully closed trade abc123
   Exit Price: $0.00001850
   Final P&L: +49.87%
✅ Closed 1 trade(s)
```

### Error Handling
If trade closure fails:
- Error logged to console
- Audit log entry created with `action: 'auto_close_failed'`
- Trade remains open for manual review
- Worker continues monitoring other trades

### Database Audit Logs
All actions logged to `audit_logs` table:
```sql
SELECT * FROM audit_logs
WHERE action IN ('exit_signal_detected', 'auto_close_failed')
ORDER BY created_at DESC;
```

## Architecture

### Dependencies
```typescript
import { TradeService } from '../services/TradeService';
import { pool } from '../config/database';
```

### Key Methods Used

**TradeService.checkExitConditions(trade)**
- Returns: `{ shouldExit, reason, currentPrice, plPct }`
- Fetches current price from DexScreener
- Evaluates all exit conditions
- Returns recommendation with details

**TradeService.closeTradeAutomatically(tradeId, reason)**
- Uses stored encrypted session password
- Derives wallet keypair from master seed
- Executes Jupiter swap (Token → SOL)
- Updates trade record with exit data
- Calculates final P&L

### Database Schema
```sql
CREATE TABLE trades (
  -- ... other fields ...
  take_profit_pct DECIMAL(5, 2),
  stop_loss_pct DECIMAL(5, 2),
  trailing_stop_pct DECIMAL(5, 2),
  max_hold_time_minutes INTEGER,
  session_password_encrypted TEXT,
  status VARCHAR(20) DEFAULT 'open',
  -- ... other fields ...
);
```

## Troubleshooting

### Worker Not Starting
```bash
# Check TypeScript compilation
npx tsx backend/src/workers/tradeMonitor.ts

# Check database connection
# Should see: ✅ Connected to PostgreSQL database
```

### Trades Not Closing
**Check 1**: Is session_password_encrypted stored?
```sql
SELECT id, token_address, session_password_encrypted IS NOT NULL as has_password
FROM trades
WHERE status = 'open';
```

**Check 2**: Are exit conditions configured?
```sql
SELECT id, take_profit_pct, stop_loss_pct, max_hold_time_minutes
FROM trades
WHERE status = 'open';
```

**Check 3**: Check worker logs for price fetch errors
- DexScreener API rate limits
- Invalid token addresses
- Network connectivity issues

### High API Costs
If DexScreener rate limits are hit:
- Increase `MONITOR_INTERVAL_MS` (e.g., 60 seconds)
- Implement Redis caching layer
- Consider paid API tier for higher limits

## Future Enhancements

### Phase 2
- [ ] Webhook notifications when trades close
- [ ] Email/SMS alerts for large P&L events
- [ ] Prometheus metrics for monitoring
- [ ] Redis pub/sub for real-time updates

### Phase 3
- [ ] Dynamic interval adjustment based on volatility
- [ ] Multi-threaded worker for high trade volume
- [ ] Advanced trailing stop with peak tracking in database
- [ ] Machine learning exit optimization

## Security Considerations

### Session Password Storage
- **Pro**: Enables fully automated background closes
- **Con**: Encrypted password stored in database
- **Mitigation**: Encrypted with strong key (JWT secret + userId)
- **Best Practice**: Rotate JWT secret periodically

### Alternative Architectures
For higher security requirements:
1. **User Confirmation Required**: Send webhook, user approves via UI
2. **Hardware Security Module**: Store master key in HSM
3. **Multi-Sig Approach**: Require multiple keys to close trades
4. **Time-Limited Sessions**: Auto-expire session passwords after N hours

## Testing

### Manual Test
```bash
# 1. Create a test trade with short timeout
curl -X POST http://localhost:3001/api/trades/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "ghostWalletId": "wallet-uuid",
    "tokenAddress": "token-address",
    "entryAmountSol": 0.1,
    "maxHoldTimeMinutes": 1,
    "sessionPassword": "encrypted-session-password"
  }'

# 2. Wait 60+ seconds

# 3. Check worker logs - should see automatic closure
```

### Unit Tests (TODO)
```typescript
describe('TradeMonitor', () => {
  it('should detect take profit condition');
  it('should detect stop loss condition');
  it('should detect timeout condition');
  it('should close trade automatically');
  it('should handle errors gracefully');
});
```

## Deployment

### Docker
```dockerfile
# Dockerfile.worker
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY backend ./backend
CMD ["tsx", "backend/src/workers/tradeMonitor.ts"]
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trade-monitor-worker
spec:
  replicas: 1  # Only run 1 instance to avoid duplicate processing
  selector:
    matchLabels:
      app: trade-monitor-worker
  template:
    metadata:
      labels:
        app: trade-monitor-worker
    spec:
      containers:
      - name: worker
        image: redacted/trade-monitor:latest
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
```

### Process Manager (PM2)
```json
{
  "apps": [{
    "name": "trade-monitor",
    "script": "backend/src/workers/tradeMonitor.ts",
    "interpreter": "tsx",
    "instances": 1,
    "autorestart": true,
    "watch": false,
    "max_memory_restart": "500M",
    "env": {
      "NODE_ENV": "production"
    }
  }]
}
```

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2026-01-08
