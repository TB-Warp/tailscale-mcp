#!/bin/bash

# Tailscale MCP Server Uninstallation Script

set -e

TAP_NAME="tb-warp/tailscale-mcp"

echo "🗑️  Tailscale MCP Server Uninstaller"
echo "====================================="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Nothing to uninstall."
    exit 0
fi

# Check if tailscale-mcp is installed
if ! brew list tailscale-mcp &> /dev/null; then
    echo "ℹ️  Tailscale MCP Server is not installed via Homebrew."
else
    echo "🗑️  Uninstalling Tailscale MCP Server..."
    brew uninstall tailscale-mcp
    echo "✅ Tailscale MCP Server uninstalled."
fi

# Offer to remove the tap
echo ""
read -p "🤔 Do you want to remove the TB-Warp tap as well? [y/N]: " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if brew tap-info "$TAP_NAME" &> /dev/null; then
        echo "🗑️  Removing tap: $TAP_NAME"
        brew untap "$TAP_NAME"
        echo "✅ Tap removed."
    else
        echo "ℹ️  Tap not found."
    fi
else
    echo "ℹ️  Keeping tap for future installations."
fi

echo ""
echo "✅ Uninstallation complete!"
echo ""
echo "📝 Don't forget to:"
echo "1. Remove tailscale-mcp from your Warp MCP configuration"
echo "2. Restart Warp to apply changes"
echo ""
echo "💡 To reinstall later, run:"
echo "   curl -fsSL https://raw.githubusercontent.com/TB-Warp/tailscale-mcp/main/scripts/install.sh | bash"
