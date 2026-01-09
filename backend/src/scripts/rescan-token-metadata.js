const { Pool } = require('pg');
const axios = require('axios');
const path = require('path');
// Load .env from root directory (3 levels up from src/scripts)
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fetchTokenMetadata(tokenAddress) {
  console.log(`\n🔍 Fetching metadata for ${tokenAddress}...`);

  // Try DexScreener first
  try {
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (response.data?.pairs && response.data.pairs.length > 0) {
      const solanaPairs = response.data.pairs.filter(pair => pair.chainId === 'solana');

      if (solanaPairs.length > 0) {
        const bestPair = solanaPairs.sort((a, b) => {
          const liquidityA = parseFloat(a.liquidity?.usd || '0');
          const liquidityB = parseFloat(b.liquidity?.usd || '0');
          return liquidityB - liquidityA;
        })[0];

        const baseToken = bestPair.baseToken;
        const info = bestPair.info || {};

        // Try multiple sources for image URL
        let imageUri = '';
        if (info.imageUrl) {
          imageUri = info.imageUrl;
        } else if (bestPair.imageUrl) {
          imageUri = bestPair.imageUrl;
        } else if (baseToken.imageUrl) {
          imageUri = baseToken.imageUrl;
        }

        // If still no image, try DexScreener Token Profiles API
        if (!imageUri) {
          try {
            const profileResponse = await axios.get(
              `https://api.dexscreener.com/token-profiles/latest/v1`,
              {
                timeout: 3000,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              }
            );

            if (profileResponse.data) {
              const profile = profileResponse.data.find(p => 
                p.tokenAddress?.toLowerCase() === tokenAddress.toLowerCase()
              );
              if (profile?.icon) {
                imageUri = profile.icon;
                console.log(`  ✅ Found image in Token Profiles API`);
              }
            }
          } catch (profileError) {
            console.log(`  ⚠️ Token Profiles API failed`);
          }
        }

        // If still no image, try Helius DAS API
        if (!imageUri) {
          try {
            const heliusUrl = process.env.HELIUS_API_URL || `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
            
            const dasResponse = await axios.post(
              heliusUrl,
              {
                jsonrpc: '2.0',
                id: 'token-metadata',
                method: 'getAsset',
                params: {
                  id: tokenAddress
                }
              },
              {
                timeout: 5000,
                headers: { 'Content-Type': 'application/json' }
              }
            );

            if (dasResponse.data?.result?.content?.links?.image) {
              imageUri = dasResponse.data.result.content.links.image;
              console.log(`  ✅ Found image via Helius DAS API`);
            } else if (dasResponse.data?.result?.content?.json_uri) {
              try {
                const jsonResponse = await axios.get(dasResponse.data.result.content.json_uri, { timeout: 3000 });
                if (jsonResponse.data?.image) {
                  imageUri = jsonResponse.data.image;
                  console.log(`  ✅ Found image in token JSON metadata`);
                }
              } catch (jsonError) {
                console.log(`  ⚠️ Failed to fetch JSON metadata`);
              }
            }
          } catch (heliusError) {
            console.log(`  ⚠️ Helius DAS API failed`);
          }
        }

        const metadata = {
          symbol: baseToken?.symbol || null,
          name: baseToken?.name || null,
          image_uri: imageUri || null,
          description: info.description || '',
          twitter: info.socials?.find(s => s.type === 'twitter')?.url || '',
          telegram: info.socials?.find(s => s.type === 'telegram')?.url || '',
          website: info.websites?.[0]?.url || ''
        };

        console.log(`  ✅ DexScreener: ${metadata.symbol} (${metadata.name}) - Image: ${imageUri ? 'Yes' : 'No'}`);
        return metadata;
      }
    }
  } catch (dexError) {
    console.log(`  ⚠️ DexScreener failed: ${dexError.message}`);
  }

  // Try PumpPortal as fallback
  try {
    console.log(`  🔍 Trying PumpPortal API...`);
    const pumpResponse = await axios.get(
      `https://pumpportal.fun/api/data/token/${tokenAddress}`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (pumpResponse.data) {
      const pumpData = pumpResponse.data;
      const metadata = {
        symbol: pumpData.symbol || null,
        name: pumpData.name || null,
        image_uri: pumpData.image_uri || pumpData.image || null,
        description: pumpData.description || '',
        twitter: pumpData.twitter || '',
        telegram: pumpData.telegram || '',
        website: pumpData.website || ''
      };

      console.log(`  ✅ PumpPortal: ${metadata.symbol} (${metadata.name}) - Image: ${metadata.image_uri ? 'Yes' : 'No'}`);
      return metadata;
    }
  } catch (pumpError) {
    console.log(`  ⚠️ PumpPortal failed: ${pumpError.message}`);
  }

  console.log(`  ❌ No metadata found for ${tokenAddress}`);
  return null;
}

async function rescanAllTokens() {
  console.log('🚀 Starting token metadata rescan...\n');

  try {
    // Get all monitored tokens
    const result = await pool.query(
      `SELECT token_address, token_symbol, token_name, metadata
       FROM monitored_tokens
       ORDER BY discovered_at DESC`
    );

    console.log(`📊 Found ${result.rows.length} tokens to rescan\n`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const token of result.rows) {
      const tokenAddress = token.token_address;
      const currentMetadata = token.metadata || {};

      // Skip if already has image_uri
      if (currentMetadata.image_uri) {
        console.log(`⏭️  Skipping ${token.token_symbol || tokenAddress} - already has image`);
        skipped++;
        continue;
      }

      // Fetch new metadata
      const newMetadata = await fetchTokenMetadata(tokenAddress);

      if (newMetadata) {
        // Merge with existing metadata
        const mergedMetadata = {
          ...currentMetadata,
          image_uri: newMetadata.image_uri,
          description: newMetadata.description || currentMetadata.description,
          twitter: newMetadata.twitter || currentMetadata.twitter,
          telegram: newMetadata.telegram || currentMetadata.telegram,
          website: newMetadata.website || currentMetadata.website
        };

        // Update database
        await pool.query(
          `UPDATE monitored_tokens
           SET token_symbol = COALESCE($1, token_symbol),
               token_name = COALESCE($2, token_name),
               metadata = $3,
               last_updated = NOW()
           WHERE token_address = $4`,
          [
            newMetadata.symbol,
            newMetadata.name,
            JSON.stringify(mergedMetadata),
            tokenAddress
          ]
        );

        console.log(`  ✅ Updated ${newMetadata.symbol || tokenAddress}`);
        updated++;
      } else {
        console.log(`  ❌ Failed to fetch metadata for ${token.token_symbol || tokenAddress}`);
        failed++;
      }

      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Rescan Summary:');
    console.log(`  ✅ Updated: ${updated}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  📊 Total: ${result.rows.length}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error during rescan:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
rescanAllTokens()
  .then(() => {
    console.log('\n✅ Rescan completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Rescan failed:', error);
    process.exit(1);
  });
