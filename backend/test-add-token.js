// Test script to add a popular Solana token for testing
const axios = require('axios');
const { Pool } = require('pg');

async function addTestToken() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:NajctWeCLYaSywSNHKxkWElcSbTsDSPc@caboose.proxy.rlwy.net:58182/railway'
  });

  try {
    console.log('🔍 Fetching BONK token metadata from DexScreener...');

    // BONK token address
    const tokenAddress = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';

    // Fetch from DexScreener
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      { timeout: 10000 }
    );

    if (!response.data?.pairs || response.data.pairs.length === 0) {
      console.error('❌ Token not found on DexScreener');
      return;
    }

    // Find Solana pair with highest liquidity
    const solanaPairs = response.data.pairs.filter((pair) => pair.chainId === 'solana');

    if (solanaPairs.length === 0) {
      console.error('❌ No Solana pairs found');
      return;
    }

    const bestPair = solanaPairs.sort((a, b) => {
      const liquidityA = parseFloat(a.liquidity?.usd || '0');
      const liquidityB = parseFloat(b.liquidity?.usd || '0');
      return liquidityB - liquidityA;
    })[0];

    const baseToken = bestPair.baseToken;
    const info = bestPair.info || {};

    console.log(`✅ Found metadata: ${baseToken.symbol} (${baseToken.name})`);

    // Check if token already exists
    const existing = await pool.query(
      'SELECT * FROM monitored_tokens WHERE token_address = $1',
      [tokenAddress]
    );

    if (existing.rows.length > 0) {
      console.log('⚠️ Token already exists in database');
      await pool.end();
      return;
    }

    // Insert into database
    await pool.query(
      `INSERT INTO monitored_tokens (
        token_address,
        token_symbol,
        token_name,
        source,
        current_price_usd,
        market_cap_usd,
        liquidity_usd,
        volume_24h_usd,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        tokenAddress,
        baseToken.symbol,
        baseToken.name,
        'manual',
        parseFloat(bestPair.priceUsd || '0'),
        parseFloat(bestPair.fdv || '0'),
        parseFloat(bestPair.liquidity?.usd || '0'),
        parseFloat(bestPair.volume?.h24 || '0'),
        JSON.stringify({ image_uri: info.imageUrl })
      ]
    );

    console.log('✅ Successfully added BONK token to database!');
    console.log(`   Symbol: ${baseToken.symbol}`);
    console.log(`   Name: ${baseToken.name}`);
    console.log(`   Price: $${parseFloat(bestPair.priceUsd || '0').toFixed(8)}`);
    console.log(`   Image: ${info.imageUrl || 'N/A'}`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addTestToken();
