-- Add OAuth support to users table
-- Migration: add_oauth_support
-- Date: 2026-01-09

-- Add OAuth provider tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(20),
ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255);

-- Add index for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON users(oauth_provider);
CREATE INDEX IF NOT EXISTS idx_users_oauth_id ON users(oauth_id);

-- Add unique constraint for OAuth ID + provider combination
ALTER TABLE users
ADD CONSTRAINT unique_oauth_provider_id UNIQUE (oauth_provider, oauth_id);

-- Allow NULL password_hash for OAuth users (they still get generated password for encryption)
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

-- Add comments explaining OAuth fields
COMMENT ON COLUMN users.oauth_provider IS 'OAuth provider: "google", "local", or NULL for legacy users';
COMMENT ON COLUMN users.oauth_id IS 'OAuth provider user ID (Google sub claim)';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hash - can be NULL for OAuth users who use generated passwords';
