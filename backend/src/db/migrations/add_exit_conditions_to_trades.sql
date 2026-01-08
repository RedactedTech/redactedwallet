-- Add exit condition columns to trades table
-- Migration: add_exit_conditions_to_trades
-- Date: 2026-01-08

ALTER TABLE trades
ADD COLUMN IF NOT EXISTS take_profit_pct DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS stop_loss_pct DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS trailing_stop_pct DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS max_hold_time_minutes INTEGER;

-- Add comment
COMMENT ON COLUMN trades.take_profit_pct IS 'Target profit percentage for automatic exit';
COMMENT ON COLUMN trades.stop_loss_pct IS 'Stop loss percentage for automatic exit';
COMMENT ON COLUMN trades.trailing_stop_pct IS 'Trailing stop percentage for dynamic exit';
COMMENT ON COLUMN trades.max_hold_time_minutes IS 'Maximum hold time before automatic exit';
