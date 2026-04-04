#!/usr/bin/env node

/**
 * Polar.sh Product Setup Script
 *
 * Creates the Free, Pro, and Team products for AI Changelog Generator
 * on Polar.sh via their API. Run once after creating a Polar.sh account.
 *
 * Prerequisites:
 *   - A Polar.sh account (sign in with GitHub)
 *   - An Organization Access Token (Settings → Tokens)
 *
 * Usage:
 *   POLAR_ACCESS_TOKEN=<token> node scripts/setup-polar.js [--org-id <id>]
 *
 * The script will:
 *   1. Look up (or use provided) organization ID
 *   2. Create a "License Key" benefit for Pro and Team tiers
 *   3. Create Free, Pro ($9/mo), and Team ($29/mo) products
 *   4. Print checkout links for each product
 */

const https = require('https');

const API_BASE = 'https://api.polar.sh';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function request(method, path, body, token) {
  const payload = body ? JSON.stringify(body) : null;
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: new URL(API_BASE).hostname,
        path,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
        timeout: 30000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(
                new Error(
                  `HTTP ${res.statusCode}: ${parsed.detail || parsed.message || JSON.stringify(parsed)}`
                )
              );
            }
          } catch {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return request('GET', path, null, token);
}

function post(path, body, token) {
  return request('POST', path, body, token);
}

// ---------------------------------------------------------------------------
// Product definitions
// ---------------------------------------------------------------------------

const PRODUCTS = [
  {
    name: 'AI Changelog Generator — Free',
    description:
      'Conventional commit-based changelog generation. Rule-based categorization, emoji labels, PR links, author attribution, and multiple output formats. Free forever.',
    priceAmountCents: 0,
    recurringInterval: null,
    isRecurring: false,
    tier: 'free',
  },
  {
    name: 'AI Changelog Generator — Pro',
    description:
      'Everything in Free plus: AI-powered commit categorization (OpenAI/Anthropic), breaking change detection with detailed reports, semantic version recommendation, and priority support.',
    priceAmountCents: 900,
    recurringInterval: 'month',
    isRecurring: true,
    tier: 'pro',
    benefitDescription: 'Pro License Key',
  },
  {
    name: 'AI Changelog Generator — Team',
    description:
      'Everything in Pro plus: unlimited repos, team-wide license, priority support, and early access to new features.',
    priceAmountCents: 2900,
    recurringInterval: 'month',
    isRecurring: true,
    tier: 'team',
    benefitDescription: 'Team License Key',
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) {
    console.error('Error: POLAR_ACCESS_TOKEN environment variable is required.');
    console.error('Create one at: https://polar.sh/settings → Tokens');
    process.exit(1);
  }

  // Parse --org-id from CLI args
  let orgId = null;
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--org-id' && args[i + 1]) {
      orgId = args[++i];
    }
  }

  // Resolve organization
  if (!orgId) {
    console.log('🔍 Looking up organization...');
    const orgs = await get('/v1/organizations', token);
    const items = orgs.items || orgs.result || orgs;
    if (!Array.isArray(items) || items.length === 0) {
      console.error('Error: No organizations found. Create one at https://polar.sh first.');
      process.exit(1);
    }
    orgId = items[0].id;
    console.log(`   Using organization: ${items[0].name || items[0].slug} (${orgId})`);
  }

  console.log('');
  console.log('━━━ AI Changelog Generator — Polar.sh Setup ━━━');
  console.log('');

  const createdProducts = [];

  for (const product of PRODUCTS) {
    console.log(`📦 Creating "${product.name}"...`);

    // Build product payload
    const productPayload = {
      name: product.name,
      description: product.description,
      organization_id: orgId,
    };

    // Create the product
    let createdProduct;
    try {
      if (product.isRecurring) {
        productPayload.recurring_interval = product.recurringInterval;
        productPayload.prices = [
          {
            type: 'recurring',
            recurring_interval: product.recurringInterval,
            price_amount: product.priceAmountCents,
            price_currency: 'usd',
          },
        ];
      } else {
        productPayload.prices = [
          {
            type: 'one_time',
            price_amount: 0,
            price_currency: 'usd',
          },
        ];
        productPayload.is_archived = false;
      }

      createdProduct = await post('/v1/products', productPayload, token);
      console.log(`   ✅ Created: ${createdProduct.id}`);
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
      continue;
    }

    // Create license key benefit for paid tiers
    if (product.benefitDescription) {
      try {
        console.log(`   🔑 Creating license key benefit...`);
        const benefit = await post(
          '/v1/benefits',
          {
            type: 'license_keys',
            description: product.benefitDescription,
            organization_id: orgId,
            properties: {
              prefix: product.tier === 'team' ? 'AICL-TEAM' : 'AICL-PRO',
              expires: { ttl: 0, timeframe: 'year' },
              activations: { limit: product.tier === 'team' ? 100 : 5, enable_activation: true },
              limit_usage: null,
            },
          },
          token
        );
        console.log(`   ✅ Benefit created: ${benefit.id}`);

        // Attach benefit to product
        await post(
          `/v1/products/${createdProduct.id}/benefits`,
          { benefits: [benefit.id] },
          token
        );
        console.log(`   ✅ Benefit attached to product`);
      } catch (err) {
        console.error(`   ⚠️  Benefit creation failed: ${err.message}`);
      }
    }

    // Generate checkout link
    try {
      const checkout = await post(
        '/v1/checkouts/custom',
        {
          product_id: createdProduct.id,
          payment_processor: 'stripe',
        },
        token
      );
      createdProducts.push({
        tier: product.tier,
        name: product.name,
        id: createdProduct.id,
        checkoutUrl: checkout.url || `https://polar.sh/checkout/${checkout.id}`,
      });
    } catch (err) {
      createdProducts.push({
        tier: product.tier,
        name: product.name,
        id: createdProduct.id,
        checkoutUrl: `https://polar.sh/jimjammcjames/products/${createdProduct.id}`,
      });
    }

    console.log('');
  }

  // Summary
  console.log('━━━ Setup Complete ━━━');
  console.log('');
  console.log('Organization ID (for POLAR_ORG_ID):');
  console.log(`  ${orgId}`);
  console.log('');
  console.log('Products created:');
  for (const p of createdProducts) {
    console.log(`  ${p.tier.toUpperCase().padEnd(6)} ${p.name}`);
    console.log(`         ID: ${p.id}`);
    console.log(`         Checkout: ${p.checkoutUrl}`);
    console.log('');
  }

  console.log('Next steps:');
  console.log('  1. Copy the Organization ID above into your workflow as polar-org-id');
  console.log('  2. Update README.md checkout links with the URLs above');
  console.log('  3. Test a checkout flow end-to-end');
  console.log('');
}

main().catch((err) => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
