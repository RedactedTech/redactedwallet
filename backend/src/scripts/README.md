# Token Metadata Rescan Script

This script rescans all tokens in the `monitored_tokens` table and fetches missing metadata (especially images) from DexScreener, Helius DAS API, and PumpPortal.

## Usage

From the `backend` directory, run:

```bash
npm run rescan-tokens
```

## What It Does

1. Queries all tokens from the `monitored_tokens` table
2. Skips tokens that already have `image_uri` in their metadata
3. For each token without an image:
   - Tries DexScreener API (multiple image sources)
   - Tries DexScreener Token Profiles API
   - Tries Helius DAS API (for on-chain metadata)
   - Tries PumpPortal API as fallback
4. Updates the database with the fetched metadata
5. Provides a summary of updated, skipped, and failed tokens

## Rate Limiting

The script includes a 500ms delay between requests to avoid hitting API rate limits.

## Environment Variables

Make sure these are set in your `.env` file:
- `HELIUS_API_KEY` - Your Helius API key (optional but recommended)
- `HELIUS_API_URL` - Helius RPC URL (optional, defaults to mainnet)

## Script Details

The script is located at `src/scripts/rescan-token-metadata.js`.
It is run using `node` to avoid TypeScript compilation issues with standalone scripts.
