#!/bin/bash

# Tailscale MCP Server Installation Script
# This script installs tailscale-mcp locally via Homebrew

set -e

REPO_URL="https://github.com/TB-Warp/tailscale-mcp"
TAP_NAME="tb-warp/tailscale-mcp"

echo "🚀 Tailscale MCP Server Installer"
echo "=================================="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew is not installed. Please install Homebrew first:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

echo "✅ Homebrew found: $(brew --version | head -1)"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js via Homebrew..."
    brew install node
else
    echo "✅ Node.js found: $(node --version)"
fi

echo ""
echo "📥 Installing Tailscale MCP Server..."

# Add the tap and install
if brew tap-info "$TAP_NAME" &> /dev/null; then
    echo "🔄 Updating existing tap..."
    brew tap "$TAP_NAME" --force
else
    echo "➕ Adding new tap..."
    brew tap "$TAP_NAME" "$REPO_URL"
fi

# Install or upgrade
if brew list tailscale-mcp &> /dev/null; then
    echo "🔄 Upgrading existing installation..."
    brew upgrade tailscale-mcp
else
    echo "🆕 Installing tailscale-mcp..."
    brew install tailscale-mcp
fi

echo ""
echo "🧪 Running post-install setup..."
tailscale-mcp-setup

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📝 Quick start:"
echo "1. Get your Tailscale API token: https://login.tailscale.com/admin/settings/keys"
echo "2. Add this to your Warp MCP config:"
echo ""
echo '   {'
echo '     "mcpServers": {'
echo '       "tailscale": {'
echo '         "command": "tailscale-mcp",'
echo '         "env": {'
echo '           "TAILSCALE_TOKEN": "your_token_here"'
echo '         }'
echo '       }'
echo '     }'
echo '   }'
echo ""
echo "3. Restart Warp and start managing Tailscale with natural language!"
echo ""
echo "💡 Need help? Visit: $REPO_URL"
