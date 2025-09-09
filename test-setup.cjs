#!/usr/bin/env node

/**
 * Basic setup validation for Tailscale MCP server
 * This script validates the setup without making actual API calls
 */

console.log('🔍 Testing Tailscale MCP Server Setup...\n');

// Test 1: Check Node.js version
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0]);

console.log(`✅ Node.js version: ${nodeVersion}`);
if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required');
  process.exit(1);
}

// Test 2: Check if dependencies are installed
const fs = require('fs');
const path = require('path');

try {
  const mcpPath = path.join(__dirname, 'node_modules/@modelcontextprotocol');
  const fetchPath = path.join(__dirname, 'node_modules/node-fetch');
  
  if (fs.existsSync(mcpPath) && fs.existsSync(fetchPath)) {
    console.log('✅ All dependencies are installed');
  } else {
    throw new Error('Dependencies not found');
  }
} catch (error) {
  console.error('❌ Missing dependencies. Run: npm install');
  process.exit(1);
}

// Test 3: Check if main files exist
const requiredFiles = [
  'src/index.js',
  'src/tailscale-client.js',
  'package.json',
  'README.md'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file} exists`);
  } else {
    console.error(`❌ ${file} is missing`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  process.exit(1);
}

// Test 4: Basic file structure check
const indexContent = fs.readFileSync(path.join(__dirname, 'src/index.js'), 'utf8');
const clientContent = fs.readFileSync(path.join(__dirname, 'src/tailscale-client.js'), 'utf8');

if (indexContent.includes('TailscaleClient') && clientContent.includes('class TailscaleClient')) {
  console.log('✅ Source files have correct structure');
} else {
  console.error('❌ Source files appear to have structural issues');
  process.exit(1);
}

// Test 5: Environment variable guidance
console.log('\n📝 Next Steps:');
console.log('1. Get your Tailscale API token from: https://login.tailscale.com/admin/settings/keys');
console.log('2. Set your environment variables:');
console.log('   export TAILSCALE_TOKEN="your_token_here"');
console.log('   export TAILNET="your_tailnet_name"  # optional');
console.log('3. Test the server: TAILSCALE_TOKEN="your_token" node src/index.js');
console.log('4. Add to your Warp MCP configuration');

console.log('\n✅ Setup validation completed successfully!');
console.log('🚀 Tailscale MCP server is ready to use once configured with your API token.');
