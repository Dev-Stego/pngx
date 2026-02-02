#!/usr/bin/env node

/**
 * Deploy script that automatically syncs environment variables from .env.production
 * to Cloudflare Workers secrets before deploying.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env.production');

// Secret variables (Firebase Admin, AWS credentials)
const SECRET_VARS = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
];

// Public variables
const PUBLIC_VARS = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'NEXT_PUBLIC_PNGX_CONTRACT_ADDRESS',
  'NEXT_PUBLIC_STORAGE_PROVIDER',
  'NEXT_PUBLIC_AWS_S3_BUCKET',
  'NEXT_PUBLIC_AWS_REGION',
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Environment file not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const vars = {};

  content.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) return;

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      vars[key] = value;
    }
  });

  return vars;
}

function setSecret(name, value) {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['wrangler', 'secret', 'put', name], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.join(__dirname, '..'),
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Write the value to stdin
    proc.stdin.write(value);
    proc.stdin.end();

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        // Check if it's just a "already exists" type message
        if (stderr.includes('created') || stdout.includes('created')) {
          resolve(stdout);
        } else {
          reject(new Error(`Failed to set ${name}: ${stderr}`));
        }
      }
    });
  });
}

async function main() {
  console.log('🔧 PNGX Cloudflare Deploy Script\n');

  // Parse environment file
  console.log('📄 Reading .env.production...');
  const envVars = parseEnvFile(ENV_FILE);

  // Set secrets
  console.log('\n🔐 Syncing secrets to Cloudflare...\n');
  
  for (const varName of SECRET_VARS) {
    if (envVars[varName]) {
      process.stdout.write(`  Setting ${varName}... `);
      try {
        await setSecret(varName, envVars[varName]);
        console.log('✅');
      } catch (error) {
        console.log('❌');
        console.error(`    Error: ${error.message}`);
      }
    } else {
      console.log(`  ⚠️  ${varName} not found in .env.production`);
    }
  }

  // Set public vars (these go in wrangler.jsonc or as non-secret vars)
  console.log('\n🌐 Syncing public variables...\n');
  
  for (const varName of PUBLIC_VARS) {
    if (envVars[varName]) {
      process.stdout.write(`  Setting ${varName}... `);
      try {
        await setSecret(varName, envVars[varName]);
        console.log('✅');
      } catch (error) {
        console.log('❌');
        console.error(`    Error: ${error.message}`);
      }
    } else {
      console.log(`  ⚠️  ${varName} not found in .env.production`);
    }
  }

  // Run the deploy
  console.log('\n🚀 Building and deploying...\n');
  
  try {
    execSync('npm run deploy', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
    console.log('\n✅ Deployment complete!');
  } catch (error) {
    console.error('\n❌ Deployment failed');
    process.exit(1);
  }
}

main().catch(console.error);
