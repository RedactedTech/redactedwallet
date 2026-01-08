-- Add session_password_encrypted column to trades for background job authentication
-- Migration: add_session_password_to_trades
-- Date: 2026-01-08

ALTER TABLE trades
ADD COLUMN IF NOT EXISTS session_password_encrypted TEXT;

COMMENT ON COLUMN trades.session_password_encrypted IS 'Encrypted session password for background worker to close trades automatically';
