#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupWarpConfig() {
  console.log('🔧 Setting up Warp MCP configuration for Tailscale...\n');

  // Get the absolute path to this project
  const projectPath = __dirname;
  console.log(`📁 Project path: ${projectPath}`);

  // Determine Warp config location based on OS
  let warpConfigPath;
  const homeDir = os.homedir();
  
  if (process.platform === 'darwin') {
    // macOS
    warpConfigPath = path.join(homeDir, '.warp', 'mcp_config.json');
  } else if (process.platform === 'linux') {
    // Linux
    warpConfigPath = path.join(homeDir, '.config', 'warp', 'mcp_config.json');
  } else if (process.platform === 'win32') {
    // Windows
    warpConfigPath = path.join(homeDir, 'AppData', 'Local', 'Warp', 'mcp_config.json');
  } else {
    console.error('❌ Unsupported operating system:', process.platform);
    process.exit(1);
  }

  console.log(`📄 Warp config location: ${warpConfigPath}`);

  // Create the Warp config directory if it doesn't exist
  const warpConfigDir = path.dirname(warpConfigPath);
  if (!fs.existsSync(warpConfigDir)) {
    console.log('📁 Creating Warp config directory...');
    fs.mkdirSync(warpConfigDir, { recursive: true });
  }

  // Create the MCP config
  const mcpConfig = {
    mcpServers: {
      tailscale: {
        command: "node",
        args: [
          path.join(projectPath, 'src', 'index.js')
        ],
        working_directory: projectPath
      }
    }
  };

  let existingConfig = {};
  
  // Check if config already exists
  if (fs.existsSync(warpConfigPath)) {
    console.log('📖 Reading existing Warp config...');
    try {
      const existingContent = fs.readFileSync(warpConfigPath, 'utf8');
      existingConfig = JSON.parse(existingContent);
    } catch (error) {
      console.warn('⚠️  Could not parse existing config, creating new one...');
    }
  }

  // Merge configs
  if (!existingConfig.mcpServers) {
    existingConfig.mcpServers = {};
  }
  
  existingConfig.mcpServers.tailscale = mcpConfig.mcpServers.tailscale;

  // Write the config
  try {
    fs.writeFileSync(warpConfigPath, JSON.stringify(existingConfig, null, 2));
    console.log('✅ Warp MCP config updated successfully!');
    
    // Also create a backup config file in the project
    const backupPath = path.join(projectPath, 'warp-mcp-config.json');
    fs.writeFileSync(backupPath, JSON.stringify(mcpConfig, null, 2));
    console.log(`📋 Backup config saved to: ${backupPath}`);
    
  } catch (error) {
    console.error('❌ Failed to write Warp config:', error.message);
    process.exit(1);
  }

  console.log('\n🎉 Setup complete!');
  console.log('\n📝 Configuration added:');
  console.log(JSON.stringify(mcpConfig.mcpServers.tailscale, null, 2));
  
  console.log('\n📋 Next steps:');
  console.log('1. Restart Warp terminal');
  console.log('2. Test with: "Show me my Tailscale status"');
  console.log('3. Or: "List all my Tailscale devices"');
  
  console.log('\n🔍 Troubleshooting:');
  console.log('- Make sure Tailscale CLI is installed and authenticated');
  console.log('- Run `tailscale status` to verify CLI access');
  console.log('- Check Warp logs if MCP server doesn\'t start');
}

setupWarpConfig().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
